import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import ReviewClient from "@/components/ReviewClient";

export const dynamic = "force-dynamic";

interface WeakCard {
  id: string;
  french: string;
  turkish: string;
  ipa: string;
  example_sentence: string;
  example_translation: string;
  unit: number;
  course: string;
  unknownCount: number;
  lastReviewed: string;
}

async function getWeakCards(userId: string): Promise<WeakCard[]> {
  const supabase = createServerSupabase();

  const { data: progress } = await supabase
    .from("progress")
    .select("card_id, known, review_count, last_seen_at, course, unit")
    .eq("user_id", userId)
    .eq("known", false)
    .order("review_count", { ascending: false })
    .limit(50);

  if (!progress || progress.length === 0) return [];

  const weakCards: WeakCard[] = [];
  for (const row of progress) {
    // Find card in curriculum
    for (let unit = 1; unit <= 18; unit++) {
      try {
        const unitData = await import(`@/curriculum/101/unit${unit}.json`);
        const card = unitData.default.find((c: { id: string }) => c.id === row.card_id);
        if (card) {
          weakCards.push({
            ...card,
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

  return weakCards;
}

export default async function ReviewPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const weakCards = await getWeakCards(user.id);

  return <ReviewClient initialCards={weakCards} userId={user.id} />;
}
