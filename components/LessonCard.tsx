import type { CardItem } from "@/lib/types";

interface Props {
  item: CardItem;
  isFlipped: boolean;
  onFlip: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPlayAudio: () => void;
  audioError: string | null;
  debugAudio: boolean;
  audioDebug: {
    srcLoaded: boolean;
    canPlayType: string;
    lastError: string | null;
  };
}

export default function LessonCard({
  item,
  isFlipped,
  onFlip,
  soundEnabled,
  onToggleSound,
  onPlayAudio,
  audioError,
  debugAudio,
  audioDebug,
}: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={
        isFlipped
          ? `${item.french} — ${item.turkish}`
          : `${item.french} — çevirmek için tıkla veya Space`
      }
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onFlip();
      }}
      className="relative w-full max-w-[40rem] select-none rounded-2xl bg-[#18181B] px-5 py-7 sm:px-8 sm:py-10 md:px-12 md:py-12 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#3F3F46]"
    >
      <div className="absolute right-3 top-3 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayAudio();
          }}
          aria-label="Ses oynat"
          title="Ses oynat"
          className="rounded-md border border-[#3F3F46] px-2.5 py-1 text-xs font-medium text-[#D4D4D8]"
        >
          Oynat
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSound();
          }}
          aria-label={soundEnabled ? "Otomatik sesi kapat" : "Otomatik sesi aç"}
          title={soundEnabled ? "Otomatik sesi kapat" : "Otomatik sesi aç"}
          className="rounded-md p-1.5 text-lg leading-none"
          style={{ color: soundEnabled ? "#71717A" : "#3F3F46" }}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      </div>

      {/* Front — always visible */}
      <p
        className="m-0 text-center text-4xl font-bold leading-tight text-[#F4F4F5] sm:text-5xl md:text-6xl"
      >
        {item.french}
      </p>
      <p
        className="mb-0 mt-2 text-center font-mono text-sm text-[#A1A1AA] sm:text-base"
      >
        {item.ipa}
      </p>

      {/* Back — hidden until flipped */}
      {isFlipped ? (
        <>
          <div className="my-6 border-t border-[#3F3F46]" />
          <p
            className="m-0 text-center text-xl text-[#E4E4E7] sm:text-2xl"
          >
            {item.turkish}
          </p>
          <p
            className="mb-0 mt-6 text-center text-sm italic text-[#A1A1AA] sm:text-[15px]"
          >
            {item.example_sentence}
          </p>
          <p
            className="mb-0 mt-1 text-center text-sm text-[#71717A]"
          >
            {item.example_translation}
          </p>
        </>
      ) : (
        <p
          className="mb-0 mt-8 text-center text-xs text-[#A1A1AA]"
        >
          tıkla veya Space
        </p>
      )}

      {audioError ? (
        <p className="mb-0 mt-3 text-center text-xs text-[#fca5a5]">{audioError}</p>
      ) : null}

      {debugAudio ? (
        <div className="mt-3 rounded-lg border border-[#3F3F46] p-2 text-[11px] text-[#A1A1AA]">
          <p className="m-0">src loaded: {audioDebug.srcLoaded ? "yes" : "no"}</p>
          <p className="m-0">canPlayType: {audioDebug.canPlayType || "unknown"}</p>
          <p className="m-0">
            last error: {audioDebug.lastError && audioDebug.lastError.length > 0 ? audioDebug.lastError : "-"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
