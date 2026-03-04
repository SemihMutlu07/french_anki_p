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
  confusable_pair: "Doğru kullanım",
};

function pct(correct: number, total: number) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

function accentColor(ratio: number) {
  if (ratio >= 0.6) return "#34D399";
  if (ratio >= 0.25) return "#60A5FA";
  return "#F59E0B";
}

/** Minimal Eiffel Tower outline whose brightness scales with accuracy. */
function EiffelTower({ ratio }: { ratio: number }) {
  const opacity = 0.15 + ratio * 0.85;
  const towerColor = ratio >= 0.6 ? "#93C5FD" : ratio >= 0.25 ? "#7BAED4" : "#4A6A8A";
  const glowStrength = ratio >= 0.6 ? (ratio - 0.6) / 0.4 : 0;
  const filter =
    glowStrength > 0
      ? `drop-shadow(0 0 ${Math.round(6 + glowStrength * 8)}px rgba(96,165,250,${(glowStrength * 0.65).toFixed(2)}))`
      : "none";

  return (
    <svg
      width="34"
      height="58"
      viewBox="0 0 40 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ opacity, filter, flexShrink: 0 }}
    >
      {/* Antenna */}
      <line x1="20" y1="1" x2="20" y2="8" stroke={towerColor} strokeWidth="1.5" strokeLinecap="round" />
      {/* Upper body */}
      <path d="M20 8 L17 21 L23 21 Z" stroke={towerColor} strokeWidth="1.1" fill={towerColor} fillOpacity="0.18" />
      {/* Level 1 platform */}
      <line x1="14" y1="21" x2="26" y2="21" stroke={towerColor} strokeWidth="2" strokeLinecap="round" />
      {/* Mid body */}
      <line x1="17" y1="22" x2="11" y2="39" stroke={towerColor} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="23" y1="22" x2="29" y2="39" stroke={towerColor} strokeWidth="1.2" strokeLinecap="round" />
      {/* Level 2 platform */}
      <line x1="9" y1="39" x2="31" y2="39" stroke={towerColor} strokeWidth="2" strokeLinecap="round" />
      {/* Arches between legs */}
      <path d="M11 39 Q14 34 17 39" stroke={towerColor} strokeWidth="1.1" fill="none" />
      <path d="M23 39 Q26 34 29 39" stroke={towerColor} strokeWidth="1.1" fill="none" />
      {/* Outer legs (curved outward) */}
      <path d="M11 39 C 10 49 5 57 3 68" stroke={towerColor} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M29 39 C 30 49 35 57 37 68" stroke={towerColor} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Inner legs */}
      <line x1="17" y1="40" x2="16" y2="68" stroke={towerColor} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="23" y1="40" x2="24" y2="68" stroke={towerColor} strokeWidth="1.1" strokeLinecap="round" />
      {/* Ground base */}
      <line x1="1" y1="68" x2="39" y2="68" stroke={towerColor} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
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

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: "#7A9BBF" }}>
          {label}
        </span>
        <span className="text-sm font-medium tabular-nums" style={{ color: "#F0F4FF" }}>
          {correct}/{total}
        </span>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct(correct, total)}%`, background: color }}
        />
      </div>
    </div>
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
    if (!result) return { strengths: [] as PlacementQuestionType[], weaknesses: [] as PlacementQuestionType[] };
    const s: PlacementQuestionType[] = [];
    const w: PlacementQuestionType[] = [];
    (Object.keys(result.typeStats) as PlacementQuestionType[]).forEach((type) => {
      const stat = result.typeStats[type];
      if (stat.total === 0) return;
      const ratio = stat.correct / stat.total;
      if (ratio >= 0.75) s.push(type);
      else if (ratio < 0.6) w.push(type);
    });
    return { strengths: s, weaknesses: w };
  }, [result]);

  if (!result) {
    return (
      <main className="flex min-h-dvh items-center justify-center" style={{ background: "#0B1220" }}>
        <p className="text-sm" style={{ color: "#7A9BBF" }}>
          Yükleniyor…
        </p>
      </main>
    );
  }

  const ratio = result.total === 0 ? 0 : result.correct / result.total;

  return (
    <main
      className="min-h-dvh px-5 py-10 sm:py-14"
      style={{ background: "#0B1220", color: "#F0F4FF" }}
    >
      <div className="mx-auto max-w-sm">
        {/* Header */}
        <p
          className="text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: "#60A5FA" }}
        >
          Seviye sonucu
        </p>
        <h1 className="mt-1.5 text-2xl font-bold leading-snug">Test tamamlandı</h1>

        {/* Accuracy card with Eiffel Tower */}
        <div
          className="mt-6 flex items-center gap-4 rounded-2xl p-4"
          style={{
            background: "#111C2E",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <EiffelTower ratio={ratio} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "#3D5570" }}>
              Doğruluk
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums leading-none">
              {result.correct}
              <span className="text-xl" style={{ color: "#3D5570" }}>/{result.total}</span>
            </p>
            <p className="mt-1 text-sm" style={{ color: accentColor(ratio) }}>
              %{pct(result.correct, result.total)} doğru
            </p>
          </div>
          {/* Accuracy ring */}
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            aria-hidden="true"
            className="shrink-0"
          >
            <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle
              cx="36"
              cy="36"
              r="28"
              fill="none"
              stroke={accentColor(ratio)}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={String(2 * Math.PI * 28)}
              strokeDashoffset={String(2 * Math.PI * 28 * (1 - ratio))}
              transform="rotate(-90 36 36)"
            />
            <text x="36" y="33" textAnchor="middle" fill="#F0F4FF" fontSize="13" fontWeight="700">
              {Math.round(ratio * 100)}%
            </text>
            <text x="36" y="46" textAnchor="middle" fill="#7A9BBF" fontSize="9">
              doğru
            </text>
          </svg>
        </div>

        {/* Suggested unit */}
        <div
          className="mt-3 flex items-center justify-between rounded-xl px-4 py-3"
          style={{
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.18)",
          }}
        >
          <span className="text-sm" style={{ color: "#7A9BBF" }}>
            Önerilen başlangıç
          </span>
          <span className="text-sm font-semibold" style={{ color: "#93C5FD" }}>
            Ünite {result.suggestedUnit}
          </span>
        </div>

        {/* Güçlü yanların */}
        <div
          className="mt-3 rounded-2xl p-4"
          style={{
            background: "#111C2E",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="mb-3 text-sm font-semibold" style={{ color: "#F0F4FF" }}>
            Güçlü yanların
          </p>
          {strengths.length > 0 ? (
            <div className="space-y-3">
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
            background: "#111C2E",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="mb-3 text-sm font-semibold" style={{ color: "#F0F4FF" }}>
            Gelişim alanların
          </p>
          {weaknesses.length > 0 ? (
            <div className="space-y-3">
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
