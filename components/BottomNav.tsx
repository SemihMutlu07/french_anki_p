"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Öğren", icon: "📖" },
  { href: "/practice", label: "Pratik", icon: "🎧" },
  { href: "/progress", label: "İlerleme", icon: "🏆" },
  { href: "/class", label: "Sınıf", icon: "👥" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isPhrasesActive = pathname.startsWith("/phrases");

  return (
    <>
      {/* Floating Action Button — Cümleler */}
      <Link
        href="/phrases"
        className="fixed z-50 md:hidden flex items-center justify-center rounded-full no-underline"
        style={{
          bottom: "calc(68px + env(safe-area-inset-bottom))",
          right: "16px",
          width: 52,
          height: 52,
          background: isPhrasesActive
            ? "linear-gradient(135deg, #e3b505, #FFD700)"
            : "linear-gradient(135deg, #000091, #4169E1)",
          border: isPhrasesActive
            ? "2px solid rgba(227, 181, 5, 0.6)"
            : "2px solid rgba(65, 105, 225, 0.5)",
          boxShadow: isPhrasesActive
            ? "0 4px 20px rgba(227, 181, 5, 0.4)"
            : "0 4px 20px rgba(0, 0, 145, 0.5)",
        }}
        aria-label="Cümleler"
      >
        <span className="text-xl">💬</span>
      </Link>

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          background: "linear-gradient(180deg, #000091 0%, #0B1220 100%)",
          borderTop: "1px solid rgba(227, 181, 5, 0.3)",
          boxShadow: "0 -4px 20px rgba(0, 0, 145, 0.4)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center justify-around py-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-[48px] min-w-[48px] flex-col items-center justify-center px-3 py-2 no-underline transition-all duration-200"
                style={{
                  flex: 1,
                  maxWidth: "80px",
                }}
              >
                <span
                  className="text-xl mb-0.5"
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 0 8px rgba(227, 181, 5, 0.8))"
                      : "none",
                    transform: isActive ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[10px] font-medium tracking-wide"
                  style={{
                    color: isActive ? "#e3b505" : "#71717A",
                    textShadow: isActive ? "0 0 10px rgba(227, 181, 5, 0.5)" : "none",
                  }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div
                    className="mt-1 h-0.5 w-6 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #e3b505 0%, #FFD700 100%)",
                      boxShadow: "0 0 8px rgba(227, 181, 5, 0.6)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
