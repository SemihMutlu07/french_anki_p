import { createServerSupabase } from "@/lib/supabase-server";
import { getSentenceCards } from "@/lib/curriculum";
import SentencePracticeClient from "@/components/SentencePracticeClient";
import Link from "next/link";

export default async function SentencesPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cards = await getSentenceCards("101");

  if (cards.length === 0) {
    return (
      <main className="min-h-dvh bg-[#09090B] text-[#E4E4E7] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">Cümle kartı bulunamadı</p>
          <Link href="/practice" className="text-sm text-[#A1A1AA] no-underline">
            ← Pratik sayfasına dön
          </Link>
        </div>
      </main>
    );
  }

  return <SentencePracticeClient cards={cards} userId={user?.id ?? ""} />;
}
