import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-helper";

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { user, supabase } = auth;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { nickname, incomeSources, financialGoals } = body;

    // Update user metadata with onboarding data
    const { error } = await supabase.auth.updateUser({
      data: {
        nickname: nickname || "",
        income_sources: incomeSources || [],
        financial_goals: financialGoals || [],
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      },
    });

    if (error) {
      console.error("Onboarding save error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save onboarding data" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
