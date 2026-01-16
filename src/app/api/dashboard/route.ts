import { NextRequest, NextResponse } from "next/server";
import { supabase, createSupabaseClient } from "@/lib/supabase";
import type { ApiResponse } from "@/types";

interface DashboardStats {
  totalIncome: number;
  incomeCount: number;
  totalSaved: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  savingsRate: number;
  recentIncome: any[];
  topSource: string | null;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<DashboardStats>>> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = createSupabaseClient(token);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: incomeData } = await client
      .from("income")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });

    const totalIncome =
      incomeData?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
    const incomeCount = incomeData?.length || 0;

    const sourceCounts: Record<string, number> = {};
    incomeData?.forEach((income) => {
      sourceCounts[income.source] =
        (sourceCounts[income.source] || 0) + Number(income.amount);
    });
    const topSource =
      Object.keys(sourceCounts).length > 0
        ? Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    const { data: goalsData } = await client
      .from("goals")
      .select("*")
      .eq("user_id", user.id);

    const activeGoalsCount =
      goalsData?.filter((g) => g.status === "active").length || 0;
    const completedGoalsCount =
      goalsData?.filter((g) => g.status === "completed").length || 0;
    const totalSaved =
      goalsData?.reduce((sum, goal) => sum + Number(goal.current_amount), 0) ||
      0;

    const savingsRate =
      totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0;

    const recentIncome = incomeData?.slice(0, 5) || [];

    return NextResponse.json({
      success: true,
      data: {
        totalIncome,
        incomeCount,
        totalSaved,
        activeGoalsCount,
        completedGoalsCount,
        savingsRate,
        recentIncome,
        topSource,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
