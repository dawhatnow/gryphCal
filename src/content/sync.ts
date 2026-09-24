// The whole fetch process: courses -> assignments + quizzes -> submissions -> grades.
import type { Course, Deadline } from "../types";
import { readStore, writeStore } from "../shared/storage";
import {
  HttpError, SignedOutError, getCourses, getFolders, getGradeObjects, getMyGradeValues,
  getMySubmissions, getQuizzes, getVersions, getWhoAmI,
} from "./api";
import { fromFolder, fromQuiz, toCourse, toUser, withGrades, withSubmissions } from "./normalize";

const DAY = 864e5;
const PAST_DAYS = 150;    // keep the whole term so graded items show on the calendar
const FUTURE_DAYS = 200;
const CONCURRENCY = 4;    // how many requests at once, polite to CourseLink

// Run fn over list, at most `limit` at a time.
async function mapLimit<T, R>(list: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(list.length);
  let next = 0;
  const worker = async () => {
    while (next < list.length) {
      const i = next++;
      out[i] = await fn(list[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, list.length) }, worker));
  return out;
}

// One course's tool being turned off shouldn't break everything, so errors
// become null. Being signed out is the exception: that should stop the sync.
// 403/404 just mean "this course doesn't use that tool", which is normal.
// Any other error calls onError so the caller can report it.
async function safe<T>(p: Promise<T>, onError?: () => void): Promise<T | null> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof SignedOutError) throw e;
    if (!(e instanceof HttpError && (e.status === 403 || e.status === 404))) onError?.();
    return null;
  }
}

// "failed" = we couldn't load assignments or quizzes, so this course's
// list may be incomplete. (Missing grades alone just means no grades shown.)
async function syncCourse(course: Course, le: string): Promise<{ items: Deadline[]; failed: boolean }> {
  let failed = false;
  const markFailed = () => { failed = true; };
  const [folders, quizzes, gradeObjects, gradeValues] = await Promise.all([
    safe(getFolders(le, course.id), markFailed),
    safe(getQuizzes(le, course.id), markFailed),
    safe(getGradeObjects(le, course.id)),
    safe(getMyGradeValues(le, course.id)),
  ]);

  const now = Date.now();
  const inWindow = (d: Deadline) => {
    const t = Date.parse(d.dueAt);
    return t >= now - PAST_DAYS * DAY && t <= now + FUTURE_DAYS * DAY;
  };

  const items = [
    ...(folders ?? []).map((f) => fromFolder(f, course)),
    ...(quizzes ?? []).map((q) => fromQuiz(q, course)),
  ].filter((d): d is Deadline => d !== null && inWindow(d));

  const withSubs = await mapLimit(items, CONCURRENCY, async (d) =>
    d.type === "assignment" ? withSubmissions(d, await safe(getMySubmissions(le, course.id, d.sourceId))) : d,
  );

  return { items: withGrades(withSubs, gradeObjects ?? [], gradeValues ?? []), failed };
}

export async function runSync(): Promise<void> {
  const before = await readStore();
  await writeStore({ pendingSync: false, sync: { ...before.sync, status: "syncing", startedAt: Date.now(), message: null } });

  try {
    const { lp, le } = await getVersions();

    // Who's signed in (for the welcome card). Not essential, so failures are ignored.
    const who = await safe(getWhoAmI(lp));
    if (who) await writeStore({ user: toUser(who) });

    const courses = (await getCourses())
      .filter((c) => c.IsActive !== false && c.CanAccessCourse !== false)
      .map(toCourse)
      .sort((a, b) => a.code.localeCompare(b.code));
    await writeStore({ courses });

    // Re-read: the student may have changed their course picks mid-sync.
    const { selectedCourseIds, deadlines: oldDeadlines } = await readStore();
    let deadlines = oldDeadlines;
    const failedCodes: string[] = [];
    if (selectedCourseIds) {
      const picked = courses.filter((c) => selectedCourseIds.includes(c.id));
      const results = await mapLimit(picked, CONCURRENCY, (c) => syncCourse(c, le));
      results.forEach((r, i) => r.failed && failedCodes.push(picked[i].code));
      deadlines = results.flatMap((r) => r.items).sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
    }

    // Save what we got either way; if some courses failed, say which.
    await writeStore({
      deadlines,
      sync: failedCodes.length
        ? { status: "error", lastSyncedAt: before.sync.lastSyncedAt, startedAt: null, message: `couldn't load ${failedCodes.join(", ")}` }
        : { status: "idle", lastSyncedAt: Date.now(), startedAt: null, message: null },
    });
  } catch (e) {
    const signedOut = e instanceof SignedOutError;
    await writeStore({
      sync: {
        status: signedOut ? "signed_out" : "error",
        lastSyncedAt: before.sync.lastSyncedAt,
        startedAt: null,
        message: signedOut ? null : String((e as Error).message ?? e),
      },
    });
  }
}
