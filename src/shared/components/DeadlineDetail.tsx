import type { CSSProperties } from "react";
import type { Deadline } from "../../types";
import { fmtDateTime } from "../dates";
import { gradeText } from "./DeadlineRow";

interface Props {
  d: Deadline;
  color: string;
  courseName: string;
  onClose: () => void;
}

// Everything about one deadline: when it's due, when you submitted, your grade.
export function DeadlineDetail({ d, color, courseName, onClose }: Props) {
  const late = d.submittedAt && Date.parse(d.submittedAt) > Date.parse(d.dueAt);
  const grade = gradeText(d);

  let submittedText = "Not submitted";
  if (d.submitted === null) submittedText = "Unknown";
  else if (d.submitted && d.submittedAt) submittedText = `${fmtDateTime(d.submittedAt)}${late ? " (late)" : ""}`;
  else if (d.submitted) submittedText = "Yes";

  return (
    <section className="detail" style={{ "--course": color } as CSSProperties} aria-label="Deadline details">
      <div className="detail-top">
        <div>
          <div className="detail-course">{d.courseCode} {d.type === "quiz" ? "Quiz" : "Assignment"}</div>
          <h3>{d.title}</h3>
        </div>
        <button className="icon-btn plain" onClick={onClose} aria-label="Close details">✕</button>
      </div>
      <dl>
        <dt>Due</dt><dd>{fmtDateTime(d.dueAt)}</dd>
        <dt>Submitted</dt><dd className={d.submitted ? "ok" : ""}>{submittedText}</dd>
        <dt>Grade</dt>
        <dd>
          {d.grade
            ? <>{d.grade.points != null && d.grade.outOf ? `${d.grade.points} / ${d.grade.outOf} ` : ""}<b>{grade}</b></>
            : "Not graded yet"}
        </dd>
      </dl>
      <p className="detail-course-name">{courseName}</p>
      <a className="primary-link" href={d.url} target="_blank" rel="noopener">Open in CourseLink</a>
    </section>
  );
}
