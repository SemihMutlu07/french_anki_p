"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Used to prevent infinite reload loops on persistent ChunkLoadErrors
const RELOAD_FLAG = "fr-chunk-reload-v1";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const msg = error?.message ?? "";
    const name = error?.name ?? "";

    const isChunkError =
      name === "ChunkLoadError" ||
      msg.includes("ChunkLoadError") ||
      msg.includes("Loading chunk") ||
      msg.includes("Failed to fetch dynamically imported module") ||
      // MIME mismatch when CDN serves HTML instead of JS
      msg.includes("Unexpected token") ||
      msg.includes("is not a valid JavaScript MIME type");

    if (isChunkError) {
      const alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === "1";
      if (!alreadyReloaded) {
        sessionStorage.setItem(RELOAD_FLAG, "1");
        window.location.reload();
      }
      // If already reloaded and still erroring, fall through to show UI
    }
  }, [error]);

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6"
      style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
    >
      <div className="w-full max-w-sm text-center">
        <p
          className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--fr-blue-bright)" }}
        >
          Fransızca 101
        </p>
        <h2 className="text-xl font-bold">Bir şeyler ters gitti.</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Sayfa yüklenirken bir sorun oluştu.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => {
              sessionStorage.removeItem(RELOAD_FLAG);
              reset();
            }}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "#3B82F6", color: "#fff" }}
          >
            Tekrar dene
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl text-sm font-medium"
            style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}
          >
            Ana sayfaya dön
          </button>
        </div>
      </div>
    </main>
  );
}
