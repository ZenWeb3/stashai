import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-helper";
import type { ApiResponse } from "@/types";

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  metadata?: {
    full_name?: string;
    avatar_url?: string;
    preferences?: {
      currency?: string;
      notifications_enabled?: boolean;
    };
  };
}

interface UserStats {
  total_income: number;
  total_goals: number;
  account_age_days: number;
  last_activity: string;
}

interface UserResponse {
  profile: UserProfile;
  stats: UserStats;
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<UserResponse>>> {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { user, supabase } = auth;

    const { data: incomeData } = await supabase
      .from("income")
      .select("amount")
      .eq("user_id", user.id);

    const { data: goalsData } = await supabase
      .from("goals")
      .select("id")
      .eq("user_id", user.id);

    const { data: lastActivity } = await supabase
      .from("income")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const totalIncome =
      incomeData?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
    const totalGoals = goalsData?.length || 0;

    const accountCreated = new Date(user.created_at);
    const now = new Date();
    const accountAgeDays = Math.floor(
      (now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24),
    );

    const profile: UserProfile = {
      id: user.id,
      email: user.email || "",
      created_at: user.created_at,
      metadata: user.user_metadata,
    };

    const stats: UserStats = {
      total_income: totalIncome,
      total_goals: totalGoals,
      account_age_days: accountAgeDays,
      last_activity: lastActivity?.created_at || user.created_at,
    };

    return NextResponse.json({
      success: true,
      data: { profile, stats },
    });
  } catch (error) {
    console.error("User profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<UserProfile>>> {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { user, supabase } = auth;
    const body = await request.json();

    const allowedFields = ["full_name", "avatar_url", "preferences"];
    const updates: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "full_name" && typeof body[field] === "string") {
          updates[field] = body[field].substring(0, 100);
        } else if (field === "avatar_url" && typeof body[field] === "string") {
          try {
            new URL(body[field]);
            updates[field] = body[field];
          } catch {
            return NextResponse.json(
              { success: false, error: "Invalid avatar URL" },
              { status: 400 },
            );
          }
        } else if (field === "preferences" && typeof body[field] === "object") {
          updates[field] = {
            currency: body[field].currency || "NGN",
            notifications_enabled: body[field].notifications_enabled !== false,
          };
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) {
      console.error("User update error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 },
      );
    }

    const updatedProfile: UserProfile = {
      id: data.user.id,
      email: data.user.email || "",
      created_at: data.user.created_at,
      metadata: data.user.user_metadata,
    };

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user profile" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    if (body.confirm !== true) {
      return NextResponse.json(
        { success: false, error: "Account deletion requires confirmation" },
        { status: 400 },
      );
    }

    // Note: Full user deletion requires Supabase Admin API
    return NextResponse.json({
      success: true,
      data: {
        message:
          "Account deletion requested. Please contact support to complete the process.",
      },
    });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
