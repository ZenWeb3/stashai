import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ✅ Debug logging
  console.log("🔵 Middleware:", {
    pathname,
    hasUser: !!user,
    onboardingCompleted: user?.user_metadata?.onboarding_completed,
  });

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return supabaseResponse;
  }

  // Not logged in
  if (!user) {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/onboarding")
    ) {
      console.log("🔴 Not logged in, redirecting to signin");
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signin";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // User is logged in
  const onboardingCompleted = user.user_metadata?.onboarding_completed === true;

  // Going to dashboard but hasn't completed onboarding
  if (pathname.startsWith("/dashboard") && !onboardingCompleted) {
    console.log("🟡 Redirecting to onboarding");
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  // Going to onboarding but already completed
  if (pathname.startsWith("/onboarding") && onboardingCompleted) {
    console.log("🟢 Redirecting to dashboard - onboarding done");
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
