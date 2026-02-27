"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
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
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioSrcLoaded, setAudioSrcLoaded] = useState(false);
  const [audioCanPlayType, setAudioCanPlayType] = useState("unknown");
  const [hasInteractedWithAudio, setHasInteractedWithAudio] = useState(false);
  const [fsrsStates, setFsrsStates] = useState<Record<string, FSRSState>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const debugAudio = searchParams.get("debugAudio") === "1";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioSrcRef = useRef("");

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

  useEffect(() => {
    if (!audioRef.current) return;
    setAudioCanPlayType(audioRef.current.canPlayType("audio/mpeg") || "no");
  }, []);

  function audioSrcFor(text: string): string {
    const q = encodeURIComponent(text);
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=fr&q=${q}`;
  }

  function mediaErrorMessage(audio: HTMLAudioElement): string {
    if (!audio.error) return "Unknown audio error";
    switch (audio.error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return "Audio playback aborted";
      case MediaError.MEDIA_ERR_NETWORK:
        return "Audio network error";
      case MediaError.MEDIA_ERR_DECODE:
        return "Audio decode error";
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return "Audio source not supported";
      default:
        return "Unknown audio error";
    }
  }

  const playAudio = useCallback(async (text: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextSrc = audioSrcFor(text);
    setAudioError(null);

    if (currentAudioSrcRef.current !== nextSrc) {
      currentAudioSrcRef.current = nextSrc;
      audio.src = nextSrc;
      setAudioSrcLoaded(false);
      audio.load();
    }

    try {
      audio.pause();
      audio.currentTime = 0;
      await audio.play();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Audio play() failed";
      setAudioError(msg);
    }
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
    const alreadyInteracted = hasInteractedWithAudio;
    if (!hasInteractedWithAudio) {
      setHasInteractedWithAudio(true);
    }
    if (!isFlipped && soundEnabled && alreadyInteracted && queue.length > 0) {
      void playAudio(queue[0].french);
    }
    setIsFlipped((f) => !f);
  }, [isFlipped, soundEnabled, queue, playAudio, hasInteractedWithAudio]);

  const doneRef = useRef(done);
  const handleFlipRef = useRef<() => void>(() => {});
  const handleKnowRef = useRef<() => void>(() => {});
  const handleDontKnowRef = useRef<() => void>(() => {});

  useEffect(() => {
    doneRef.current = done;
    handleFlipRef.current = handleFlip;
    handleKnowRef.current = handleKnow;
    handleDontKnowRef.current = handleDontKnow;
  }, [done, handleFlip, handleKnow, handleDontKnow]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space" || e.key === "Spacebar") {
        e.preventDefault();
        if (doneRef.current) {
          router.push("/");
        } else {
          handleFlipRef.current();
        }
      } else if (e.key === "1") {
        handleDontKnowRef.current();
      } else if (e.key === "2") {
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
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx > 0) handleKnow();
      else handleDontKnow();
    },
    [handleKnow, handleDontKnow]
  );

  const cardIndex = masteredCount + (queue.length > 0 ? 1 : 0);

  return (
    <main className="min-h-dvh bg-[#09090B] text-[#E4E4E7] flex flex-col">
      <audio
        ref={audioRef}
        preload="none"
        onCanPlay={() => setAudioSrcLoaded(true)}
        onLoadedData={() => setAudioSrcLoaded(true)}
        onError={() => {
          if (!audioRef.current) return;
          setAudioError(mediaErrorMessage(audioRef.current));
        }}
      />
      {/* Top bar */}
      <header className="flex flex-col px-4 sm:px-6 md:px-8">
        <div className="flex items-center py-3 sm:py-4">
          <Link
            href="/"
            aria-label="Ana sayfaya dön"
            className="mr-3 text-xl leading-none no-underline text-[#71717A]"
          >
            ←
          </Link>
          <span className="text-sm font-medium text-[#F4F4F5]">
            {courseName} · Ünite {unitNumber}
          </span>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-[13px] text-[#71717A] tabular-nums">
              {cardIndex} / {totalCards}
            </span>
            <button
              onClick={async () => {
                const supabase = createBrowserSupabase();
                await supabase.auth.signOut();
                router.push("/login");
              }}
              aria-label="Çıkış yap"
              className="bg-transparent border-none text-xs text-[#52525B] cursor-pointer p-0 leading-none"
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
                className="w-full max-w-[40rem] rounded-2xl bg-[#18181B] h-[20rem] sm:h-[22rem]"
              />
            </div>
            <div className="sticky bottom-0 left-0 right-0 bg-[#09090B] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:static md:pt-5 md:pb-0">
              <div className="mx-auto flex w-full max-w-[40rem] gap-3">
                <div
                  aria-hidden="true"
                  className="h-14 flex-1 rounded-xl bg-[#18181B]"
                />
                <div
                  aria-hidden="true"
                  className="h-14 flex-1 rounded-xl bg-[#18181B]"
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
              <p className="mt-3 text-[13px] text-[#71717A]">
                {sessionKnown} biliyorum &middot; {sessionUnknown} bilmiyorum
              </p>
              <Link
                href="/"
                className="mx-auto mt-8 block w-full max-w-[15rem] rounded-xl border border-[#3F3F46] bg-[#27272A] py-4 text-center text-[15px] font-medium text-[#F4F4F5] no-underline"
              >
                Ana sayfa
              </Link>
              <p className="mt-3 text-xs text-[#3F3F46]">Space ile de dönebilirsin</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 flex-col">
            <div className="flex flex-1 min-h-0 items-center justify-center py-2 sm:py-4 md:py-6">
              <div className="w-full max-w-[48rem]">
                <div className="mx-auto w-full max-w-[40rem]">
                  <LessonCard
                    item={queue[0]}
                    isFlipped={cardVisible}
                    onFlip={handleFlip}
                    soundEnabled={soundEnabled}
                    onToggleSound={toggleSound}
                    onPlayAudio={() => {
                      setHasInteractedWithAudio(true);
                      void playAudio(queue[0].french);
                    }}
                    audioError={audioError}
                    debugAudio={debugAudio}
                    audioDebug={{
                      srcLoaded: audioSrcLoaded,
                      canPlayType: audioCanPlayType,
                      lastError: audioError,
                    }}
                  />
                </div>
                <p className="mt-4 text-center text-[13px] text-[#52525B]">
                  {sessionKnown} biliyorum &middot; {sessionUnknown} bilmiyorum
                </p>
                <button
                  onClick={() => setShowAlways((v) => !v)}
                  aria-pressed={showAlways}
                  className="mt-4 block w-full bg-transparent border-none p-0 text-center text-xs cursor-pointer"
                  style={{ color: showAlways ? "#A1A1AA" : "#52525B" }}
                >
                  {showAlways ? "● Yanıtı her zaman göster" : "○ Yanıtı her zaman göster"}
                </button>
              </div>
            </div>
            <div className="sticky bottom-0 left-0 right-0 bg-[#09090B] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:static md:bg-transparent md:pt-5 md:pb-0">
              <div className="mx-auto flex w-full max-w-[40rem] gap-3">
                <button
                  onClick={handleDontKnow}
                  aria-label="Bilmiyorum — kartı tekrar kuyruğa ekle"
                  className="relative h-14 flex-1 rounded-xl border border-[#3D2A2A] bg-transparent text-[15px] font-medium text-[#A1A1AA] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#6b3030]"
                >
                  Bilmiyorum
                  <span className="absolute bottom-1.5 right-2.5 text-[11px] text-[#52525B]">
                    1
                  </span>
                </button>
                <button
                  onClick={handleKnow}
                  aria-label="Biliyorum — kartı öğrenildi olarak işaretle"
                  className="relative h-14 flex-1 rounded-xl border border-[#1E3A28] bg-[#162419] text-[15px] font-medium text-[#E4E4E7] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#2d6e45]"
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
    </main>
  );
}
