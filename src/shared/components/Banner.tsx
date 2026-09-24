import type { Store } from "../../types";
import { effectiveStatus } from "../storage";
import { openCourseLink, requestSync } from "../actions";

// A slim strip above the calendar when the last sync had a problem,
// so old data still shows but the student knows it may be out of date.
export function Banner({ store }: { store: Store }) {
  const status = effectiveStatus(store.sync);
  if (status === "signed_out") {
    return <div className="banner">Signed out of CourseLink. <button onClick={() => openCourseLink()}>Sign in to refresh</button></div>;
  }
  if (status === "error") {
    return <div className="banner">Last sync didn't finish ({store.sync.message}). <button onClick={() => requestSync()}>Try again</button></div>;
  }
  return null;
}
