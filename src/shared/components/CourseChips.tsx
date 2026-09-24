import type { CSSProperties } from "react";
import type { Course, Filter } from "../../types";

interface Props {
  courses: Course[];
  colors: Record<number, string>;
  filter: Filter;
  onChange: (f: Filter) => void;
}

// "All" shows everything; tapping a course shows only that course.
// The chips also act as the colour legend.
export function CourseChips({ courses, colors, filter, onChange }: Props) {
  return (
    <div className="chips" role="toolbar" aria-label="Filter by course">
      <button className={`chip ${filter === "all" ? "on" : ""}`} aria-pressed={filter === "all"} onClick={() => onChange("all")}>
        All
      </button>
      {courses.map((c) => (
        <button
          key={c.id}
          className={`chip ${filter === c.id ? "on" : ""}`}
          aria-pressed={filter === c.id}
          title={c.name}
          style={{ "--course": colors[c.id] } as CSSProperties}
          onClick={() => onChange(filter === c.id ? "all" : c.id)}
        >
          <span className="swatch" />
          {c.code}
        </button>
      ))}
    </div>
  );
}
