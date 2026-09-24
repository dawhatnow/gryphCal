// The popup: mini month with dots, and the selected day's list underneath.
import { useMemo, useState } from "react";
import { format, isToday, startOfMonth } from "date-fns";
import type { Deadline, Filter } from "../types";
import { useStore } from "../shared/useStore";
import { effectiveStatus, writeStore } from "../shared/storage";
import { courseColors } from "../shared/colors";
import { dayKey, groupByDay } from "../shared/dates";
import { openFullCalendar, requestSync } from "../shared/actions";
import { Header } from "../shared/components/Header";
import { CourseChips } from "../shared/components/CourseChips";
import { MonthGrid } from "../shared/components/MonthGrid";
import { DeadlineRow } from "../shared/components/DeadlineRow";
import { DeadlineDetail } from "../shared/components/DeadlineDetail";
import { SetupGate } from "../shared/components/SetupGate";
import { Banner } from "../shared/components/Banner";
import { Skeleton } from "../shared/components/Skeleton";
import { ProfileCard } from "../shared/components/ProfileCard";
import { Splash } from "../shared/components/Splash";

export function Popup() {
  const store = useStore();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());
  const [detail, setDetail] = useState<Deadline | null>(null);
  const [editing, setEditing] = useState(false);
  // Welcome splash on open (skipped if the user prefers reduced motion).
  const [splash, setSplash] = useState(() => !matchMedia("(prefers-reduced-motion: reduce)").matches);

  // Only the picked courses, and only the filtered one if a filter is on.
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
  if (splash) return <Splash onDone={() => setSplash(false)} />;

  const setFilter = (f: Filter) => void writeStore({ filter: f });
  const dayItems = byDay.get(dayKey(selected)) ?? [];
  const loadingFirst = effectiveStatus(store.sync) === "syncing" && store.deadlines.length === 0;
  const courseName = (id: number) => store.courses.find((c) => c.id === id)?.name ?? "";

  return (
    <div className="popup-shell">
      <Header sync={store.sync} onSync={() => void requestSync()} />
      <SetupGate store={store} editing={editing} onDoneEditing={() => setEditing(false)}>
        <Banner store={store} />
        <ProfileCard store={store} courseCount={pickedCourses.length} />
        <CourseChips courses={pickedCourses} colors={colors} filter={store.filter} onChange={setFilter} />
        <MonthGrid
          variant="mini"
          month={month}
          selected={selected}
          byDay={byDay}
          colors={colors}
          onMonthChange={setMonth}
          onSelectDay={(d) => { setSelected(d); setDetail(null); }}
        />
        <div className="day-panel">
          {detail ? (
            <DeadlineDetail d={detail} color={colors[detail.courseId]} courseName={courseName(detail.courseId)} onClose={() => setDetail(null)} />
          ) : (
            <>
              <h3 className="day-title">{isToday(selected) ? "Today" : format(selected, "EEEE, MMM d")}</h3>
              {loadingFirst
                ? <Skeleton />
                : dayItems.length === 0
                ? <p className="muted empty-day">Nothing due. Enjoy it, Gryphon.</p>
                : dayItems.map((d) => <DeadlineRow key={d.id} d={d} color={colors[d.courseId]} onOpen={setDetail} />)}
            </>
          )}
        </div>
        <footer className="popup-footer">
          <button className="ghost-btn" onClick={() => setEditing(true)}>Edit courses</button>
          <button className="primary-btn" onClick={openFullCalendar}>Open full calendar</button>
        </footer>
      </SetupGate>
      <p className="disclaimer">Built by a Gryphon, for Gryphons</p>
    </div>
  );
}
