import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { validateEmail, validatePassword, sanitizeInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      const text = await request.text();
      if (!text) {
        return NextResponse.json(
          { success: false, error: "Request body is empty" },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email, password, full_name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { success: false, error: emailValidation.error },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 }
      );
    }

    const sanitizedName = full_name ? sanitizeInput(full_name) : "";
    const normalizedEmail = email.trim().toLowerCase();

    const supabase = await createClient();

    // ✅ Sign up with OTP (email code) instead of magic link
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { full_name: sanitizedName },
        // Don't set emailRedirectTo - we want OTP, not magic link
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists.",
          code: "EMAIL_EXISTS",
        },
        { status: 409 }
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
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}