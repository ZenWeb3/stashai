import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-helper";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { user, supabase } = auth;
    const { id } = await context.params;

    const { data, error } = await supabase
      .from("income")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Income entry not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { user, supabase } = auth;
    const { id } = await context.params;

    const body = await request.json();
    const { amount, source, date, notes } = body;

    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be positive" },
        { status: 400 },
      );
    }

    if (source) {
      const validSources = [
        "hackathon",
        "bounty",
        "freelance",
        "crypto",
        "other",
        "salary",
        "business",
        "investment",
      ];
      if (!validSources.includes(source)) {
        return NextResponse.json(
          {
            success: false,
            error: `Source must be one of: ${validSources.join(", ")}`,
          },
          { status: 400 },
        );
      }
    }

    const updates: any = {};
    if (amount !== undefined) updates.amount = amount;
    if (source) updates.source = source;
    if (date) updates.date = date;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from("income")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Failed to update income entry" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { user, supabase } = auth;
    const { id } = await context.params;

    const { error } = await supabase
      .from("income")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to delete income entry" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Income entry deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
