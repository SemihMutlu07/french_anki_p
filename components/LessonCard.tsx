import type { CardItem } from "@/lib/types";

interface Props {
  item: CardItem;
  isFlipped: boolean;
  onFlip: () => void;
}

export default function LessonCard({ item, isFlipped, onFlip }: Props) {
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
        // Space is handled globally; Enter also flips for keyboard accessibility
        if (e.key === "Enter") onFlip();
      }}
      style={{
        width: "100%",
        maxWidth: 560,
        background: "#1a1a1a",
        borderRadius: 16,
        padding: 48,
        cursor: "pointer",
        outline: "none",
        userSelect: "none",
      }}
      onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #444")}
      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Front — always visible */}
      <p
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {item.french}
      </p>
      <p
        style={{
          fontSize: 16,
          color: "#666666",
          textAlign: "center",
          marginTop: 8,
          marginBottom: 0,
          fontFamily: "monospace",
        }}
      >
        {item.ipa}
      </p>

      {/* Back — hidden until flipped */}
      {isFlipped ? (
        <>
          <div style={{ borderTop: "1px solid #333333", margin: "24px 0" }} />
          <p
            style={{
              fontSize: 24,
              color: "#cccccc",
              textAlign: "center",
              margin: 0,
            }}
          >
            {item.turkish}
          </p>
          <p
            style={{
              fontSize: 15,
              fontStyle: "italic",
              color: "#888888",
              textAlign: "center",
              marginTop: 24,
              marginBottom: 0,
            }}
          >
            {item.example_sentence}
          </p>
          <p
            style={{
              fontSize: 14,
              color: "#555555",
              textAlign: "center",
              marginTop: 4,
              marginBottom: 0,
            }}
          >
            {item.example_translation}
          </p>
        </>
      ) : (
        /* Flip hint when card is showing front only */
        <p
          style={{
            fontSize: 12,
            color: "#333333",
            textAlign: "center",
            marginTop: 32,
            marginBottom: 0,
          }}
        >
          tıkla veya Space
        </p>
      )}
    </div>
  );
}
