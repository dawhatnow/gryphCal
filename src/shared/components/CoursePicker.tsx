import { useState } from "react";
import type { Course } from "../../types";
import { isLikelyCurrent } from "../../content/normalize";

interface Props {
  courses: Course[];
  selected: number[] | null; // null on first run: pre-tick likely current courses
  onSave: (ids: number[]) => void;
  onCancel?: () => void;
}

export function CoursePicker({ courses, selected, onSave, onCancel }: Props) {
  const [picked, setPicked] = useState<Set<number>>(
    () => new Set(selected ?? courses.filter((c) => isLikelyCurrent(c)).map((c) => c.id)),
  );
  const toggle = (id: number) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  return (
    <div className="picker">
      <h2>Pick your courses</h2>
      <p className="muted">GryphCal will show assignments and quizzes from these.</p>
      <ul>
        {courses.map((c) => (
          <li key={c.id}>
            <label>
              <input type="checkbox" checked={picked.has(c.id)} onChange={() => toggle(c.id)} />
              <span><b>{c.code}</b> <span className="muted">{c.name}</span></span>
            </label>
          </li>
        ))}
      </ul>
      <div className="picker-actions">
        {onCancel && <button className="ghost-btn" onClick={onCancel}>Cancel</button>}
        <button className="primary-btn" disabled={picked.size === 0} onClick={() => onSave([...picked])}>
          Show my calendar
        </button>
      </div>
    </div>
  );
}
