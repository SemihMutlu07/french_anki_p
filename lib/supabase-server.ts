/**
 * Server-side Supabase client factory using @supabase/ssr.
 * Reads and writes session cookies via next/headers.
 * Only import this in Server Components and Route Handlers — never in "use client" files.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from a Server Component; cookie writes are
            // ignored there (they only work in Route Handlers / middleware).
          }
        },
      },
    }
  );
}
