import Link from "next/link";
import { getUnitCount } from "@/lib/curriculum";

const UNIT_IDS = Array.from({ length: 10 }, (_, i) => `unit${i + 1}`);

export default async function Home() {
  const units = await Promise.all(
    UNIT_IDS.map(async (id, i) => ({
      id,
      label: `Ünite ${i + 1}`,
      count: await getUnitCount(id),
    }))
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5]">
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-zinc-600 text-xs uppercase tracking-widest mb-2">
            Fransızca
          </p>
          <h1 className="text-3xl font-bold">101</h1>
        </div>
        <ul className="space-y-2">
          {units.map((unit) => (
            <li key={unit.id}>
              <Link
                href={`/lesson/${unit.id}`}
                className="flex items-center justify-between px-4 py-4 border border-zinc-800 hover:border-zinc-600 rounded-lg transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {unit.label}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {unit.count} kart
                  </p>
                </div>
                <span className="text-zinc-700 group-hover:text-zinc-400 text-sm transition-colors">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
