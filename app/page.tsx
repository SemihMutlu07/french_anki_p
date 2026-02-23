import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">FR Tutor</h1>
      <Link
        href="/lesson/unit1"
        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded text-lg transition-colors"
      >
        Unit 1 — Start
      </Link>
    </main>
  );
}
