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
        if (e.key === "Enter") onFlip();
      }}
      style={{
        width: "100%",
        maxWidth: 560,
        background: "#18181B",
        borderRadius: 16,
        padding: 48,
        cursor: "pointer",
        outline: "none",
        userSelect: "none",
      }}
      onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #3F3F46")}
      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Front — always visible */}
      <p
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: "#F4F4F5",
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
          color: "#A1A1AA",
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
          <div style={{ borderTop: "1px solid #3F3F46", margin: "24px 0" }} />
          <p
            style={{
              fontSize: 24,
              color: "#E4E4E7",
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
              color: "#A1A1AA",
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
              color: "#71717A",
              textAlign: "center",
              marginTop: 4,
              marginBottom: 0,
            }}
          >
            {item.example_translation}
          </p>
        </>
      ) : (
        <p
          style={{
            fontSize: 12,
            color: "#A1A1AA",
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
