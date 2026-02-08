import type { Income, Goal } from "@/types";
import type { UserContext, GoalWithProgress } from "./types";

export async function getUserContext(
  supabase: any,
  userId: string,
  userMetadata?: any
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
      0
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
    nickname: userMetadata?.nickname || "there",
    incomeSources: userMetadata?.income_sources || [],
  };
}