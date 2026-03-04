"use client";

import { useRouter } from "next/navigation";
import { ONBOARDING_WELCOME_KEY, ONBOARDING_PLACEMENT_KEY } from "@/components/OnboardingGuard";

export default function WelcomePage() {
  const router = useRouter();

  function handlePlacementTest() {
    localStorage.setItem(ONBOARDING_WELCOME_KEY, "1");
    router.push("/test");
  }

  function handleSkip() {
    // User explicitly skips both welcome and placement
    localStorage.setItem(ONBOARDING_WELCOME_KEY, "1");
    localStorage.setItem(ONBOARDING_PLACEMENT_KEY, "1");
    router.push("/");
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#09090B",
        color: "#F4F4F5",
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
          color: "#52525B",
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
          color: "#71717A",
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
            background: "#F4F4F5",
            border: "none",
            borderRadius: 14,
            color: "#09090B",
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
          onClick={handleSkip}
          style={{
            minHeight: 52,
            padding: "0 32px",
            background: "transparent",
            border: "1px solid #27272A",
            borderRadius: 14,
            color: "#52525B",
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
