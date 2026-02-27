"use client";

import { useEffect, useMemo, useState } from "react";
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
    const frVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("fr"));
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
      <main className="min-h-screen bg-[#09090B] px-5 py-10 text-[#F4F4F5]">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#27272A] bg-[#18181B] p-6">
          <p className="text-lg font-semibold">Test su an hazir degil</p>
          <p className="mt-2 text-sm text-[#A1A1AA]">
            Soru havuzu bulunamadi. Lutfen daha sonra tekrar dene.
          </p>
        </div>
      </main>
    );
  }

  if (!current) {
    return (
      <main className="min-h-screen bg-[#09090B] px-5 py-10 text-[#F4F4F5]">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#27272A] bg-[#18181B] p-6">
          <p className="text-lg font-semibold">Sonuclar hazirlaniyor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090B] text-[#F4F4F5]">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-6">
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#A1A1AA]">
            <span>Test</span>
            <span>
              {index + 1}/{questions.length}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#27272A]">
            <div
              className="h-full rounded-full bg-[#F4F4F5] transition-all"
              style={{ width: `${pct(index, questions.length)}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA]">
            {current.type === "recognition" && "Recognition"}
            {current.type === "audio_recognition" && "Audio Recognition"}
            {current.type === "confusable_pair" && "Confusable Pair"}
          </p>
          <p className="mt-3 text-xl font-semibold leading-tight">{current.prompt}</p>
          {current.helper ? (
            <p className="mt-2 text-sm text-[#A1A1AA]">{current.helper}</p>
          ) : null}

          {current.type === "audio_recognition" ? (
            <button
              type="button"
              onClick={() => playAudio(current.audioText)}
              className="mt-5 flex min-h-[56px] w-full items-center justify-center rounded-xl border border-[#3F3F46] bg-[#09090B] px-4 text-base font-semibold"
            >
              {isPlaying ? "Caliyor..." : "Sesi oynat"}
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 pb-6">
          {current.choices.map((choice, choiceIndex) => (
            <button
              key={`${current.id}-choice-${choice}`}
              type="button"
              onClick={() => selectChoice(choiceIndex)}
              className="flex min-h-[56px] w-full items-center justify-start rounded-2xl border border-[#3F3F46] bg-[#18181B] px-4 text-left text-base font-medium"
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
