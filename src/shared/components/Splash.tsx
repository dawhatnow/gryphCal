import { useEffect } from "react";
import { Logo } from "./Logo";

const SHOW_MS = 1600; // keep in sync with the splash-out animation in styles.css

// A short "Welcome, Gryphons" screen when the popup opens. Click to skip.
export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, SHOW_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <button className="splash" onClick={onDone} aria-label="Welcome, Gryphons. Click to continue.">
      <span className="splash-mark"><Logo size={110} /></span>
      <span className="splash-title">
        <span style={{ animationDelay: "0.35s" }}>Welcome,</span>{" "}
        <span style={{ animationDelay: "0.5s" }}>Gryphons</span>
      </span>
      <span className="splash-sub">Your deadlines, one calendar.</span>
    </button>
  );
}
