"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LessonCard from "@/components/LessonCard";
import { saveProgress, getProgress } from "@/lib/progress";
import { updateState, sortQueueByR } from "@/lib/fsrs";
import type { FSRSState } from "@/lib/fsrs";
import { createBrowserSupabase } from "@/lib/supabase";
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
  userId: string;
}

export default function LessonClient({ unitId, items, userId }: Props) {
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fsrsStates, setFsrsStates] = useState<Record<string, FSRSState>>({});
  const router = useRouter();

  useEffect(() => {
    async function load() {
      // Restore session mastery from localStorage
      let initialItems = [...items];
      const stored = localStorage.getItem(storageKey(unitId));
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as ProgressStore;
          setProgress(parsed);
          initialItems = items.filter(
            (item) => (parsed[item.id]?.knowCount ?? 0) < MASTERY_THRESHOLD
          );
        } catch {
          // keep defaults
        }
      }

      // Fetch FSRS states from Supabase and sort queue by retrievability
      const records = await getProgress(courseName, unitNumber, userId);
      const stateMap: Record<string, FSRSState> = {};
      for (const rec of records) {
        if (rec.s != null) {
          stateMap[rec.card_id] = {
            s: rec.s,
            d: rec.d ?? 5.0,
            r: rec.r ?? 1.0,
            last_review_at: rec.last_seen_at,
          };
        }
      }
      setFsrsStates(stateMap);
      setQueue(sortQueueByR(initialItems, stateMap));

      if (localStorage.getItem("fr-tutor-sound") === "0") setSoundEnabled(false);
      setLoaded(true);
    }
    void load();
  }, [unitId, items, userId, courseName, unitNumber]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find((v) => v.lang.startsWith("fr"));
    if (frVoice) utterance.voice = frVoice;
    window.speechSynthesis.speak(utterance);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((v) => {
      const next = !v;
      localStorage.setItem("fr-tutor-sound", next ? "1" : "0");
      return next;
    });
  }, []);

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
    const newFsrs = updateState(fsrsStates[card.id] ?? null, true);
    setFsrsStates((prev) => ({ ...prev, [card.id]: newFsrs }));
    void saveProgress(card, true, userId, newFsrs);
    if (newKnowCount >= MASTERY_THRESHOLD) {
      setQueue(queue.slice(1));
    } else {
      setQueue([...queue.slice(1), card]);
    }
  }, [loaded, queue, progress, updateProgress, userId, fsrsStates]);

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
    const newFsrs = updateState(fsrsStates[card.id] ?? null, false);
    setFsrsStates((prev) => ({ ...prev, [card.id]: newFsrs }));
    void saveProgress(card, false, userId, newFsrs);
    const rest = queue.slice(1);
    // Never reinsert at front if only 1 card remains (avoid immediate repeat)
    const insertAt = Math.max(
      Math.min(REINSERTION_OFFSET, rest.length),
      rest.length > 0 ? 1 : 0
    );
    setQueue([...rest.slice(0, insertAt), card, ...rest.slice(insertAt)]);
  }, [loaded, queue, progress, updateProgress, userId, fsrsStates]);

  const handleFlip = useCallback(() => {
    if (!isFlipped && soundEnabled && queue.length > 0) {
      speak(queue[0].french);
    }
    setIsFlipped((f) => !f);
  }, [isFlipped, soundEnabled, speak, queue]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (done) {
          router.push("/");
        } else {
          handleFlip();
        }
      } else if (e.key === "1") {
        handleDontKnow();
      } else if (e.key === "2") {
        handleKnow();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleFlip, handleKnow, handleDontKnow, done, router]);

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
        background: "#09090B",
        color: "#E4E4E7",
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
              color: "#71717A",
              textDecoration: "none",
              fontSize: 20,
              lineHeight: 1,
              marginRight: 12,
            }}
          >
            ←
          </Link>
          <span style={{ color: "#F4F4F5", fontWeight: 500, fontSize: 14 }}>
            {courseName} · Ünite {unitNumber}
          </span>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                color: "#71717A",
                fontSize: 13,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {cardIndex} / {totalCards}
            </span>
            <button
              onClick={async () => {
                const supabase = createBrowserSupabase();
                await supabase.auth.signOut();
                router.push("/login");
              }}
              aria-label="Çıkış yap"
              style={{
                background: "none",
                border: "none",
                color: "#52525B",
                fontSize: 12,
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
              }}
            >
              Çıkış
            </button>
          </div>
        </div>
        {/* Full-width progress bar */}
        <div style={{ height: 1, background: "#27272A", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${progressPct}%`,
              background: "#71717A",
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
                background: "#18181B",
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
                  background: "#18181B",
                  borderRadius: 12,
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  flex: 1,
                  height: 56,
                  background: "#18181B",
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
            <p style={{ color: "#71717A", fontSize: 13, marginTop: 12 }}>
              {sessionKnown} biliyorum &middot; {sessionUnknown} bilmiyorum
            </p>
            <Link
              href="/"
              style={{
                display: "block",
                marginTop: 32,
                width: 240,
                marginLeft: "auto",
                marginRight: "auto",
                padding: "16px 0",
                background: "#27272A",
                border: "1px solid #3F3F46",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                color: "#F4F4F5",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Ana sayfa
            </Link>
            <p style={{ fontSize: 12, color: "#3F3F46", marginTop: 12 }}>
              Space ile de dönebilirsin
            </p>
          </div>
        ) : (
          <>
            <LessonCard
              item={queue[0]}
              isFlipped={cardVisible}
              onFlip={handleFlip}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
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
              {/* Bilmiyorum — subtle reddish border + text */}
              <button
                onClick={handleDontKnow}
                aria-label="Bilmiyorum — kartı tekrar kuyruğa ekle"
                style={{
                  flex: 1,
                  height: 56,
                  border: "1px solid #3D2A2A",
                  background: "transparent",
                  borderRadius: 12,
                  color: "#A1A1AA",
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: "pointer",
                  position: "relative",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #6b3030")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                Bilmiyorum
                <span
                  style={{
                    position: "absolute",
                    bottom: 6,
                    right: 10,
                    fontSize: 11,
                    color: "#52525B",
                  }}
                >
                  1
                </span>
              </button>

              {/* Biliyorum — subtle dark-green background */}
              <button
                onClick={handleKnow}
                aria-label="Biliyorum — kartı öğrenildi olarak işaretle"
                style={{
                  flex: 1,
                  height: 56,
                  border: "1px solid #1E3A28",
                  background: "#162419",
                  borderRadius: 12,
                  color: "#E4E4E7",
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: "pointer",
                  position: "relative",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #2d6e45")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                Biliyorum
                <span
                  style={{
                    position: "absolute",
                    bottom: 6,
                    right: 10,
                    fontSize: 11,
                    color: "#4d7a5e",
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
                color: "#52525B",
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
                color: showAlways ? "#A1A1AA" : "#52525B",
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
