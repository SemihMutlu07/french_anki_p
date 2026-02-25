"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import WelcomeScreen from "@/components/WelcomeScreen";

const WELCOMED_KEY = "fr-tutor-welcomed";

interface Unit {
  id: string;
  label: string;
  count: number;
  available: boolean;
  completed: boolean;
}

interface Props {
  groups: { course: string; units: Unit[] }[];
}

export default function HomeClient({ groups }: Props) {
  const [welcomed, setWelcomed] = useState<boolean | null>(null);

  useEffect(() => {
    setWelcomed(!!localStorage.getItem(WELCOMED_KEY));
  }, []);

  function handleStart() {
    localStorage.setItem(WELCOMED_KEY, "1");
    setWelcomed(true);
  }

  // Avoid flash: render nothing until localStorage is read
  if (welcomed === null) return null;

  if (!welcomed) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <main className="min-h-screen bg-[#09090B] text-[#F4F4F5]">
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="mb-8">
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: "#9CA3AF" }}
          >
            Fransızca
          </p>
        </div>
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.course} className="rounded-xl border border-[#27272A]">
              <div className="px-4 py-3 border-b border-[#27272A]">
                <p
                  className="text-sm font-medium"
                  style={{
                    color: "#D4D4D8",
                    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                  }}
                >
                  {"{ "}
                  {group.course}
                  {" }"}
                </p>
              </div>
              <ul className="p-2 space-y-2">
                {group.units.map((unit) => (
                  <li key={unit.id}>
                    {unit.available ? (
                      <Link
                        href={`/lesson/${unit.id}`}
                        className="flex items-center justify-between px-4 py-4 rounded-lg"
                        style={{ border: "1px solid #3F3F46" }}
                      >
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "#F4F4F5" }}
                          >
                            {unit.label}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                            {unit.count} kart
                          </p>
                        </div>
                        <span
                          className={unit.completed ? "text-xs" : "text-sm"}
                          style={{ color: unit.completed ? "#A1A1AA" : "#52525B" }}
                        >
                          {unit.completed ? "Tamamlandı" : "→"}
                        </span>
                      </Link>
                    ) : (
                      <div
                        className="flex items-center justify-between px-4 py-4 rounded-lg opacity-55"
                        style={{ border: "1px solid #3F3F46" }}
                      >
                        <p className="text-sm font-medium" style={{ color: "#F4F4F5" }}>
                          {unit.label}
                        </p>
                        <span className="text-xs" style={{ color: "#A1A1AA" }}>
                          Yakında
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
