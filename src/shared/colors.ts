import type { Course } from "../types";

// Course colours stay away from UofG red, which we save for "urgent".
const PALETTE = ["#2F6FD6", "#1F9D6B", "#D98E04", "#8A4FD1", "#1A9BB0", "#E2622B", "#C2408A", "#5B6470"];

export function courseColors(courses: Course[]): Record<number, string> {
  const sorted = [...courses].sort((a, b) => a.code.localeCompare(b.code));
  return Object.fromEntries(sorted.map((c, i) => [c.id, PALETTE[i % PALETTE.length]]));
}
