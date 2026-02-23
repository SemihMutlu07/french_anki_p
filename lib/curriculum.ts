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

const VALID_UNIT_RANGE = { min: 1, max: 10 };

function unitFilePath(n: number): string {
  return path.join(process.cwd(), "curriculum", "101", `unit${n}.json`);
}

function parseUnitId(unitId: string): number | null {
  const match = /^unit(\d+)$/.exec(unitId);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  if (n < VALID_UNIT_RANGE.min || n > VALID_UNIT_RANGE.max) return null;
  return n;
}

/**
 * Load and strip a single unit. Returns null for unknown/invalid unit IDs.
 * IDs are taken from JSON; if absent, a deterministic `unitN:index` is generated.
 */
export async function getUnitItems(unitId: string): Promise<CardItem[] | null> {
  const n = parseUnitId(unitId);
  if (n === null) return null;

  try {
    const raw = await fs.readFile(unitFilePath(n), "utf-8");
    const items: RawVocabItem[] = JSON.parse(raw);
    return items.map(
      (item, idx): CardItem => ({
        id: typeof item.id === "string" ? item.id : `unit${n}:${idx}`,
        french: item.french,
        turkish: item.turkish,
        ipa: item.ipa ?? "",
        example_sentence: item.example_sentence ?? "",
        example_translation: item.example_translation ?? "",
        unit: item.unit,
        course: item.course,
      })
    );
  } catch {
    return null;
  }
}

/** Returns the number of cards in a unit (0 if the unit doesn't exist). */
export async function getUnitCount(unitId: string): Promise<number> {
  const items = await getUnitItems(unitId);
  return items?.length ?? 0;
}
