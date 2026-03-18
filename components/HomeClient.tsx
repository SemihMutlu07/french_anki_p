"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import WelcomeScreen from "@/components/WelcomeScreen";
import { PLACEMENT_RESULT_KEY } from "@/lib/placement";
import AppLayout from "@/components/AppLayout";

// Set only when user explicitly skips the placement test via "Ünitelere geç".
// PLACEMENT_RESULT_KEY being present means the test was completed — also welcomed.
const SKIP_KEY = "fr-tutor-welcomed-v2";

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
    const hasResult = !!localStorage.getItem(PLACEMENT_RESULT_KEY);
    const hasSkipped = !!localStorage.getItem(SKIP_KEY);
    setWelcomed(hasResult || hasSkipped);
    setOpenGroups(
      groups.reduce<Record<string, boolean>>((acc, group) => {
        acc[group.course] = true;
        return acc;
      }, {})
    );
  }, [groups]);

  function handleStart() {
    // Only called by "Ünitelere geç" — marks user as having explicitly skipped the test.
    localStorage.setItem(SKIP_KEY, "1");
    setWelcomed(true);
  }

  // Avoid flash: render nothing until localStorage is read
  if (welcomed === null) return null;

  if (!welcomed) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <AppLayout>
      <div className="min-h-dvh bg-gradient-to-br from-french-blue via-french-lightBlue to-french-purple">
        {/* Animated background sparkles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
                background: i % 4 === 0 ? '#e3b505' : i % 4 === 1 ? '#ffffff' : i % 4 === 2 ? '#e1000f' : '#60A5FA',
                opacity: 0.3 + Math.random() * 0.4,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-10 sm:px-6 sm:pt-14 md:px-8 md:py-16">
          {/* Header with fun gradient */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl animate-bounce-slow" style={{ display: 'inline-block' }}>
                🇫🇷
              </span>
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{
                    background: 'linear-gradient(90deg, #ffffff, #e3b505)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Fransızca
                </p>
                <p
                  className="text-xs"
                  style={{ color: '#93C5FD' }}
                >
                  101 - Eğlenceli Öğren! ✨
                </p>
              </div>
            </div>

            <Link
              href="/test"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all hover:scale-105 hover:shadow-lg no-underline"
              style={{
                background: 'linear-gradient(135deg, #e1000f 0%, #e3b505 100%)',
                color: '#ffffff',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 15px rgba(225, 0, 15, 0.4)',
              }}
            >
              🎯 Placement testi
            </Link>
          </div>

          {/* Course groups with vibrant colors */}
          <div className="space-y-4 sm:space-y-6">
            {groups.map((group, groupIndex) => {
              const groupColors = [
                { from: '#000091', to: '#4169E1', accent: '#60A5FA' },
                { from: '#e1000f', to: '#FF6B6B', accent: '#FF8E8E' },
                { from: '#e3b505', to: '#FFD700', accent: '#FFE55C' },
                { from: '#4169E1', to: '#A855F7', accent: '#C084FC' },
              ];
              const colors = groupColors[groupIndex % groupColors.length];

              return (
                <details
                  key={group.course}
                  open={openGroups[group.course] ?? true}
                  onToggle={(e) => {
                    const nextOpen = (e.currentTarget as HTMLDetailsElement).open;
                    setOpenGroups((prev) => ({ ...prev, [group.course]: nextOpen }));
                  }}
                  className="rounded-2xl border-2 overflow-hidden transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, rgba(${hexToRgb(colors.from)}, 0.9) 0%, rgba(${hexToRgb(colors.to)}, 0.8) 100%)`,
                    borderColor: colors.accent,
                    boxShadow: `0 8px 32px rgba(${hexToRgb(colors.from)}, 0.3)`,
                  }}
                >
                  <summary
                    className="cursor-pointer list-none px-6 py-4 border-b-2 transition-all hover:bg-white/10"
                    style={{
                      borderColor: `rgba(255, 255, 255, 0.3)`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className="text-lg font-bold"
                        style={{
                          color: '#ffffff',
                          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        📚 {group.course}
                      </p>
                      <span className="text-2xl transition-transform duration-300 group-open:rotate-90">
                        ▶️
                      </span>
                    </div>
                  </summary>
                  <ul className="p-3 space-y-2 bg-black/20">
                    {group.units.map((unit, unitIndex) => {
                      const unitColor = unitIndex % 4;
                      const unitBorderColors = ['#60A5FA', '#FF6B6B', '#e3b505', '#A855F7'];

                      return (
                        <li key={unit.id}>
                          {unit.available ? (
                            <Link
                              href={`/lesson/${unit.id}`}
                              className="group flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl no-underline"
                              style={{
                                background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
                                border: `2px solid ${unitBorderColors[unitColor]}`,
                              }}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-lg"
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                                  >
                                    {unitIndex % 3 === 0 ? '🎯' : unitIndex % 3 === 1 ? '⭐' : '🚀'}
                                  </span>
                                  <p
                                    className="text-base font-bold"
                                    style={{
                                      color: '#ffffff',
                                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                                    }}
                                  >
                                    {unit.label}
                                  </p>
                                </div>
                                <p
                                  className="text-xs mt-1 font-medium"
                                  style={{ color: unitBorderColors[unitColor], marginLeft: '26px' }}
                                >
                                  📝 {unit.count} kart
                                </p>
                              </div>
                              <span
                                className="text-xl transition-transform group-hover:translate-x-1"
                                style={{ color: unit.completed ? '#84CC16' : '#ffffff' }}
                              >
                                {unit.completed ? '✅' : '→'}
                              </span>
                            </Link>
                          ) : (
                            <div
                              className="flex items-center justify-between px-5 py-4 rounded-xl opacity-60"
                              style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '2px dashed rgba(255, 255, 255, 0.2)',
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg grayscale">🔒</span>
                                <p className="text-base font-medium" style={{ color: '#9CA3AF' }}>
                                  {unit.label}
                                </p>
                              </div>
                              <span className="text-xs font-bold" style={{ color: '#e3b505' }}>
                                🔜 Yakında
                              </span>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              );
            })}
          </div>

          {/* Footer with fun message */}
          <div className="mt-8 text-center">
            <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              🎨 Fransızca öğrenmek hiç bu kadar eğlenceli olmamıştı!
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}
