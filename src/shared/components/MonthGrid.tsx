import { useState, type CSSProperties } from "react";
import { addMonths, format, isSameDay, isSameMonth, isToday } from "date-fns";
import type { Deadline } from "../../types";
import { WEEKDAYS, dayKey, monthDays } from "../dates";

interface Props {
  month: Date;
  selected: Date;
  byDay: Map<string, Deadline[]>;
  colors: Record<number, string>;
  variant: "mini" | "full";        // mini = dots (popup), full = titles (calendar page)
  onSelectDay: (d: Date) => void;
  onMonthChange: (m: Date) => void;
  onOpen?: (d: Deadline) => void;  // full variant: click an item
}

export function MonthGrid({ month, selected, byDay, colors, variant, onSelectDay, onMonthChange, onOpen }: Props) {
  const days = monthDays(month);
  // Which way we last navigated, so the grid can slide in from that side.
  const [dir, setDir] = useState<"next" | "prev" | null>(null);
  const go = (delta: number) => {
    setDir(delta > 0 ? "next" : "prev");
    onMonthChange(addMonths(month, delta));
  };
  return (
    <div className={`month month-${variant}`}>
      <div className="month-nav">
        <button className="nav-btn" onClick={() => go(-1)} aria-label="Previous month">‹</button>
        <h2>{format(month, "MMMM yyyy")}</h2>
        <button className="nav-btn" onClick={() => go(1)} aria-label="Next month">›</button>
      </div>
      <div key={format(month, "yyyy-MM")} className={`grid ${dir ? `slide-${dir}` : ""}`} role="grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="weekday">{variant === "mini" ? w[0] : w}</div>
        ))}
        {days.map((day) => {
          const items = byDay.get(dayKey(day)) ?? [];
          const open = items.filter((i) => !i.submitted);
          const cls = [
            "cell",
            isSameMonth(day, month) ? "" : "outside",
            isToday(day) ? "today" : "",
            isSameDay(day, selected) ? "selected" : "",
            open.length >= 3 ? "busy" : "",
          ].join(" ");
          return (
            <div key={dayKey(day)} className={cls} role="gridcell">
              <button
                className="day-btn"
                onClick={() => onSelectDay(day)}
                aria-label={`${format(day, "EEEE MMMM d")}, ${items.length} due`}
              >
                <span className="day-num">{format(day, "d")}</span>
              </button>
              {variant === "mini" ? (
                <div className="dots" aria-hidden="true">
                  {items.slice(0, 4).map((i) => (
                    <span key={i.id} className={`dot ${i.submitted ? "done" : ""}`} style={{ background: colors[i.courseId] }} />
                  ))}
                </div>
              ) : (
                <div className="pills">
                  {items.slice(0, 3).map((i) => (
                    <button
                      key={i.id}
                      className={`pill ${i.submitted ? "done" : ""}`}
                      style={{ "--course": colors[i.courseId] } as CSSProperties}
                      onClick={() => onOpen?.(i)}
                      title={`${i.courseCode}: ${i.title}`}
                    >
                      {i.title}
                    </button>
                  ))}
                  {items.length > 3 && (
                    <button className="more" onClick={() => onSelectDay(day)}>+{items.length - 3} more</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
