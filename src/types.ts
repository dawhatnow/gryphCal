// The shapes every part of GryphCal agrees on.
// CourseLink's API returns messy, tool-specific objects; we convert them into
// these clean types once (in content/normalize.ts) and the UI only uses these.

export const COURSELINK_ORIGIN = "https://courselink.uoguelph.ca";

export interface Course {
  id: number;            // CourseLink's OrgUnit id
  code: string;          // "CIS*2500"
  name: string;          // full course name
  startDate: string | null;
  endDate: string | null;
  semester: string | null; // "2026 Fall"
}

export interface User {
  name: string;
  id: string;              // CourseLink username / id
}

export type DeadlineType = "assignment" | "quiz";

export interface Grade {
  points: number | null;   // 18
  outOf: number | null;    // 20
  display: string | null;  // what CourseLink shows, e.g. "90 %"
}

export interface Deadline {
  id: string;              // unique across courses and tools: "assignment-123-456"
  sourceId: number;        // the assignment (dropbox folder) or quiz id in CourseLink
  courseId: number;
  courseCode: string;
  type: DeadlineType;
  title: string;
  dueAt: string;           // ISO date string
  url: string;             // opens the item in CourseLink
  submitted: boolean | null;   // null = we couldn't tell
  submittedAt: string | null;
  grade: Grade | null;         // null = not graded or not released yet
}

export type SyncStatus = "idle" | "syncing" | "error" | "signed_out";

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: number | null;
  startedAt: number | null;
  message: string | null;
}

export type Filter = "all" | number; // "all" or a course id

// Everything saved in chrome.storage.local.
export interface Store {
  user: User | null;
  courses: Course[];
  deadlines: Deadline[];
  selectedCourseIds: number[] | null; // null = student hasn't picked courses yet
  filter: Filter;
  sync: SyncState;
  pendingSync: boolean; // UI asks the content script to sync on next load
}
