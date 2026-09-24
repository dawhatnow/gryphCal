// Thin wrapper around chrome.storage.local so the rest of the code
// always gets a complete, typed Store back.
import type { Store, SyncState } from "../types";

export const DEFAULT_STORE: Store = {
  user: null,
  courses: [],
  deadlines: [],
  selectedCourseIds: null,
  filter: "all",
  sync: { status: "idle", lastSyncedAt: null, startedAt: null, message: null },
  pendingSync: false,
};

export async function readStore(): Promise<Store> {
  const raw = (await chrome.storage.local.get(null)) as Partial<Store>;
  return { ...DEFAULT_STORE, ...raw, sync: { ...DEFAULT_STORE.sync, ...(raw.sync ?? {}) } };
}

export function writeStore(patch: Partial<Store>): Promise<void> {
  return chrome.storage.local.set(patch);
}

// If a sync "started" but the CourseLink tab was closed mid-way, it never
// finishes. Treat anything older than 2 minutes as dead.
export function effectiveStatus(sync: SyncState): SyncState["status"] {
  if (sync.status === "syncing" && Date.now() - (sync.startedAt ?? 0) > 120_000) return "idle";
  return sync.status;
}
