import { getPhrases } from "@/lib/curriculum";
import PhrasesClient from "@/components/PhrasesClient";

export default async function PhrasesPage() {
  const phrases = await getPhrases();
  return <PhrasesClient phrases={phrases} />;
}
