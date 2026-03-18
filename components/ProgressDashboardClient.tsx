"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";

const ProgressiveEiffelTower = dynamic(
  () => import("@/components/ProgressiveEiffelTower"),
  { ssr: false }
);
const FranceMap = dynamic(() => import("@/components/FranceMap"), {
  ssr: false,
});

interface WeeklyActivity {
  date: string;
  cardsReviewed: number;
}

interface MasteryData {
  unit: number;
  mastered: number;
  total: number;
  percentage: number;
}

interface WeakCard {
  id: string;
  french: string;
  turkish: string;
  unknownCount: number;
  lastReviewed: string;
}

interface PersonalSummary {
  cardsStudiedThisWeek: number;
  newCardsThisWeek: number;
  listeningAccuracy: number | null;
  suggestedUnit: number | null;
}

interface Props {
  weeklyActivity: WeeklyActivity[];
  masteryData: MasteryData[];
  weakCards: WeakCard[];
  overallProgress: number;
  totalMastered: number;
  totalCards: number;
  matureCount: number;
  personalSummary: PersonalSummary;
}

const MILESTONES = [25, 50, 100, 150] as const;

function getMilestoneReached(mastered: number): number | null {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (mastered >= MILESTONES[i]) return MILESTONES[i];
  }
  return null;
}

function getNextMilestone(mastered: number): number | null {
  for (const m of MILESTONES) {
    if (mastered < m) return m;
  }
  return null;
}

const MILESTONE_MESSAGES: Record<number, { emoji: string; title: string; sub: string }> = {
  25: { emoji: "🌱", title: "Fransızca tohumları yeşeriyor!", sub: "25 kart tamamlandı" },
  50: { emoji: "🗼", title: "Eyfel Kulesi'ne yarı yol!", sub: "50 kart tamamlandı" },
  100: { emoji: "🎉", title: "Yüzüncü kart! Bravo!", sub: "100 kart tamamlandı" },
  150: { emoji: "🏆", title: "Fransızca ustası!", sub: "150 kart tamamlandı" },
};

export default function ProgressDashboardClient({
  weeklyActivity,
  masteryData,
  weakCards,
  overallProgress,
  totalMastered,
  totalCards,
  matureCount,
  personalSummary,
}: Props) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMilestone, setCelebrationMilestone] = useState<number | null>(null);

  // Check for new milestone on mount
  useEffect(() => {
    const milestone = getMilestoneReached(totalMastered);
    if (!milestone) return;

    const key = "fr-tutor-last-milestone";
    const lastSeen = parseInt(localStorage.getItem(key) || "0", 10);
    if (milestone > lastSeen) {
      setCelebrationMilestone(milestone);
      setShowCelebration(true);
      localStorage.setItem(key, String(milestone));
    }
  }, [totalMastered]);

  const maxReviewCount = useMemo(
    () => Math.max(...weeklyActivity.map((a) => a.cardsReviewed), 1),
    [weeklyActivity]
  );

  const dayLabels = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return dayLabels[date.getDay()];
  };

  const getShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Eiffel tower level: ratio of mature cards to total cards, mapped to 0-10
  const eiffelLevel = totalCards > 0 ? (matureCount / totalCards) * 10 : 0;

  const nextMilestone = getNextMilestone(totalMastered);

  return (
    <AppLayout>
      <div className="min-h-dvh" style={{ background: "var(--bg-base)" }}>
        {/* Header */}
        <header
          className="px-4 sm:px-6 md:px-8 py-6 md:py-8"
          style={{
            background: "linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-base) 100%)",
            borderBottom: "1px solid rgba(227, 181, 5, 0.2)",
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📊</span>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{
                  background: "linear-gradient(90deg, var(--text-primary), var(--fr-gold))",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                İlerleme
              </h1>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Fransızca öğrenme yolculuğunu takip et
            </p>
          </div>
        </header>

        <div className="px-4 sm:px-6 md:px-8 py-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* === PERSONAL WEEKLY SUMMARY === */}
            <div
              className="rounded-2xl p-5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0, 0, 145, 0.2) 0%, rgba(227, 181, 5, 0.08) 100%)",
                border: "1px solid rgba(227, 181, 5, 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">✨</span>
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  Bu Hafta
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat
                  label="Çalışılan kart"
                  value={String(personalSummary.cardsStudiedThisWeek)}
                />
                <MiniStat
                  label="Yeni kelime"
                  value={String(personalSummary.newCardsThisWeek)}
                />
                <MiniStat
                  label="Dinleme doğruluk"
                  value={
                    personalSummary.listeningAccuracy !== null
                      ? `%${personalSummary.listeningAccuracy}`
                      : "—"
                  }
                />
                <MiniStat
                  label="Önerilen"
                  value={
                    personalSummary.suggestedUnit
                      ? `Ünite ${personalSummary.suggestedUnit}`
                      : "—"
                  }
                  sub={personalSummary.suggestedUnit ? "tekrar et" : undefined}
                />
              </div>
            </div>

            {/* === EIFFEL TOWER + STATS === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Eiffel Tower Card */}
              <div
                className="rounded-2xl p-6 flex flex-col items-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0, 0, 145, 0.25) 0%, rgba(11, 18, 32, 0.5) 100%)",
                  border: "2px solid rgba(227, 181, 5, 0.25)",
                  boxShadow: "0 8px 32px rgba(0, 0, 145, 0.25)",
                }}
              >
                <p
                  className="text-sm font-semibold mb-4 tracking-wide uppercase"
                  style={{ color: "var(--fr-blue-pale)" }}
                >
                  Kelime Olgunluğu
                </p>

                <ProgressiveEiffelTower
                  level={eiffelLevel}
                  width={160}
                  showHint={true}
                  size={0.8}
                />

                <div className="mt-4 text-center">
                  <p
                    className="text-3xl font-bold"
                    style={{
                      color: "var(--fr-gold)",
                      textShadow: "0 0 15px rgba(227, 181, 5, 0.4)",
                    }}
                  >
                    {matureCount}
                    <span className="text-base font-normal" style={{ color: "var(--text-muted)" }}>
                      /{totalCards}
                    </span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    olgun kart (21+ gün stabil)
                  </p>
                </div>
              </div>

              {/* Stats + Milestone Card */}
              <div className="flex flex-col gap-4">
                {/* Overall progress */}
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0, 0, 145, 0.3) 0%, rgba(11, 18, 32, 0.5) 100%)",
                    border: `2px solid var(--border-gold)`,
                    boxShadow: "0 8px 32px rgba(0, 0, 145, 0.3)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--fr-blue-pale)" }}>
                        Toplam İlerleme
                      </p>
                      <p
                        className="text-4xl font-bold mt-1"
                        style={{
                          color: "var(--fr-gold)",
                          textShadow: "0 0 20px rgba(227, 181, 5, 0.5)",
                        }}
                      >
                        {overallProgress}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {totalMastered}
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                          /{totalCards}
                        </span>
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        kart tamamlandı
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="h-3 rounded-full overflow-hidden"
                    style={{ background: "rgba(255, 255, 255, 0.1)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${overallProgress}%`,
                        background:
                          "linear-gradient(90deg, var(--fr-blue) 0%, var(--fr-blue-light) 50%, var(--fr-gold) 100%)",
                        boxShadow: "0 0 15px rgba(227, 181, 5, 0.4)",
                      }}
                    />
                  </div>
                </div>

                {/* Milestone badge */}
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: "rgba(11, 18, 32, 0.5)",
                    border: "1px solid rgba(65, 105, 225, 0.3)",
                  }}
                >
                  <p
                    className="text-sm font-semibold mb-3 tracking-wide uppercase"
                    style={{ color: "var(--fr-blue-pale)" }}
                  >
                    Kilometre Taşları
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {MILESTONES.map((m) => {
                      const reached = totalMastered >= m;
                      return (
                        <div
                          key={m}
                          className="flex items-center gap-2 rounded-xl px-3 py-2"
                          style={{
                            background: reached
                              ? "linear-gradient(135deg, rgba(227, 181, 5, 0.15), rgba(227, 181, 5, 0.05))"
                              : "rgba(0, 0, 0, 0.3)",
                            border: reached
                              ? "1px solid rgba(227, 181, 5, 0.4)"
                              : "1px solid rgba(255, 255, 255, 0.08)",
                            boxShadow: reached
                              ? "0 2px 10px rgba(227, 181, 5, 0.15)"
                              : "none",
                          }}
                        >
                          <span className="text-lg">
                            {reached ? MILESTONE_MESSAGES[m].emoji : "🔒"}
                          </span>
                          <span
                            className="text-xs font-medium"
                            style={{ color: reached ? "var(--fr-gold)" : "var(--text-faint)" }}
                          >
                            {m}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {nextMilestone && (
                    <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                      Sonraki hedef: {nextMilestone} kart ({nextMilestone - totalMastered} kaldı)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* === FRANCE MAP === */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(11, 18, 32, 0.5)",
                border: "1px solid rgba(65, 105, 225, 0.3)",
                boxShadow: "0 4px 20px rgba(0, 0, 145, 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🗺️</span>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  Fransa Haritası
                </h2>
              </div>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Her şehir bir üniteyi temsil eder
              </p>

              <FranceMap
                unitData={masteryData.map((m) => ({
                  unit: m.unit,
                  percentage: m.percentage,
                }))}
              />

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                {[
                  { color: "#2a2a4a", label: "Başlanmadı" },
                  { color: "var(--fr-blue)", label: "Başlandı" },
                  { color: "var(--fr-blue-light)", label: "%50+" },
                  { color: "var(--fr-gold)", label: "Tamamlandı" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* === WEEKLY ACTIVITY === */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(11, 18, 32, 0.5)",
                border: "1px solid rgba(65, 105, 225, 0.3)",
                boxShadow: "0 4px 20px rgba(0, 0, 145, 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📅</span>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  Haftalık Aktivite
                </h2>
              </div>

              {weeklyActivity.length > 0 ? (
                <div className="flex items-end justify-between gap-2 h-28">
                  {weeklyActivity.map((activity, index) => {
                    const heightPercent =
                      (activity.cardsReviewed / maxReviewCount) * 100;
                    const isToday = index === weeklyActivity.length - 1;
                    return (
                      <div
                        key={activity.date}
                        className="flex-1 flex flex-col items-center gap-1.5"
                      >
                        <p
                          className="text-[10px] font-medium"
                          style={{
                            color: activity.cardsReviewed > 0 ? "var(--fr-blue-pale)" : "var(--text-faint)",
                          }}
                        >
                          {activity.cardsReviewed > 0 ? activity.cardsReviewed : ""}
                        </p>
                        <div className="w-full flex flex-col items-center">
                          <div
                            className="w-full max-w-[36px] rounded-t-lg transition-all duration-300"
                            style={{
                              height: `${Math.max(heightPercent, 6)}px`,
                              background: isToday
                                ? "linear-gradient(180deg, var(--fr-gold) 0%, var(--fr-gold-light) 100%)"
                                : activity.cardsReviewed > 0
                                  ? "linear-gradient(180deg, var(--fr-blue) 0%, var(--fr-blue-light) 100%)"
                                  : "rgba(255, 255, 255, 0.06)",
                              boxShadow: isToday
                                ? "0 0 12px rgba(227, 181, 5, 0.5)"
                                : "none",
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <p
                            className="text-[10px] font-medium"
                            style={{ color: isToday ? "var(--fr-gold)" : "var(--text-muted)" }}
                          >
                            {getDayLabel(activity.date)}
                          </p>
                          <p className="text-[9px]" style={{ color: "var(--text-faint)" }}>
                            {getShortDate(activity.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Henüz aktivite yok. İlk kartını tamamla!
                  </p>
                </div>
              )}
            </div>

            {/* === UNIT MASTERY GRID === */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(11, 18, 32, 0.5)",
                border: "1px solid rgba(65, 105, 225, 0.3)",
                boxShadow: "0 4px 20px rgba(0, 0, 145, 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  Ünite Durumu
                </h2>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {masteryData.map((unit) => (
                  <Link
                    key={unit.unit}
                    href={`/lesson/101-unit${unit.unit}`}
                    className="no-underline"
                  >
                    <div
                      className="rounded-xl p-3 text-center transition-all duration-200 hover:scale-105"
                      style={{
                        background:
                          unit.percentage === 100
                            ? "linear-gradient(135deg, rgba(227, 181, 5, 0.2), rgba(227, 181, 5, 0.08))"
                            : "rgba(0, 0, 145, 0.15)",
                        border:
                          unit.percentage === 100
                            ? "1px solid rgba(227, 181, 5, 0.5)"
                            : `1px solid var(--border-default)`,
                        boxShadow:
                          unit.percentage === 100
                            ? "0 4px 12px rgba(227, 181, 5, 0.15)"
                            : "none",
                      }}
                    >
                      <p className="text-[10px] font-medium" style={{ color: "var(--fr-blue-pale)" }}>
                        Ü{unit.unit}
                      </p>
                      <p
                        className="text-xl font-bold mt-0.5"
                        style={{
                          color: unit.percentage === 100 ? "var(--fr-gold)" : "var(--text-primary)",
                          textShadow:
                            unit.percentage === 100
                              ? "0 0 8px rgba(227, 181, 5, 0.5)"
                              : "none",
                        }}
                      >
                        {unit.percentage}%
                      </p>
                      <p className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {unit.mastered}/{unit.total}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* === WEAK CARDS === */}
            {weakCards.length > 0 && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(225, 0, 15, 0.12) 0%, rgba(11, 18, 32, 0.5) 100%)",
                  border: "1px solid rgba(225, 0, 15, 0.25)",
                  boxShadow: "0 4px 20px rgba(225, 0, 15, 0.12)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                      Tekrar Gereken Kartlar
                    </h2>
                  </div>
                  <Link
                    href="/review"
                    className="text-xs font-medium px-3 py-1.5 rounded-full no-underline min-h-[44px] min-w-[44px] flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, var(--fr-red), var(--fr-gold))",
                      color: "var(--text-primary)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    Tekrar Et
                  </Link>
                </div>

                <div className="space-y-2">
                  {weakCards.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-xl p-3"
                      style={{
                        background: "rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(225, 0, 15, 0.15)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className="text-sm font-bold"
                            style={{ color: "var(--fr-gold)" }}
                          >
                            {card.french}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {card.turkish}
                          </p>
                        </div>
                        <p
                          className="text-xs font-medium"
                          style={{ color: "var(--fr-red-soft)" }}
                        >
                          {card.unknownCount}x
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === MILESTONE CELEBRATION OVERLAY === */}
      {showCelebration && celebrationMilestone && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowCelebration(false)}
        >
          <div
            className="rounded-3xl p-8 text-center max-w-sm mx-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 0, 145, 0.6), rgba(11, 18, 32, 0.9))",
              border: "2px solid rgba(227, 181, 5, 0.5)",
              boxShadow:
                "0 0 60px rgba(227, 181, 5, 0.3), 0 0 120px rgba(0, 0, 145, 0.3)",
              animation: "celebrationPop 0.5s ease-out",
            }}
          >
            <p className="text-6xl mb-4">
              {MILESTONE_MESSAGES[celebrationMilestone].emoji}
            </p>
            <p
              className="text-xl font-bold mb-2"
              style={{
                background: "linear-gradient(90deg, var(--text-primary), var(--fr-gold))",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {MILESTONE_MESSAGES[celebrationMilestone].title}
            </p>
            <p className="text-sm" style={{ color: "var(--fr-blue-pale)" }}>
              {MILESTONE_MESSAGES[celebrationMilestone].sub}
            </p>
            <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
              devam etmek için dokun
            </p>
          </div>

          <style jsx>{`
            @keyframes celebrationPop {
              0% {
                transform: scale(0.5);
                opacity: 0;
              }
              70% {
                transform: scale(1.05);
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </AppLayout>
  );
}

function MiniStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{
        background: "rgba(0, 0, 0, 0.25)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <p className="text-lg font-bold" style={{ color: "var(--fr-gold)" }}>
        {value}
      </p>
      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      {sub && (
        <p className="text-[9px]" style={{ color: "var(--fr-blue-pale)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
