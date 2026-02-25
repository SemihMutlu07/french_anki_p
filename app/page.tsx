import { COURSE_GROUPS } from "@/curriculum/courseGroups";
import { getCourseUnitCount } from "@/lib/curriculum";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  const groups = await Promise.all(
    COURSE_GROUPS.map(async (group) => ({
      course: group.course,
      units: await Promise.all(
        group.units.map(async (unit) => {
          const count = await getCourseUnitCount(group.course, unit);
          return {
            id: `${group.course}-unit${unit}`,
            label: `Ünite ${unit}`,
            count,
            available: count > 0,
          };
        })
      ),
    }))
  );

  return <HomeClient groups={groups} />;
}
