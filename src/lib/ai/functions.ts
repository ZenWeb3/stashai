import { SchemaType, type FunctionDeclaration } from "@google/generative-ai";
import { SECURITY_LIMITS } from "./types";
import { validateAmount, validateSource, validateDate } from "./validators";
import type { Goal } from "@/types";

export const aiFunctions: FunctionDeclaration[] = [
  {
    name: "add_income",
    description:
      "Add a new income entry for the user. Use when user reports earning money.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        amount: {
          type: SchemaType.NUMBER,
          description: "The income amount in Naira",
        },
        source: {
          type: SchemaType.STRING,
          description:
            "Source: hackathon, bounty, freelance, crypto, salary, business, investment, or other",
        },
        date: {
          type: SchemaType.STRING,
          description: "Date in YYYY-MM-DD format (defaults to today)",
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
    description: "Add money to a savings goal.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        goal_name: {
          type: SchemaType.STRING,
          description: "The name of the goal to update",
        },
        amount_to_add: {
          type: SchemaType.NUMBER,
          description: "The amount to add to the goal",
        },
      },
      required: ["goal_name", "amount_to_add"],
    },
  },
  {
    name: "create_goal",
    description: "Create a new savings goal for the user.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: {
          type: SchemaType.STRING,
          description:
            "Name of the goal (e.g., 'New Laptop', 'Emergency Fund')",
        },
        target_amount: {
          type: SchemaType.NUMBER,
          description: "Target amount to save in Naira",
        },
        deadline: {
          type: SchemaType.STRING,
          description: "Optional deadline in YYYY-MM-DD format",
        },
      },
      required: ["name", "target_amount"],
    },
  },
];

export async function executeFunctionCall(
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
        return `Error: Invalid income source. Must be one of: hackathon, bounty, freelance, crypto, salary, business, investment, other`;
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

      // ✅ Get user's available balance first
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: incomeData } = await supabase
        .from("income")
        .select("amount")
        .eq("user_id", userId)
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

      const { data: goalsData } = await supabase
        .from("goals")
        .select("current_amount")
        .eq("user_id", userId)
        .eq("status", "active");

      const totalIncome =
        incomeData?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;
      const totalSaved =
        goalsData?.reduce((sum, g) => sum + Number(g.current_amount), 0) || 0;
      const availableBalance = totalIncome - totalSaved;

      // ✅ Check if user has enough balance
      if (amount_to_add > 0 && amount_to_add > availableBalance) {
        return `Error: You only have ₦${availableBalance.toLocaleString()} available. You're trying to move ₦${amount_to_add.toLocaleString()}.`;
      }

      const { data: goals } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active");

      if (!goals || goals.length === 0) return `Error: No active goals found`;

      const matchedGoal = goals.find(
        (g: any) =>
          g.name.toLowerCase().includes(goal_name.toLowerCase()) ||
          goal_name.toLowerCase().includes(g.name.toLowerCase()),
      );

      if (!matchedGoal) {
        return `Error: Could not find goal "${goal_name}". Your goals: ${goals.map((g: any) => g.name).join(", ")}`;
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
      const remainingBalance = availableBalance - amount_to_add;

      return `Success: Moved ₦${amount_to_add.toLocaleString()} to "${matchedGoal.name}". Progress: ${progress}%. Available balance: ₦${remainingBalance.toLocaleString()}`;
    }

    if (functionName === "create_goal") {
      const { name, target_amount, deadline } = args;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return "Error: Goal name is required";
      }

      const amountError = validateAmount(
        target_amount,
        SECURITY_LIMITS.MAX_INCOME_AMOUNT,
        "Goal target",
      );
      if (amountError) return `Error: ${amountError}`;

      // Check for duplicate
      const { data: existingGoals } = await supabase
        .from("goals")
        .select("name")
        .eq("user_id", userId)
        .eq("status", "active");

      const duplicate = existingGoals?.find(
        (g: any) => g.name.toLowerCase() === name.trim().toLowerCase(),
      );

      if (duplicate) {
        return `Error: You already have a goal named "${name}"`;
      }

      // Validate deadline if provided
      let validDeadline = null;
      if (deadline) {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        if (isNaN(deadlineDate.getTime()) || deadlineDate <= today) {
          return "Error: Deadline must be a valid future date";
        }
        validDeadline = deadline;
      }

      const { error } = await supabase.from("goals").insert({
        user_id: userId,
        name: name.trim().substring(0, 100),
        target_amount: Number(target_amount.toFixed(2)),
        current_amount: 0,
        deadline: validDeadline,
        status: "active",
      });

      if (error) return `Error: Failed to create goal`;
      return `Success: Created goal "${name}" with target ₦${target_amount.toLocaleString()}${validDeadline ? ` (deadline: ${validDeadline})` : ""}`;
    }

    return `Error: Unknown function`;
  } catch (error) {
    console.error("Function execution error:", error);
    return `Error: Function execution failed`;
  }
}
