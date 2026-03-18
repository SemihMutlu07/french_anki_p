"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";
import { enableGuestMode, markOnboarded } from "@/lib/guestProgress";
import {
  PLACEMENT_RESULT_KEY,
  buildPlacementQuestions,
  buildPlacementResult,
} from "@/lib/placement";
import type { CardItem } from "@/lib/types";

interface Props {
  cards: CardItem[];
}

type Screen = "intro" | "placement" | "email";

const FEATURES = [
  { icon: "🎧", title: "Dinle & Telaffuz Et", desc: "Her kartta Fransızca ses, doğru telaffuzu duy." },
  { icon: "🧠", title: "Akıllı Tekrar", desc: "FSRS algoritması ile tam zamanında tekrar et." },
  { icon: "🗺️", title: "İlerlemeni Gör", desc: "Eyfel Kulesi ve Fransa haritası ile motivasyon." },
];

export default function OnboardingFlow({ cards }: Props) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("intro");

  // Placement state
  const questions = useMemo(
    () => buildPlacementQuestions(cards).slice(0, 8),
    [cards]
  );
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  // Email state
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Auto-play audio for audio questions
  const current = questions[qIndex];

  useEffect(() => {
    if (screen !== "placement" || !current) return;
    if (current.type === "audio_recognition" && current.audioText) {
      playAudio(current.audioText);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, screen]);

  function playAudio(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "fr-FR";
    utter.rate = 0.85;
    const fr = synth.getVoices().find((v) => v.lang.startsWith("fr"));
    if (fr) utter.voice = fr;
    synth.speak(utter);
  }

  function selectAnswer(choiceIndex: number) {
    const next = [...answers, choiceIndex];
    setAnswers(next);

    if (next.length >= questions.length) {
      // Placement complete — save result and go to email screen
      const result = buildPlacementResult(questions, next);
      localStorage.setItem(PLACEMENT_RESULT_KEY, JSON.stringify(result));
      setScreen("email");
    } else {
      setQIndex((i) => i + 1);
    }
  }

  function skipPlacement() {
    setScreen("email");
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sent || loading) return;
    setLoading(true);
    setError("");

    const supabase = createBrowserSupabase();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (authError) {
      console.error("[auth] signInWithOtp failed:", authError.message, authError);
      setError(`Hata: ${authError.message}`);
    } else {
      markOnboarded();
      setSent(true);
    }
  }

  function handleSkipEmail() {
    enableGuestMode();
    router.refresh();
  }

  function finishOnboarding() {
    markOnboarded();
    router.refresh();
  }

  // ─── Screen 1: Intro ──────────────────────────────────────
  if (screen === "intro") {
    return (
      <main
        className="min-h-dvh flex flex-col items-center justify-center px-6 py-10"
        style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
      >
        <div className="w-full max-w-sm text-center">
          <span className="text-6xl block mb-6">🇫🇷</span>

          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
            style={{ color: "var(--fr-blue-bright)" }}
          >
            Fransızca 101
          </p>

          <h1
            className="text-3xl font-bold mb-2"
            style={{
              background: "linear-gradient(90deg, #ffffff, #e3b505)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            FR Tutor
          </h1>

          <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
            Boğaziçi FR101 sınıfı için tasarlandı.
          </p>

          {/* Feature highlights */}
          <div className="space-y-3 mb-10 text-left">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(65, 105, 225, 0.08)",
                  border: "1px solid rgba(65, 105, 225, 0.2)",
                }}
              >
                <span className="text-2xl shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {f.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setScreen("placement")}
            className="w-full min-h-[56px] rounded-2xl text-base font-semibold transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #000091 0%, #4169E1 100%)",
              color: "var(--text-primary)",
              border: "1px solid rgba(227, 181, 5, 0.3)",
            }}
          >
            Seviyeni belirle
          </button>

          <button
            onClick={skipPlacement}
            className="w-full mt-3 min-h-[48px] rounded-2xl text-sm font-medium"
            style={{
              background: "transparent",
              color: "var(--text-faint)",
              border: "1px solid var(--bg-subtle)",
            }}
          >
            Atla
          </button>
        </div>
      </main>
    );
  }

  // ─── Screen 2: Placement ──────────────────────────────────
  if (screen === "placement") {
    if (!current) {
      // All questions answered, saving...
      return (
        <main
          className="min-h-dvh flex items-center justify-center"
          style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
        >
          <p className="text-sm">Sonuçlar hesaplanıyor...</p>
        </main>
      );
    }

    const progress = questions.length > 0
      ? Math.round((qIndex / questions.length) * 100)
      : 0;

    return (
      <main
        className="min-h-dvh"
        style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
      >
        <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-6">
          {/* Progress */}
          <div className="mb-6">
            <div
              className="mb-2 flex items-center justify-between text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span>Seviye testi</span>
              <span>
                {qIndex + 1} / {questions.length}
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "#3B82F6" }}
              />
            </div>
          </div>

          {/* Question */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="text-xl font-semibold leading-snug">{current.prompt}</p>
            {current.helper && (
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                {current.helper}
              </p>
            )}
            {current.type === "audio_recognition" && (
              <button
                type="button"
                onClick={() => current.audioText && playAudio(current.audioText)}
                className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-xl text-sm font-semibold"
                style={{
                  background: "rgba(59,130,246,0.12)",
                  border: "1px solid rgba(59,130,246,0.25)",
                  color: "var(--fr-blue-pale)",
                }}
              >
                🔊 Tekrar dinle
              </button>
            )}
          </div>

          {/* Choices */}
          <div className="mt-4 grid gap-2.5 pb-6">
            {current.choices.map((choice, ci) => (
              <button
                key={`${current.id}-${ci}`}
                type="button"
                onClick={() => selectAnswer(ci)}
                className="flex min-h-[54px] w-full items-center justify-start rounded-xl px-4 text-left text-base font-medium transition-all active:scale-[0.99]"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--text-primary)",
                }}
              >
                <span
                  className="mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px]"
                  style={{ border: "1px solid rgba(255,255,255,0.15)", color: "var(--text-faint)" }}
                >
                  {ci + 1}
                </span>
                {choice}
              </button>
            ))}
          </div>

          {/* Skip */}
          <button
            onClick={skipPlacement}
            className="mt-auto mb-4 text-xs font-medium"
            style={{ color: "var(--text-faint)" }}
          >
            Testi atla
          </button>
        </div>
      </main>
    );
  }

  // ─── Screen 3: Email ──────────────────────────────────────
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-10"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-4">📧</span>
          <h2 className="text-2xl font-bold mb-2">
            {sent ? "Bağlantı gönderildi!" : "İlerlemen kaydedilsin mi?"}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {sent
              ? `${email} adresine giriş linki gönderdik.`
              : "E-postanı gir, ilerlemen bulutta saklanır. Dilersen atlayıp misafir olarak devam et."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              required
              disabled={loading}
              placeholder="email@ornek.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: "14px 16px",
                background: "var(--bg-muted)",
                border: "1px solid var(--text-ghost)",
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: 16,
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {error && (
              <p className="text-sm mt-2" style={{ color: "#cc4444" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 min-h-[52px] rounded-xl text-base font-semibold transition-opacity"
              style={{
                background: loading
                  ? "var(--bg-muted)"
                  : "linear-gradient(135deg, #000091 0%, #4169E1 100%)",
                color: loading ? "var(--text-muted)" : "#ffffff",
                border: "1px solid rgba(65, 105, 225, 0.3)",
                cursor: loading ? "default" : "pointer",
              }}
            >
              {loading ? "Gönderiliyor..." : "Giriş linki gönder"}
            </button>

            <button
              type="button"
              onClick={handleSkipEmail}
              className="w-full mt-3 min-h-[48px] rounded-xl text-sm font-medium"
              style={{
                background: "transparent",
                color: "var(--text-faint)",
                border: "1px solid var(--bg-subtle)",
              }}
            >
              Misafir olarak devam et
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div
              className="rounded-xl p-4"
              style={{ background: "var(--bg-muted)", border: "1px solid var(--bg-subtle)" }}
            >
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                Mail uygulamanı aç:
              </p>
              <div className="space-y-2">
                {[
                  { label: "Gmail", href: "https://mail.google.com" },
                  { label: "Outlook", href: "https://outlook.live.com/mail/" },
                  { label: "Yahoo", href: "https://mail.yahoo.com" },
                ].map((m) => (
                  <a
                    key={m.label}
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm no-underline"
                    style={{ background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                  >
                    {m.label}
                    <span style={{ color: "var(--text-muted)" }}>→</span>
                  </a>
                ))}
              </div>
              <p className="text-xs text-center mt-3" style={{ color: "var(--text-faint)" }}>
                Gelmediyse spam klasörünü kontrol et.
              </p>
            </div>

            <button
              onClick={finishOnboarding}
              className="w-full min-h-[48px] rounded-xl text-sm font-medium"
              style={{
                background: "transparent",
                color: "var(--text-faint)",
                border: "1px solid var(--bg-subtle)",
              }}
            >
              Misafir olarak devam et
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
