export interface FSRSState {
  s: number;               // stability: days until 90% retention
  d: number;               // difficulty: 1–10
  r: number;               // retrievability at time of last review
  last_review_at: string | null;
}

export const FSRS_INIT: FSRSState = {
  s: 1.0,
  d: 5.0,
  r: 1.0,
  last_review_at: null,
};

/** e^(-t/S) — retrievability given stability and elapsed days. */
export function calcR(s: number, daysSince: number): number {
  return Math.exp(-daysSince / s);
}

/** Current retrievability, accounting for time elapsed since last review. */
export function currentR(state: FSRSState): number {
  if (!state.last_review_at) return 0.5; // never reviewed
  const ms = Date.now() - new Date(state.last_review_at).getTime();
  const daysSince = ms / (1000 * 60 * 60 * 24);
  return calcR(state.s, daysSince);
}

/** Compute next FSRS state after a review. */
export function updateState(
  prev: FSRSState | null,
  known: boolean
): FSRSState {
  const state = prev ?? FSRS_INIT;
  const r = prev ? currentR(state) : 0.5;

  let s: number;
  let d: number;

  if (known) {
    s = state.s * (1 + 0.9 * (1 - r));
    d = Math.max(1, state.d - 0.15);
  } else {
    s = Math.max(0.1, state.s * 0.2);
    d = Math.min(10, state.d + 0.3);
  }

  return { s, d, r, last_review_at: new Date().toISOString() };
}

/** Fisher-Yates shuffle (in-place). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Sort cards by current R ascending (lowest = most at-risk = show first).
 * Cards are grouped into three R buckets and shuffled within each bucket.
 */
export function sortQueueByR<T extends { id: string }>(
  items: T[],
  states: Record<string, FSRSState>
): T[] {
  const withR = items.map((item) => ({
    item,
    r: states[item.id] ? currentR(states[item.id]) : 0.5,
  }));

  const atRisk   = withR.filter((x) => x.r < 0.4);
  const uncertain = withR.filter((x) => x.r >= 0.4 && x.r < 0.75);
  const safe     = withR.filter((x) => x.r >= 0.75);

  return [...shuffle(atRisk), ...shuffle(uncertain), ...shuffle(safe)].map(
    (x) => x.item
  );
}
