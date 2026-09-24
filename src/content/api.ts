// Everything that talks to CourseLink's (Brightspace's) API lives here.
// Runs inside a CourseLink tab, so the student's login cookie is sent
// automatically with every request. No passwords, no OAuth.
import { COURSELINK_ORIGIN } from "../types";

export class SignedOutError extends Error {}
export class HttpError extends Error {
  constructor(public status: number, url: string) {
    super(`${status} from ${url}`);
  }
}

async function getJSON<T>(pathOrUrl: string): Promise<T> {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : COURSELINK_ORIGIN + pathOrUrl;
  // Paging links come from the response; never follow one off CourseLink.
  if (new URL(url).origin !== COURSELINK_ORIGIN) throw new Error(`Refusing to fetch ${url}`);
  const res = await fetch(url, { credentials: "include", headers: { Accept: "application/json" } });
  if (res.status === 401) throw new SignedOutError();
  if (!res.ok) throw new HttpError(res.status, url);
  // A login page instead of JSON means the session expired.
  if (!(res.headers.get("content-type") ?? "").includes("json")) throw new SignedOutError();
  return (await res.json()) as T;
}

// ---- Raw shapes (only the fields we use). Check these against the Network tab! ----

interface RawVersion { ProductCode: string; LatestVersion: string }

// From /d2l/le/manageCourses/api/mycourses (checked against a real response).
// Note OrgUnitId arrives as a string, not a number.
export interface RawCourse {
  OrgUnitId: string;
  Name: string;
  Code: string | null;
  IsActive?: boolean;
  CanAccessCourse?: boolean;
  StartDate: string | null;
  EndDate: string | null;
  SemesterName?: string | null;
}
// From /d2l/api/lp/{v}/users/whoami (shape from the Brightspace docs; verify with a real response).
export interface RawWhoAmI { Identifier: string; FirstName: string; LastName: string; UniqueName: string | null }
interface RawCoursePage { Courses: RawCourse[]; Bookmark: string | null }
interface ObjectListPage<T> { Objects: T[]; Next: string | null }

export interface RawFolder {
  Id: number;
  Name: string;
  DueDate: string | null;
  IsHidden?: boolean;
  GradeItemId?: number | null; // links to the gradebook entry (not used yet)
  Availability?: { StartDate: string | null; EndDate: string | null } | null;
}
export interface RawQuiz {
  QuizId: number;
  Name: string;
  DueDate: string | null;
  EndDate: string | null;
  IsActive?: boolean;
  GradeItemId?: number | null; // links to the gradebook entry (not used yet)
}
export interface RawEntityDropbox { Submissions?: { Id: number; SubmissionDate: string | null }[] }
export interface RawGradeObject { Id: number; Name: string; MaxPoints?: number | null; AssociatedTool?: { ToolId: number; ToolItemId: number } | null }
export interface RawGradeValue {
  GradeObjectIdentifier: string | number;
  PointsNumerator: number | null;
  PointsDenominator: number | null;
  DisplayedGrade: string | null;
}

// ---- Requests ----

// Brightspace versions its API per product ("lp" = platform, "le" = learning tools).
export async function getVersions(): Promise<{ lp: string; le: string }> {
  const list = await getJSON<RawVersion[]>("/d2l/api/versions/");
  const find = (code: string) => list.find((v) => v.ProductCode === code)?.LatestVersion;
  const lp = find("lp");
  const le = find("le");
  if (!lp || !le) throw new Error("CourseLink didn't report its API versions");
  return { lp, le };
}

export const getWhoAmI = (lp: string) => getJSON<RawWhoAmI>(`/d2l/api/lp/${lp}/users/whoami`);

// Courses come back in pages; follow the bookmark until there are no more.
// (Untested guess: that the next page is requested with &bookmark=...)
export async function getCourses(): Promise<RawCourse[]> {
  const all: RawCourse[] = [];
  let bookmark = "";
  do {
    const q = `?pageSize=20&sort=current&orgUnitTypeId=3&embedDepth=0${bookmark ? `&bookmark=${encodeURIComponent(bookmark)}` : ""}`;
    const page = await getJSON<RawCoursePage>(`/d2l/le/manageCourses/api/mycourses${q}`);
    all.push(...page.Courses);
    bookmark = page.Courses.length > 0 ? (page.Bookmark ?? "") : "";
  } while (bookmark);
  return all;
}

// Some endpoints return a plain array, others a { Objects, Next } page.
async function getAllPages<T>(path: string): Promise<T[]> {
  const out: T[] = [];
  let next: string | null = path;
  while (next) {
    const data: T[] | ObjectListPage<T> = await getJSON(next);
    if (Array.isArray(data)) return data;
    out.push(...data.Objects);
    next = data.Next;
  }
  return out;
}

export const getFolders = (le: string, ou: number) =>
  getJSON<RawFolder[]>(`/d2l/api/le/${le}/${ou}/dropbox/folders/`);

export const getMySubmissions = (le: string, ou: number, folderId: number) =>
  getJSON<RawEntityDropbox[]>(`/d2l/api/le/${le}/${ou}/dropbox/folders/${folderId}/submissions/mysubmissions/`);

export const getQuizzes = (le: string, ou: number) =>
  getAllPages<RawQuiz>(`/d2l/api/le/${le}/${ou}/quizzes/`);

export const getGradeObjects = (le: string, ou: number) =>
  getJSON<RawGradeObject[]>(`/d2l/api/le/${le}/${ou}/grades/`);

export const getMyGradeValues = (le: string, ou: number) =>
  getJSON<RawGradeValue[]>(`/d2l/api/le/${le}/${ou}/grades/values/myGradeValues/`);
