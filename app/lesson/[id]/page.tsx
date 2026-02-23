"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

  // Swipe support
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      touchStartX.current = null;
      touchStartY.current = null;
      // Must be more horizontal than vertical, and exceed minimum distance
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx > 0) handleKnow();
      else handleDontKnow();
    },
    [handleKnow, handleDontKnow]
  );

  const progressPct = totalCards > 0 ? (masteredCount / totalCards) * 100 : 0;
  const cardIndex = masteredCount + (queue.length > 0 ? 1 : 0);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e5e5e5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingTop: 16,
            paddingBottom: 12,
          }}
        >
          <Link
            href="/"
            style={{
              color: "#666666",
              textDecoration: "none",
              fontSize: 20,
              lineHeight: 1,
              marginRight: 12,
            }}
          >
            ←
          </Link>
          <span
            style={{ color: "#e5e5e5", fontWeight: 500, fontSize: 14 }}
          >
            {courseName} · Ünite {unitNumber}
          </span>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                color: "#666666",
                fontSize: 13,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {cardIndex} / {totalCards}
            </span>
          </div>
        </div>
        {/* Full-width thin progress bar */}
        <div
          style={{
            height: 1,
            background: "#1f1f1f",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${progressPct}%`,
              background: "#555555",
            }}
          />
        </div>
      </header>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 24px 32px",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!loaded ? null : done ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
              Ünite tamamlandı
            </p>
            <p
              style={{
                color: "#555555",
                fontSize: 13,
                marginTop: 12,
              }}
            >
              {sessionKnown} biliyorum &middot; {sessionUnknown} bilmiyorum
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                marginTop: 32,
                padding: "10px 20px",
                border: "1px solid #333",
                borderRadius: 10,
                fontSize: 14,
                color: "#cccccc",
                textDecoration: "none",
              }}
            >
              Ana sayfa
            </Link>
          </div>
        ) : (
          <>
            <LessonCard item={queue[0]} />

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 24,
                width: "100%",
                maxWidth: 560,
              }}
            >
              {/* Bilmiyorum */}
              <button
                onClick={handleDontKnow}
                style={{
                  flex: 1,
                  height: 56,
                  border: "1px solid #333333",
                  background: "transparent",
                  borderRadius: 12,
                  color: "#888888",
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                Bilmiyorum
                <span
                  style={{
                    position: "absolute",
                    bottom: 6,
                    right: 10,
                    fontSize: 11,
                    color: "#444444",
                  }}
                >
                  1
                </span>
              </button>

              {/* Biliyorum */}
              <button
                onClick={handleKnow}
                style={{
                  flex: 1,
                  height: 56,
                  border: "none",
                  background: "#2a2a2a",
                  borderRadius: 12,
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                Biliyorum
                <span
                  style={{
                    position: "absolute",
                    bottom: 6,
                    right: 10,
                    fontSize: 11,
                    color: "#555555",
                  }}
                >
                  2
                </span>
              </button>
            </div>

            {/* Session stats */}
            <p
              style={{
                marginTop: 16,
                fontSize: 13,
                color: "#444444",
                textAlign: "center",
              }}
            >
              {sessionKnown} biliyorum &middot; {sessionUnknown} bilmiyorum
            </p>
          </>
        )}
      </div>
    </main>
  );
}
