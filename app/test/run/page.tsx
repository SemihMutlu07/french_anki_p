import { COURSE_GROUPS } from "@/curriculum/courseGroups";
import { getUnitItems } from "@/lib/curriculum";
import TestRunClient from "@/components/test/TestRunClient";
import type { CardItem } from "@/lib/types";

async function loadPlacementCards(): Promise<CardItem[]> {
  const cards: CardItem[] = [];

  for (const group of COURSE_GROUPS) {
    for (const unit of group.units) {
      const unitId = `${group.course}-unit${unit}`;
      const items = await getUnitItems(unitId);
      if (items && items.length > 0) cards.push(...items);
    }
  }

  return cards;
}

export default async function TestRunPage() {
  const cards = await loadPlacementCards();

  return <TestRunClient cards={cards} />;
}
