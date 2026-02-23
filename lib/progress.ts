import { createBrowserSupabase } from "./supabase";
import type { CardItem } from "./types";

export interface ProgressRecord {
  id: string;
  user_id: string;
  card_id: string;
  course: string;
  unit: number;
  known: boolean;
  review_count: number;
  next_review_at: string;
  last_seen_at: string;
}

/** Returns the next review date based on whether the card was known and how many times reviewed. */
export function getNextReviewDate(known: boolean, reviewCount: number): Date {
  const now = new Date();
  if (!known) {
    // Unknown: review again in 10 minutes
    return new Date(now.getTime() + 10 * 60 * 1000);
  }
  // Known: +1 day, +3 days, +7 days
  const days = reviewCount === 1 ? 1 : reviewCount === 2 ? 3 : 7;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

/** Upsert a card's progress for the given user. */
export async function saveProgress(
  card: CardItem,
  known: boolean,
  userId: string
): Promise<void> {
  if (!userId) return;

  const supabase = createBrowserSupabase();

  // Fetch existing record to get current review_count for this user + card.
  const { data: existing } = await supabase
    .from("progress")
    .select("review_count")
    .eq("user_id", userId)
    .eq("card_id", card.id)
    .maybeSingle();

  const reviewCount = existing ? existing.review_count + 1 : 1;
  const nextReview = getNextReviewDate(known, reviewCount);

  await supabase.from("progress").upsert(
    {
      user_id: userId,
      card_id: card.id,
      course: card.course,
      unit: card.unit,
      known,
      review_count: reviewCount,
      next_review_at: nextReview.toISOString(),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id,card_id" }
  );
}

/** Fetch all progress records for a given user + course + unit. */
export async function getProgress(
  course: string,
  unit: number,
  userId: string
): Promise<ProgressRecord[]> {
  if (!userId) return [];

  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", userId)
    .eq("course", course)
    .eq("unit", unit);

  if (error) {
    console.error("getProgress error:", error);
    return [];
  }
  return data ?? [];
}
