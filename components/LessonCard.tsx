import type { CardItem } from "@/lib/types";

interface Props {
  item: CardItem;
  isFlipped: boolean;
  onFlip: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPlayAudio: () => void;
  showPulse: boolean;
  slowMode: boolean;
  onToggleSlow: () => void;
  audioError: string | null;
  onRetry: () => void;
  isPlaying: boolean;
}

export default function LessonCard({
  item,
  isFlipped,
  onFlip,
  soundEnabled,
  onToggleSound,
  onPlayAudio,
  showPulse,
  slowMode,
  onToggleSlow,
  audioError,
  onRetry,
  isPlaying,
}: Props) {
  return (
    <div className="card-flip-container" style={{ perspective: "1200px" }}>
      <div
        role="button"
        tabIndex={0}
        aria-label={
          isFlipped
            ? `${item.french} — ${item.turkish}`
            : `${item.french} — çevirmek için tıkla`
        }
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onFlip();
        }}
        className={`relative w-full select-none rounded-2xl bg-gradient-to-br from-[var(--bg-muted)] to-[#121214] px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-ghost)] shadow-xl${
          showPulse && !isFlipped ? " pulse-hint" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isFlipped ? "rotateX(4deg)" : "rotateX(0deg)",
        }}
      >
        {/* Control buttons — 44x44 minimum touch targets */}
        <div className="absolute right-2 top-2 flex gap-1 sm:right-3 sm:top-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayAudio();
            }}
            aria-label="Ses oynat"
            title="Ses oynat (Fransızca telaffuz)"
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all ${
              isPlaying
                ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]"
                : "border-[var(--text-ghost)] bg-[var(--bg-subtle)]/50 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
            }`}
          >
            {isPlaying ? (
              <>
                <span className="animate-pulse">🔊</span>
                <span className="hidden sm:inline">Oynatılıyor...</span>
              </>
            ) : (
              <>
                <span>♪</span>
                <span className="hidden sm:inline">Dinle</span>
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSlow();
            }}
            aria-label={slowMode ? "Normal hıza geç" : "Yavaş oynat"}
            title={slowMode ? "Normal hız" : "Yavaş telaffuz (0.5x)"}
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border text-xs font-medium transition-all ${
              slowMode
                ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]"
                : "border-[var(--text-ghost)] bg-[var(--bg-subtle)]/50 text-[var(--text-faint)] hover:bg-[var(--bg-subtle)]"
            }`}
          >
            {slowMode ? "0.5×" : "1×"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSound();
            }}
            aria-label={soundEnabled ? "Otomatik sesi kapat" : "Otomatik sesi aç"}
            title={soundEnabled ? "Otomatik ses: Açık" : "Otomatik ses: Kapalı"}
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border text-sm transition-all ${
              soundEnabled
                ? "border-[var(--text-ghost)] bg-[var(--bg-subtle)]/50 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                : "border-[var(--bg-subtle)] bg-transparent text-[var(--text-ghost)]"
            }`}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>

        {/* French word */}
        <p className="m-0 text-center text-4xl font-bold leading-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl">
          {item.french}
        </p>

        {/* IPA pronunciation */}
        <p className="mb-0 mt-3 text-center font-mono text-sm text-[var(--text-muted)] sm:text-base">
          {item.ipa}
        </p>

        {/* Back — slides in via transform when flipped */}
        <div
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{
            maxHeight: isFlipped ? "400px" : "0px",
            opacity: isFlipped ? 1 : 0,
            transform: isFlipped ? "translateY(0)" : "translateY(-8px)",
          }}
        >
          <div className="my-6 border-t border-[var(--bg-subtle)]" />

          {/* Turkish translation */}
          <p className="m-0 text-center text-xl font-medium text-[var(--text-primary)] sm:text-2xl">
            {item.turkish}
          </p>

          {/* Example sentence */}
          <div className="mt-6 rounded-xl bg-[var(--bg-muted)]/50 p-4 text-center">
            <p className="m-0 text-sm italic text-[var(--text-secondary)] sm:text-[15px]">
              &ldquo;{item.example_sentence}&rdquo;
            </p>
            <p className="mb-0 mt-2 text-sm text-[var(--text-faint)]">
              {item.example_translation}
            </p>
          </div>
        </div>

        {/* Audio error */}
        {audioError && (
          <div
            className="mt-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="m-0 text-xs text-[#F87171]">{audioError}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
              className="mt-2 min-h-[44px] rounded-lg border border-[var(--text-ghost)] bg-[var(--bg-subtle)] px-4 text-xs text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-subtle)]/80"
            >
              🔁 Tekrar dene
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
