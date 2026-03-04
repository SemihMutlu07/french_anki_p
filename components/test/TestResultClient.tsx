"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PLACEMENT_RESULT_KEY,
  type PlacementQuestionType,
  type PlacementResult,
} from "@/lib/placement";
import { FORCE_ONBOARDING_KEY, ONBOARDING_PLACEMENT_KEY } from "@/components/OnboardingGuard";

const TYPE_LABEL: Record<PlacementQuestionType, string> = {
  recognition: "Kelime tanıma",
  audio_recognition: "Dinleyerek tanıma",
  confusable_pair: "Karıştırılan çiftler",
};

function pct(correct: number, total: number) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

function accentColor(ratio: number) {
  if (ratio >= 0.6) return "#34D399"; // green
  if (ratio >= 0.25) return "#60A5FA"; // blue
  return "#F59E0B"; // amber
}

function StatRow({
  label,
  correct,
  total,
}: {
  label: string;
  correct: number;
  total: number;
}) {
  const ratio = total === 0 ? 0 : correct / total;
  const color = accentColor(ratio);
  const width = pct(correct, total);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: "#7A9BBF" }}>
          {label}
        </span>
        <span
          className="text-sm font-medium tabular-nums"
          style={{ color: "#F0F4FF" }}
        >
          {correct}/{total}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
    </div>
  );
}

function AccuracyRing({
  correct,
  total,
}: {
  correct: number;
  total: number;
}) {
  const ratio = total === 0 ? 0 : correct / total;
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - ratio);
  const color = accentColor(ratio);

  return (
    <svg
      width="88"
      height="88"
      viewBox="0 0 88 88"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="6"
      />
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={String(circ)}
        strokeDashoffset={String(offset)}
        transform="rotate(-90 44 44)"
      />
      <text
        x="44"
        y="40"
        textAnchor="middle"
        fill="#F0F4FF"
        fontSize="15"
        fontWeight="700"
      >
        {Math.round(ratio * 100)}%
      </text>
      <text
        x="44"
        y="56"
        textAnchor="middle"
        fill="#7A9BBF"
        fontSize="10"
      >
        doğru
      </text>
    </svg>
  );
}

export default function TestResultClient() {
  const router = useRouter();
  const [result, setResult] = useState<PlacementResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(PLACEMENT_RESULT_KEY);
    if (!raw) {
      router.replace("/test");
      return;
    }
    try {
      setResult(JSON.parse(raw) as PlacementResult);
    } catch {
      router.replace("/test");
    }
  }, [router]);

  const { strengths, weaknesses } = useMemo(() => {
    if (!result) {
      return {
        strengths: [] as PlacementQuestionType[],
        weaknesses: [] as PlacementQuestionType[],
      };
    }
    const s: PlacementQuestionType[] = [];
    const w: PlacementQuestionType[] = [];
    (Object.keys(result.typeStats) as PlacementQuestionType[]).forEach(
      (type) => {
        const stat = result.typeStats[type];
        if (stat.total === 0) return;
        const ratio = stat.correct / stat.total;
        if (ratio >= 0.75) s.push(type);
        else if (ratio < 0.6) w.push(type);
      }
    );
    return { strengths: s, weaknesses: w };
  }, [result]);

  if (!result) {
    return (
      <main
        className="flex min-h-dvh items-center justify-center"
        style={{ background: "#0B1220" }}
      >
        <p className="text-sm" style={{ color: "#7A9BBF" }}>
          Yükleniyor…
        </p>
      </main>
    );
  }

  return (
    <main
      className="min-h-dvh px-5 py-10 sm:py-14"
      style={{ background: "#0B1220", color: "#F0F4FF" }}
    >
      <div className="mx-auto max-w-sm">
        {/* Label + title */}
        <p
          className="text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: "#60A5FA" }}
        >
          Seviye sonucu
        </p>
        <h1 className="mt-1.5 text-2xl font-bold leading-snug">
          Test tamamlandı
        </h1>

        {/* Accuracy ring + score text */}
        <div
          className="mt-6 flex items-center gap-5 rounded-2xl p-4"
          style={{
            background: "#101B2D",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <AccuracyRing correct={result.correct} total={result.total} />
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: "#3D5570" }}>
              Doğruluk
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums leading-none">
              {result.correct}
              <span className="text-xl text-[#3D5570]">/{result.total}</span>
            </p>
            <p className="mt-1 text-sm" style={{ color: "#7A9BBF" }}>
              %{pct(result.correct, result.total)} doğru
            </p>
          </div>
        </div>

        {/* Güçlü yanların */}
        <div
          className="mt-3 rounded-2xl p-4"
          style={{
            background: "#101B2D",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="mb-3 text-sm font-semibold" style={{ color: "#F0F4FF" }}>
            Güçlü yanların
          </p>
          {strengths.length > 0 ? (
            <div className="space-y-4">
              {strengths.map((type) => (
                <StatRow
                  key={type}
                  label={TYPE_LABEL[type]}
                  correct={result.typeStats[type].correct}
                  total={result.typeStats[type].total}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "#3D5570" }}>
              Şimdilik net bir güçlü alan çıkmadı.
            </p>
          )}
        </div>

        {/* Gelişim alanların */}
        <div
          className="mt-3 rounded-2xl p-4"
          style={{
            background: "#101B2D",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="mb-3 text-sm font-semibold" style={{ color: "#F0F4FF" }}>
            Gelişim alanların
          </p>
          {weaknesses.length > 0 ? (
            <div className="space-y-4">
              {weaknesses.map((type) => (
                <StatRow
                  key={type}
                  label={TYPE_LABEL[type]}
                  correct={result.typeStats[type].correct}
                  total={result.typeStats[type].total}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "#3D5570" }}>
              Ciddi bir zayıf alan görünmüyor.
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            if (localStorage.getItem(FORCE_ONBOARDING_KEY) === "1") {
              localStorage.setItem(ONBOARDING_PLACEMENT_KEY, "1");
            }
            router.push("/");
          }}
          className="mt-8 flex min-h-[56px] w-full items-center justify-center rounded-2xl text-base font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#3B82F6", color: "#fff" }}
        >
          Ana sayfaya dön
        </button>
        <p className="mt-3 text-center text-xs" style={{ color: "#3D5570" }}>
          İstersen sonra tekrar seviye testi yapabilirsin.
        </p>
      </div>
    </main>
  );
}
