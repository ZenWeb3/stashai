import { NextRequest, NextResponse } from "next/server";
import { supabase, createSupabaseClient } from "@/lib/supabase";
``;
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getUserAndClient(request);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user, client } = result;
    const { id } = await context.params;

    const { data, error } = await client
      .from("goals")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 }
      );
    }

    const goalWithProgress = {
      ...data,
      progress:
        data.target_amount > 0
          ? Math.round((data.current_amount / data.target_amount) * 100)
          : 0,
    };

    return NextResponse.json({
      success: true,
      data: goalWithProgress,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getUserAndClient(request);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user, client } = result;
    const { id } = await context.params;

    const body = await request.json();
    const { name, target_amount, current_amount, deadline, status } = body;

    // Validate amounts if provided
    if (target_amount !== undefined && target_amount <= 0) {
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

    // First, get the current goal to calculate final amounts
    const { data: currentGoal, error: fetchError } = await client
      .from("goals")
      .select("current_amount, target_amount")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !currentGoal) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {};
    if (name) updates.name = name;
    if (target_amount !== undefined) updates.target_amount = target_amount;
    if (current_amount !== undefined) updates.current_amount = current_amount;
    if (deadline !== undefined) updates.deadline = deadline;
    if (status) updates.status = status;

    // Calculate final amounts (use new value if provided, else keep current)
    const finalCurrent =
      current_amount !== undefined
        ? current_amount
        : currentGoal.current_amount;
    const finalTarget =
      target_amount !== undefined ? target_amount : currentGoal.target_amount;

    // Auto-complete if goal is reached
    if (finalCurrent >= finalTarget) {
      updates.status = "completed";
    }

    // Update in database
    const { data, error } = await client
      .from("goals")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Failed to update goal" },
        { status: 404 }
      );
    }

    // Add progress percentage
    const goalWithProgress = {
      ...data,
      progress:
        data.target_amount > 0
          ? Math.round((data.current_amount / data.target_amount) * 100)
          : 0,
    };

    return NextResponse.json({
      success: true,
      data: goalWithProgress,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getUserAndClient(request);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user, client } = result;
    const { id } = await context.params;

    const { error } = await client
      .from("goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to delete goal" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
