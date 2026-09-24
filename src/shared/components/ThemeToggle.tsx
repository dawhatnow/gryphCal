import { useState } from "react";
import { applyTheme, getTheme, nextTheme, type Theme } from "../theme";

const LABEL: Record<Theme, string> = { system: "Theme: match system", light: "Theme: light", dark: "Theme: dark" };

// One button that cycles system -> light -> dark.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getTheme);
  const cycle = () => {
    const t = nextTheme(theme);
    applyTheme(t);
    setTheme(t);
  };
  return (
    <button className="icon-btn" onClick={cycle} aria-label={LABEL[theme]} title={LABEL[theme]}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {theme === "light" && <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>}
        {theme === "dark" && <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}
        {theme === "system" && <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>}
      </svg>
    </button>
  );
}
