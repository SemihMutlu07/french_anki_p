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
  { href: "/phrases", label: "Cümleler", icon: "💬" },
  { href: "/progress", label: "İlerleme", icon: "🏆" },
  { href: "/class", label: "Sınıf", icon: "👥" },
  { href: "/settings", label: "Ayarlar", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 z-40"
      style={{
        background: "linear-gradient(180deg, #0B1220 0%, #000091 100%)",
        borderRight: "2px solid rgba(227, 181, 5, 0.2)",
        boxShadow: "4px 0 30px rgba(0, 0, 145, 0.3)",
      }}
    >
      {/* Logo area */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🇫🇷</span>
          <div>
            <p
              className="text-sm font-bold uppercase tracking-widest"
              style={{
                background: "linear-gradient(90deg, #ffffff, #e3b505)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              FR Tutor
            </p>
            <p className="text-xs" style={{ color: "#93C5FD" }}>
              Fransızca Öğren
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 no-underline"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(227, 181, 5, 0.15) 0%, rgba(227, 181, 5, 0.05) 100%)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(227, 181, 5, 0.4)"
                  : "1px solid transparent",
                boxShadow: isActive
                  ? "0 4px 15px rgba(227, 181, 5, 0.15)"
                  : "none",
              }}
            >
              <span
                className="text-xl"
                style={{
                  filter: isActive
                    ? "drop-shadow(0 0 8px rgba(227, 181, 5, 0.8))"
                    : "none",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.2s ease",
                }}
              >
                {item.icon}
              </span>
              <span
                className="text-sm font-medium"
                style={{
                  color: isActive ? "#e3b505" : "#A1A1AA",
                  textShadow: isActive ? "0 0 10px rgba(227, 181, 5, 0.5)" : "none",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div
          className="rounded-xl p-4"
          style={{
            background: "rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <p className="text-xs" style={{ color: "#71717A" }}>
            Her gün biraz öğren!
          </p>
        </div>
      </div>
    </aside>
  );
}
