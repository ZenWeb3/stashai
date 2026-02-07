import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-helper";
import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclaration,
} from "@google/generative-ai";
import type {
  Income,
  Goal,
  ChatMessage,
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

const SECURITY_LIMITS = {
  MAX_INCOME_AMOUNT: 100000,
  MAX_GOAL_UPDATE: 50000,
  MIN_AMOUNT: 0.01,
  MAX_ACTIONS_PER_MESSAGE: 3,
};

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
          description: "The income amount (must be between 0.01 and 100000)",
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
    description: "Add or subtract money from a goal's current savings.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        goal_name: {
          type: SchemaType.STRING,
          description: "The name of the goal to update",
        },
        amount_to_add: {
          type: SchemaType.NUMBER,
          description: "The amount to add (positive) or subtract (negative).",
        },
      },
      required: ["goal_name", "amount_to_add"],
    },
  },
];

async function getUserContext(
  supabase: any,
  userId: string,
): Promise<UserContext> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentIncome } = await supabase
    .from("income")
    .select("*")
    .eq("user_id", userId)
    .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: false });

  const totalIncome =
    recentIncome?.reduce(
      (sum: number, income: Income) => sum + Number(income.amount),
      0,
    ) || 0;

  const { data: activeGoals } = await supabase
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
  context: string,
): string | null {
  if (typeof amount !== "number" || isNaN(amount))
    return `${context}: Amount must be a valid number`;
  if (amount < SECURITY_LIMITS.MIN_AMOUNT)
    return `${context}: Amount must be at least ₦${SECURITY_LIMITS.MIN_AMOUNT}`;
  if (amount > maxLimit) return `${context}: Amount cannot exceed ₦${maxLimit}`;
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
  if (!dateStr) return new Date().toISOString().split("T")[0];

  const date = new Date(dateStr);
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  if (isNaN(date.getTime()) || date > today || date < oneYearAgo) return null;
  return dateStr;
}

async function executeFunctionCall(
  functionName: string,
  args: any,
  supabase: any,
  userId: string,
): Promise<string> {
  try {
    if (functionName === "add_income") {
      const { amount, source, date, notes } = args;

      const amountError = validateAmount(
        amount,
        SECURITY_LIMITS.MAX_INCOME_AMOUNT,
        "Income",
      );
      if (amountError) return `Error: ${amountError}`;

      if (!validateSource(source)) {
        return `Error: Invalid income source. Must be one of: hackathon, bounty, freelance, crypto, other`;
      }

      const validDate = validateDate(date);
      if (!validDate) return `Error: Invalid date`;

      const { error } = await supabase.from("income").insert({
        user_id: userId,
        amount: Number(amount.toFixed(2)),
        source,
        date: validDate,
        notes: notes ? String(notes).substring(0, 500) : null,
      });

      if (error) return `Error: Failed to add income`;
      return `Success: Added ₦${amount.toLocaleString()} from ${source} on ${validDate}`;
    }

    if (functionName === "update_goal_progress") {
      const { goal_name, amount_to_add } = args;

      const amountError = validateAmount(
        Math.abs(amount_to_add),
        SECURITY_LIMITS.MAX_GOAL_UPDATE,
        "Goal update",
      );
      if (amountError) return `Error: ${amountError}`;

      const { data: goals } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active");

      if (!goals || goals.length === 0) return `Error: No active goals found`;

      const matchedGoal = goals.find(
        (g: Goal) =>
          g.name.toLowerCase().includes(goal_name.toLowerCase()) ||
          goal_name.toLowerCase().includes(g.name.toLowerCase()),
      );

      if (!matchedGoal) {
        return `Error: Could not find goal "${goal_name}". Your goals: ${goals.map((g: Goal) => g.name).join(", ")}`;
      }

      const newAmount = matchedGoal.current_amount + amount_to_add;
      if (newAmount < 0)
        return `Error: Cannot subtract more than current balance`;

      const { error } = await supabase
        .from("goals")
        .update({
          current_amount: Number(newAmount.toFixed(2)),
          status:
            newAmount >= matchedGoal.target_amount ? "completed" : "active",
        })
        .eq("id", matchedGoal.id);

      if (error) return `Error: Failed to update goal`;

      const progress = Math.round(
        (newAmount / matchedGoal.target_amount) * 100,
      );
      return `Success: Added ₦${amount_to_add.toLocaleString()} to "${matchedGoal.name}". Progress: ${progress}%`;
    }

    return `Error: Unknown function`;
  } catch (error) {
    return `Error: Function execution failed`;
  }
}

function buildSystemPrompt(context: UserContext): string {
  return `You are StashAI, a friendly financial assistant for people with inconsistent income (freelancers, gig workers).

FUNCTIONS AVAILABLE:
- add_income: When user mentions earning money
- update_goal_progress: When user adds money to a goal

Current Financial Snapshot:
- 30-day income: ₦${context.totalIncome.toLocaleString()}
- Income entries: ${context.incomeCount}
- Active goals: ${context.goals.length}

${context.goals.length > 0 ? `Goals:\n${context.goals.map((g) => `- ${g.name}: ₦${g.current.toLocaleString()} / ₦${g.target.toLocaleString()} (${g.progress}%)`).join("\n")}` : "No active goals yet"}

Keep responses concise. Use Naira (₦) for currency. Be encouraging and helpful!`;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ChatResponse>>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { user, supabase } = auth;
    const body = (await request.json()) as ChatRequestInput;
    const { message, conversationHistory } = body;

    if (!message?.trim() || message.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Invalid message" },
        { status: 400 },
      );
    }

    const context = await getUserContext(supabase, user.id);
    const systemPrompt = buildSystemPrompt(context);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ functionDeclarations: functions }],
    });

    const conversationContents: any[] = [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [{ text: "I'm StashAI, ready to help with your finances!" }],
      },
    ];

    if (conversationHistory?.length) {
      conversationHistory.forEach((msg) => {
        conversationContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.message }],
        });
      });
    }

    conversationContents.push({ role: "user", parts: [{ text: message }] });

    let response = await model.generateContent({
      contents: conversationContents,
    });
    const functionCalls = response.response.functionCalls();

    if (functionCalls?.length) {
      const functionResults: string[] = [];

      for (const call of functionCalls.slice(
        0,
        SECURITY_LIMITS.MAX_ACTIONS_PER_MESSAGE,
      )) {
        const result = await executeFunctionCall(
          call.name,
          call.args,
          supabase,
          user.id,
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

    const aiMessage =
      response.response.text() || "Sorry, I couldn't generate a response.";

    // Save chat history
    await supabase.from("chat_history").insert([
      {
        user_id: user.id,
        message,
        role: "user",
        timestamp: new Date().toISOString(),
      },
      {
        user_id: user.id,
        message: aiMessage,
        role: "assistant",
        timestamp: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({
      success: true,
      data: { message: aiMessage, role: "assistant" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process message" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ChatMessage[]>>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { user, supabase } = auth;
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");

    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", user.id)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch history" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: data?.reverse() || [] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
