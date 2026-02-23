import Link from "next/link";
import unit1 from "@/curriculum/101/unit1.json";
import unit2 from "@/curriculum/101/unit2.json";
import unit3 from "@/curriculum/101/unit3.json";
import unit4 from "@/curriculum/101/unit4.json";
import unit5 from "@/curriculum/101/unit5.json";
import unit6 from "@/curriculum/101/unit6.json";

const units = [
  { id: "unit1", label: "Ünite 1", count: unit1.length },
  { id: "unit2", label: "Ünite 2", count: unit2.length },
  { id: "unit3", label: "Ünite 3", count: unit3.length },
  { id: "unit4", label: "Ünite 4", count: unit4.length },
  { id: "unit5", label: "Ünite 5", count: unit5.length },
  { id: "unit6", label: "Ünite 6", count: unit6.length },
];

export default function Home() {
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
