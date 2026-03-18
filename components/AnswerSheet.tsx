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
          background: "var(--bg-muted)",
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
            background: "var(--text-ghost)",
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
            color: "var(--text-primary)",
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
            color: "var(--text-secondary)",
          }}
        >
          {item.ipa}
        </p>

        <div style={{ margin: "20px 0", borderTop: "1px solid var(--text-ghost)" }} />

        {/* Turkish translation */}
        <p
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: 22,
            color: "var(--text-primary)",
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
              color: "var(--text-secondary)",
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
              color: "var(--text-muted)",
            }}
          >
            {item.example_translation}
          </p>
        )}

        <div
          style={{ margin: "24px 0 0", borderTop: "1px solid var(--bg-subtle)" }}
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
            background: "var(--bg-subtle)",
            border: "none",
            color: "var(--text-primary)",
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
