import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

async function getUserStats(userId: string) {
  const supabase = createServerSupabase();

  const { data: progress } = await supabase
    .from("progress")
    .select("known, created_at, review_count")
    .eq("user_id", userId);

  if (!progress) {
    return {
      totalCards: 0,
      masteredCards: 0,
      reviewSessions: 0,
      firstLearnedAt: null,
    };
  }

  const totalCards = progress.length;
  const masteredCards = progress.filter((p) => p.known).length;
  const reviewSessions = progress.reduce((sum, p) => sum + (p.review_count || 1), 0);
  
  const dates = progress.map((p) => new Date(p.created_at).getTime());
  const firstLearnedAt = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : null;

  return {
    totalCards,
    masteredCards,
    reviewSessions,
    firstLearnedAt,
  };
}

export default async function SettingsPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const stats = await getUserStats(user.id);

  return <SettingsClient userId={user.id} stats={stats} />;
}
