// Content script entry point. Chrome injects this into every CourseLink page.
import { readStore } from "../shared/storage";
import { runSync } from "./sync";

const STALE_MS = 15 * 60 * 1000; // auto-sync at most every 15 minutes

let running: Promise<void> | null = null;
function sync(): Promise<void> {
  // If a sync is already running, reuse it instead of starting a second one.
  running ??= runSync().finally(() => (running = null));
  return running;
}

// The popup / calendar page send this when you press the sync button.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "COURSECAL_SYNC") {
    sync().then(() => sendResponse({ ok: true }));
    return true; // tells Chrome we'll reply asynchronously
  }
  return undefined;
});

// Auto-sync when you open CourseLink, if the data is old or the UI asked for it.
readStore().then((s) => {
  const stale = !s.sync.lastSyncedAt || Date.now() - s.sync.lastSyncedAt > STALE_MS;
  if (s.pendingSync || stale) void sync();
});
