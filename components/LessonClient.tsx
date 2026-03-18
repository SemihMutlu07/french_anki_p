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
import AnswerSheet from "@/components/AnswerSheet";
import { saveProgress, getProgress } from "@/lib/progress";
import { saveGuestProgress } from "@/lib/guestProgress";
import { updateState, sortQueueByR } from "@/lib/fsrs";
import type { FSRSState } from "@/lib/fsrs";
import { createBrowserSupabase } from "@/lib/supabase";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
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
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [fsrsStates, setFsrsStates] = useState<Record<string, FSRSState>>({});
  const router = useRouter();

  const {
    slowMode,
    soundEnabled,
    audioError,
    audioHintShown,
    firstAudioAttempted,
    isPlaying,
    play,
    retry,
    toggleSlow,
    toggleSound,
    dismissHint,
  } = useAudioPlayer();

  useEffect(() => {
    async function load() {
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

      const storedHint = parseInt(
        localStorage.getItem("fr-tutor-hint-count") ?? "0",
        10
      );
      setHintCount(isNaN(storedHint) ? 0 : storedHint);

      setLoaded(true);
    }
    void load();
  }, [unitId, items, userId, courseName, unitNumber]);

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

  const showPulse = loaded && hintCount < 2;
  const done = loaded && queue.length === 0;

  const handleKnow = useCallback(() => {
    if (!loaded || queue.length === 0) return;
    setShowAnswerSheet(false);
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
    if (userId) {
      void saveProgress(card, true, userId, newFsrs);
    } else {
      saveGuestProgress(card, true, newFsrs);
    }
    if (newKnowCount >= MASTERY_THRESHOLD) {
      setQueue(queue.slice(1));
    } else {
      setQueue([...queue.slice(1), card]);
    }
  }, [loaded, queue, progress, updateProgress, userId, fsrsStates]);

  const handleDontKnow = useCallback(() => {
    if (!loaded || queue.length === 0) return;
    setShowAnswerSheet(false);
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
    if (userId) {
      void saveProgress(card, false, userId, newFsrs);
    } else {
      saveGuestProgress(card, false, newFsrs);
    }
    const rest = queue.slice(1);
    const insertAt = Math.max(
      Math.min(REINSERTION_OFFSET, rest.length),
      rest.length > 0 ? 1 : 0
    );
    setQueue([...rest.slice(0, insertAt), card, ...rest.slice(insertAt)]);
  }, [loaded, queue, progress, updateProgress, userId, fsrsStates]);

  const handleFlip = useCallback(() => {
    if (!isFlipped && soundEnabled && queue.length > 0) {
      play(queue[0].french);
    }
    if (!isFlipped && hintCount < 2) {
      const newCount = hintCount + 1;
      setHintCount(newCount);
      localStorage.setItem("fr-tutor-hint-count", String(newCount));
    }
    setIsFlipped((f) => !f);
  }, [isFlipped, soundEnabled, queue, play, hintCount]);

  const doneRef = useRef(done);
  const handleFlipRef = useRef<() => void>(() => {});
  const handleKnowRef = useRef<() => void>(() => {});
  const handleDontKnowRef = useRef<() => void>(() => {});
  const showAnswerSheetRef = useRef(false);

  useEffect(() => {
    doneRef.current = done;
    handleFlipRef.current = handleFlip;
    handleKnowRef.current = handleKnow;
    handleDontKnowRef.current = handleDontKnow;
    showAnswerSheetRef.current = showAnswerSheet;
  }, [done, handleFlip, handleKnow, handleDontKnow, showAnswerSheet]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space" || e.key === "Spacebar") {
        e.preventDefault();
        if (doneRef.current) {
          router.push("/");
        } else if (showAnswerSheetRef.current) {
          setShowAnswerSheet(false);
          setIsFlipped(true);
        } else {
          handleFlipRef.current();
        }
      } else if (e.key === "1") {
        if (showAnswerSheetRef.current) setShowAnswerSheet(false);
        handleDontKnowRef.current();
      } else if (e.key === "2") {
        if (showAnswerSheetRef.current) setShowAnswerSheet(false);
        handleKnowRef.current();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

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
      if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx > 0) handleKnow();
      else handleDontKnow();
    },
    [handleKnow, handleDontKnow]
  );

  const cardIndex = masteredCount + (queue.length > 0 ? 1 : 0);

  return (
    <main className="min-h-dvh bg-base text-t-primary flex flex-col">
      {/* Top bar */}
      <header className="flex flex-col px-4 sm:px-6 md:px-8">
        <div className="flex items-center py-3 sm:py-4">
          <Link
            href="/"
            aria-label="Ana sayfaya dön"
            className="mr-3 text-xl leading-none no-underline text-t-muted"
          >
            ←
          </Link>
          <span className="text-sm font-medium text-t-primary">
            {courseName} · Ünite {unitNumber}
          </span>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-[13px] text-t-muted tabular-nums">
              {cardIndex} / {totalCards}
            </span>
            <button
              onClick={async () => {
                const supabase = createBrowserSupabase();
                await supabase.auth.signOut();
                router.push("/login");
              }}
              aria-label="Çıkış yap"
              className="bg-transparent border-none text-xs text-t-faint cursor-pointer p-0 leading-none"
            >
              Çıkış
            </button>
          </div>
        </div>
        {/* Full-width progress bar */}
        <div style={{ height: 1, background: "var(--bg-subtle)", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${progressPct}%`,
              background: "var(--text-muted)",
            }}
          />
        </div>
      </header>

      <section
        className="flex flex-1 min-h-0 flex-col px-4 pt-4 sm:px-6 md:px-8 md:pt-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading skeleton */}
        {!loaded ? (
          <div className="flex flex-1 min-h-0 flex-col">
            <div className="flex flex-1 items-center justify-center py-3 sm:py-5">
              <div
                aria-hidden="true"
                className="w-full max-w-[40rem] rounded-2xl bg-muted h-[20rem] sm:h-[22rem]"
              />
            </div>
            <div className="sticky bottom-0 left-0 right-0 bg-base pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:static md:pt-5 md:pb-0">
              <div className="mx-auto flex w-full max-w-[40rem] gap-3">
                <div
                  aria-hidden="true"
                  className="h-14 flex-1 rounded-xl bg-muted"
                />
                <div
                  aria-hidden="true"
                  className="h-14 flex-1 rounded-xl bg-muted"
                />
              </div>
            </div>
          </div>
        ) : done ? (
          /* Completion screen */
          <div className="flex flex-1 items-center justify-center pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div className="w-full max-w-[30rem] text-center">
              <p className="m-0 text-2xl font-semibold">
                Ünite tamamlandı
              </p>
              <p className="mt-3 text-[13px] text-t-muted">
                {sessionKnown} biliyorum &middot; {sessionUnknown} bilmiyorum
              </p>
              <Link
                href="/"
                className="mx-auto mt-8 block w-full max-w-[15rem] rounded-xl border border-t-ghost bg-subtle py-4 text-center text-[15px] font-medium text-t-primary no-underline"
              >
                Ana sayfa
              </Link>
              <p className="mt-3 text-xs text-t-ghost">Space ile de dönebilirsin</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 flex-col">
            <div className="flex flex-1 min-h-0 items-center justify-center py-2 sm:py-4 md:py-6">
              <div className="w-full max-w-[48rem]">
                <div className="mx-auto w-full max-w-[40rem]">
                  <LessonCard
                    item={queue[0]}
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                    soundEnabled={soundEnabled}
                    onToggleSound={toggleSound}
                    onPlayAudio={() => play(queue[0].french)}
                    showPulse={showPulse}
                    slowMode={slowMode}
                    onToggleSlow={toggleSlow}
                    audioError={audioError}
                    onRetry={retry}
                    isPlaying={isPlaying}
                  />
                </div>
                <p className="mt-4 text-center text-[13px] text-t-faint">
                  {sessionKnown} biliyorum &middot; {sessionUnknown} bilmiyorum
                </p>
                {!isFlipped && queue.length > 0 && (
                  <button
                    onClick={() => {
                      localStorage.setItem(
                        "fr-tutor-answers-shown",
                        String(
                          parseInt(
                            localStorage.getItem("fr-tutor-answers-shown") ?? "0",
                            10
                          ) + 1
                        )
                      );
                      setShowAnswerSheet(true);
                    }}
                    className="mt-3 block w-full bg-transparent border-none p-0 text-center text-xs cursor-pointer"
                    style={{ color: "var(--text-faint)" }}
                  >
                    Yanıtı göster
                  </button>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 left-0 right-0 bg-base pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:static md:bg-transparent md:pt-5 md:pb-0">
              <div className="mx-auto flex w-full max-w-[40rem] gap-3">
                <button
                  onClick={handleDontKnow}
                  aria-label="Bilmiyorum — kartı tekrar kuyruğa ekle"
                  className="relative h-14 flex-1 rounded-xl border border-[#3D2A2A] bg-transparent text-[15px] font-medium text-t-secondary cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#6b3030]"
                >
                  Bilmiyorum
                  <span className="absolute bottom-1.5 right-2.5 text-[11px] text-t-faint">
                    1
                  </span>
                </button>
                <button
                  onClick={handleKnow}
                  aria-label="Biliyorum — kartı öğrenildi olarak işaretle"
                  className="relative h-14 flex-1 rounded-xl border border-[#1E3A28] bg-[#162419] text-[15px] font-medium text-t-primary cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#2d6e45]"
                >
                  Biliyorum
                  <span className="absolute bottom-1.5 right-2.5 text-[11px] text-[#4d7a5e]">
                    2
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Answer Sheet */}
      {showAnswerSheet && queue.length > 0 && (
        <AnswerSheet
          item={queue[0]}
          onContinue={() => {
            setShowAnswerSheet(false);
            setIsFlipped(true);
          }}
        />
      )}

      {/* Volume hint toast */}
      {!audioHintShown && firstAudioAttempted && (
        <div
          className="fixed left-4 right-4 flex items-center justify-between rounded-xl border border-t-ghost bg-muted px-4 py-3 text-sm text-t-secondary"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)",
            zIndex: 60,
            animation: "slideUpIn 0.35s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          <span>Ses düşükse: sessiz modu kapatıp sesi aç.</span>
          <button
            onClick={dismissHint}
            className="ml-4 shrink-0 rounded border border-t-ghost bg-transparent px-3 py-1 text-xs text-t-muted cursor-pointer"
          >
            Tamam
          </button>
        </div>
      )}
    </main>
  );
}
