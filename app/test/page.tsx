import Link from "next/link";

export default function TestStartPage() {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6"
      style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
    >
      <div className="w-full max-w-sm text-center">
        {/* French motif badge */}
        <div className="mb-8 flex justify-center">
          <span
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-xl"
            style={{
              background: "rgba(96,165,250,0.1)",
              border: "1px solid rgba(96,165,250,0.2)",
            }}
          >
            🇫🇷
          </span>
        </div>

        {/* Blue accent label */}
        <p
          className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--fr-blue-bright)" }}
        >
          Fransızca 101
        </p>

        {/* Title */}
        <h1 className="text-3xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
          Seviye belirleme
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mt-4 max-w-[280px] text-base leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          2 dakikalık kısa bir test. Sonunda nereden başlaman gerektiğini önereceğiz.
        </p>

        {/* Small note */}
        <p className="mt-2 text-xs" style={{ color: "var(--text-faint)" }}>
          En fazla 12 soru.
        </p>

        {/* CTA */}
        <Link
          href="/test/run"
          className="mt-10 flex min-h-[56px] w-full items-center justify-center rounded-2xl text-base font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#3B82F6", color: "#fff" }}
        >
          Teste başla
        </Link>
      </div>
    </main>
  );
}
