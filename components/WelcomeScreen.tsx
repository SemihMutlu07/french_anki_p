"use client";

import { useRouter } from "next/navigation";

interface Props {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  const router = useRouter();

  function handlePlacementTest() {
    // Don't mark as welcomed here — PLACEMENT_RESULT_KEY being set on
    // test completion is what gates the welcome screen for returning visits.
    router.push("/test");
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px calc(env(safe-area-inset-bottom) + 56px)",
        textAlign: "center",
      }}
    >
      <p className="anim-flag" style={{ fontSize: 64, margin: "0 0 28px", lineHeight: 1 }}>
        🇫🇷
      </p>

      <p
        className="anim-1"
        style={{
          fontSize: 11,
          color: "var(--text-faint)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          margin: "0 0 10px",
        }}
      >
        Fransızca 101
      </p>

      <h1
        className="anim-2"
        style={{
          fontSize: "clamp(28px, 8vw, 38px)",
          fontWeight: 700,
          margin: "0 0 14px",
          lineHeight: 1.15,
        }}
      >
        Hoş geldin.
      </h1>

      <p
        className="anim-3"
        style={{
          fontSize: 15,
          color: "var(--text-muted)",
          maxWidth: 272,
          lineHeight: 1.65,
          margin: "0 0 52px",
        }}
      >
        10 ünite, 150+ kart. Seviyeni hızlı belirle ve sana uygun yerden başla.
      </p>

      <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          className="anim-4"
          onClick={handlePlacementTest}
          style={{
            minHeight: 58,
            padding: "0 32px",
            background: "var(--text-primary)",
            border: "none",
            borderRadius: 14,
            color: "var(--bg-base)",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
            letterSpacing: "-0.01em",
          }}
        >
          Seviyeni belirle →
        </button>

        <button
          className="anim-5"
          onClick={onStart}
          style={{
            minHeight: 52,
            padding: "0 32px",
            background: "transparent",
            border: "1px solid var(--bg-subtle)",
            borderRadius: 14,
            color: "var(--text-faint)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Ünitelere geç
        </button>
      </div>
    </div>
  );
}
