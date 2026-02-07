import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/signup?error=${encodeURIComponent(error_description || error)}`,
    );
  }

  const supabase = await createClient();

  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (verifyError) {
      return NextResponse.redirect(
        `${origin}/auth/signup?error=${encodeURIComponent(verifyError.message)}`,
      );
    }

    // ✅ Redirect back to signup page with verified=true
    return NextResponse.redirect(`${origin}/auth/signup?verified=true`);
  }

  return NextResponse.redirect(`${origin}/auth/signup`);
}
