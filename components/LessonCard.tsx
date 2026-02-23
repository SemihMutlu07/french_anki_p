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
    <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl p-10">
      <p className="text-6xl font-bold text-center tracking-tight mb-3">
        {item.french}
      </p>
      <p className="text-zinc-500 text-center text-sm font-mono mb-8">
        {item.ipa}
      </p>
      <p className="text-2xl text-zinc-200 text-center mb-8">
        {item.turkish}
      </p>
      <div className="border-t border-zinc-800 pt-6 space-y-2">
        <p className="text-zinc-400 text-sm italic text-center">
          {item.example_sentence}
        </p>
        <p className="text-zinc-600 text-xs text-center">
          {item.example_translation}
        </p>
      </div>
    </div>
  );
}
