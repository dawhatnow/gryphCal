import type { ReactNode } from "react";
import type { SyncState } from "../../types";
import { effectiveStatus } from "../storage";
import { syncedLabel } from "../dates";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  sync: SyncState;
  onSync: () => void;
  children?: ReactNode; // extra buttons (e.g. month/week toggle)
}

export function Header({ sync, onSync, children }: Props) {
  const syncing = effectiveStatus(sync) === "syncing";
  return (
    <header className="header">
      <div className="brand">
        <Logo />
        <div>
          <div className="brand-name">GryphCal</div>
          <div className="brand-status">{syncing ? "Syncing with CourseLink…" : syncedLabel(sync.lastSyncedAt)}</div>
        </div>
      </div>
      <div className="header-actions">
        {children}
        <ThemeToggle />
        <button className={`icon-btn ${syncing ? "spinning" : ""}`} onClick={onSync} aria-label="Sync with CourseLink" title="Sync with CourseLink">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              d="M20 11a8 8 0 0 0-14.9-3.9M4 4v4h4M4 13a8 8 0 0 0 14.9 3.9M20 20v-4h-4" />
          </svg>
        </button>
      </div>
    </header>
  );
}
