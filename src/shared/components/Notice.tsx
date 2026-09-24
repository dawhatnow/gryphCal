import type { ReactNode } from "react";

// Empty / signed-out / error states: say what happened and what to do.
export function Notice({ title, children, action }: { title: string; children?: ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="notice">
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action && <button className="primary-btn" onClick={action.onClick}>{action.label}</button>}
    </div>
  );
}
