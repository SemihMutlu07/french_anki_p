import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Start with a pass-through response; we'll replace it if we need to redirect.
  let response = NextResponse.next({ request });

  // Build a server-side Supabase client that can read and refresh the session
  // cookie. The setAll callback propagates refreshed tokens back to the browser.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror cookies onto the request for downstream middleware.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Build a new response so we can write the refreshed cookies.
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() validates the JWT with Supabase and triggers a token refresh if
  // needed. This is intentionally not getSession() (which trusts the local JWT
  // without re-validating with the server).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Protect everything except /login, /auth/*, Next.js internals, and static assets.
  matcher: ["/((?!login|auth|_next/static|_next/image|favicon.ico).*)"],
};
