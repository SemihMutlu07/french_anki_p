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
    <main className="min-h-screen bg-[#09090B] text-[#F4F4F5]">
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#9CA3AF" }}>
            Fransızca
          </p>
          <h1 className="text-3xl font-bold">101</h1>
        </div>
        <ul className="space-y-2">
          {units.map((unit) => (
            <li key={unit.id}>
              <Link
                href={`/lesson/${unit.id}`}
                className="flex items-center justify-between px-4 py-4 rounded-lg transition-colors group"
                style={{ border: "1px solid #3F3F46" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "#F4F4F5" }}>
                    {unit.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                    {unit.count} kart
                  </p>
                </div>
                <span className="text-sm transition-colors" style={{ color: "#52525B" }}>
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
