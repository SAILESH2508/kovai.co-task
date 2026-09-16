/**
 * DashboardPage — stat cards, welcome banner, filter/search, full CRUD.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { taskService } from '../services/taskService';
import Navbar from '../components/Navbar';
import WelcomeBanner from '../components/WelcomeBanner';
import TaskCard from '../components/TaskCard';
import FilterBar from '../components/FilterBar';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function DashboardPage() {
  const { showToast } = useToast();

  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');
  const [updatingIds, setUpdatingIds] = useState(new Set());

  // Filter state
  const [search, setSearch]                     = useState('');
  const [statusFilter, setStatusFilter]         = useState('All');
  const [priorityFilter, setPriorityFilter]     = useState('All Priorities');

  // Edit / delete state
  const [editingTask, setEditingTask]   = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // ── Load tasks ───────────────────────────────────────────────────────────
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      setTasks(await taskService.getTasks());
    } catch (err) {
      setFetchError(err.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // ── Derived data ─────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      tasks.length,
    planned:    tasks.filter((t) => t.status === 'Planned').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    complete:   tasks.filter((t) => t.status === 'Complete').length,
  }), [tasks]);

  const filteredTasks = useMemo(() => tasks.filter((t) => {
    const matchSearch   = search === '' ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus   = statusFilter === 'All' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'All Priorities' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  }), [tasks, search, statusFilter, priorityFilter]);

  // ── CRUD handlers ────────────────────────────────────────────────────────
  const handleTaskCreated = useCallback(async (payload) => {
    const newTask = await taskService.createTask(payload);
    setTasks((prev) => [newTask, ...prev]);
    showToast('Task created!', 'success');
    return newTask;
  }, [showToast]);

  const handleStatusChange = useCallback(async (taskId, newStatus) => {
    setUpdatingIds((prev) => new Set(prev).add(taskId));
    try {
      const updated = await taskService.updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      showToast(`Moved to "${newStatus}"`, 'info');
    } catch (err) {
      showToast(`Could not update: ${err.message}`, 'error');
    } finally {
      setUpdatingIds((prev) => { const n = new Set(prev); n.delete(taskId); return n; });
    }
  }, [showToast]);

  const openEdit = (task) => {
    setEditingTask(task);
    new window.bootstrap.Modal(document.getElementById('editTaskModal')).show();
  };

  const handleSaveEdit = useCallback(async (taskId, payload) => {
    const updated = await taskService.editTask(taskId, payload);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast('Task updated!', 'success');
  }, [showToast]);

  const openDelete = (task) => {
    setDeletingTask(task);
    new window.bootstrap.Modal(document.getElementById('deleteConfirmModal')).show();
  };

  const handleConfirmDelete = useCallback(async (taskId) => {
    await taskService.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task deleted.', 'info');
  }, [showToast]);

  const openCreate = () => {
    new window.bootstrap.Modal(document.getElementById('createTaskModal')).show();
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />

      <main className="container-lg py-4">

        {/* ── Welcome Banner ── */}
        {!loading && !fetchError && (
          <WelcomeBanner stats={stats} />
        )}

        {/* ── Page header ── */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h2 className="page-header-title mb-0">My Tasks</h2>
          </div>
          <button className="btn btn-brand d-flex align-items-center gap-2" onClick={openCreate}>
            <i className="bi bi-plus-lg" aria-hidden="true" />
            New Task
          </button>
        </div>

        {/* ── Stat cards ── */}
        {!loading && !fetchError && (
          <div className="row g-3 mb-4">
            {[
              { label: 'Total',       value: stats.total,      icon: 'bi-list-task',         color: '#6366f1', bg: '#eef2ff' },
              { label: 'Planned',     value: stats.planned,    icon: 'bi-clock',             color: '#2563eb', bg: '#eff6ff' },
              { label: 'In Progress', value: stats.inProgress, icon: 'bi-arrow-repeat',      color: '#c2410c', bg: '#fff7ed' },
              { label: 'Complete',    value: stats.complete,   icon: 'bi-check-circle-fill', color: '#15803d', bg: '#f0fdf4' },
            ].map((s) => (
              <div className="col-6 col-md-3" key={s.label}>
                <div className="stat-card" style={{ '--stat-color': s.color, '--stat-bg': s.bg }}>
                  <div className="stat-icon mb-2">
                    <i className={`bi ${s.icon}`} aria-hidden="true" />
                  </div>
                  <div className="stat-number">{s.value}</div>
                  <div className="stat-label mt-1">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="spinner-overlay" role="status">
            <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem' }} />
            <span className="text-secondary small">Loading your tasks…</span>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && fetchError && (
          <div className="alert alert-danger d-flex align-items-center gap-3" role="alert">
            <i className="bi bi-wifi-off fs-4 flex-shrink-0" aria-hidden="true" />
            <div>
              <strong>Could not load tasks.</strong> {fetchError}
              <button className="btn btn-sm btn-outline-danger ms-3" onClick={loadTasks}>Retry</button>
            </div>
          </div>
        )}

        {/* ── Filter bar ── */}
        {!loading && !fetchError && tasks.length > 0 && (
          <FilterBar
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilter={setPriorityFilter}
            taskCount={filteredTasks.length}
          />
        )}

        {/* ── Empty: no tasks ── */}
        {!loading && !fetchError && tasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="bi bi-clipboard-x" aria-hidden="true" />
            </div>
            <h5>No tasks yet</h5>
            <p>Create your first task to get started.</p>
            <button className="btn btn-brand px-4" onClick={openCreate}>
              <i className="bi bi-plus-lg me-2" aria-hidden="true" />
              Create Task
            </button>
          </div>
        )}

        {/* ── Empty: filtered ── */}
        {!loading && !fetchError && tasks.length > 0 && filteredTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="bi bi-funnel" aria-hidden="true" />
            </div>
            <h5>No matching tasks</h5>
            <p>Try adjusting your search or filters.</p>
            <button
              className="btn btn-brand-outline px-4"
              onClick={() => { setSearch(''); setStatusFilter('All'); setPriorityFilter('All Priorities'); }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* ── Task list ── */}
        {!loading && !fetchError && filteredTasks.length > 0 && (
          <div aria-label="Task list" aria-live="polite">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={openEdit}
                onDelete={openDelete}
                updating={updatingIds.has(task.id)}
              />
            ))}
          </div>
        )}

      </main>

      {/* ── Modals ── */}
      <CreateTaskModal onTaskCreated={handleTaskCreated} />
      <EditTaskModal task={editingTask} onSave={handleSaveEdit} />
      <DeleteConfirmModal task={deletingTask} onConfirm={handleConfirmDelete} />
    </>
  );
}
