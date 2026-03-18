/**
 * Server-only curriculum loader.
 * Uses `fs` — do NOT import this in client components.
 *
 * Reads unit JSON from disk and returns only the fields the client needs,
 * stripping unsplash_query, forvo_word, audio_gender, cefr_level, and tags.
 */
import { promises as fs } from "fs";
import path from "path";
import type { CardItem, GenderedCard, SentenceCard } from "./types";

// Raw shape as it exists in the JSON files (includes unused fields)
interface RawVocabItem {
  id?: string;
  french: string;
  turkish: string;
  ipa?: string;
  example_sentence?: string;
  example_translation?: string;
  unit: number;
  course: string;
  [key: string]: unknown;
}

const VALID_UNIT_RANGE = { min: 1, max: 18 };
const unitCache = new Map<string, Promise<RawVocabItem[] | null>>();

function unitFilePath(course: string, n: number): string {
  return path.join(process.cwd(), "curriculum", course, `unit${n}.json`);
}

function unitCacheKey(course: string, unit: number): string {
  return `${course}:unit${unit}`;
}

async function readRawUnit(
  course: string,
  unit: number
): Promise<RawVocabItem[] | null> {
  const key = unitCacheKey(course, unit);
  const cached = unitCache.get(key);
  if (cached) return cached;

  const promise = (async () => {
    try {
      const raw = await fs.readFile(unitFilePath(course, unit), "utf-8");
      return JSON.parse(raw) as RawVocabItem[];
    } catch {
      return null;
    }
  })();
  unitCache.set(key, promise);
  return promise;
}

function parseUnitRef(unitId: string): { course: string; unit: number } | null {
  const courseMatch = /^(\d+)-unit(\d+)$/.exec(unitId);
  if (courseMatch) {
    const n = parseInt(courseMatch[2], 10);
    if (n < VALID_UNIT_RANGE.min || n > VALID_UNIT_RANGE.max) return null;
    return { course: courseMatch[1], unit: n };
  }

  const legacyMatch = /^unit(\d+)$/.exec(unitId);
  if (!legacyMatch) return null;
  const n = parseInt(legacyMatch[1], 10);
  if (n < VALID_UNIT_RANGE.min || n > VALID_UNIT_RANGE.max) return null;
  return { course: "101", unit: n };
}

/**
 * Load and strip a single unit. Returns null for unknown/invalid unit IDs.
 * IDs are taken from JSON; if absent, a deterministic `course-unitN:index` is generated.
 */
export async function getUnitItems(unitId: string): Promise<CardItem[] | null> {
  const parsed = parseUnitRef(unitId);
  if (parsed === null) return null;

  const items = await readRawUnit(parsed.course, parsed.unit);
  if (!items) return null;

  return items.map(
    (item, idx): CardItem => {
      const raw = item as Record<string, unknown>;
      const french =
        typeof item.french === "string"
          ? item.french
          : typeof raw.front === "string"
          ? (raw.front as string)
          : "";
      const turkish =
        typeof item.turkish === "string"
          ? item.turkish
          : typeof raw.back === "string"
          ? (raw.back as string)
          : "";
      return {
        id:
          typeof item.id === "string"
            ? item.id
            : `${parsed.course}-unit${parsed.unit}:${idx}`,
        french,
        turkish,
        ipa: item.ipa ?? "",
        example_sentence: item.example_sentence ?? "",
        example_translation: item.example_translation ?? "",
        unit: item.unit ?? parsed.unit,
        course: item.course ?? parsed.course,
      };
    }
  );
}

/** Returns the number of cards in a unit (0 if the unit doesn't exist). */
export async function getUnitCount(unitId: string): Promise<number> {
  const items = await getUnitItems(unitId);
  return items?.length ?? 0;
}

/**
 * Load all cards from all available units for quiz use.
 * Normalises unit 11-12 format (front/back → french/turkish).
 */
export async function getAllCards(course: string): Promise<CardItem[]> {
  const all: CardItem[] = [];
  for (let u = VALID_UNIT_RANGE.min; u <= VALID_UNIT_RANGE.max; u++) {
    const raw = await readRawUnit(course, u);
    if (!raw) continue;
    for (let i = 0; i < raw.length; i++) {
      const item = raw[i];
      const french =
        typeof item.french === "string"
          ? item.french
          : typeof (item as Record<string, unknown>).front === "string"
          ? (item as Record<string, unknown>).front as string
          : "";
      const turkish =
        typeof item.turkish === "string"
          ? item.turkish
          : typeof (item as Record<string, unknown>).back === "string"
          ? (item as Record<string, unknown>).back as string
          : "";
      if (!french) continue;
      all.push({
        id: typeof item.id === "string" ? item.id : `${course}-unit${u}:${i}`,
        french,
        turkish,
        ipa: item.ipa ?? "",
        example_sentence: item.example_sentence ?? "",
        example_translation: item.example_translation ?? "",
        unit: item.unit,
        course: item.course,
      });
    }
  }
  return all;
}

/**
 * Extract gendered cards: cards whose french text starts with le/la/l'/un/une.
 * Returns cards with the article stripped and gender determined.
 */
export async function getGenderedCards(course: string): Promise<GenderedCard[]> {
  const all = await getAllCards(course);
  const result: GenderedCard[] = [];

  for (const card of all) {
    const text = card.french.trim();
    let gender: "m" | "f" | null = null;
    let bareWord = "";

    if (text.startsWith("le ")) {
      gender = "m";
      bareWord = text.slice(3);
    } else if (text.startsWith("la ")) {
      gender = "f";
      bareWord = text.slice(3);
    } else if (text.startsWith("un ")) {
      gender = "m";
      bareWord = text.slice(3);
    } else if (text.startsWith("une ")) {
      gender = "f";
      bareWord = text.slice(4);
    } else if (text.startsWith("l'") || text.startsWith("l\u2019")) {
      // l' is ambiguous — skip unless we can infer from common patterns
      continue;
    }

    if (gender && bareWord) {
      result.push({
        id: card.id,
        french: card.french,
        turkish: card.turkish,
        bareWord,
        gender,
        unit: card.unit,
        course: card.course,
      });
    }
  }

  return result;
}

/** Load sentence cards from curriculum/101/sentences/ directory. */
export async function getSentenceCards(
  course: string
): Promise<SentenceCard[]> {
  const dir = path.join(process.cwd(), "curriculum", course, "sentences");
  try {
    const files = await fs.readdir(dir);
    const all: SentenceCard[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const raw = await fs.readFile(path.join(dir, file), "utf-8");
      const cards = JSON.parse(raw) as SentenceCard[];
      all.push(...cards);
    }
    return all;
  } catch {
    return [];
  }
}

/** Phrase for the classroom quick-reference sheet. */
export interface Phrase {
  fr: string;
  tr: string;
  audio: boolean;
}

/** Load phrases from curriculum/phrases.json. */
export async function getPhrases(): Promise<Phrase[]> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "curriculum", "phrases.json"),
      "utf-8"
    );
    return JSON.parse(raw) as Phrase[];
  } catch {
    return [];
  }
}

/** Returns number of cards in a specific course/unit (0 if file is missing). */
export async function getCourseUnitCount(
  course: string,
  unit: number
): Promise<number> {
  if (!/^\d+$/.test(course)) return 0;
  if (unit < VALID_UNIT_RANGE.min || unit > VALID_UNIT_RANGE.max) return 0;

  const items = await readRawUnit(course, unit);
  return items?.length ?? 0;
}
