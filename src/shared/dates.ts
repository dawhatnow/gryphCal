// Calendar math. date-fns does the heavy lifting.
import {
  addDays, differenceInMinutes, eachDayOfInterval, endOfMonth, endOfWeek,
  format, startOfMonth, startOfWeek,
} from "date-fns";
import type { Deadline } from "../types";

const WEEK = { weekStartsOn: 1 as const }; // Monday, like the school week

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Every day shown on a month grid, including the grey days from the
// previous/next month that fill out the first and last rows.
export function monthDays(month: Date): Date[] {
  return eachDayOfInterval({ start: startOfWeek(startOfMonth(month), WEEK), end: endOfWeek(endOfMonth(month), WEEK) });
}

export function weekDays(day: Date): Date[] {
  const start = startOfWeek(day, WEEK);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export const dayKey = (d: Date) => format(d, "yyyy-MM-dd");

// { "2026-09-22": [deadline, deadline], ... } for quick lookups per cell.
export function groupByDay(deadlines: Deadline[]): Map<string, Deadline[]> {
  const map = new Map<string, Deadline[]>();
  for (const d of deadlines) {
    const key = dayKey(new Date(d.dueAt));
    map.set(key, [...(map.get(key) ?? []), d]);
  }
  return map;
}

export type Tone = "late" | "urgent" | "soon" | "calm" | "done";

// "5h" / "2d" / "Late", plus how worried to be.
export function countdown(d: Deadline, now = new Date()): { label: string; tone: Tone } {
  if (d.submitted) return { label: "Done", tone: "done" };
  const mins = differenceInMinutes(new Date(d.dueAt), now);
  if (mins < 0) return { label: "Late", tone: "late" };
  if (mins < 60) return { label: `${Math.max(1, mins)}m`, tone: "urgent" };
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return { label: `${hrs}h`, tone: "urgent" };
  if (hrs < 72) return { label: `${Math.round(hrs / 24)}d`, tone: "soon" };
  return { label: `${Math.round(hrs / 24)}d`, tone: "calm" };
}

export const fmtTime = (iso: string) => format(new Date(iso), "h:mm a");
export const fmtDateTime = (iso: string) => format(new Date(iso), "EEE MMM d, h:mm a");

export function syncedLabel(ts: number | null): string {
  if (!ts) return "Not synced yet";
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "Synced just now";
  if (m < 60) return `Synced ${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `Synced ${h} hr ago` : `Synced ${Math.round(h / 24)} days ago`;
}
