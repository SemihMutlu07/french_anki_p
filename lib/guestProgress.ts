import { createBrowserSupabase } from "./supabase";
import type { FSRSState } from "./fsrs";
import type { CardItem } from "./types";

const GUEST_PROGRESS_KEY = "fr-tutor-guest-progress";
const GUEST_COOKIE = "fr-tutor-guest";
const ONBOARDED_KEY = "fr-tutor-onboarded";

export interface GuestProgressItem {
  card_id: string;
  course: string;
  unit: number;
  known: boolean;
  review_count: number;
  next_review_at: string;
  last_seen_at: string;
  s: number;
  d: number;
  r: number;
}

/** Check if current user is in guest mode (no Supabase session). */
export function isGuestMode(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(`${GUEST_COOKIE}=1`);
}

/** Set the guest cookie (called when user skips email in onboarding). */
export function enableGuestMode(): void {
  document.cookie = `${GUEST_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  localStorage.setItem(ONBOARDED_KEY, "1");
}

/** Mark onboarding complete (for logged-in users). */
export function markOnboarded(): void {
  localStorage.setItem(ONBOARDED_KEY, "1");
}

/** Check if user has completed onboarding. */
export function hasOnboarded(): boolean {
  return localStorage.getItem(ONBOARDED_KEY) === "1";
}

/** Save a card's progress to localStorage (guest mode). */
export function saveGuestProgress(
  card: CardItem,
  known: boolean,
  fsrs: FSRSState
): void {
  const items = getGuestProgress();
  const existing = items.findIndex((i) => i.card_id === card.id);

  const entry: GuestProgressItem = {
    card_id: card.id,
    course: card.course,
    unit: card.unit,
    known,
    review_count: existing >= 0 ? items[existing].review_count + 1 : 1,
    next_review_at: known
      ? new Date(Date.now() + fsrs.s * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    last_seen_at: new Date().toISOString(),
    s: fsrs.s,
    d: fsrs.d,
    r: fsrs.r,
  };

  if (existing >= 0) {
    items[existing] = entry;
  } else {
    items.push(entry);
  }

  localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(items));
}

/** Get all guest progress from localStorage. */
export function getGuestProgress(): GuestProgressItem[] {
  try {
    const raw = localStorage.getItem(GUEST_PROGRESS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GuestProgressItem[];
  } catch {
    return [];
  }
}

/**
 * Merge guest localStorage progress into Supabase for a logged-in user.
 * Returns number of items merged. Clears guest data after success.
 */
export async function mergeGuestProgress(userId: string): Promise<number> {
  const items = getGuestProgress();
  if (items.length === 0) return 0;

  const supabase = createBrowserSupabase();

  for (const item of items) {
    await supabase.from("progress").upsert(
      {
        user_id: userId,
        card_id: item.card_id,
        course: item.course,
        unit: item.unit,
        known: item.known,
        review_count: item.review_count,
        next_review_at: item.next_review_at,
        last_seen_at: item.last_seen_at,
        s: item.s,
        d: item.d,
        r: item.r,
      },
      { onConflict: "user_id,card_id" }
    );
  }

  // Clear guest data
  localStorage.removeItem(GUEST_PROGRESS_KEY);
  // Clear guest cookie
  document.cookie = `${GUEST_COOKIE}=; path=/; max-age=0`;

  return items.length;
}
