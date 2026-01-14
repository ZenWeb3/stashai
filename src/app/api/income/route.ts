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
    const source = searchParams.get("source");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let query = client
      .from("income")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (source) {
      query = query.eq("source", source);
    }
    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch income" },
        { status: 500 }
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
    const { amount, source, date, notes } = body;

    if (!amount || !source || !date) {
      return NextResponse.json(
        { success: false, error: "Amount, source, and date are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be positive" },
        { status: 400 }
      );
    }

    const validSources = [
      "hackathon",
      "bounty",
      "freelance",
      "crypto",
      "other",
    ];
    if (!validSources.includes(source)) {
      return NextResponse.json(
        {
          success: false,
          error: `Source must be one of: ${validSources.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from("income")
      .insert({
        user_id: user.id,
        amount,
        source,
        date,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create income entry" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
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
