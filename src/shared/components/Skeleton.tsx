// Grey shimmering rows shown while the first sync is still loading,
// so an empty list doesn't look like "nothing is due".
export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton" role="status" aria-label="Loading your deadlines">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-row">
          <span className="skeleton-bar count" />
          <span className="skeleton-col">
            <span className="skeleton-bar title" />
            <span className="skeleton-bar meta" />
          </span>
        </div>
      ))}
    </div>
  );
}
