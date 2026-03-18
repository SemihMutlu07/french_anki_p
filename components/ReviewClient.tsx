"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import LessonCard from "@/components/LessonCard";
import { createBrowserSupabase } from "@/lib/supabase";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { updateState } from "@/lib/fsrs";
import type { FSRSState } from "@/lib/fsrs";
import type { CardItem } from "@/lib/types";

interface WeakCard extends CardItem {
  unknownCount: number;
  lastReviewed: string;
}

interface Props {
  initialCards: WeakCard[];
  userId: string;
}

export default function ReviewClient({ initialCards, userId }: Props) {
  const [queue, setQueue] = useState<WeakCard[]>([...initialCards]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [mastered, setMastered] = useState(0);
  const [fsrsStates, setFsrsStates] = useState<Record<string, FSRSState>>({});
  const [showCompletion, setShowCompletion] = useState(false);

  const {
    slowMode,
    soundEnabled,
    audioError,
    isPlaying,
    play,
    retry,
    toggleSlow,
    toggleSound,
  } = useAudioPlayer();

  const handleFlip = useCallback(() => {
    if (!isFlipped && soundEnabled && queue.length > 0) {
      play(queue[0].french);
    }
    setIsFlipped((f) => !f);
  }, [isFlipped, soundEnabled, queue, play]);

  const handleKnow = useCallback(() => {
    if (queue.length === 0) return;

    const card = queue[0];
    const newFsrs = updateState(fsrsStates[card.id] ?? null, true);
    setFsrsStates((prev) => ({ ...prev, [card.id]: newFsrs }));

    // Save progress
    const supabase = createBrowserSupabase();
    void supabase.from("progress").upsert({
      user_id: userId,
      card_id: card.id,
      course: card.course,
      unit: card.unit,
      known: true,
      review_count: (card.unknownCount || 0) + 1,
      next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      last_seen_at: new Date().toISOString(),
      s: newFsrs.s,
      d: newFsrs.d,
      r: newFsrs.r,
    }, {
      onConflict: "user_id,card_id",
    });

    setReviewed((r) => r + 1);
    setMastered((m) => m + 1);
    setIsFlipped(false);
    setQueue((q) => q.slice(1));
  }, [queue, userId, fsrsStates]);

  const handleDontKnow = useCallback(() => {
    if (queue.length === 0) return;

    const card = queue[0];
    const newFsrs = updateState(fsrsStates[card.id] ?? null, false);
    setFsrsStates((prev) => ({ ...prev, [card.id]: newFsrs }));

    // Save progress
    const supabase = createBrowserSupabase();
    void supabase.from("progress").upsert({
      user_id: userId,
      card_id: card.id,
      course: card.course,
      unit: card.unit,
      known: false,
      review_count: (card.unknownCount || 0) + 1,
      next_review_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      last_seen_at: new Date().toISOString(),
      s: newFsrs.s,
      d: newFsrs.d,
      r: newFsrs.r,
    }, {
      onConflict: "user_id,card_id",
    });

    setReviewed((r) => r + 1);
    setIsFlipped(false);

    // Re-insert card later in queue
    const rest = queue.slice(1);
    const insertAt = Math.min(3, rest.length);
    setQueue([...rest.slice(0, insertAt), card, ...rest.slice(insertAt)]);
  }, [queue, userId, fsrsStates]);

  const router = useRouter();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space" || e.key === "Spacebar") {
        e.preventDefault();
        if (showCompletion) {
          router.push("/");
        } else if (queue.length === 0) {
          setShowCompletion(true);
        } else {
          handleFlip();
        }
      } else if (e.key === "1") {
        if (queue.length > 0) handleDontKnow();
      } else if (e.key === "2") {
        if (queue.length > 0) handleKnow();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleFlip, handleKnow, handleDontKnow, showCompletion, queue.length, router]);

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

  const totalCards = initialCards.length;
  const progressPct = totalCards > 0 ? (reviewed / totalCards) * 100 : 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Sidebar />

      <div className="md:ml-64 pb-20 md:pb-8">
        {/* Header */}
        <header
          className="px-4 sm:px-6 md:px-8 py-6 md:py-8"
          style={{
            background: "linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-base) 100%)",
            borderBottom: "1px solid rgba(225, 0, 15, 0.3)",
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/progress"
                  className="text-xl no-underline"
                  style={{ color: "var(--text-muted)" }}
                >
                  ←
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔄</span>
                    <h1
                      className="text-xl md:text-2xl font-bold"
                      style={{
                        background: "linear-gradient(90deg, var(--fr-red) 0%, var(--fr-gold) 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Tekrar Oturumu
                    </h1>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Zorlandığın kartlara odaklan
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: "var(--fr-gold)" }}>
                  {reviewed} / {totalCards}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255, 255, 255, 0.1)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, var(--fr-red) 0%, var(--fr-gold) 100%)",
                  boxShadow: "0 0 10px rgba(225, 0, 15, 0.4)",
                }}
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 sm:px-6 md:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            {showCompletion || queue.length === 0 ? (
              /* Completion screen */
              <div
                className="rounded-2xl p-8 text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(0, 0, 145, 0.3) 0%, rgba(11, 18, 32, 0.5) 100%)",
                  border: "2px solid rgba(227, 181, 5, 0.3)",
                  boxShadow: "0 8px 32px rgba(0, 0, 145, 0.3)",
                }}
              >
                <span className="text-5xl mb-4 block">🎉</span>
                <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--fr-gold)" }}>
                  Tekrar Tamamlandı!
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                  {reviewed} kart gözden geçirildi &middot; {mastered} kart pekiştirildi
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/progress"
                    className="px-6 py-3 rounded-xl font-medium no-underline"
                    style={{
                      background: "linear-gradient(135deg, var(--fr-blue) 0%, var(--fr-blue-light) 100%)",
                      color: "var(--text-primary)",
                      border: `2px solid var(--border-strong)`,
                    }}
                  >
                    📊 İlerlemeye Dön
                  </Link>
                  <Link
                    href="/"
                    className="px-6 py-3 rounded-xl font-medium no-underline"
                    style={{
                      background: "linear-gradient(135deg, var(--fr-gold) 0%, var(--fr-gold-light) 100%)",
                      color: "#000000",
                      border: "2px solid rgba(227, 181, 5, 0.4)",
                    }}
                  >
                    🏠 Ana Sayfa
                  </Link>
                </div>
                <p className="mt-4 text-xs" style={{ color: "var(--text-faint)" }}>
                  Space ile ana sayfaya dönebilirsin
                </p>
              </div>
            ) : (
              /* Review cards */
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="flex flex-1 min-h-0 flex-col">
                  <div className="flex flex-1 min-h-0 items-center justify-center py-4">
                    <div className="w-full max-w-[48rem]">
                      <div className="mx-auto w-full max-w-[40rem]">
                        <LessonCard
                          item={queue[0]}
                          isFlipped={isFlipped}
                          onFlip={handleFlip}
                          soundEnabled={soundEnabled}
                          onToggleSound={toggleSound}
                          onPlayAudio={() => play(queue[0].french)}
                          showPulse={false}
                          slowMode={slowMode}
                          onToggleSlow={toggleSlow}
                          audioError={audioError}
                          onRetry={retry}
                          isPlaying={isPlaying}
                        />
                      </div>
                      <p className="mt-4 text-center text-[13px]" style={{ color: "var(--text-faint)" }}>
                        {mastered} pekiştirildi &middot; {reviewed - mastered} tekrar gerekli
                      </p>
                    </div>
                  </div>
                  <div className="sticky bottom-0 left-0 right-0 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3" style={{ background: "var(--bg-base)" }}>
                    <div className="mx-auto flex w-full max-w-[40rem] gap-3">
                      <button
                        onClick={handleDontKnow}
                        aria-label="Tekrar necessary — kartı kuyruğa ekle"
                        className="relative h-14 flex-1 rounded-xl border border-[#3D2A2A] bg-transparent text-[15px] font-medium cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#6b3030]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Tekrar Necessary
                        <span className="absolute bottom-1.5 right-2.5 text-[11px]" style={{ color: "var(--text-faint)" }}>
                          1
                        </span>
                      </button>
                      <button
                        onClick={handleKnow}
                        aria-label="Pekiştirildi — kartı tamamla"
                        className="relative h-14 flex-1 rounded-xl border border-[#1E3A28] bg-[#162419] text-[15px] font-medium text-[var(--text-primary)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#2d6e45]"
                      >
                        Pekiştirildi
                        <span className="absolute bottom-1.5 right-2.5 text-[11px] text-[#4d7a5e]">
                          2
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info box */}
                <div
                  className="mt-6 rounded-xl p-4 text-center"
                  style={{
                    background: "rgba(225, 0, 15, 0.1)",
                    border: "1px solid rgba(225, 0, 15, 0.2)",
                  }}
                >
                  <p className="text-xs" style={{ color: "var(--fr-red-soft)" }}>
                    ⚠️ Bu kartlar en çok zorlandığın kelimeler. Tekrar ederek pekiştir!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
