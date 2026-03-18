"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { shuffle, saveGenderAttempt, getGenderHint } from "@/lib/quiz";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import type { GenderedCard } from "@/lib/types";

const TOTAL_QUESTIONS = 10;

interface Props {
  cards: GenderedCard[];
  userId: string;
}

export default function GenderQuizClient({ cards, userId }: Props) {
  const [questions] = useState(() =>
    shuffle(cards).slice(0, Math.min(TOTAL_QUESTIONS, cards.length))
  );
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState<"m" | "f" | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const { play } = useAudioPlayer();

  const q = questions[current];

  const handleAnswer = useCallback(
    (choice: "m" | "f") => {
      if (answered || !q) return;
      setAnswered(choice);
      const correct = choice === q.gender;
      if (correct) setScore((s) => s + 1);

      void saveGenderAttempt(userId, q.id, correct);

      // Play the full word with article
      play(q.french);

      setTimeout(() => {
        if (current + 1 >= questions.length) {
          setDone(true);
        } else {
          setCurrent((c) => c + 1);
          setAnswered(null);
        }
      }, 2000);
    },
    [answered, q, current, questions.length, userId, play]
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
            Cinsiyet Quiz Tamamlandı!
          </h2>
          <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
            {score} / {questions.length} doğru
          </p>
          <p
            className="text-3xl font-bold mb-6"
            style={{
              color: pct >= 80 ? "#84CC16" : pct >= 50 ? "var(--fr-gold)" : "var(--fr-red-soft)",
            }}
          >
            %{pct}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/practice/gender"
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
              style={{ background: "var(--bg-subtle)", color: "var(--text-primary)" }}
            >
              ← Pratik
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!q) return null;

  const isCorrect = answered === q.gender;
  const hint = getGenderHint(q.bareWord);

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
            <span className="text-lg">🏷️</span>
            <span className="text-sm font-medium">le / la ?</span>
          </div>
          <span className="text-sm tabular-nums" style={{ color: "var(--text-muted)" }}>
            {current + 1}/{questions.length}
          </span>
        </div>
        {/* Progress bar */}
        <div
          className="mt-3 h-1.5 rounded-full overflow-hidden max-w-2xl mx-auto"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
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
        <div className="w-full max-w-md text-center">
          {/* Word display */}
          <div className="mb-10">
            <p
              className="text-4xl sm:text-5xl font-bold transition-all duration-300"
              style={{
                color: answered
                  ? q.gender === "m"
                    ? "var(--fr-blue-bright)"
                    : "var(--fr-red-soft)"
                  : "var(--text-primary)",
              }}
            >
              {answered ? q.french : q.bareWord}
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              {q.turkish}
            </p>
          </div>

          {/* Answer feedback */}
          {answered && (
            <div
              className="mb-8 rounded-xl p-4 transition-all duration-300"
              style={{
                background: isCorrect
                  ? "rgba(132, 204, 22, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
                border: `1px solid ${
                  isCorrect
                    ? "rgba(132, 204, 22, 0.3)"
                    : "rgba(239, 68, 68, 0.3)"
                }`,
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: isCorrect ? "#84CC16" : "var(--fr-red-soft)" }}
              >
                {isCorrect ? "Doğru! ✓" : `Yanlış — doğrusu: ${q.french}`}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                {hint}
              </p>
            </div>
          )}

          {/* Le / La buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer("m")}
              disabled={answered !== null}
              className="flex-1 rounded-2xl py-6 text-2xl font-bold transition-all duration-200 min-h-[80px]"
              style={{
                background:
                  answered === "m"
                    ? q.gender === "m"
                      ? "rgba(132, 204, 22, 0.2)"
                      : "rgba(239, 68, 68, 0.2)"
                    : answered
                    ? "rgba(255,255,255,0.03)"
                    : "linear-gradient(135deg, rgba(0, 0, 145, 0.4) 0%, rgba(96, 165, 250, 0.2) 100%)",
                border:
                  answered === "m"
                    ? q.gender === "m"
                      ? "3px solid #84CC16"
                      : "3px solid #EF4444"
                    : answered
                    ? "3px solid rgba(255,255,255,0.1)"
                    : "3px solid rgba(96, 165, 250, 0.4)",
                color:
                  answered && answered !== "m"
                    ? "var(--text-faint)"
                    : "var(--fr-blue-bright)",
                cursor: answered ? "default" : "pointer",
                boxShadow: !answered
                  ? "0 4px 20px rgba(0, 0, 145, 0.3)"
                  : "none",
              }}
            >
              le
              <span className="block text-xs font-normal mt-1" style={{ color: "var(--text-muted)" }}>
                maskülen
              </span>
            </button>
            <button
              onClick={() => handleAnswer("f")}
              disabled={answered !== null}
              className="flex-1 rounded-2xl py-6 text-2xl font-bold transition-all duration-200 min-h-[80px]"
              style={{
                background:
                  answered === "f"
                    ? q.gender === "f"
                      ? "rgba(132, 204, 22, 0.2)"
                      : "rgba(239, 68, 68, 0.2)"
                    : answered
                    ? "rgba(255,255,255,0.03)"
                    : "linear-gradient(135deg, rgba(225, 0, 15, 0.3) 0%, rgba(255, 107, 107, 0.15) 100%)",
                border:
                  answered === "f"
                    ? q.gender === "f"
                      ? "3px solid #84CC16"
                      : "3px solid #EF4444"
                    : answered
                    ? "3px solid rgba(255,255,255,0.1)"
                    : "3px solid rgba(255, 107, 107, 0.4)",
                color:
                  answered && answered !== "f"
                    ? "var(--text-faint)"
                    : "var(--fr-red-soft)",
                cursor: answered ? "default" : "pointer",
                boxShadow: !answered
                  ? "0 4px 20px rgba(225, 0, 15, 0.2)"
                  : "none",
              }}
            >
              la
              <span className="block text-xs font-normal mt-1" style={{ color: "var(--text-muted)" }}>
                feminen
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
