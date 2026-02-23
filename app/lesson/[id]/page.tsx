"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LessonCard, { type VocabItem } from "@/components/LessonCard";

import unit1Data from "@/curriculum/101/unit1.json";
import unit2Data from "@/curriculum/101/unit2.json";
import unit3Data from "@/curriculum/101/unit3.json";
import unit4Data from "@/curriculum/101/unit4.json";
import unit5Data from "@/curriculum/101/unit5.json";
import unit6Data from "@/curriculum/101/unit6.json";

const UNIT_MAP: Record<string, VocabItem[]> = {
  unit1: unit1Data as VocabItem[],
  unit2: unit2Data as VocabItem[],
  unit3: unit3Data as VocabItem[],
  unit4: unit4Data as VocabItem[],
  unit5: unit5Data as VocabItem[],
  unit6: unit6Data as VocabItem[],
};

interface CardProgress {
  knowCount: number;
  unknownCount: number;
}

type ProgressStore = Record<string, CardProgress>;

const MASTERY_THRESHOLD = 2;
const REINSERTION_OFFSET = 3;

function storageKey(unitId: string) {
  return `fr-tutor-progress-${unitId}`;
}

export default function LessonPage() {
  const params = useParams();
  const unitId = (params?.id as string) ?? "unit1";
  const allItems = UNIT_MAP[unitId] ?? UNIT_MAP.unit1;
  const totalCards = allItems.length;
  const unitNumber = allItems[0]?.unit ?? 1;
  const courseName = allItems[0]?.course ?? "101";

  const [queue, setQueue] = useState<VocabItem[]>([...allItems]);
  const [progress, setProgress] = useState<ProgressStore>({});
  const [sessionKnown, setSessionKnown] = useState(0);
  const [sessionUnknown, setSessionUnknown] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey(unitId));
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ProgressStore;
        setProgress(parsed);
        setQueue(
          allItems.filter(
            (item) => (parsed[item.id]?.knowCount ?? 0) < MASTERY_THRESHOLD
          )
        );
      } catch {
        setQueue([...allItems]);
      }
    }
    setLoaded(true);
  }, [unitId, allItems]);

  const updateProgress = useCallback(
    (newProgress: ProgressStore) => {
      localStorage.setItem(storageKey(unitId), JSON.stringify(newProgress));
      setProgress(newProgress);
    },
    [unitId]
  );

  const masteredCount = Object.values(progress).filter(
    (p) => p.knowCount >= MASTERY_THRESHOLD
  ).length;

  const done = loaded && queue.length === 0;

  const handleKnow = useCallback(() => {
    if (!loaded || queue.length === 0) return;
    const card = queue[0];
    const current = progress[card.id] ?? { knowCount: 0, unknownCount: 0 };
    const newKnowCount = current.knowCount + 1;
    const newProgress: ProgressStore = {
      ...progress,
      [card.id]: { ...current, knowCount: newKnowCount },
    };
    updateProgress(newProgress);
    setSessionKnown((s) => s + 1);
    if (newKnowCount >= MASTERY_THRESHOLD) {
      setQueue(queue.slice(1));
    } else {
      setQueue([...queue.slice(1), card]);
    }
  }, [loaded, queue, progress, updateProgress]);

  const handleDontKnow = useCallback(() => {
    if (!loaded || queue.length === 0) return;
    const card = queue[0];
    const current = progress[card.id] ?? { knowCount: 0, unknownCount: 0 };
    const newProgress: ProgressStore = {
      ...progress,
      [card.id]: { ...current, unknownCount: current.unknownCount + 1 },
    };
    updateProgress(newProgress);
    setSessionUnknown((s) => s + 1);
    const rest = queue.slice(1);
    const insertAt = Math.min(REINSERTION_OFFSET, rest.length);
    setQueue([...rest.slice(0, insertAt), card, ...rest.slice(insertAt)]);
  }, [loaded, queue, progress, updateProgress]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "1") handleDontKnow();
      else if (e.key === "2") handleKnow();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKnow, handleDontKnow]);

  const progressPct = totalCards > 0 ? (masteredCount / totalCards) * 100 : 0;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex flex-col">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-zinc-800">
        <Link
          href="/"
          className="text-zinc-600 hover:text-zinc-300 text-sm leading-none"
        >
          ←
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-300 font-medium">{courseName}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-500">Ünite {unitNumber}</span>
        </div>
        <div className="flex-1 flex items-center gap-3 justify-end">
          <span className="text-zinc-600 text-xs tabular-nums">
            {masteredCount}/{totalCards}
          </span>
          <div className="w-28 h-px bg-zinc-800 rounded-full overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0 bg-zinc-400 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {!loaded ? null : done ? (
          <div className="text-center space-y-3">
            <p className="text-2xl font-semibold">Ünite tamamlandı</p>
            <p className="text-zinc-500 text-sm">
              {sessionKnown} biliyorum &middot; {sessionUnknown} bilmiyorum
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-5 py-2 border border-zinc-700 hover:border-zinc-500 rounded text-sm text-zinc-300 transition-colors"
            >
              Ana sayfa
            </Link>
          </div>
        ) : (
          <>
            <LessonCard item={queue[0]} />
            <div className="flex gap-3 mt-8 w-full max-w-xl">
              <button
                onClick={handleDontKnow}
                className="flex-1 flex flex-col items-center py-4 border border-zinc-800 hover:border-zinc-600 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium">Bilmiyorum</span>
                <span className="text-zinc-700 text-xs mt-1">tuş 1</span>
              </button>
              <button
                onClick={handleKnow}
                className="flex-1 flex flex-col items-center py-4 border border-zinc-800 hover:border-zinc-600 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium">Biliyorum</span>
                <span className="text-zinc-700 text-xs mt-1">tuş 2</span>
              </button>
            </div>
            <p className="mt-5 text-zinc-700 text-xs tabular-nums">
              bu oturumda: {sessionKnown} biliyorum &middot; {sessionUnknown}{" "}
              bilmiyorum
            </p>
          </>
        )}
      </div>
    </main>
  );
}
