import { NextRequest, NextResponse } from "next/server";
import { supabase, createSupabaseClient } from "@/lib/supabase";

async function getUserAndClient(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  const userClient = createSupabaseClient(token);

  return { user, client: userClient };
}

export async function GET(request: NextRequest) {
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
    const status = searchParams.get("status");

    let query = client
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch goals" },
        { status: 500 }
      );
    }

    // Calculate progress percentage for each goal
    const goalsWithProgress = data.map((goal) => ({
      ...goal,
      progress:
        goal.target_amount > 0
          ? Math.round((goal.current_amount / goal.target_amount) * 100)
          : 0,
    }));

    return NextResponse.json({
      success: true,
      data: goalsWithProgress,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await getUserAndClient(request);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user, client } = result;

    const body = await request.json();
    const { name, target_amount, current_amount, deadline } = body;

    if (!name || !target_amount) {
      return NextResponse.json(
        { success: false, error: "Name and target amount are required" },
        { status: 400 }
      );
    }

    if (target_amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Target amount must be positive" },
        { status: 400 }
      );
    }

    if (current_amount !== undefined && current_amount < 0) {
      return NextResponse.json(
        { success: false, error: "Current amount cannot be negative" },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from("goals")
      .insert({
        user_id: user.id,
        name,
        target_amount,
        current_amount: current_amount || 0,
        deadline: deadline || null,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create goal" },
        { status: 500 }
      );
    }

    const goalWithProgress = {
      ...data,
      progress:
        data.target_amount > 0
          ? Math.round((data.current_amount / data.target_amount) * 100)
          : 0,
    };

    return NextResponse.json(
      {
        success: true,
        data: goalWithProgress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
