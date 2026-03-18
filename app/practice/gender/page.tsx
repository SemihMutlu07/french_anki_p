import { createServerSupabase } from "@/lib/supabase-server";
import { getGenderedCards } from "@/lib/curriculum";
import GenderQuizClient from "@/components/GenderQuizClient";
import Link from "next/link";

export default async function GenderPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cards = await getGenderedCards("101");

  if (cards.length < 4) {
    return (
      <main className="min-h-dvh bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">
            Yeterli kart bulunamadı
          </p>
          <Link href="/practice" className="text-sm text-[var(--text-secondary)] no-underline">
            ← Pratik sayfasına dön
          </Link>
        </div>
      </main>
    );
  }

  return <GenderQuizClient cards={cards} userId={user?.id ?? ""} />;
}
