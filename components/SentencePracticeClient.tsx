"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import {
  shuffle,
  saveSentenceAttempt,
  accentTolerantMatch,
} from "@/lib/quiz";
import type { SentenceCard } from "@/lib/types";

const SESSION_SIZE = 12;

interface Props {
  cards: SentenceCard[];
  userId: string;
}

export default function SentencePracticeClient({ cards, userId }: Props) {
  const [queue] = useState(() =>
    shuffle(cards).slice(0, Math.min(SESSION_SIZE, cards.length))
  );
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = queue[current];

  const advance = useCallback(
    (correct: boolean) => {
      if (correct) setScore((s) => s + 1);
      if (q) void saveSentenceAttempt(userId, q.id, q.type, correct);
      if (current + 1 >= queue.length) {
        setDone(true);
      } else {
        setCurrent((c) => c + 1);
      }
    },
    [current, queue.length, userId, q]
  );

  if (done) {
    const pct = Math.round((score / queue.length) * 100);
    return (
      <main className="min-h-dvh bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <span className="text-5xl block mb-4">
            {pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}
          </span>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--fr-gold)" }}>
            Cümle Pratiği Tamamlandı!
          </h2>
          <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
            {score} / {queue.length} doğru
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
              href="/practice/sentences"
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
            <span className="text-lg">✍️</span>
            <span className="text-sm font-medium">Cümle Pratiği</span>
          </div>
          <span className="text-sm tabular-nums" style={{ color: "var(--text-muted)" }}>
            {current + 1}/{queue.length}
          </span>
        </div>
        <div
          className="mt-3 h-1.5 rounded-full overflow-hidden max-w-2xl mx-auto"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((current + 1) / queue.length) * 100}%`,
              background: "linear-gradient(90deg, var(--fr-blue) 0%, var(--fr-gold) 100%)",
            }}
          />
        </div>
      </header>

      {/* Content — switch by type */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <div className="w-full max-w-lg">
          {q.type === "qa" && <QACard card={q} onDone={advance} />}
          {q.type === "translate" && <TranslateCard card={q} onDone={advance} />}
          {q.type === "fill_blank" && <FillBlankCard card={q} onDone={advance} />}
          {q.type === "listen_respond" && <QACard card={q} onDone={advance} />}
        </div>
      </div>
    </main>
  );
}

/* ── QA Card ─────────────────────────────────────────────────── */

function QACard({
  card,
  onDone,
}: {
  card: SentenceCard;
  onDone: (correct: boolean) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const { play, isPlaying } = useAudioPlayer();

  return (
    <div className="text-center">
      {/* Question */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 0, 145, 0.3) 0%, rgba(11, 18, 32, 0.5) 100%)",
          border: "2px solid rgba(65, 105, 225, 0.3)",
        }}
      >
        <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2">
          {card.question_fr}
        </p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {card.question_tr}
        </p>
        {card.audio && (
          <button
            onClick={() => play(card.question_fr)}
            disabled={isPlaying}
            className="mt-3 inline-flex items-center gap-2 rounded-lg px-4 min-h-[44px] text-sm font-medium transition-all"
            style={{
              background: isPlaying ? "rgba(59,130,246,0.15)" : "var(--border-subtle)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: isPlaying ? "var(--fr-blue-bright)" : "var(--text-secondary)",
              cursor: isPlaying ? "default" : "pointer",
            }}
          >
            <span className={isPlaying ? "animate-pulse" : ""}>
              {isPlaying ? "🔊" : "▶️"}
            </span>
            {isPlaying ? "Dinleniyor..." : "Dinle"}
          </button>
        )}
      </div>

      {/* Answer reveal */}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-full rounded-xl py-4 text-base font-medium transition-all min-h-[56px]"
          style={{
            background: "var(--border-subtle)",
            border: "2px solid rgba(255,255,255,0.15)",
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          Cevabı Gör
        </button>
      ) : (
        <div>
          <div
            className="rounded-2xl p-6 mb-4"
            style={{
              background: "rgba(132, 204, 22, 0.08)",
              border: "2px solid rgba(132, 204, 22, 0.3)",
            }}
          >
            <p className="text-lg font-bold" style={{ color: "#84CC16" }}>
              {card.answer_fr}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {card.answer_tr}
            </p>
            {card.hint && (
              <p className="text-xs mt-2 italic" style={{ color: "var(--fr-gold)" }}>
                💡 {card.hint}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onDone(false)}
              className="flex-1 rounded-xl py-4 text-base font-medium min-h-[56px]"
              style={{
                background: "transparent",
                border: "2px solid rgba(239, 68, 68, 0.4)",
                color: "var(--fr-red-soft)",
                cursor: "pointer",
              }}
            >
              Tekrar Et
            </button>
            <button
              onClick={() => onDone(true)}
              className="flex-1 rounded-xl py-4 text-base font-medium min-h-[56px]"
              style={{
                background: "rgba(132, 204, 22, 0.1)",
                border: "2px solid rgba(132, 204, 22, 0.4)",
                color: "#84CC16",
                cursor: "pointer",
              }}
            >
              Bildim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Translate Card ──────────────────────────────────────────── */

function TranslateCard({
  card,
  onDone,
}: {
  card: SentenceCard;
  onDone: (correct: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (submitted || !input.trim()) return;
      const isCorrect = accentTolerantMatch(input, card.answer_fr);
      setCorrect(isCorrect);
      setSubmitted(true);
    },
    [submitted, input, card.answer_fr]
  );

  return (
    <div className="text-center">
      {/* Turkish prompt */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(225, 0, 15, 0.15) 0%, rgba(11, 18, 32, 0.5) 100%)",
          border: "2px solid rgba(225, 0, 15, 0.3)",
        }}
      >
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--fr-red-soft)" }}>
          Türkçe → Fransızca
        </p>
        <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
          {card.question_tr}
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitted}
          placeholder="Fransızca cevabı yaz..."
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          lang="fr"
          className="w-full rounded-xl px-5 py-4 text-base outline-none transition-all"
          style={{
            background: submitted
              ? correct
                ? "rgba(132, 204, 22, 0.08)"
                : "rgba(239, 68, 68, 0.08)"
              : "var(--bg-muted)",
            border: submitted
              ? correct
                ? "2px solid rgba(132, 204, 22, 0.4)"
                : "2px solid rgba(239, 68, 68, 0.4)"
              : "2px solid var(--text-ghost)",
            color: "var(--text-primary)",
            fontSize: 16,
          }}
        />
        {!submitted && (
          <button
            type="submit"
            disabled={!input.trim()}
            className="mt-3 w-full rounded-xl py-4 text-base font-medium min-h-[56px] transition-all"
            style={{
              background: input.trim()
                ? "linear-gradient(135deg, var(--fr-blue) 0%, var(--fr-blue-light) 100%)"
                : "var(--bg-subtle)",
              color: input.trim() ? "#ffffff" : "var(--text-faint)",
              cursor: input.trim() ? "pointer" : "default",
              border: "none",
            }}
          >
            Kontrol Et
          </button>
        )}
      </form>

      {/* Feedback */}
      {submitted && (
        <div className="mt-4">
          <div
            className="rounded-xl p-4 mb-4"
            style={{
              background: correct
                ? "rgba(132, 204, 22, 0.08)"
                : "rgba(239, 68, 68, 0.08)",
              border: `1px solid ${correct ? "rgba(132,204,22,0.3)" : "rgba(239,68,68,0.3)"}`,
            }}
          >
            <p
              className="text-sm font-medium"
              style={{ color: correct ? "#84CC16" : "var(--fr-red-soft)" }}
            >
              {correct ? "Doğru! ✓" : "Yanlış"}
            </p>
            {!correct && (
              <p className="text-base font-bold mt-1 text-[var(--text-primary)]">
                {card.answer_fr}
              </p>
            )}
            {card.hint && !correct && (
              <p className="text-xs mt-1 italic" style={{ color: "var(--fr-gold)" }}>
                💡 {card.hint}
              </p>
            )}
          </div>
          <button
            onClick={() => onDone(correct)}
            className="w-full rounded-xl py-4 text-base font-medium min-h-[56px]"
            style={{
              background: "var(--border-subtle)",
              border: "2px solid rgba(255,255,255,0.15)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            Devam Et →
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Fill Blank Card ─────────────────────────────────────────── */

function FillBlankCard({
  card,
  onDone,
}: {
  card: SentenceCard;
  onDone: (correct: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (submitted || !input.trim()) return;
      const isCorrect = accentTolerantMatch(input, card.answer_fr);
      setCorrect(isCorrect);
      setSubmitted(true);
    },
    [submitted, input, card.answer_fr]
  );

  // Highlight the blank in the question
  const parts = card.question_fr.split("___");

  return (
    <div className="text-center">
      {/* Sentence with blank */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(227, 181, 5, 0.1) 0%, rgba(11, 18, 32, 0.5) 100%)",
          border: "2px solid var(--border-gold)",
        }}
      >
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--fr-gold)" }}>
          Boşluğu Doldur
        </p>
        <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
          {parts[0]}
          <span
            className="inline-block min-w-[60px] border-b-2 mx-1"
            style={{
              borderColor: submitted
                ? correct
                  ? "#84CC16"
                  : "#EF4444"
                : "var(--fr-gold)",
              color: submitted
                ? correct
                  ? "#84CC16"
                  : "#EF4444"
                : "var(--fr-gold)",
            }}
          >
            {submitted ? card.answer_fr : input || "___"}
          </span>
          {parts[1]}
        </p>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          {card.question_tr}
        </p>
        {card.hint && !submitted && (
          <p className="text-xs mt-2 italic" style={{ color: "var(--text-secondary)" }}>
            💡 {card.hint}
          </p>
        )}
      </div>

      {/* Input */}
      {!submitted && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Cevabı yaz..."
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            lang="fr"
            className="w-full rounded-xl px-5 py-4 text-base outline-none"
            style={{
              background: "var(--bg-muted)",
              border: "2px solid var(--text-ghost)",
              color: "var(--text-primary)",
              fontSize: 16,
            }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="mt-3 w-full rounded-xl py-4 text-base font-medium min-h-[56px] transition-all"
            style={{
              background: input.trim()
                ? "linear-gradient(135deg, var(--fr-blue) 0%, var(--fr-blue-light) 100%)"
                : "var(--bg-subtle)",
              color: input.trim() ? "#ffffff" : "var(--text-faint)",
              cursor: input.trim() ? "pointer" : "default",
              border: "none",
            }}
          >
            Kontrol Et
          </button>
        </form>
      )}

      {/* Feedback */}
      {submitted && (
        <div className="mt-4">
          <div
            className="rounded-xl p-4 mb-4"
            style={{
              background: correct
                ? "rgba(132, 204, 22, 0.08)"
                : "rgba(239, 68, 68, 0.08)",
              border: `1px solid ${correct ? "rgba(132,204,22,0.3)" : "rgba(239,68,68,0.3)"}`,
            }}
          >
            <p
              className="text-sm font-medium"
              style={{ color: correct ? "#84CC16" : "var(--fr-red-soft)" }}
            >
              {correct ? "Doğru! ✓" : `Yanlış — doğrusu: ${card.answer_fr}`}
            </p>
          </div>
          <button
            onClick={() => onDone(correct)}
            className="w-full rounded-xl py-4 text-base font-medium min-h-[56px]"
            style={{
              background: "var(--border-subtle)",
              border: "2px solid rgba(255,255,255,0.15)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            Devam Et →
          </button>
        </div>
      )}
    </div>
  );
}
