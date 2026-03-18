import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

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
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this keeps cookies alive across page refreshes.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authenticated users pass through.
  if (user) return response;

  // Allow root path without auth (onboarding lives here).
  if (request.nextUrl.pathname === "/") return response;

  // Guest users (completed onboarding, skipped email) can access the app.
  if (request.cookies.get("fr-tutor-guest")?.value === "1") return response;

  // Everyone else → login.
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!login|auth|_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|icons|offline).*)"],
};
