// Full-tab calendar: month or week view, course filter, details side panel.
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { addWeeks, format, isToday, startOfMonth } from "date-fns";
import type { Deadline, Filter } from "../types";
import { useStore } from "../shared/useStore";
import { writeStore } from "../shared/storage";
import { courseColors } from "../shared/colors";
import { WEEKDAYS, dayKey, groupByDay, weekDays } from "../shared/dates";
import { requestSync } from "../shared/actions";
import { Header } from "../shared/components/Header";
import { CourseChips } from "../shared/components/CourseChips";
import { MonthGrid } from "../shared/components/MonthGrid";
import { DeadlineRow } from "../shared/components/DeadlineRow";
import { DeadlineDetail } from "../shared/components/DeadlineDetail";
import { SetupGate } from "../shared/components/SetupGate";
import { Banner } from "../shared/components/Banner";
import { ProfileCard } from "../shared/components/ProfileCard";

type View = "month" | "week";

export function CalendarPage() {
  const store = useStore();
  const [view, setView] = useState<View>("month");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());
  const [detail, setDetail] = useState<Deadline | null>(null);
  const [editing, setEditing] = useState(false);

  const pickedCourses = useMemo(
    () => (store ? store.courses.filter((c) => store.selectedCourseIds?.includes(c.id)) : []),
    [store],
  );
  const colors = useMemo(() => courseColors(pickedCourses), [pickedCourses]);
  const visible = useMemo(
    () => (store ? store.deadlines.filter((d) => store.filter === "all" || d.courseId === store.filter) : []),
    [store],
  );
  const byDay = useMemo(() => groupByDay(visible), [visible]);

  if (!store) return null;

  const setFilter = (f: Filter) => void writeStore({ filter: f });
  const courseName = (id: number) => store.courses.find((c) => c.id === id)?.name ?? "";
  const week = weekDays(selected);

  return (
    <div className="page-shell">
      <Header sync={store.sync} onSync={() => void requestSync()}>
        <div className="segmented" role="tablist" aria-label="Calendar view">
          {(["month", "week"] as View[]).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} className={view === v ? "on" : ""} onClick={() => setView(v)}>
              {v === "month" ? "Month" : "Week"}
            </button>
          ))}
        </div>
      </Header>
      <SetupGate store={store} editing={editing} onDoneEditing={() => setEditing(false)}>
        <Banner store={store} />
        <ProfileCard store={store} courseCount={pickedCourses.length} />
        <div className="toolbar">
          <CourseChips courses={pickedCourses} colors={colors} filter={store.filter} onChange={setFilter} />
          <button className="ghost-btn" onClick={() => setEditing(true)}>Edit courses</button>
        </div>
        <div className={`page-body ${detail ? "with-detail" : ""}`}>
          <main>
            {view === "month" ? (
              <MonthGrid
                variant="full"
                month={month}
                selected={selected}
                byDay={byDay}
                colors={colors}
                onMonthChange={setMonth}
                onSelectDay={(d) => { setSelected(d); setView("week"); }}
                onOpen={setDetail}
              />
            ) : (
              <div className="week">
                <div className="month-nav">
                  <button className="nav-btn" onClick={() => setSelected(addWeeks(selected, -1))} aria-label="Previous week">‹</button>
                  <h2>Week of {format(week[0], "MMM d")}</h2>
                  <button className="nav-btn" onClick={() => setSelected(addWeeks(selected, 1))} aria-label="Next week">›</button>
                </div>
                <div className="week-cols">
                  {week.map((day, i) => {
                    const items = byDay.get(dayKey(day)) ?? [];
                    return (
                      <div key={dayKey(day)} className={`week-col ${isToday(day) ? "today" : ""} ${items.filter((x) => !x.submitted).length >= 3 ? "busy" : ""}`}>
                        <div className="week-head">
                          <span>{WEEKDAYS[i]}</span>
                          <b>{format(day, "d")}</b>
                        </div>
                        {items.map((d) => <DeadlineRow key={d.id} d={d} color={colors[d.courseId]} onOpen={setDetail} />)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
          {detail && (
            <aside style={{ "--course": colors[detail.courseId] } as CSSProperties}>
              <DeadlineDetail d={detail} color={colors[detail.courseId]} courseName={courseName(detail.courseId)} onClose={() => setDetail(null)} />
            </aside>
          )}
        </div>
      </SetupGate>
      <p className="disclaimer">Built by a Gryphon, for Gryphons</p>
    </div>
  );
}
