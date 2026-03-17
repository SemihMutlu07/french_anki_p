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
      className={`relative w-full select-none rounded-2xl bg-gradient-to-br from-[#18181B] to-[#121214] px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#3F3F46] shadow-xl${
        showPulse && !isFlipped ? " pulse-hint" : ""
      }`}
    >
      {/* Control buttons */}
      <div className="absolute right-3 top-3 flex gap-1.5 sm:right-4 sm:top-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayAudio();
          }}
          aria-label="Ses oynat"
          title="Ses oynat (Fransızca telaffuz)"
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
            isPlaying
              ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]"
              : "border-[#3F3F46] bg-[#27272A]/50 text-[#A1A1AA] hover:bg-[#27272A]"
          }`}
        >
          {isPlaying ? (
            <>
              <span className="animate-pulse">🔊</span>
              <span>Oynatılıyor...</span>
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
          className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
            slowMode
              ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]"
              : "border-[#3F3F46] bg-[#27272A]/50 text-[#52525B] hover:bg-[#27272A]"
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
          className={`rounded-lg border p-2 text-sm transition-all ${
            soundEnabled
              ? "border-[#3F3F46] bg-[#27272A]/50 text-[#A1A1AA] hover:bg-[#27272A]"
              : "border-[#27272A] bg-transparent text-[#3F3F46]"
          }`}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      </div>

      {/* French word */}
      <p className="m-0 text-center text-4xl font-bold leading-tight text-[#F4F4F5] sm:text-5xl md:text-6xl">
        {item.french}
      </p>
      
      {/* IPA pronunciation */}
      <p className="mb-0 mt-3 text-center font-mono text-sm text-[#71717A] sm:text-base">
        {item.ipa}
      </p>

      {/* Back — hidden until flipped */}
      {isFlipped && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="my-6 border-t border-[#27272A]" />
          
          {/* Turkish translation */}
          <p className="m-0 text-center text-xl font-medium text-[#E4E4E7] sm:text-2xl">
            {item.turkish}
          </p>
          
          {/* Example sentence */}
          <div className="mt-6 rounded-xl bg-[#18181B]/50 p-4 text-center">
            <p className="m-0 text-sm italic text-[#A1A1AA] sm:text-[15px]">
              &ldquo;{item.example_sentence}&rdquo;
            </p>
            <p className="mb-0 mt-2 text-sm text-[#52525B]">
              {item.example_translation}
            </p>
          </div>
        </div>
      )}

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
            className="mt-2 rounded-lg border border-[#3F3F46] bg-[#27272A] px-4 py-1.5 text-xs text-[#F4F4F5] transition-colors hover:bg-[#27272A]/80"
          >
            🔁 Tekrar dene
          </button>
        </div>
      )}
    </div>
  );
}
