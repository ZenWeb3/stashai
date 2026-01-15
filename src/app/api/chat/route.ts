import { NextRequest, NextResponse } from "next/server";
import { supabase, createSupabaseClient } from "@/lib/supabase";
import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclaration,
} from "@google/generative-ai";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type {
  Income,
  Goal,
  ChatMessage,
  SendMessageInput,
  ChatResponse,
  ApiResponse,
  IncomeSource,
} from "@/types";

interface ChatRequestInput {
  message: string;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    message: string;
  }>;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Security: Maximum limits to prevent abuse
const SECURITY_LIMITS = {
  MAX_INCOME_AMOUNT: 100000, // $100k max per entry
  MAX_GOAL_UPDATE: 50000, // $50k max per update
  MIN_AMOUNT: 0.01, // Minimum $0.01
  MAX_ACTIONS_PER_MESSAGE: 3, // Max 3 function calls per message
};

interface UserAndClient {
  user: User;
  client: SupabaseClient;
}

interface GoalWithProgress {
  name: string;
  target: number;
  current: number;
  progress: number;
  deadline: string | null;
}

interface UserContext {
  totalIncome: number;
  incomeCount: number;
  goals: GoalWithProgress[];
}

const functions: FunctionDeclaration[] = [
  {
    name: "add_income",
    description:
      "Add a new income entry for the user. Use this when user reports earning money.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        amount: {
          type: SchemaType.NUMBER,
          description:
            "The income amount in dollars (must be between 0.01 and 100000)",
        },
        source: {
          type: SchemaType.STRING,
          description:
            "The source of income. Must be one of: hackathon, bounty, freelance, crypto, or other",
        },
        date: {
          type: SchemaType.STRING,
          description:
            "The date of income in YYYY-MM-DD format (defaults to today)",
        },
        notes: {
          type: SchemaType.STRING,
          description: "Optional notes about the income",
        },
      },
      required: ["amount", "source"],
    },
  },
  {
    name: "update_goal_progress",
    description:
      "Add or subtract money from a goal's current savings. Use when user allocates money to a goal.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        goal_name: {
          type: SchemaType.STRING,
          description:
            "The name of the goal to update (must match existing goal name)",
        },
        amount_to_add: {
          type: SchemaType.NUMBER,
          description:
            "The amount to add (positive) or subtract (negative). Must be between -50000 and 50000.",
        },
      },
      required: ["goal_name", "amount_to_add"],
    },
  },
];

async function getUserAndClient(
  request: NextRequest
): Promise<UserAndClient | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;

  const userClient = createSupabaseClient(token);
  return { user, client: userClient };
}

async function getUserContext(
  client: SupabaseClient,
  userId: string
): Promise<UserContext> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentIncome } = await client
    .from("income")
    .select("*")
    .eq("user_id", userId)
    .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: false });

  const totalIncome =
    recentIncome?.reduce(
      (sum: number, income: Income) => sum + Number(income.amount),
      0
    ) || 0;

  const { data: activeGoals } = await client
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const goalsWithProgress: GoalWithProgress[] =
    activeGoals?.map((goal: Goal) => ({
      name: goal.name,
      target: goal.target_amount,
      current: goal.current_amount,
      progress: Math.round((goal.current_amount / goal.target_amount) * 100),
      deadline: goal.deadline || null,
    })) || [];

  return {
    totalIncome,
    incomeCount: recentIncome?.length || 0,
    goals: goalsWithProgress,
  };
}

function validateAmount(
  amount: number,
  maxLimit: number,
  context: string
): string | null {
  if (typeof amount !== "number" || isNaN(amount)) {
    return `${context}: Amount must be a valid number`;
  }
  if (amount < SECURITY_LIMITS.MIN_AMOUNT) {
    return `${context}: Amount must be at least $${SECURITY_LIMITS.MIN_AMOUNT}`;
  }
  if (amount > maxLimit) {
    return `${context}: Amount cannot exceed $${maxLimit}`;
  }
  const decimalPlaces = (amount.toString().split(".")[1] || "").length;
  if (decimalPlaces > 2) {
    return `${context}: Amount can only have up to 2 decimal places`;
  }
  return null;
}

function validateSource(source: string): source is IncomeSource {
  const validSources: IncomeSource[] = [
    "hackathon",
    "bounty",
    "freelance",
    "crypto",
    "other",
  ];
  return validSources.includes(source as IncomeSource);
}

function validateDate(dateStr: string): string | null {
  if (!dateStr) {
    return new Date().toISOString().split("T")[0];
  }

  const date = new Date(dateStr);
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  if (isNaN(date.getTime())) {
    return null;
  }

  if (date > today || date < oneYearAgo) {
    return null;
  }

  return dateStr;
}

async function executeFunctionCall(
  functionName: string,
  args: any,
  client: SupabaseClient,
  userId: string
): Promise<string> {
  try {
    if (!["add_income", "update_goal_progress"].includes(functionName)) {
      return `Security Error: Invalid function "${functionName}"`;
    }

    if (functionName === "add_income") {
      const { amount, source, date, notes } = args;

      const amountError = validateAmount(
        amount,
        SECURITY_LIMITS.MAX_INCOME_AMOUNT,
        "Income"
      );
      if (amountError) {
        return `Error: ${amountError}`;
      }

      if (!validateSource(source)) {
        return `Error: Invalid income source. Must be one of: hackathon, bounty, freelance, crypto, other`;
      }

      const validDate = validateDate(date);
      if (!validDate) {
        return `Error: Invalid date. Date must be within the last year and not in the future`;
      }

      const sanitizedNotes = notes ? String(notes).substring(0, 500) : null;

      const { data, error } = await client
        .from("income")
        .insert({
          user_id: userId,
          amount: Number(amount.toFixed(2)),
          source,
          date: validDate,
          notes: sanitizedNotes,
        })
        .select()
        .single();

      if (error) {
        console.error("Income insert error:", error);
        return `Error: Failed to add income: Database error`;
      }

      return `Success: Added $${amount.toFixed(
        2
      )} from ${source} on ${validDate}`;
    }

    if (functionName === "update_goal_progress") {
      const { goal_name, amount_to_add } = args;

      const amountError = validateAmount(
        Math.abs(amount_to_add),
        SECURITY_LIMITS.MAX_GOAL_UPDATE,
        "Goal update"
      );
      if (amountError) {
        return `Error: ${amountError}`;
      }

      const sanitizedGoalName = String(goal_name).trim().substring(0, 100);
      if (!sanitizedGoalName) {
        return `Error: Goal name cannot be empty`;
      }

      const { data: goals } = await client
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active");

      if (!goals || goals.length === 0) {
        return `Error: You don't have any active goals yet. Create a goal first`;
      }

      let matchedGoal = goals.find(
        (g: Goal) => g.name.toLowerCase() === sanitizedGoalName.toLowerCase()
      );

      if (!matchedGoal) {
        matchedGoal = goals.find(
          (g: Goal) =>
            g.name.toLowerCase().includes(sanitizedGoalName.toLowerCase()) ||
            sanitizedGoalName.toLowerCase().includes(g.name.toLowerCase())
        );
      }

      if (!matchedGoal) {
        const availableGoals = goals.map((g: Goal) => g.name).join(", ");
        return `Error: Could not find goal "${sanitizedGoalName}". Your active goals are: ${availableGoals}`;
      }

      const newAmount = matchedGoal.current_amount + amount_to_add;

      if (newAmount < 0) {
        return `Error: Cannot subtract $${Math.abs(amount_to_add)} from "${
          matchedGoal.name
        }" - current balance is only $${matchedGoal.current_amount}`;
      }

      if (newAmount > matchedGoal.target_amount * 1.5) {
        return `Warning: Adding $${amount_to_add} would bring "${matchedGoal.name}" to $${newAmount}, which is 50% over your target of $${matchedGoal.target_amount}. Please confirm if this is correct.`;
      }

      const { error } = await client
        .from("goals")
        .update({
          current_amount: Number(newAmount.toFixed(2)),
          status:
            newAmount >= matchedGoal.target_amount
              ? "completed"
              : matchedGoal.status,
        })
        .eq("id", matchedGoal.id)
        .eq("user_id", userId);

      if (error) {
        console.error("Goal update error:", error);
        return `Error: Failed to update goal: Database error`;
      }

      const progress = Math.round(
        (newAmount / matchedGoal.target_amount) * 100
      );
      const statusNote =
        newAmount >= matchedGoal.target_amount ? " Goal completed!" : "";

      return `Success: Added $${amount_to_add.toFixed(2)} to "${
        matchedGoal.name
      }". New progress: ${progress}% ($${newAmount.toFixed(2)}/$${
        matchedGoal.target_amount
      })${statusNote}`;
    }

    return `Error: Unknown function: ${functionName}`;
  } catch (error) {
    console.error(`Function execution error in ${functionName}:`, error);
    return `Error: Failed to execute ${functionName}`;
  }
}

function buildSystemPrompt(context: UserContext): string {
  return `You are a helpful financial advisor for StashAI with the ability to take actions using available functions.

AVAILABLE FUNCTIONS YOU MUST USE:
- add_income: When user mentions earning/receiving money, call this function
- update_goal_progress: When user mentions adding money to a goal, call this function

CONFIRMATION FLOW:
1. When user requests an action, ask for confirmation before executing
2. When user responds with affirmative (yes, proceed, go ahead, do it, sure, ok), IMMEDIATELY call the function
3. When user responds with negative (no, cancel, don't, stop), DO NOT call function and acknowledge cancellation
4. When user response is unclear (maybe, not sure, let me think), ask for clarification

Examples:
User: "I earned $600 from crypto"
You: "I'll add $600 from crypto to your income. Should I proceed?"
User: "Yes" / "Go ahead" / "Do it"
You: [CALL add_income function]

User: "No" / "Cancel"
You: "Understood, I won't add that. Let me know if you change your mind."

Current User's Financial Situation:
- Total income in last 30 days: $${context.totalIncome}
- Active savings goals: ${context.goals.length}

${
  context.goals.length > 0
    ? `Active Goals:\n${context.goals
        .map(
          (g) =>
            `- ${g.name}: $${g.current} / $${g.target} (${
              g.progress
            }% complete)${g.deadline ? ` - Deadline: ${g.deadline}` : ""}`
        )
        .join("\n")}`
    : "No active goals yet"
}

SECURITY RULES:
- Amounts must be under $100k for income, under $50k for goal updates
- If amount seems unusually large (over $10k), ask for confirmation first
- Maximum 3 function calls per message
- NEVER call functions without confirmation for amounts over $1000`;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ChatResponse>>> {
  try {
    const result = await getUserAndClient(request);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user, client } = result;
    const body = (await request.json()) as ChatRequestInput;
    const { message, conversationHistory } = body;

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Message too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    const context: UserContext = await getUserContext(client, user.id);
    const systemPrompt = buildSystemPrompt(context);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ functionDeclarations: functions }],
      toolConfig: {
        functionCallingConfig: {
          mode: "AUTO",
        },
      },
    });

    let conversationContents: any[] = [];

    conversationContents.push({
      role: "user",
      parts: [{ text: systemPrompt }],
    });

    // Add previous conversation if provided
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg) => {
        conversationContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.message }],
        });
      });
    }

    conversationContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    let response = await model.generateContent({
      contents: conversationContents,
    });

    let aiMessage = "";
    let functionResults: string[] = [];

    const functionCalls = response.response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      if (functionCalls.length > SECURITY_LIMITS.MAX_ACTIONS_PER_MESSAGE) {
        return NextResponse.json(
          {
            success: false,
            error: `Too many actions requested (max ${SECURITY_LIMITS.MAX_ACTIONS_PER_MESSAGE} per message)`,
          },
          { status: 400 }
        );
      }

      for (const call of functionCalls) {
        const result = await executeFunctionCall(
          call.name,
          call.args,
          client,
          user.id
        );
        functionResults.push(result);
      }

      conversationContents.push({
        role: "model",
        parts: response.response.candidates?.[0].content.parts,
      });

      conversationContents.push({
        role: "user",
        parts: functionCalls.map((call: any, i: number) => ({
          functionResponse: {
            name: call.name,
            response: { result: functionResults[i] },
          },
        })),
      });

      response = await model.generateContent({
        contents: conversationContents,
      });
    }

    aiMessage =
      response.response.text() || "Sorry, I could not generate a response.";

    // Save to chat history
    await client.from("chat_history").insert([
      {
        user_id: user.id,
        message,
        role: "user" as const,
        timestamp: new Date().toISOString(),
      },
      {
        user_id: user.id,
        message: aiMessage,
        role: "assistant" as const,
        timestamp: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({
      success: true,
      data: { message: aiMessage, role: "assistant" as const },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ChatMessage[]>>> {
  try {
    const result = await getUserAndClient(request);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user, client } = result;
    const { searchParams } = request.nextUrl;
    const limit: number = parseInt(searchParams.get("limit") || "50");

    const { data, error } = await client
      .from("chat_history")
      .select("*")
      .eq("user_id", user.id)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch chat history" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data?.reverse() || [] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
