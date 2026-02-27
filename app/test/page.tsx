import Link from "next/link";

export default function TestStartPage() {
  return (
    <main className="min-h-screen bg-[#09090B] text-[#F4F4F5]">
      <div className="mx-auto max-w-xl px-5 py-8 sm:py-12">
        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-[#9CA3AF]">
          Placement Lite
        </p>
        <h1 className="text-3xl font-semibold leading-tight">
          Seviyeni hizli bir testle belirle
        </h1>
        <p className="mt-4 text-base leading-7 text-[#D4D4D8]">
          En fazla 12 soru var. Test sonunda guclu ve zayif oldugun alanlari gorecek,
          sana uygun baslangic unitesi onerisi alacaksin.
        </p>

        <section className="mt-8 rounded-2xl border border-[#27272A] bg-[#18181B] p-5">
          <h2 className="text-lg font-medium">Soru tipleri</h2>
          <ul className="mt-4 space-y-3 text-sm text-[#D4D4D8]">
            <li className="rounded-xl border border-[#3F3F46] p-4">1) Kelimeyi gor, anlami sec</li>
            <li className="rounded-xl border border-[#3F3F46] p-4">2) Sesi dinle, anlami sec</li>
            <li className="rounded-xl border border-[#3F3F46] p-4">3) Karistirilabilir ciftlerde dogru kullanim</li>
          </ul>
        </section>

        <Link
          href="/test/run"
          className="mt-8 flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-[#F4F4F5] px-5 text-base font-semibold text-[#09090B]"
        >
          Teste basla
        </Link>
      </div>
    </main>
  );
}
