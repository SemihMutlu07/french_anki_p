"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PLACEMENT_RESULT_KEY,
  type PlacementQuestionType,
  type PlacementResult,
} from "@/lib/placement";
import { FORCE_ONBOARDING_KEY, ONBOARDING_PLACEMENT_KEY } from "@/components/OnboardingGuard";
import LoadingScreen from "@/components/LoadingScreen";
import ProgressiveEiffelTower from "@/components/ProgressiveEiffelTower";

const TYPE_LABEL: Record<PlacementQuestionType, string> = {
  recognition: "Kelime tanıma",
  audio_recognition: "Dinleyerek tanıma",
  confusable_pair: "Doğru kullanım",
};

function pct(correct: number, total: number) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

function accentColor(ratio: number) {
  // French color palette based accent
  if (ratio >= 0.6) return "#34D399"; // Green for good
  if (ratio >= 0.25) return "#60A5FA"; // Blue for moderate
  return "#e3b505"; // Gold for needs improvement
}

/** Minimal Eiffel Tower outline whose brightness scales with accuracy. */
function EiffelTower({ ratio }: { ratio: number }) {
  const level = Math.round(ratio * 10);
  return (
    <div style={{ transform: "scale(1.3)", transformOrigin: "center bottom" }}>
      <ProgressiveEiffelTower 
        level={level} 
        size={1} 
        showHint={ratio < 1}
        width={180}
      />
    </div>
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
  const [showLoading, setShowLoading] = useState(false);

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
      style={{ 
        background: "linear-gradient(180deg, #0B1220 0%, #000091 100%)",
        color: "#F0F4FF" 
      }}
    >
      <div className="mx-auto max-w-sm">
        {/* Header */}
        <p
          className="text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: "#e3b505" }}
        >
          Seviye sonucu
        </p>
        <h1 className="mt-1.5 text-2xl font-bold leading-snug" style={{ color: "#ffffff" }}>
          Test tamamlandı
        </h1>

        {/* Accuracy card with Eiffel Tower */}
        <div
          className="mt-6 flex items-center gap-4 rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, rgba(0, 0, 145, 0.4) 0%, rgba(11, 18, 32, 0.6) 100%)",
            border: "1px solid rgba(227, 181, 5, 0.3)",
            backdropFilter: "blur(10px)",
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
            background: "rgba(227, 181, 5, 0.1)",
            border: "1px solid rgba(227, 181, 5, 0.4)",
          }}
        >
          <span className="text-sm" style={{ color: "#93C5FD" }}>
            Önerilen başlangıç
          </span>
          <span className="text-sm font-semibold" style={{ color: "#e3b505" }}>
            Ünite {result.suggestedUnit}
          </span>
        </div>

        {/* Güçlü yanların */}
        <div
          className="mt-3 rounded-2xl p-4"
          style={{
            background: "rgba(0, 0, 145, 0.2)",
            border: "1px solid rgba(96, 165, 250, 0.3)",
          }}
        >
          <p className="mb-3 text-sm font-semibold" style={{ color: "#ffffff" }}>
            💪 Güçlü yanların
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
            background: "rgba(225, 0, 15, 0.15)",
            border: "1px solid rgba(225, 0, 15, 0.3)",
          }}
        >
          <p className="mb-3 text-sm font-semibold" style={{ color: "#ffffff" }}>
            📚 Gelişim alanların
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
            setShowLoading(true);
          }}
          className="mt-8 flex min-h-[56px] w-full items-center justify-center rounded-2xl text-base font-semibold transition-all hover:shadow-lg"
          style={{ 
            background: "linear-gradient(135deg, #000091 0%, #4169E1 100%)",
            color: "#fff",
            border: "1px solid rgba(227, 181, 5, 0.3)",
          }}
        >
          Ana sayfaya dön
        </button>
        <p className="mt-3 text-center text-xs" style={{ color: "#93C5FD" }}>
          İstersen sonra tekrar seviye testi yapabilirsin.
        </p>
      </div>

      {/* Loading Screen */}
      <LoadingScreen
        isVisible={showLoading}
        minDuration={2000}
        onComplete={() => {
          setShowLoading(false);
          router.push("/");
        }}
      />
    </main>
  );
}
