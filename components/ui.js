// Shared presentational states used across dashboard pages.

export function EmptyState({ title, children, action }) {
  return (
    <div className="card empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && <div style={{ marginTop: "var(--s4)" }}>{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="alert alert-error spread" role="alert">
      <span>{message || "Something went wrong."}</span>
      {onRetry && <button className="btn btn-sm" onClick={onRetry}>Try again</button>}
    </div>
  );
}

// Placeholder rows shown while a list is loading.
export function SkeletonList({ rows = 5 }) {
  return (
    <div className="card card-flush" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-row">
          <span className="avatar skeleton" style={{ width: 28, height: 28 }} />
          <span className="skeleton-line" style={{ width: `${30 + ((i * 17) % 40)}%` }} />
        </div>
      ))}
    </div>
  );
}

export function Field({ label, htmlFor, error, hint, className, children }) {
  return (
    <div className={`field ${className ?? ""}`}>
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
      {error ? <span className="error">{error}</span> : hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function Pagination({ page, totalPages, total, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="spread" style={{ marginTop: "var(--s4)" }}>
      <span className="small muted num">Page {page} of {totalPages}{total !== undefined && ` · ${total} results`}</span>
      <div className="row">
        <button className="btn btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
        <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}
