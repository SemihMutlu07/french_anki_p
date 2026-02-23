"use client";

import { useState } from "react";
import Link from "next/link";
import LessonCard from "@/components/LessonCard";
import unit1 from "@/curriculum/101/unit1.json";

export default function LessonPage() {
  const [index, setIndex] = useState(0);
  const items = unit1;
  const total = items.length;
  const done = index >= total;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {done ? (
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Done</p>
          <Link
            href="/"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
          >
            Back
          </Link>
        </div>
      ) : (
        <>
          <p className="text-zinc-500 text-sm mb-6">
            {index + 1} / {total}
          </p>
          <LessonCard item={items[index]} />
          <button
            onClick={() => setIndex(index + 1)}
            className="mt-8 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded text-lg transition-colors"
          >
            Next
          </button>
        </>
      )}
    </main>
  );
}
