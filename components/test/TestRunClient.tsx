"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PLACEMENT_RESULT_KEY,
  buildPlacementQuestions,
  buildPlacementResult,
} from "@/lib/placement";
import type { CardItem } from "@/lib/types";

interface Props {
  cards: CardItem[];
}

const TYPE_LABEL: Record<string, string> = {
  recognition: "Kelime tanıma",
  audio_recognition: "Dinleyerek tanıma",
  confusable_pair: "Doğru kullanım",
};

function pct(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export default function TestRunClient({ cards }: Props) {
  const router = useRouter();
  const questions = useMemo(() => buildPlacementQuestions(cards), [cards]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const current = questions[index];
  const selectChoiceRef = useRef(selectChoice);
  const currentRef = useRef(current);

  useEffect(() => {
    selectChoiceRef.current = selectChoice;
    currentRef.current = current;
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const idx = parseInt(e.key, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx > 3) return;
      if (!currentRef.current) return;
      if (idx >= currentRef.current.choices.length) return;
      selectChoiceRef.current(idx);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (questions.length === 0) return;
    if (answers.length !== questions.length) return;

    const result = buildPlacementResult(questions, answers);
    localStorage.setItem(PLACEMENT_RESULT_KEY, JSON.stringify(result));
    router.replace("/test/result");
  }, [answers, questions, router]);

  function playAudio(text?: string) {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.85;
    const voices = synth.getVoices();
    const frVoice = voices.find((v) => v.lang.toLowerCase().startsWith("fr"));
    if (frVoice) utterance.voice = frVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    synth.speak(utterance);
  }

  function selectChoice(choiceIndex: number) {
    if (!current) return;
    setAnswers((prev) => [...prev, choiceIndex]);
    setIndex((prev) => prev + 1);
  }

  if (questions.length === 0) {
    return (
      <main
        className="flex min-h-dvh items-center justify-center px-5"
        style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
      >
        <div
          className="w-full max-w-xl rounded-2xl p-6"
          style={{ background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-lg font-semibold">Test şu an hazır değil</p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Soru havuzu bulunamadı. Lütfen daha sonra tekrar dene.
          </p>
        </div>
      </main>
    );
  }

  if (!current) {
    return (
      <main
        className="flex min-h-dvh items-center justify-center px-5"
        style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
      >
        <div
          className="w-full max-w-xl rounded-2xl p-6"
          style={{ background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-lg font-semibold">Sonuçlar hazırlanıyor…</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-dvh"
      style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div
            className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em]"
            style={{ color: "var(--text-faint)" }}
          >
            <span>Seviye testi</span>
            <span style={{ color: "var(--text-muted)" }}>
              {index + 1} / {questions.length}
            </span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${pct(index, questions.length)}%`,
                background: "#3B82F6",
              }}
            />
          </div>
        </div>

        {/* Question card */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--fr-blue-bright)" }}
          >
            {TYPE_LABEL[current.type] ?? current.type}
          </p>
          <p className="mt-3 text-xl font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
            {current.prompt}
          </p>
          {current.helper ? (
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              {current.helper}
            </p>
          ) : null}

          {current.type === "audio_recognition" ? (
            <button
              type="button"
              onClick={() => playAudio(current.audioText)}
              className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-xl text-base font-semibold transition-opacity hover:opacity-80"
              style={{
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.25)",
                color: "var(--fr-blue-pale)",
              }}
            >
              {isPlaying ? "Çalıyor…" : "🔊 Sesi oynat"}
            </button>
          ) : null}
        </div>

        {/* Choices */}
        <div className="mt-4 grid gap-2.5 pb-6">
          {current.choices.map((choice, choiceIndex) => (
            <button
              key={`${current.id}-choice-${choice}`}
              type="button"
              onClick={() => selectChoice(choiceIndex)}
              className="relative flex min-h-[54px] w-full items-center justify-start rounded-xl px-4 text-left text-base font-medium transition-all hover:opacity-90 active:scale-[0.99]"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text-primary)",
              }}
            >
              <span
                className="mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[11px]"
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "var(--text-faint)",
                }}
              >
                {choiceIndex + 1}
              </span>
              {choice}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
