import { COURSE_GROUPS } from "@/curriculum/courseGroups";
import { createServerSupabase } from "@/lib/supabase-server";
import { getCourseUnitCount, getAllCards } from "@/lib/curriculum";
import HomeClient from "@/components/HomeClient";
import type { CardItem } from "@/lib/types";

export default async function Home() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allCourses = Array.from(new Set(COURSE_GROUPS.map((g) => g.course)));
  const allUnits = Array.from(new Set(COURSE_GROUPS.flatMap((g) => g.units)));
  const completedByUnit = new Map<string, number>();

  if (user) {
    const { data } = await supabase
      .from("progress")
      .select("course, unit, known")
      .eq("user_id", user.id)
      .in("course", allCourses)
      .in("unit", allUnits)
      .eq("known", true);

    for (const row of data ?? []) {
      const key = `${row.course}:${row.unit}`;
      completedByUnit.set(key, (completedByUnit.get(key) ?? 0) + 1);
    }
  }

  const groups = await Promise.all(
    COURSE_GROUPS.map(async (group) => ({
      course: group.course,
      units: await Promise.all(
        group.units.map(async (unit) => {
          const count = await getCourseUnitCount(group.course, unit);
          const completedCount = completedByUnit.get(`${group.course}:${unit}`) ?? 0;
          return {
            id: `${group.course}-unit${unit}`,
            label: `Ünite ${unit}`,
            count,
            available: count > 0,
            completed: count > 0 && completedCount >= count,
          };
        })
      ),
    }))
  );

  // Load cards for onboarding placement test (needed for new users)
  let placementCards: CardItem[] = [];
  if (!user) {
    placementCards = await getAllCards("101");
  }

  return (
    <HomeClient
      groups={groups}
      userId={user?.id ?? null}
      placementCards={placementCards}
    />
  );
}
