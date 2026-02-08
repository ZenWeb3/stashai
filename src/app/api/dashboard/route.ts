import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-helper";

export async function GET() {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { user, supabase } = auth;

    // Get 30-day income
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: incomeData } = await supabase
      .from("income")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });

    const totalIncome =
      incomeData?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;

    // Get all goals
    const { data: goalsData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const activeGoals = goalsData?.filter((g) => g.status === "active") || [];
    const completedGoals =
      goalsData?.filter((g) => g.status === "completed") || [];

    const totalSaved = activeGoals.reduce(
      (sum, goal) => sum + Number(goal.current_amount),
      0,
    );

    // ✅ Calculate available balance
    const availableBalance = totalIncome - totalSaved;

    return NextResponse.json({
      success: true,
      data: {
        totalIncome,
        incomeCount: incomeData?.length || 0,
        totalSaved,
        availableBalance, // ✅ Add this
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        goals: activeGoals.map((g) => ({
          id: g.id,
          name: g.name,
          target_amount: g.target_amount,
          current_amount: g.current_amount,
          deadline: g.deadline,
          status: g.status,
          progress: Math.round((g.current_amount / g.target_amount) * 100),
        })),
        recentIncome: incomeData?.slice(0, 5) || [],
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
