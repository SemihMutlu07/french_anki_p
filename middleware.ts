import { NextResponse } from "next/server";

// Auth disabled for testing — all routes are publicly accessible.
// Re-enable by restoring the Supabase auth check and redirect logic.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|auth|_next/static|_next/image|favicon.ico).*)"],
};
