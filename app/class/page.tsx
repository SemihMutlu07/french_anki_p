import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import ClassDashboardClient from "@/components/ClassDashboardClient";

export const dynamic = "force-dynamic";

interface UnitReviewData {
  unit: number;
  reviews: number;
}

interface HardCard {
  cardId: string;
  french: string;
  turkish: string;
  fails: number;
}

async function getActiveUsers(sevenDaysAgo: string): Promise<number> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("progress")
    .select("user_id")
    .gte("last_seen_at", sevenDaysAgo);

  if (!data) return 0;
  return new Set(data.map((r) => r.user_id)).size;
}

async function getClassAverageMature(): Promise<number> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("progress")
    .select("user_id")
    .gt("s", 21);

  if (!data || data.length === 0) return 0;

  // Count mature cards per user, then average
  const byUser = new Map<string, number>();
  for (const row of data) {
    byUser.set(row.user_id, (byUser.get(row.user_id) || 0) + 1);
  }

  const counts = Array.from(byUser.values());
  return Math.round(counts.reduce((a, b) => a + b, 0) / counts.length);
}

async function getUnitReviews(): Promise<UnitReviewData[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("progress")
    .select("unit")
    .eq("course", "101");

  if (!data) return [];

  const byUnit = new Map<number, number>();
  for (const row of data) {
    byUnit.set(row.unit, (byUnit.get(row.unit) || 0) + 1);
  }

  return Array.from(byUnit.entries())
    .map(([unit, reviews]) => ({ unit, reviews }))
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 5);
}

async function getHardCards(): Promise<HardCard[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("progress")
    .select("card_id")
    .eq("course", "101")
    .eq("known", false);

  if (!data || data.length === 0) return [];

  // Count fails per card
  const byCard = new Map<string, number>();
  for (const row of data) {
    byCard.set(row.card_id, (byCard.get(row.card_id) || 0) + 1);
  }

  const topCards = Array.from(byCard.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Look up card names from curriculum
  const results: HardCard[] = [];
  for (const [cardId, fails] of topCards) {
    let found = false;
    for (let unit = 1; unit <= 18 && !found; unit++) {
      try {
        const unitData = await import(`@/curriculum/101/unit${unit}.json`);
        const card = unitData.default.find(
          (c: { id: string }) => c.id === cardId
        );
        if (card) {
          results.push({
            cardId,
            french: card.french || card.front,
            turkish: card.turkish || card.back,
            fails,
          });
          found = true;
        }
      } catch {
        continue;
      }
    }
  }

  return results;
}

async function getListeningAccuracy(sevenDaysAgo: string): Promise<number | null> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("listening_attempts")
    .select("correct")
    .gte("created_at", sevenDaysAgo);

  if (!data || data.length === 0) return null;

  const correctCount = data.filter((r) => r.correct).length;
  return Math.round((correctCount / data.length) * 100);
}

async function getGenderAccuracy(sevenDaysAgo: string): Promise<number | null> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("gender_quiz_attempts")
    .select("correct")
    .gte("created_at", sevenDaysAgo);

  if (!data || data.length === 0) return null;

  const correctCount = data.filter((r) => r.correct).length;
  return Math.round((correctCount / data.length) * 100);
}

/** Compare this week's activity with last week's. */
async function getWeekOverWeek(
  sevenDaysAgo: string,
  fourteenDaysAgo: string
): Promise<{ thisWeek: number; lastWeek: number }> {
  const supabase = createServerSupabase();

  const { count: thisWeek } = await supabase
    .from("progress")
    .select("*", { count: "exact", head: true })
    .gte("last_seen_at", sevenDaysAgo);

  const { count: lastWeek } = await supabase
    .from("progress")
    .select("*", { count: "exact", head: true })
    .gte("last_seen_at", fourteenDaysAgo)
    .lt("last_seen_at", sevenDaysAgo);

  return {
    thisWeek: thisWeek ?? 0,
    lastWeek: lastWeek ?? 0,
  };
}

export default async function ClassPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const [
    activeUsers,
    classAvgMature,
    unitReviews,
    hardCards,
    listeningAccuracy,
    genderAccuracy,
    weekOverWeek,
  ] = await Promise.all([
    getActiveUsers(sevenDaysAgo),
    getClassAverageMature(),
    getUnitReviews(),
    getHardCards(),
    getListeningAccuracy(sevenDaysAgo),
    getGenderAccuracy(sevenDaysAgo),
    getWeekOverWeek(sevenDaysAgo, fourteenDaysAgo),
  ]);

  return (
    <ClassDashboardClient
      activeUsers={activeUsers}
      totalStudents={25}
      classAvgMature={classAvgMature}
      unitReviews={unitReviews}
      hardCards={hardCards}
      listeningAccuracy={listeningAccuracy}
      genderAccuracy={genderAccuracy}
      weekOverWeek={weekOverWeek}
    />
  );
}
