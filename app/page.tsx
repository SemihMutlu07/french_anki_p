import { getUnitCount } from "@/lib/curriculum";
import HomeClient from "@/components/HomeClient";

const UNIT_IDS = Array.from({ length: 10 }, (_, i) => `unit${i + 1}`);

export default async function Home() {
  const units = await Promise.all(
    UNIT_IDS.map(async (id, i) => ({
      id,
      label: `Ünite ${i + 1}`,
      count: await getUnitCount(id),
    }))
  );

  return <HomeClient units={units} />;
}
