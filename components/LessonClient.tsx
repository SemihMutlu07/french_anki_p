"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Link from "next/link";
import LessonCard from "@/components/LessonCard";
import type { CardItem } from "@/lib/types";

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

interface Props {
  unitId: string;
  items: CardItem[];
}

export default function LessonClient({ unitId, items }: Props) {
  const totalCards = items.length;
  const unitNumber = items[0]?.unit ?? 1;
  const courseName = items[0]?.course ?? "101";

  const [queue, setQueue] = useState<CardItem[]>([...items]);
  const [progress, setProgress] = useState<ProgressStore>({});
  const [sessionKnown, setSessionKnown] = useState(0);
  const [sessionUnknown, setSessionUnknown] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAlways, setShowAlways] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey(unitId));
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ProgressStore;
        setProgress(parsed);
        setQueue(
          items.filter(
            (item) => (parsed[item.id]?.knowCount ?? 0) < MASTERY_THRESHOLD
          )
        );
      } catch {
        setQueue([...items]);
      }
    }
    setLoaded(true);
  }, [unitId, items]);

  const updateProgress = useCallback(
    (newProgress: ProgressStore) => {
      localStorage.setItem(storageKey(unitId), JSON.stringify(newProgress));
      setProgress(newProgress);
    },
    [unitId]
  );

  const masteredCount = useMemo(
    () =>
      Object.values(progress).filter((p) => p.knowCount >= MASTERY_THRESHOLD)
        .length,
    [progress]
  );

  const progressPct = useMemo(
    () => (totalCards > 0 ? (masteredCount / totalCards) * 100 : 0),
    [masteredCount, totalCards]
  );

  const done = loaded && queue.length === 0;

  const cardVisible = showAlways || isFlipped;

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
    setIsFlipped(false);
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
    setIsFlipped(false);
    const rest = queue.slice(1);
    const insertAt = Math.min(REINSERTION_OFFSET, rest.length);
    setQueue([...rest.slice(0, insertAt), card, ...rest.slice(insertAt)]);
  }, [loaded, queue, progress, updateProgress]);

  const handleFlip = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "1") {
        handleDontKnow();
      } else if (e.key === "2") {
        handleKnow();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleFlip, handleKnow, handleDontKnow]);

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
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx > 0) handleKnow();
      else handleDontKnow();
    },
    [handleKnow, handleDontKnow]
  );

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
      <header style={{ display: "flex", flexDirection: "column", padding: "0 24px" }}>
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
            aria-label="Ana sayfaya dön"
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
          <span style={{ color: "#e5e5e5", fontWeight: 500, fontSize: 14 }}>
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
        {/* Full-width progress bar */}
        <div style={{ height: 1, background: "#1f1f1f", position: "relative" }}>
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
        {/* Loading skeleton */}
        {!loaded ? (
          <>
            <div
              aria-hidden="true"
              style={{
                width: "100%",
                maxWidth: 560,
                background: "#1a1a1a",
                borderRadius: 16,
                height: 300,
              }}
            />
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 24,
                width: "100%",
                maxWidth: 560,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  flex: 1,
                  height: 56,
                  background: "#161616",
                  borderRadius: 12,
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  flex: 1,
                  height: 56,
                  background: "#161616",
                  borderRadius: 12,
                }}
              />
            </div>
          </>
        ) : done ? (
          /* Completion screen */
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
              Ünite tamamlandı
            </p>
            <p style={{ color: "#555555", fontSize: 13, marginTop: 12 }}>
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
            <LessonCard
              item={queue[0]}
              isFlipped={cardVisible}
              onFlip={handleFlip}
            />

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
              <button
                onClick={handleDontKnow}
                aria-label="Bilmiyorum — kartı tekrar kuyruğa ekle"
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
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #555")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
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

              <button
                onClick={handleKnow}
                aria-label="Biliyorum — kartı öğrenildi olarak işaretle"
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
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #888")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
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

            {/* Always-show toggle */}
            <button
              onClick={() => setShowAlways((v) => !v)}
              aria-pressed={showAlways}
              style={{
                marginTop: 20,
                background: "none",
                border: "none",
                color: showAlways ? "#888888" : "#333333",
                fontSize: 12,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {showAlways ? "● Yanıtı her zaman göster" : "○ Yanıtı her zaman göster"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
