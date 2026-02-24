import { createBrowserSupabase } from "./supabase";
import type { CardItem } from "./types";
import type { FSRSState } from "./fsrs";

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
  s: number | null;
  d: number | null;
  r: number | null;
}

/** Upsert a card's progress with the new FSRS state. */
export async function saveProgress(
  card: CardItem,
  known: boolean,
  userId: string,
  newFsrsState: FSRSState
): Promise<void> {
  if (!userId) return;

  const supabase = createBrowserSupabase();

  const { data: existing } = await supabase
    .from("progress")
    .select("review_count")
    .eq("user_id", userId)
    .eq("card_id", card.id)
    .maybeSingle();

  const reviewCount = existing ? existing.review_count + 1 : 1;

  const nextReview = known
    ? new Date(Date.now() + newFsrsState.s * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 10 * 60 * 1000);

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
      s: newFsrsState.s,
      d: newFsrsState.d,
      r: newFsrsState.r,
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
  return (data ?? []) as ProgressRecord[];
}
