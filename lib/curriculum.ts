/**
 * Server-only curriculum loader.
 * Uses `fs` — do NOT import this in client components.
 *
 * Reads unit JSON from disk and returns only the fields the client needs,
 * stripping unsplash_query, forvo_word, audio_gender, cefr_level, and tags.
 */
import { promises as fs } from "fs";
import path from "path";
import type { CardItem } from "./types";

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

const VALID_UNIT_RANGE = { min: 1, max: 12 };
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
    (item, idx): CardItem => ({
      id:
        typeof item.id === "string"
          ? item.id
          : `${parsed.course}-unit${parsed.unit}:${idx}`,
      french: item.french,
      turkish: item.turkish,
      ipa: item.ipa ?? "",
      example_sentence: item.example_sentence ?? "",
      example_translation: item.example_translation ?? "",
      unit: item.unit,
      course: item.course,
    })
  );
}

/** Returns the number of cards in a unit (0 if the unit doesn't exist). */
export async function getUnitCount(unitId: string): Promise<number> {
  const items = await getUnitItems(unitId);
  return items?.length ?? 0;
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
