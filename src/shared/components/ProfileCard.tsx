import { format } from "date-fns";
import type { Store } from "../../types";
import { currentSemester } from "../../content/normalize";
import { useNow } from "../useNow";
import { Logo } from "./Logo";

// The landing card: who you are, how many courses, which semester, and the time.
// Everything here comes from CourseLink (via the last sync) and stays in the browser.
export function ProfileCard({ store, courseCount }: { store: Store; courseCount: number }) {
  const now = useNow();
  const first = store.user?.name.split(" ")[0];
  const semester = currentSemester(store.courses);
  return (
    <section className="profile" aria-label="Your info">
      <Logo size={52} />
      <div className="profile-main">
        <div className="profile-hello">{first ? `Hi, ${first}` : "Hi, Gryphon"}</div>
        <div className="profile-meta">
          {store.user && <span>ID {store.user.id}</span>}
          <span>{courseCount} {courseCount === 1 ? "course" : "courses"}</span>
          {semester && <span>{semester}</span>}
        </div>
      </div>
      <div className="profile-time">
        <b>{format(now, "h:mm a")}</b>
        <span>{format(now, "EEE, MMM d")}</span>
      </div>
    </section>
  );
}
