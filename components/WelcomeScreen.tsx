"use client";

interface Props {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090B",
        color: "#F4F4F5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 48, margin: "0 0 32px" }}>🇫🇷</p>

      <p
        style={{
          fontSize: 13,
          color: "#9CA3AF",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          margin: "0 0 12px",
        }}
      >
        Fransızca 101
      </p>

      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          margin: "0 0 16px",
          lineHeight: 1.2,
        }}
      >
        Hoş geldin.
      </h1>

      <p
        style={{
          fontSize: 15,
          color: "#71717A",
          maxWidth: 280,
          lineHeight: 1.6,
          margin: "0 0 48px",
        }}
      >
        10 ünite, 150+ kelime kartı. Her gün birkaç dakikayla Fransızca kelime bilgini kalıcı hale getir.
      </p>

      <button
        onClick={onStart}
        style={{
          height: 52,
          padding: "0 40px",
          background: "#F4F4F5",
          border: "none",
          borderRadius: 12,
          color: "#09090B",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: "0.01em",
        }}
      >
        Başla →
      </button>
    </div>
  );
}
