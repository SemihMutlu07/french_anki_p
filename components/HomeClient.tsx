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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setWelcomed(!!localStorage.getItem(WELCOMED_KEY));
    setOpenGroups(
      groups.reduce<Record<string, boolean>>((acc, group) => {
        acc[group.course] = true;
        return acc;
      }, {})
    );
  }, [groups]);

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
    <main className="min-h-dvh bg-[#09090B] text-[#F4F4F5]">
      <div className="mx-auto max-w-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-10 sm:px-6 sm:pt-14 md:px-8 md:py-16">
        <div className="mb-8">
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: "#9CA3AF" }}
          >
            Fransızca
          </p>
          <Link
            href="/test"
            className="inline-flex items-center rounded-lg border px-3 py-2 text-xs font-medium"
            style={{ borderColor: "#3F3F46", color: "#E4E4E7" }}
          >
            Placement testi
          </Link>
        </div>
        <div className="space-y-4 sm:space-y-6">
          {groups.map((group) => (
            <details
              key={group.course}
              open={openGroups[group.course] ?? true}
              onToggle={(e) => {
                const nextOpen = (e.currentTarget as HTMLDetailsElement).open;
                setOpenGroups((prev) => ({ ...prev, [group.course]: nextOpen }));
              }}
              className="rounded-xl border border-[#27272A] bg-[#0D0D10]"
            >
              <summary className="cursor-pointer list-none px-4 py-3 border-b border-[#27272A]">
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
              </summary>
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
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
