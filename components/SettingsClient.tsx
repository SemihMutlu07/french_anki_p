"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { createBrowserSupabase } from "@/lib/supabase";

interface UserStats {
  totalCards: number;
  masteredCards: number;
  reviewSessions: number;
  firstLearnedAt: string | null;
}

interface Props {
  userId: string;
  stats: UserStats;
}

export default function SettingsClient({ userId, stats }: Props) {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [slowMode, setSlowMode] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setSoundEnabled(localStorage.getItem("fr-tutor-sound") !== "0");
    setSlowMode(localStorage.getItem("fr-tutor-slow") === "1");
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    localStorage.setItem("fr-tutor-sound", next ? "1" : "0");
    setSoundEnabled(next);
  };

  const handleToggleSlow = () => {
    const next = !slowMode;
    localStorage.setItem("fr-tutor-slow", next ? "1" : "0");
    setSlowMode(next);
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem("fr-tutor-welcomed-v2");
    localStorage.removeItem("fr-tutor-placement-result");
    window.location.reload();
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const supabase = createBrowserSupabase();
      const { data: progress } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", userId);

      const exportData = {
        userId,
        exportedAt: new Date().toISOString(),
        stats,
        progress: progress || [],
        localStorage: {
          soundEnabled: localStorage.getItem("fr-tutor-sound"),
          slowMode: localStorage.getItem("fr-tutor-slow"),
          onboardingComplete: localStorage.getItem("fr-tutor-welcomed-v2"),
          placementResult: localStorage.getItem("fr-tutor-placement-result"),
        },
      };

      setExportData(JSON.stringify(exportData, null, 2));
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadExport = () => {
    if (!exportData) return;
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fr-tutor-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearLocalData = () => {
    if (confirm("Tüm yerel veriler silinecek. Emin misiniz?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSignOut = async () => {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Sidebar />

      <div className="md:ml-64 pb-20 md:pb-8">
        {/* Header */}
        <header
          className="px-4 sm:px-6 md:px-8 py-6 md:py-8"
          style={{
            background: "linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-base) 100%)",
            borderBottom: "1px solid var(--border-gold)",
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⚙️</span>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{
                  background: "linear-gradient(90deg, var(--text-primary), var(--fr-gold))",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Ayarlar
              </h1>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Uygulama tercihlerini yönet
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 sm:px-6 md:px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Audio Settings */}
            <section
              className="rounded-2xl p-6"
              style={{
                background: "rgba(11, 18, 32, 0.5)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-blue)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔊</span>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  Ses Ayarları
                </h2>
              </div>

              <div className="space-y-4">
                {/* Sound Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      Telaffuz Sesi
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      Kart çevrildiğinde Fransızca telaffuz
                    </p>
                  </div>
                  <button
                    onClick={handleToggleSound}
                    className="relative w-14 h-11 min-h-[44px] rounded-full transition-colors duration-200 border-2"
                    style={{
                      background: soundEnabled
                        ? "linear-gradient(135deg, var(--fr-blue) 0%, var(--fr-blue-light) 100%)"
                        : "rgba(255, 255, 255, 0.1)",
                      borderColor: soundEnabled ? "var(--fr-gold)" : "rgba(255, 255, 255, 0.2)",
                    }}
                    aria-label="Ses aç/kapat"
                  >
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full transition-transform duration-200"
                      style={{
                        background: soundEnabled
                          ? "linear-gradient(135deg, var(--fr-gold) 0%, var(--fr-gold-light) 100%)"
                          : "var(--text-muted)",
                        left: soundEnabled ? "calc(100% - 22px)" : "4px",
                        boxShadow: soundEnabled ? "0 0 10px rgba(227, 181, 5, 0.5)" : "none",
                      }}
                    />
                  </button>
                </div>

                {/* Slow Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      Yavaş Telaffuz Modu
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      Kelimeleri yavaşça telaffuz et (%50 hız)
                    </p>
                  </div>
                  <button
                    onClick={handleToggleSlow}
                    className="relative w-14 h-11 min-h-[44px] rounded-full transition-colors duration-200 border-2"
                    style={{
                      background: slowMode
                        ? "linear-gradient(135deg, var(--fr-blue) 0%, var(--fr-blue-light) 100%)"
                        : "rgba(255, 255, 255, 0.1)",
                      borderColor: slowMode ? "var(--fr-gold)" : "rgba(255, 255, 255, 0.2)",
                    }}
                    aria-label="Yavaş mod aç/kapat"
                  >
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full transition-transform duration-200"
                      style={{
                        background: slowMode
                          ? "linear-gradient(135deg, var(--fr-gold) 0%, var(--fr-gold-light) 100%)"
                          : "var(--text-muted)",
                        left: slowMode ? "calc(100% - 22px)" : "4px",
                        boxShadow: slowMode ? "0 0 10px rgba(227, 181, 5, 0.5)" : "none",
                      }}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* User Stats */}
            <section
              className="rounded-2xl p-6"
              style={{
                background: "rgba(11, 18, 32, 0.5)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-blue)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📈</span>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  Kullanıcı İstatistikleri
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className="rounded-xl p-4 text-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(0, 0, 145, 0.3) 0%, rgba(11, 18, 32, 0.5) 100%)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  <p className="text-2xl font-bold" style={{ color: "var(--fr-gold)" }}>
                    {stats.masteredCards}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Tamamlanan Kartlar
                  </p>
                </div>
                <div
                  className="rounded-xl p-4 text-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(0, 0, 145, 0.3) 0%, rgba(11, 18, 32, 0.5) 100%)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  <p className="text-2xl font-bold" style={{ color: "var(--fr-blue-bright)" }}>
                    {stats.reviewSessions}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Tekrar Oturumları
                  </p>
                </div>
              </div>

              {stats.firstLearnedAt && (
                <div className="mt-4 text-center">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    İlk öğrenme: {new Date(stats.firstLearnedAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              )}
            </section>

            {/* Data Management */}
            <section
              className="rounded-2xl p-6"
              style={{
                background: "rgba(11, 18, 32, 0.5)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-blue)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💾</span>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  Veri Yönetimi
                </h2>
              </div>

              <div className="space-y-4">
                {/* Export Data */}
                <div>
                  <button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="w-full py-3 rounded-xl font-medium transition-all duration-200 no-underline"
                    style={{
                      background: isExporting
                        ? "rgba(255, 255, 255, 0.1)"
                        : "linear-gradient(135deg, var(--fr-blue) 0%, var(--fr-blue-light) 100%)",
                      color: isExporting ? "var(--text-muted)" : "var(--text-primary)",
                      border: "2px solid var(--border-default)",
                      cursor: isExporting ? "not-allowed" : "pointer",
                    }}
                  >
                    {isExporting ? "Veriler Hazırlanıyor..." : "Verilerimi Dışa Aktar"}
                  </button>

                  {exportData && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={handleDownloadExport}
                          className="text-xs font-medium px-3 py-1.5 rounded-full no-underline"
                          style={{
                            background: "linear-gradient(135deg, var(--fr-gold) 0%, var(--fr-gold-light) 100%)",
                            color: "#000000",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          ⬇️ JSON İndir
                        </button>
                      </div>
                      <pre
                        className="text-[10px] p-3 rounded-xl overflow-auto max-h-48"
                        style={{
                          background: "rgba(0, 0, 0, 0.5)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {exportData}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Clear Local Data */}
                <button
                  onClick={handleClearLocalData}
                  className="w-full py-3 rounded-xl font-medium transition-all duration-200"
                  style={{
                    background: "rgba(225, 0, 15, 0.15)",
                    color: "var(--fr-red-soft)",
                    border: "2px solid rgba(225, 0, 15, 0.3)",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Yerel Verileri Temizle
                </button>
              </div>
            </section>

            {/* Account */}
            <section
              className="rounded-2xl p-6"
              style={{
                background: "rgba(11, 18, 32, 0.5)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-blue)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">👤</span>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  Hesap
                </h2>
              </div>

              <div className="space-y-4">
                {/* Reset Onboarding */}
                <button
                  onClick={handleResetOnboarding}
                  className="w-full py-3 rounded-xl font-medium transition-all duration-200 text-left"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                  }}
                >
                  🔄 Onboarding&apos;i Sıfırla
                </button>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="w-full py-3 rounded-xl font-medium transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, var(--fr-red) 0%, var(--fr-red-soft) 100%)",
                    color: "var(--text-primary)",
                    border: "2px solid rgba(225, 0, 15, 0.4)",
                    boxShadow: "0 4px 15px rgba(225, 0, 15, 0.2)",
                    cursor: "pointer",
                  }}
                >
                  🚪 Çıkış Yap
                </button>
              </div>
            </section>

            {/* App Info */}
            <div className="text-center py-6">
              <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                FR Tutor v0.1.0
              </p>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-ghost)" }}>
                🇫🇷 Fransızca öğrenmek hiç bu kadar eğlenceli olmamıştı!
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
