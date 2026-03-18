"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import OnboardingFlow from "@/components/OnboardingFlow";
import { hasOnboarded, mergeGuestProgress, getGuestProgress } from "@/lib/guestProgress";
import AppLayout from "@/components/AppLayout";
import type { CardItem } from "@/lib/types";

interface Unit {
  id: string;
  label: string;
  count: number;
  available: boolean;
  completed: boolean;
}

interface Props {
  groups: { course: string; units: Unit[] }[];
  userId: string | null;
  placementCards: CardItem[];
}

export default function HomeClient({ groups, userId, placementCards }: Props) {
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [mergeMessage, setMergeMessage] = useState<string | null>(null);
  const mergeAttempted = useRef(false);

  useEffect(() => {
    setOnboarded(hasOnboarded());
    setOpenGroups(
      groups.reduce<Record<string, boolean>>((acc, group) => {
        acc[group.course] = true;
        return acc;
      }, {})
    );
  }, [groups]);

  // Merge guest progress when a logged-in user has leftover guest data
  useEffect(() => {
    if (!userId || mergeAttempted.current) return;
    mergeAttempted.current = true;

    const guestItems = getGuestProgress();
    if (guestItems.length === 0) return;

    mergeGuestProgress(userId).then((count) => {
      if (count > 0) {
        setMergeMessage(`${count} kart ilerlemen hesabına aktarıldı.`);
        setTimeout(() => setMergeMessage(null), 4000);
      }
    });
  }, [userId]);

  // Wait for localStorage read
  if (onboarded === null) return null;

  // Show onboarding for new users
  if (!onboarded) {
    return <OnboardingFlow cards={placementCards} />;
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
          {/* Merge toast */}
          {mergeMessage && (
            <div
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: "linear-gradient(135deg, #000091 0%, #4169E1 100%)",
                color: "#ffffff",
                border: "1px solid rgba(227, 181, 5, 0.4)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
              }}
            >
              {mergeMessage}
            </div>
          )}

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

            <div className="flex items-center gap-2">
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

              {!userId && (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-bold transition-all hover:scale-105 no-underline"
                  style={{
                    background: 'rgba(65, 105, 225, 0.15)',
                    color: '#93C5FD',
                    border: '1px solid rgba(65, 105, 225, 0.3)',
                  }}
                >
                  📧 Giriş yap
                </Link>
              )}
            </div>
          </div>

          {/* Course groups */}
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
                    style={{ borderColor: `rgba(255, 255, 255, 0.3)` }}
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

          {/* Footer */}
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

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}
