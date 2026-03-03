import type { CardItem } from "@/lib/types";

interface Props {
  item: CardItem;
  onContinue: () => void;
}

export default function AnswerSheet({ item, onContinue }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onContinue}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 40,
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Yanıt"
        className="sheet-slide-up"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "80dvh",
          overflowY: "auto",
          borderRadius: "20px 20px 0 0",
          background: "#18181B",
          paddingBottom:
            "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
          paddingTop: "1.25rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          zIndex: 50,
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: "#3F3F46",
            margin: "0 auto 1.5rem",
          }}
        />

        {/* French word */}
        <p
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: 42,
            fontWeight: 700,
            lineHeight: 1.2,
            color: "#F4F4F5",
          }}
        >
          {item.french}
        </p>

        {/* IPA */}
        <p
          style={{
            margin: "8px 0 0",
            textAlign: "center",
            fontFamily: "monospace",
            fontSize: 14,
            color: "#A1A1AA",
          }}
        >
          {item.ipa}
        </p>

        <div style={{ margin: "20px 0", borderTop: "1px solid #3F3F46" }} />

        {/* Turkish translation */}
        <p
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: 22,
            color: "#E4E4E7",
          }}
        >
          {item.turkish}
        </p>

        {/* Example sentence */}
        {item.example_sentence && (
          <p
            style={{
              margin: "20px 0 0",
              textAlign: "center",
              fontSize: 14,
              fontStyle: "italic",
              color: "#A1A1AA",
            }}
          >
            {item.example_sentence}
          </p>
        )}

        {/* Example translation */}
        {item.example_translation && (
          <p
            style={{
              margin: "4px 0 0",
              textAlign: "center",
              fontSize: 14,
              color: "#71717A",
            }}
          >
            {item.example_translation}
          </p>
        )}

        <div
          style={{ margin: "24px 0 0", borderTop: "1px solid #27272A" }}
        />

        {/* Continue button */}
        <button
          onClick={onContinue}
          style={{
            display: "block",
            width: "100%",
            marginTop: 16,
            height: 52,
            borderRadius: 12,
            background: "#27272A",
            border: "none",
            color: "#F4F4F5",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Devam et
        </button>
      </div>
    </>
  );
}
