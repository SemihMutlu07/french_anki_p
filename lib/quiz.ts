import { createBrowserSupabase } from "./supabase";

/** Save a listening quiz attempt to Supabase. */
export async function saveListeningAttempt(
  userId: string,
  cardId: string,
  correct: boolean
): Promise<void> {
  if (!userId) return;
  const supabase = createBrowserSupabase();
  await supabase.from("listening_attempts").insert({
    user_id: userId,
    card_id: cardId,
    correct,
  });
}

/** Save a sentence practice attempt to Supabase. */
export async function saveSentenceAttempt(
  userId: string,
  cardId: string,
  type: string,
  correct: boolean
): Promise<void> {
  if (!userId) return;
  const supabase = createBrowserSupabase();
  await supabase.from("sentence_attempts").insert({
    user_id: userId,
    card_id: cardId,
    type,
    correct,
  });
}

/** Save a gender quiz attempt to Supabase. */
export async function saveGenderAttempt(
  userId: string,
  cardId: string,
  correct: boolean
): Promise<void> {
  if (!userId) return;
  const supabase = createBrowserSupabase();
  await supabase.from("gender_quiz_attempts").insert({
    user_id: userId,
    card_id: cardId,
    correct,
  });
}

/** Gender rule hints based on common French suffix patterns. */
const GENDER_RULES: { pattern: RegExp; gender: "m" | "f"; hint: string }[] = [
  { pattern: /tion$/i, gender: "f", hint: "-tion ile bitenler genellikle feminen" },
  { pattern: /sion$/i, gender: "f", hint: "-sion ile bitenler genellikle feminen" },
  { pattern: /ure$/i, gender: "f", hint: "-ure ile bitenler genellikle feminen" },
  { pattern: /ette$/i, gender: "f", hint: "-ette ile bitenler genellikle feminen" },
  { pattern: /ence$/i, gender: "f", hint: "-ence ile bitenler genellikle feminen" },
  { pattern: /ance$/i, gender: "f", hint: "-ance ile bitenler genellikle feminen" },
  { pattern: /ie$/i, gender: "f", hint: "-ie ile bitenler genellikle feminen" },
  { pattern: /age$/i, gender: "m", hint: "-age ile bitenler genellikle maskülen" },
  { pattern: /ment$/i, gender: "m", hint: "-ment ile bitenler genellikle maskülen" },
  { pattern: /isme$/i, gender: "m", hint: "-isme ile bitenler genellikle maskülen" },
  { pattern: /eur$/i, gender: "m", hint: "-eur ile bitenler genellikle maskülen" },
  { pattern: /eau$/i, gender: "m", hint: "-eau ile bitenler genellikle maskülen" },
];

/** Get a gender hint for a word based on its suffix, or a generic hint. */
export function getGenderHint(bareWord: string): string {
  for (const rule of GENDER_RULES) {
    if (rule.pattern.test(bareWord)) {
      return rule.hint;
    }
  }
  return "Article ile birlikte ezberle!";
}

/**
 * Strip accents for tolerant comparison.
 * "français" → "francais", "où" → "ou"
 */
export function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Compare two strings ignoring case and accents. */
export function accentTolerantMatch(input: string, expected: string): boolean {
  return (
    stripAccents(input.trim().toLowerCase()) ===
    stripAccents(expected.trim().toLowerCase())
  );
}

/** Shuffle an array in place (Fisher-Yates). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick N random distractors from a pool, excluding the correct card.
 * Prefers cards from the same unit for confusability.
 */
export function pickDistractors<T extends { id: string; unit: number }>(
  correct: T,
  pool: T[],
  count: number
): T[] {
  const sameUnit = pool.filter(
    (c) => c.id !== correct.id && c.unit === correct.unit
  );
  const otherUnit = pool.filter(
    (c) => c.id !== correct.id && c.unit !== correct.unit
  );

  const shuffledSame = shuffle(sameUnit);
  const shuffledOther = shuffle(otherUnit);

  const result: T[] = [];
  for (const c of shuffledSame) {
    if (result.length >= count) break;
    result.push(c);
  }
  for (const c of shuffledOther) {
    if (result.length >= count) break;
    result.push(c);
  }
  return result;
}
