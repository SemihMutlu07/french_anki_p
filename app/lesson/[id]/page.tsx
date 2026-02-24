import Link from "next/link";
import { getUnitItems } from "@/lib/curriculum";
import { createServerSupabase } from "@/lib/supabase-server";
import LessonClient from "@/components/LessonClient";

interface Props {
  params: { id: string };
}

export default async function LessonPage({ params }: Props) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const items = await getUnitItems(params.id);

  if (!items || items.length === 0) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#09090B",
          color: "#E4E4E7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{ fontSize: 20, fontWeight: 600, margin: 0, marginBottom: 16 }}
          >
            Ünite bulunamadı
          </p>
          <Link
            href="/"
            style={{ color: "#A1A1AA", textDecoration: "none", fontSize: 14 }}
          >
            ← Ana sayfa
          </Link>
        </div>
      </main>
    );
  }

  return (
    <LessonClient unitId={params.id} items={items} userId={user?.id ?? ""} />
  );
}
