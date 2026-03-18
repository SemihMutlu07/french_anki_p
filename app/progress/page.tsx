import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import ProgressDashboardClient from "@/components/ProgressDashboardClient";

export const dynamic = "force-dynamic";

interface WeeklyActivity {
  date: string;
  cardsReviewed: number;
}

interface MasteryData {
  unit: number;
  mastered: number;
  total: number;
  percentage: number;
}

interface WeakCard {
  id: string;
  french: string;
  turkish: string;
  unknownCount: number;
  lastReviewed: string;
}

async function getWeeklyActivity(userId: string): Promise<WeeklyActivity[]> {
  const supabase = createServerSupabase();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data } = await supabase
    .from("progress")
    .select("last_seen_at, review_count")
    .eq("user_id", userId)
    .gte("last_seen_at", sevenDaysAgo.toISOString())
    .order("last_seen_at", { ascending: true });

  if (!data) return [];

  const byDate = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    byDate.set(dateStr, 0);
  }

  for (const row of data) {
    const dateStr = row.last_seen_at.split("T")[0];
    const existing = byDate.get(dateStr) || 0;
    byDate.set(dateStr, existing + (row.review_count || 1));
  }

  return Array.from(byDate.entries())
    .map(([date, count]) => ({ date, cardsReviewed: count }))
    .reverse();
}

async function getMasteryData(userId: string): Promise<MasteryData[]> {
  const supabase = createServerSupabase();

  const { data: progress } = await supabase
    .from("progress")
    .select("unit, known")
    .eq("user_id", userId)
    .eq("course", "101");

  if (!progress) return [];

  const byUnit = new Map<number, { mastered: number; total: number }>();
  const units = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  units.forEach((unit) => {
    byUnit.set(unit, { mastered: 0, total: 0 });
  });

  for (const unit of units) {
    try {
      const unitData = await import(`@/curriculum/101/unit${unit}.json`);
      byUnit.get(unit)!.total = unitData.default.length;
    } catch {
      // Unit doesn't exist
    }
  }

  for (const row of progress) {
    if (row.known) {
      const existing = byUnit.get(row.unit) || { mastered: 0, total: 0 };
      existing.mastered += 1;
      byUnit.set(row.unit, existing);
    }
  }

  return Array.from(byUnit.entries())
    .filter(([, data]) => data.total > 0)
    .map(([unit, data]) => ({
      unit,
      mastered: data.mastered,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0,
    }));
}

async function getWeakCards(userId: string): Promise<WeakCard[]> {
  const supabase = createServerSupabase();

  const { data: progress } = await supabase
    .from("progress")
    .select("card_id, known, review_count, last_seen_at")
    .eq("user_id", userId)
    .eq("course", "101")
    .eq("known", false)
    .order("review_count", { ascending: false })
    .limit(10);

  if (!progress || progress.length === 0) return [];

  const weakCards: WeakCard[] = [];
  for (const row of progress) {
    for (let unit = 1; unit <= 18; unit++) {
      try {
        const unitData = await import(`@/curriculum/101/unit${unit}.json`);
        const card = unitData.default.find((c: { id: string }) => c.id === row.card_id);
        if (card) {
          weakCards.push({
            id: card.id,
            french: card.french || card.front,
            turkish: card.turkish || card.back,
            unknownCount: row.review_count,
            lastReviewed: row.last_seen_at,
          });
          break;
        }
      } catch {
        continue;
      }
    }
  }

  return weakCards.slice(0, 5);
}

/** Count cards with stability > 21 days (mature/well-learned). */
async function getMatureCount(userId: string): Promise<number> {
  const supabase = createServerSupabase();

  const { count } = await supabase
    .from("progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course", "101")
    .gt("s", 21);

  return count ?? 0;
}

interface PersonalSummary {
  cardsStudiedThisWeek: number;
  newCardsThisWeek: number;
  listeningAccuracy: number | null;
  suggestedUnit: number | null;
}

async function getPersonalSummary(userId: string): Promise<PersonalSummary> {
  const supabase = createServerSupabase();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Cards studied this week (distinct cards with activity)
  const { data: recentProgress } = await supabase
    .from("progress")
    .select("card_id, review_count")
    .eq("user_id", userId)
    .gte("last_seen_at", sevenDaysAgo);

  const cardsStudiedThisWeek = recentProgress?.length ?? 0;
  const newCardsThisWeek = recentProgress?.filter((r) => r.review_count === 1).length ?? 0;

  // Listening accuracy
  const { data: listeningData } = await supabase
    .from("listening_attempts")
    .select("correct")
    .eq("user_id", userId)
    .gte("created_at", sevenDaysAgo);

  let listeningAccuracy: number | null = null;
  if (listeningData && listeningData.length > 0) {
    const correct = listeningData.filter((r) => r.correct).length;
    listeningAccuracy = Math.round((correct / listeningData.length) * 100);
  }

  return {
    cardsStudiedThisWeek,
    newCardsThisWeek,
    listeningAccuracy,
    suggestedUnit: null, // filled below from masteryData
  };
}

export default async function ProgressPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [weeklyActivity, masteryData, weakCards, matureCount, personalSummary] =
    await Promise.all([
      getWeeklyActivity(user.id),
      getMasteryData(user.id),
      getWeakCards(user.id),
      getMatureCount(user.id),
      getPersonalSummary(user.id),
    ]);

  const totalMastered = masteryData.reduce((sum, m) => sum + m.mastered, 0);
  const totalCards = masteryData.reduce((sum, m) => sum + m.total, 0);
  const overallProgress = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;

  // Find weakest unit that has been started but not completed
  const weakestUnit = masteryData
    .filter((m) => m.percentage > 0 && m.percentage < 100)
    .sort((a, b) => a.percentage - b.percentage)[0];
  personalSummary.suggestedUnit = weakestUnit?.unit ?? null;

  return (
    <ProgressDashboardClient
      weeklyActivity={weeklyActivity}
      masteryData={masteryData}
      weakCards={weakCards}
      overallProgress={overallProgress}
      totalMastered={totalMastered}
      totalCards={totalCards}
      matureCount={matureCount}
      personalSummary={personalSummary}
    />
  );
}
