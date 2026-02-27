"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PLACEMENT_RESULT_KEY,
  type PlacementQuestionType,
  type PlacementResult,
} from "@/lib/placement";

const TYPE_LABEL: Record<PlacementQuestionType, string> = {
  recognition: "Recognition",
  audio_recognition: "Audio recognition",
  confusable_pair: "Confusable pairs",
};

function ratio(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export default function TestResultClient() {
  const router = useRouter();
  const [result, setResult] = useState<PlacementResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(PLACEMENT_RESULT_KEY);
    if (!raw) {
      router.replace("/test");
      return;
    }

    try {
      setResult(JSON.parse(raw) as PlacementResult);
    } catch {
      router.replace("/test");
    }
  }, [router]);

  const strengthsAndWeaknesses = useMemo(() => {
    if (!result) return { strengths: [] as string[], weaknesses: [] as string[] };

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    (Object.keys(result.typeStats) as PlacementQuestionType[]).forEach((type) => {
      const stat = result.typeStats[type];
      if (stat.total === 0) return;
      const value = stat.correct / stat.total;
      const line = `${TYPE_LABEL[type]}: ${stat.correct}/${stat.total}`;

      if (value >= 0.75) strengths.push(line);
      if (value < 0.6) weaknesses.push(line);
    });

    return { strengths, weaknesses };
  }, [result]);

  if (!result) {
    return (
      <main className="min-h-screen bg-[#09090B] px-5 py-10 text-[#F4F4F5]">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#27272A] bg-[#18181B] p-6">
          <p className="text-lg font-semibold">Sonuc yukleniyor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090B] text-[#F4F4F5]">
      <div className="mx-auto max-w-xl px-5 py-8 sm:py-12">
        <p className="text-xs uppercase tracking-[0.22em] text-[#9CA3AF]">Placement Sonucu</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight">Test tamamlandi</h1>
        <p className="mt-3 text-base text-[#D4D4D8]">
          Dogru oran: {result.correct}/{result.total} (%{ratio(result.correct, result.total)})
        </p>

        <section className="mt-7 rounded-2xl border border-[#27272A] bg-[#18181B] p-5">
          <h2 className="text-lg font-medium">Guclu yonler</h2>
          {strengthsAndWeaknesses.strengths.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-[#D4D4D8]">
              {strengthsAndWeaknesses.strengths.map((line) => (
                <li key={`strength-${line}`} className="rounded-xl border border-[#3F3F46] p-3">
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#A1A1AA]">Belirgin bir guclu alan henuz yok.</p>
          )}
        </section>

        <section className="mt-4 rounded-2xl border border-[#27272A] bg-[#18181B] p-5">
          <h2 className="text-lg font-medium">Gelisim alanlari</h2>
          {strengthsAndWeaknesses.weaknesses.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-[#D4D4D8]">
              {strengthsAndWeaknesses.weaknesses.map((line) => (
                <li key={`weakness-${line}`} className="rounded-xl border border-[#3F3F46] p-3">
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#A1A1AA]">Ciddi bir zayif alan gorunmuyor.</p>
          )}
        </section>

        <p className="mt-6 text-sm text-[#A1A1AA]">
          Onerilen baslangic: {result.suggestedCourse} / Unite {result.suggestedUnit}
        </p>

        <Link
          href={`/lesson/${result.suggestedCourse}-unit${result.suggestedUnit}`}
          className="mt-4 flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-[#F4F4F5] px-5 text-base font-semibold text-[#09090B]"
        >
          Önerilen yerden başla
        </Link>
      </div>
    </main>
  );
}
