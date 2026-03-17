export interface CourseGroup {
  course: string;
  units: number[];
}

export const COURSE_GROUPS: CourseGroup[] = [
  { course: "101", units: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
];
