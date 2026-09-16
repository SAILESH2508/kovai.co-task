/**
 * TaskCard — redesigned with priority left-border, badges, edit/delete actions.
 */
import React from 'react';

const STATUSES   = ['Planned', 'In Progress', 'Complete'];

function statusBadgeClass(status) {
  switch (status) {
    case 'In Progress': return 'badge-in-progress';
    case 'Complete':    return 'badge-complete';
    default:            return 'badge-planned';
  }
}

function priorityBadgeClass(priority) {
  switch (priority) {
    case 'High':   return 'badge-priority-high';
    case 'Low':    return 'badge-priority-low';
    default:       return 'badge-priority-medium';
  }
}

function priorityCardClass(priority) {
  switch (priority) {
    case 'High':   return 'priority-high';
    case 'Low':    return 'priority-low';
    default:       return 'priority-medium';
  }
}

function priorityIcon(priority) {
  switch (priority) {
    case 'High':   return 'bi-arrow-up-circle-fill';
    case 'Low':    return 'bi-arrow-down-circle-fill';
    default:       return 'bi-dash-circle-fill';
  }
}

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function TaskCard({ task, onStatusChange, onEdit, onDelete, updating }) {
  return (
    <div
      className={`task-card mb-3 ${priorityCardClass(task.priority)}`}
      aria-label={`Task: ${task.title}`}
    >
      <div className="task-card-body">
        <div className="d-flex align-items-start justify-content-between gap-3">

          {/* Left: content */}
          <div className="flex-grow-1 min-width-0">
            {/* Badges row */}
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span className={`badge-status ${statusBadgeClass(task.status)}`}>
                {task.status}
              </span>
              <span className={`badge-priority ${priorityBadgeClass(task.priority)}`}>
                <i className={`bi ${priorityIcon(task.priority)} me-1`} style={{ fontSize: '0.65rem' }} aria-hidden="true" />
                {task.priority}
              </span>
            </div>

            {/* Title */}
            <h6
              className="mb-1 fw-semibold"
              style={{
                fontSize: '0.95rem',
                color: 'var(--gray-900)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={task.title}
            >
              {task.title}
            </h6>

            {/* Description */}
            {task.description && (
              <p
                className="mb-0"
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--gray-500)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {task.description}
              </p>
            )}
          </div>

          {/* Right: actions */}
          <div className="d-flex align-items-center gap-1 flex-shrink-0">
            <button
              className="task-action-btn edit"
              onClick={() => onEdit(task)}
              aria-label={`Edit ${task.title}`}
              title="Edit task"
            >
              <i className="bi bi-pencil" />
            </button>
            <button
              className="task-action-btn delete"
              onClick={() => onDelete(task)}
              aria-label={`Delete ${task.title}`}
              title="Delete task"
            >
              <i className="bi bi-trash3" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3 pt-2"
          style={{ borderTop: '1px solid var(--gray-100)' }}
        >
          {/* Date */}
          <span style={{ fontSize: '0.73rem', color: 'var(--gray-400)' }}>
            <i className="bi bi-calendar3 me-1" aria-hidden="true" />
            {formatDate(task.created_at)}
          </span>

          {/* Status selector */}
          <div className="d-flex align-items-center gap-2">
            {updating && (
              <div
                className="spinner-border spinner-border-sm"
                role="status"
                style={{ width: '0.9rem', height: '0.9rem', borderWidth: '0.15em', color: 'var(--brand)' }}
              >
                <span className="visually-hidden">Updating…</span>
              </div>
            )}
            <select
              className="status-select"
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              disabled={updating}
              aria-label={`Change status of ${task.title}`}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
