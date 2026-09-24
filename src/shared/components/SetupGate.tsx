// Screens shown before the calendar is ready: signed out, first run,
// course picker. Both the popup and the full calendar page use this.
import type { ReactNode } from "react";
import type { Store } from "../../types";
import { effectiveStatus, writeStore } from "../storage";
import { openCourseLink, requestSync } from "../actions";
import { CoursePicker } from "./CoursePicker";
import { Notice } from "./Notice";

export async function saveCourses(ids: number[]) {
  await writeStore({ selectedCourseIds: ids, filter: "all" });
  await requestSync();
}

export function SetupGate({ store, editing, onDoneEditing, children }: {
  store: Store;
  editing: boolean;
  onDoneEditing: () => void;
  children: ReactNode;
}) {
  const status = effectiveStatus(store.sync);

  if (status === "signed_out" && store.deadlines.length === 0) {
    return <Notice title="Sign in to CourseLink" action={{ label: "Open CourseLink", onClick: () => openCourseLink() }}>
      GryphCal reads your deadlines while you're signed in.
    </Notice>;
  }
  if (store.courses.length === 0) {
    return status === "syncing"
      ? <Notice title="Finding your courses…" />
      : <Notice title="Let's find your courses" action={{ label: "Open CourseLink", onClick: () => openCourseLink() }}>
          Open CourseLink once and GryphCal will load your courses.
        </Notice>;
  }
  if (store.selectedCourseIds === null || editing) {
    return <CoursePicker
      courses={store.courses}
      selected={store.selectedCourseIds}
      onCancel={store.selectedCourseIds ? onDoneEditing : undefined}
      onSave={(ids) => { onDoneEditing(); void saveCourses(ids); }}
    />;
  }
  return <>{children}</>;
}
