import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  validateEmail,
  validatePassword,
  sanitizeInput,
} from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateLimitResult = checkRateLimit(`signup:${ip}`);
    if (!rateLimitResult.allowed) {
      const minutes = Math.ceil(rateLimitResult.resetIn / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `Too many attempts. Try again in ${minutes} minutes.`,
        },
        { status: 429 },
      );
    }

    // ✅ Safely parse JSON body
    let body;
    try {
      const text = await request.text();
      if (!text) {
        return NextResponse.json(
          { success: false, error: "Request body is empty" },
          { status: 400 },
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { email, password, full_name } = body;

    // ✅ Check required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { success: false, error: emailValidation.error },
        { status: 400 },
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 },
      );
    }

    const sanitizedName = full_name ? sanitizeInput(full_name) : "";
    const normalizedEmail = email.trim().toLowerCase();

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { full_name: sanitizedName },
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    // Check if user already exists
    if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "An account with this email already exists. Please sign in instead.",
          code: "EMAIL_EXISTS",
        },
        { status: 409 },
      );
    }

    const emailConfirmationRequired = data.user && !data.session;

    return NextResponse.json({
      success: true,
      data: {
        user: data.user,
        session: data.session,
        emailConfirmationRequired,
      },
      passwordStrength: passwordValidation.strength,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
