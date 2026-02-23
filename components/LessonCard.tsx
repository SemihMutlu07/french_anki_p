export interface VocabItem {
  id: string;
  french: string;
  turkish: string;
  ipa: string;
  example_sentence: string;
  example_translation: string;
  unit: number;
  course: string;
}

export default function LessonCard({ item }: { item: VocabItem }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 560,
        background: "#1a1a1a",
        borderRadius: 16,
        padding: 48,
      }}
    >
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
      <div
        style={{
          borderTop: "1px solid #333333",
          margin: "24px 0",
        }}
      />
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
    </div>
  );
}
