// Turns raw CourseLink objects into our clean Course / Deadline types.
// These are pure functions (no fetching), which makes them easy to test
// with JSON you copy from the Network tab.
import { COURSELINK_ORIGIN, type Course, type Deadline, type User } from "../types";
import type { RawCourse, RawEntityDropbox, RawFolder, RawGradeObject, RawGradeValue, RawQuiz, RawWhoAmI } from "./api";

// "CIS*2500*0101: Intermediate Programming F26" -> "CIS*2500"
export function shortCode(name: string, code: string | null): string {
  const m = `${code ?? ""} ${name}`.match(/([A-Z]{2,5})\*(\d{4})/);
  return m ? `${m[1]}*${m[2]}` : name.slice(0, 14);
}

export function toCourse(c: RawCourse): Course {
  return {
    id: Number(c.OrgUnitId),
    code: shortCode(c.Name, c.Code),
    name: c.Name,
    startDate: c.StartDate ?? null,
    endDate: c.EndDate ?? null,
    semester: c.SemesterName ?? null,
  };
}

export function toUser(w: RawWhoAmI): User {
  return { name: `${w.FirstName} ${w.LastName}`.trim(), id: w.UniqueName || w.Identifier };
}

// The semester most of the student's courses are in, e.g. "2026 Fall".
export function currentSemester(courses: Course[]): string | null {
  const counts = new Map<string, number>();
  for (const c of courses) if (c.semester) counts.set(c.semester, (counts.get(c.semester) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

// Used to pre-tick courses in the picker: skip ones that clearly ended.
export function isLikelyCurrent(c: Course, now = Date.now()): boolean {
  const day = 864e5;
  if (c.endDate && Date.parse(c.endDate) < now - 14 * day) return false;
  if (c.startDate && Date.parse(c.startDate) > now + 60 * day) return false;
  if (c.startDate && !c.endDate && Date.parse(c.startDate) < now - 200 * day) return false;
  return true;
}

export function fromFolder(f: RawFolder, course: Course): Deadline | null {
  const due = f.DueDate ?? f.Availability?.EndDate ?? null;
  if (!due || f.IsHidden) return null;
  return {
    id: `assignment-${course.id}-${f.Id}`,
    sourceId: f.Id,
    courseId: course.id,
    courseCode: course.code,
    type: "assignment",
    title: f.Name.trim(),
    dueAt: due,
    url: `${COURSELINK_ORIGIN}/d2l/lms/dropbox/user/folder_submit_files.d2l?db=${f.Id}&ou=${course.id}`,
    submitted: null,
    submittedAt: null,
    grade: null,
  };
}

export function fromQuiz(q: RawQuiz, course: Course): Deadline | null {
  const due = q.DueDate ?? q.EndDate;
  if (!due || q.IsActive === false) return null;
  return {
    id: `quiz-${course.id}-${q.QuizId}`,
    sourceId: q.QuizId,
    courseId: course.id,
    courseCode: course.code,
    type: "quiz",
    title: q.Name.trim(),
    dueAt: due,
    url: `${COURSELINK_ORIGIN}/d2l/lms/quizzing/user/quiz_summary.d2l?qi=${q.QuizId}&ou=${course.id}`,
    submitted: null,
    submittedAt: null,
    grade: null,
  };
}

// entities === null means the request failed, so we leave "submitted" unknown.
export function withSubmissions(d: Deadline, entities: RawEntityDropbox[] | null): Deadline {
  if (!entities) return d;
  const dates = entities
    .flatMap((e) => e.Submissions ?? [])
    .map((s) => s.SubmissionDate)
    .filter((x): x is string => !!x)
    .sort();
  return { ...d, submitted: dates.length > 0, submittedAt: dates.at(-1) ?? null };
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

// Grades live in the gradebook, separate from assignments and quizzes.
// Each grade item may point back to the tool item it came from (AssociatedTool).
// We match on that first, then fall back to matching by name.
export function withGrades(items: Deadline[], objects: RawGradeObject[], values: RawGradeValue[]): Deadline[] {
  const valueById = new Map(values.map((v) => [String(v.GradeObjectIdentifier), v]));
  return items.map((d) => {
    const linked = objects.filter((g) => g.AssociatedTool?.ToolItemId === d.sourceId);
    const match =
      linked.find((g) => norm(g.Name) === norm(d.title)) ??
      (linked.length === 1 ? linked[0] : undefined) ??
      objects.find((g) => norm(g.Name) === norm(d.title));
    const v = match && valueById.get(String(match.Id));
    if (!match || !v || (v.PointsNumerator == null && !v.DisplayedGrade)) return d;
    return {
      ...d,
      // A graded quiz was obviously attempted.
      submitted: d.submitted ?? true,
      grade: { points: v.PointsNumerator, outOf: v.PointsDenominator ?? match.MaxPoints ?? null, display: v.DisplayedGrade },
    };
  });
}
