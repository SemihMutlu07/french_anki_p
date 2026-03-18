"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { shuffle, pickDistractors, saveListeningAttempt } from "@/lib/quiz";
import type { CardItem } from "@/lib/types";

const TOTAL_QUESTIONS = 10;

interface Question {
  card: CardItem;
  options: CardItem[];
}

function buildQuestions(cards: CardItem[]): Question[] {
  const shuffled = shuffle(cards);
  const questions: Question[] = [];

  for (let i = 0; i < Math.min(TOTAL_QUESTIONS, shuffled.length); i++) {
    const card = shuffled[i];
    const distractors = pickDistractors(card, cards, 3);
    const options = shuffle([card, ...distractors]);
    questions.push({ card, options });
  }

  return questions;
}

interface Props {
  cards: CardItem[];
  userId: string;
}

export default function ListeningQuizClient({ cards, userId }: Props) {
  const [questions] = useState(() => buildQuestions(cards));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const { play, isPlaying, audioError } = useAudioPlayer();

  const q = questions[current];

  // Unlock audio on first interaction
  const unlockAndPlay = useCallback(() => {
    if (!audioUnlocked) setAudioUnlocked(true);
    if (q) play(q.card.french);
  }, [audioUnlocked, q, play]);

  // Auto-play audio when question changes (after unlock)
  useEffect(() => {
    if (audioUnlocked && q && !done) {
      // Small delay so the UI renders first
      const t = setTimeout(() => play(q.card.french), 300);
      return () => clearTimeout(t);
    }
  }, [current, audioUnlocked, q, done, play]);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (selected || !q) return;
      setSelected(optionId);
      const correct = optionId === q.card.id;
      if (correct) setScore((s) => s + 1);

      void saveListeningAttempt(userId, q.card.id, correct);

      // If wrong, replay audio
      if (!correct) {
        setTimeout(() => play(q.card.french), 500);
      }

      // Advance after delay
      setTimeout(() => {
        if (current + 1 >= questions.length) {
          setDone(true);
        } else {
          setCurrent((c) => c + 1);
          setSelected(null);
        }
      }, correct ? 1000 : 2000);
    },
    [selected, q, current, questions.length, userId, play]
  );

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <main className="min-h-dvh bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <span className="text-5xl block mb-4">
            {pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}
          </span>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--fr-gold)" }}
          >
            Dinleme Tamamlandı!
          </h2>
          <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
            {score} / {questions.length} doğru
          </p>
          <p className="text-3xl font-bold mb-6" style={{ color: pct >= 80 ? "#84CC16" : pct >= 50 ? "var(--fr-gold)" : "var(--fr-red-soft)" }}>
            %{pct}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/practice/listening"
              className="block rounded-xl py-3 px-6 font-medium no-underline text-center"
              style={{
                background: "linear-gradient(135deg, var(--fr-blue) 0%, var(--fr-blue-light) 100%)",
                color: "#ffffff",
                border: "2px solid var(--border-strong)",
              }}
            >
              Tekrar Dene
            </Link>
            <Link
              href="/practice"
              className="block rounded-xl py-3 px-6 font-medium no-underline text-center"
              style={{
                background: "var(--bg-subtle)",
                color: "var(--text-primary)",
              }}
            >
              ← Pratik
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!q) return null;

  return (
    <main className="min-h-dvh bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link
            href="/practice"
            className="text-xl text-[var(--text-muted)] no-underline min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            ←
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg">🎧</span>
            <span className="text-sm font-medium">Dinleme</span>
          </div>
          <span className="text-sm tabular-nums" style={{ color: "var(--text-muted)" }}>
            {current + 1}/{questions.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full overflow-hidden max-w-2xl mx-auto" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((current + 1) / questions.length) * 100}%`,
              background: "linear-gradient(90deg, var(--fr-blue) 0%, var(--fr-gold) 100%)",
            }}
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <div className="w-full max-w-md">
          {/* Audio play area */}
          <div className="text-center mb-8">
            <button
              onClick={unlockAndPlay}
              disabled={isPlaying}
              className="inline-flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                width: 96,
                height: 96,
                background: isPlaying
                  ? "linear-gradient(135deg, #3B82F6 0%, var(--fr-blue-bright) 100%)"
                  : "linear-gradient(135deg, var(--fr-blue) 0%, var(--fr-blue-light) 100%)",
                border: "3px solid rgba(255,255,255,0.2)",
                boxShadow: isPlaying
                  ? "0 0 30px rgba(59, 130, 246, 0.5)"
                  : "0 4px 20px rgba(0, 0, 145, 0.4)",
                cursor: isPlaying ? "default" : "pointer",
              }}
            >
              <span className={`text-4xl ${isPlaying ? "animate-pulse" : ""}`}>
                {isPlaying ? "🔊" : "▶️"}
              </span>
            </button>
            <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
              {!audioUnlocked
                ? "Sesi dinlemek için dokunun"
                : isPlaying
                ? "Dinleniyor..."
                : "Tekrar dinlemek için dokunun"}
            </p>
            {audioError && (
              <p className="mt-2 text-xs" style={{ color: "var(--fr-red-soft)" }}>
                {audioError}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt) => {
              const isCorrect = opt.id === q.card.id;
              const isSelected = selected === opt.id;
              const showResult = selected !== null;

              let bg = "rgba(255,255,255,0.05)";
              let borderColor = "rgba(63, 63, 70, 0.5)";

              if (showResult && isCorrect) {
                bg = "rgba(132, 204, 22, 0.15)";
                borderColor = "#84CC16";
              } else if (showResult && isSelected && !isCorrect) {
                bg = "rgba(239, 68, 68, 0.15)";
                borderColor = "#EF4444";
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  disabled={selected !== null}
                  className="w-full text-left rounded-xl px-5 py-4 transition-all duration-200 min-h-[56px]"
                  style={{
                    background: bg,
                    border: `2px solid ${borderColor}`,
                    cursor: selected ? "default" : "pointer",
                    opacity: showResult && !isCorrect && !isSelected ? 0.5 : 1,
                  }}
                >
                  <p className="text-base font-medium text-[var(--text-primary)]">
                    {opt.turkish}
                  </p>
                  {showResult && isCorrect && (
                    <p className="text-xs mt-1" style={{ color: "#84CC16" }}>
                      {opt.french}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
