"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import type { Phrase } from "@/lib/curriculum";

interface Props {
  phrases: Phrase[];
}

export default function PhrasesClient({ phrases }: Props) {
  const [filter, setFilter] = useState("");
  const { play, isPlaying } = useAudioPlayer();
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  const handlePlay = useCallback(
    (text: string, idx: number) => {
      setPlayingIdx(idx);
      play(text);
      // Clear playing state after a reasonable duration
      setTimeout(() => setPlayingIdx(null), 3000);
    },
    [play]
  );

  const filtered = filter
    ? phrases.filter(
        (p) =>
          p.fr.toLowerCase().includes(filter.toLowerCase()) ||
          p.tr.toLowerCase().includes(filter.toLowerCase())
      )
    : phrases;

  return (
    <main className="min-h-dvh bg-[#09090B] text-[#E4E4E7]">
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 pt-4 pb-3 sm:px-6"
        style={{
          background: "linear-gradient(180deg, #09090B 80%, transparent 100%)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/"
              className="text-xl text-[#71717A] no-underline min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              ←
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                <h1
                  className="text-xl font-bold"
                  style={{
                    background:
                      "linear-gradient(90deg, #e1000f 0%, #e3b505 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Derste Kurtaran Cümleler
                </h1>
              </div>
              <p className="text-xs" style={{ color: "#71717A" }}>
                Dokunarak dinle — derste anında kullan
              </p>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Ara..."
            autoCapitalize="off"
            autoCorrect="off"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              background: "#18181B",
              border: "1px solid #3F3F46",
              color: "#F4F4F5",
              fontSize: 16,
            }}
          />
        </div>
      </header>

      {/* Phrase list */}
      <div className="max-w-2xl mx-auto px-4 pb-24 sm:px-6">
        <div className="space-y-2">
          {filtered.map((phrase, idx) => {
            const isLast = idx === phrases.length - 1 && !filter;
            const isActive = playingIdx === idx && isPlaying;

            return (
              <button
                key={idx}
                onClick={() => handlePlay(phrase.fr, idx)}
                className="w-full text-left rounded-xl px-5 py-4 transition-all duration-200 min-h-[56px]"
                style={{
                  background: isActive
                    ? "rgba(59, 130, 246, 0.1)"
                    : isLast
                    ? "rgba(227, 181, 5, 0.08)"
                    : "rgba(255,255,255,0.04)",
                  border: isActive
                    ? "1px solid rgba(59, 130, 246, 0.3)"
                    : isLast
                    ? "1px solid rgba(227, 181, 5, 0.3)"
                    : "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-[#F4F4F5]">
                      {phrase.fr}
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: "#71717A" }}>
                      {phrase.tr}
                    </p>
                  </div>
                  <span
                    className={`text-lg shrink-0 mt-0.5 ${isActive ? "animate-pulse" : ""}`}
                    style={{ color: isActive ? "#60A5FA" : "#52525B" }}
                  >
                    {isActive ? "🔊" : "▶️"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-sm mt-8" style={{ color: "#52525B" }}>
            Sonuç bulunamadı
          </p>
        )}
      </div>
    </main>
  );
}
