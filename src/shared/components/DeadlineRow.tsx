import type { CSSProperties } from "react";
import type { Deadline } from "../../types";
import { countdown, fmtTime } from "../dates";

interface Props {
  d: Deadline;
  color: string;
  onOpen: (d: Deadline) => void;
}

export function gradeText(d: Deadline): string | null {
  if (!d.grade) return null;
  const { points, outOf, display } = d.grade;
  if (points != null && outOf) return `${Math.round((points / outOf) * 100)}%`;
  return display;
}

export function DeadlineRow({ d, color, onOpen }: Props) {
  const cd = countdown(d);
  const grade = gradeText(d);
  return (
    <button className={`row tone-${cd.tone}`} style={{ "--course": color } as CSSProperties} onClick={() => onOpen(d)}>
      <span className="row-count">{cd.tone === "done" ? "✓" : cd.label}</span>
      <span className="row-body">
        <span className="row-title">{d.title}</span>
        <span className="row-meta">
          <b>{d.courseCode}</b> {d.type === "quiz" ? "Quiz" : "Assignment"}, {fmtTime(d.dueAt)}
        </span>
      </span>
      {grade && <span className="grade-badge">{grade}</span>}
    </button>
  );
}
