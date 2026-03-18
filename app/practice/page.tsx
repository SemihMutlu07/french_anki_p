import Link from "next/link";
import AppLayout from "@/components/AppLayout";

const PRACTICE_ITEMS = [
  {
    href: "/practice/listening",
    label: "Dinleme",
    description: "Ses dinle, doğru kelimeyi seç",
    icon: "🎧",
    available: true,
  },
  {
    href: "/practice/gender",
    label: "Cinsiyet Quiz",
    description: "le mi, la mı? Test et!",
    icon: "🏷️",
    available: true,
  },
  {
    href: "/practice/sentences",
    label: "Cümle Pratiği",
    description: "Soru-cevap, çeviri, boşluk doldur",
    icon: "✍️",
    available: true,
  },
];

export default function PracticePage() {
  return (
    <AppLayout>
      <div className="min-h-dvh bg-[var(--bg-base)]">
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-10 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎯</span>
              <h1
                className="text-2xl font-bold"
                style={{
                  background: "linear-gradient(90deg, var(--fr-red) 0%, var(--fr-gold) 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Pratik
              </h1>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Farklı egzersizlerle Fransızcanı pekiştir
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {PRACTICE_ITEMS.map((item) =>
              item.available ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col items-center justify-center rounded-2xl p-6 sm:p-8 no-underline transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0, 0, 145, 0.3) 0%, rgba(11, 18, 32, 0.5) 100%)",
                    border: "2px solid rgba(65, 105, 225, 0.3)",
                    boxShadow: "0 4px 20px rgba(0, 0, 145, 0.2)",
                  }}
                >
                  <span className="text-4xl mb-3">{item.icon}</span>
                  <p className="text-base font-bold text-[var(--text-primary)] text-center">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-center" style={{ color: "var(--text-muted)" }}>
                    {item.description}
                  </p>
                </Link>
              ) : (
                <div
                  key={item.href}
                  className="flex flex-col items-center justify-center rounded-2xl p-6 sm:p-8 opacity-50"
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "2px dashed rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <span className="text-4xl mb-3 grayscale">{item.icon}</span>
                  <p className="text-base font-medium text-[var(--text-muted)] text-center">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-center" style={{ color: "var(--text-faint)" }}>
                    Yakında
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
