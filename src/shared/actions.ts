// Things the UI asks for that involve other tabs.
import { COURSELINK_ORIGIN } from "../types";
import { writeStore } from "./storage";

export async function openCourseLink(active = true) {
  await writeStore({ pendingSync: true });
  await chrome.tabs.create({ url: `${COURSELINK_ORIGIN}/d2l/home`, active });
}

// Ask an open CourseLink tab to sync. If none is open, open one in the
// background; the content script there will see pendingSync and sync itself.
export async function requestSync() {
  const tabs = await chrome.tabs.query({ url: `${COURSELINK_ORIGIN}/*` });
  const tab = tabs.find((t) => t.id !== undefined);
  if (!tab?.id) return openCourseLink(false);
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "COURSECAL_SYNC" });
  } catch {
    // Tab was open before the extension was installed, so it has no content script.
    await writeStore({ pendingSync: true });
    await chrome.tabs.reload(tab.id);
  }
}

export function openFullCalendar() {
  void chrome.tabs.create({ url: chrome.runtime.getURL("calendar.html") });
}
