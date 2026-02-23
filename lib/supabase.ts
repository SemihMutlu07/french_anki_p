/**
 * Browser-side Supabase client using @supabase/ssr.
 * Sessions are persisted in cookies so they're visible to middleware and server components.
 * Call createBrowserSupabase() wherever you need a client in a "use client" file.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
