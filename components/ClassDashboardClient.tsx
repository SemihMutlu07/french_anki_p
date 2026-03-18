"use client";

import AppLayout from "@/components/AppLayout";

interface UnitReviewData {
  unit: number;
  reviews: number;
}

interface HardCard {
  cardId: string;
  french: string;
  turkish: string;
  fails: number;
}

interface Props {
  activeUsers: number;
  totalStudents: number;
  classAvgMature: number;
  unitReviews: UnitReviewData[];
  hardCards: HardCard[];
  listeningAccuracy: number | null;
  genderAccuracy: number | null;
  weekOverWeek: { thisWeek: number; lastWeek: number };
}

function WowArrow({
  thisWeek,
  lastWeek,
}: {
  thisWeek: number;
  lastWeek: number;
}) {
  if (lastWeek === 0 && thisWeek === 0) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  if (lastWeek === 0) return <span style={{ color: "#22C55E" }}>+{thisWeek}</span>;

  const diff = thisWeek - lastWeek;
  const pct = Math.round((diff / lastWeek) * 100);

  if (diff > 0) {
    return (
      <span style={{ color: "#22C55E" }}>
        ↑ %{Math.abs(pct)}
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span style={{ color: "var(--fr-red-soft)" }}>
        ↓ %{Math.abs(pct)}
      </span>
    );
  }
  return <span style={{ color: "var(--text-muted)" }}>→ aynı</span>;
}

export default function ClassDashboardClient({
  activeUsers,
  totalStudents,
  classAvgMature,
  unitReviews,
  hardCards,
  listeningAccuracy,
  genderAccuracy,
  weekOverWeek,
}: Props) {
  const maxReviews = Math.max(...unitReviews.map((u) => u.reviews), 1);

  return (
    <AppLayout>
      <div className="min-h-dvh" style={{ background: "var(--bg-base)" }}>
        {/* Header */}
        <header
          className="px-4 sm:px-6 md:px-8 py-6 md:py-8"
          style={{
            background: "linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-base) 100%)",
            borderBottom: `1px solid var(--border-default)`,
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">👥</span>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{
                  background: "linear-gradient(90deg, var(--text-primary), var(--fr-blue-pale))",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                FR101 Sınıf Durumu
              </h1>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Son 7 gün — anonim sınıf verileri
            </p>
          </div>
        </header>

        <div className="px-4 sm:px-6 md:px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* ── Stat Cards (2×2 grid) ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* Active Students */}
              <StatCard
                label="Aktif Öğrenci"
                value={`${activeUsers}/${totalStudents}`}
                color="var(--fr-blue-pale)"
              />
              {/* Class Average */}
              <StatCard
                label="Sınıf Ortalaması"
                value={`${classAvgMature} kelime`}
                sub="olgun (21+ gün)"
                color="var(--fr-gold)"
              />
              {/* Listening Accuracy */}
              <StatCard
                label="Dinleme Başarısı"
                value={listeningAccuracy !== null ? `%${listeningAccuracy}` : "—"}
                sub={listeningAccuracy === null ? "henüz veri yok" : undefined}
                color="var(--fr-blue-light)"
              />
              {/* Gender Quiz */}
              <StatCard
                label="Cinsiyet Quiz"
                value={genderAccuracy !== null ? `%${genderAccuracy}` : "—"}
                sub={genderAccuracy === null ? "henüz veri yok" : undefined}
                color="#E879F9"
              />
            </div>

            {/* ── Week over Week ── */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "rgba(11, 18, 32, 0.5)",
                border: `1px solid var(--border-default)`,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--fr-blue-pale)" }}>
                    Bu Hafta vs Geçen Hafta
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    toplam tekrar sayısı
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {weekOverWeek.thisWeek}
                    <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>
                      {" "}
                      vs {weekOverWeek.lastWeek}
                    </span>
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    <WowArrow
                      thisWeek={weekOverWeek.thisWeek}
                      lastWeek={weekOverWeek.lastWeek}
                    />
                  </p>
                </div>
              </div>
            </div>

            {/* ── Most Studied Units ── */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "rgba(11, 18, 32, 0.5)",
                border: `1px solid var(--border-default)`,
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📚</span>
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  En Çok Çalışılan Üniteler
                </h2>
              </div>

              {unitReviews.length > 0 ? (
                <div className="space-y-3">
                  {unitReviews.map((u) => {
                    const widthPct = Math.round((u.reviews / maxReviews) * 100);
                    return (
                      <div key={u.unit}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                            Ünite {u.unit}
                          </p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {u.reviews} tekrar
                          </p>
                        </div>
                        <div
                          className="h-3 rounded-full overflow-hidden"
                          style={{ background: "rgba(255, 255, 255, 0.06)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${widthPct}%`,
                              background:
                                "linear-gradient(90deg, var(--fr-blue) 0%, var(--fr-blue-light) 100%)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Henüz veri yok
                </p>
              )}
            </div>

            {/* ── Hardest Cards ── */}
            {hardCards.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(11, 18, 32, 0.5)",
                  border: "1px solid rgba(225, 0, 15, 0.2)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🔥</span>
                  <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                    En Zor Kartlar
                  </h2>
                </div>

                <div className="space-y-2">
                  {hardCards.map((card, i) => (
                    <div
                      key={card.cardId}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5"
                      style={{
                        background: "rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(225, 0, 15, 0.1)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs font-bold w-5 text-center"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--fr-gold)" }}
                          >
                            {card.french}
                          </p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {card.turkish}
                          </p>
                        </div>
                      </div>
                      <p
                        className="text-xs font-medium"
                        style={{ color: "var(--fr-red-soft)" }}
                      >
                        {card.fails} hata
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "rgba(11, 18, 32, 0.5)",
        border: `1px solid var(--border-default)`,
      }}
    >
      <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p
        className="text-2xl font-bold mt-1"
        style={{ color, textShadow: `0 0 12px ${color}40` }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
