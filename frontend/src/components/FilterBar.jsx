/**
 * FilterBar — search input + status filter pills + priority filter.
 */
import React from 'react';

const STATUS_FILTERS = ['All', 'Planned', 'In Progress', 'Complete'];
const PRIORITY_FILTERS = ['All Priorities', 'High', 'Medium', 'Low'];

export default function FilterBar({ search, onSearch, statusFilter, onStatusFilter, priorityFilter, onPriorityFilter, taskCount }) {
  return (
    <div className="filter-bar mb-4">
      {/* Search */}
      <div className="search-input-wrap">
        <i className="bi bi-search" aria-hidden="true" />
        <input
          type="search"
          className="search-input"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search tasks"
        />
      </div>

      {/* Status filters */}
      <div className="d-flex flex-wrap gap-2 align-items-center">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            className={`filter-pill ${statusFilter === s ? 'active' : ''}`}
            onClick={() => onStatusFilter(s)}
            aria-pressed={statusFilter === s}
            aria-label={`Filter by ${s}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Priority filter */}
      <div className="d-flex flex-wrap gap-2">
        {PRIORITY_FILTERS.map((p) => (
          <button
            key={p}
            className={`filter-pill ${priorityFilter === p ? 'active' : ''}`}
            onClick={() => onPriorityFilter(p)}
            aria-pressed={priorityFilter === p}
            aria-label={`Filter by priority ${p}`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Result count */}
      <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
        {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
      </span>
    </div>
  );
}
