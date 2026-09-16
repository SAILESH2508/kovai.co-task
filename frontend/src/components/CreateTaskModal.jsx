/**
 * CreateTaskModal — orange-themed modal for creating a new task.
 * Includes priority selector alongside title, description, and status.
 */
import React, { useEffect, useRef, useState } from 'react';

const STATUSES   = ['Planned', 'In Progress', 'Complete'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const INITIAL    = { title: '', description: '', status: 'Planned', priority: 'Medium' };

export default function CreateTaskModal({ onTaskCreated }) {
  const [form, setForm]           = useState(INITIAL);
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]   = useState('');
  const [success, setSuccess]     = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    const modalEl = document.getElementById('createTaskModal');
    if (!modalEl) return;
    const onShown = () => {
      titleRef.current?.focus();
      setForm(INITIAL);
      setErrors({});
      setApiError('');
      setSuccess(false);
    };
    modalEl.addEventListener('shown.bs.modal', onShown);
    return () => modalEl.removeEventListener('shown.bs.modal', onShown);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    else if (form.title.trim().length > 255) e.title = 'Title must be 255 characters or fewer.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    setSubmitting(true);
    try {
      await onTaskCreated({
        title:       form.title.trim(),
        description: form.description.trim() || null,
        status:      form.status,
        priority:    form.priority,
      });
      setSuccess(true);
      setForm(INITIAL);
      setErrors({});
      setTimeout(() => {
        const modalEl = document.getElementById('createTaskModal');
        window.bootstrap?.Modal.getInstance(modalEl)?.hide();
        setSuccess(false);
      }, 1000);
    } catch (err) {
      setApiError(err.message || 'Failed to create task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade" id="createTaskModal" tabIndex="-1" aria-labelledby="createTaskModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="createTaskModalLabel">
              <i className="bi bi-plus-circle me-2" aria-hidden="true" />
              New Task
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">

              {success && (
                <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3" role="status">
                  <i className="bi bi-check-circle-fill" />
                  Task created successfully!
                </div>
              )}
              {apiError && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill" />
                  {apiError}
                </div>
              )}

              {/* Title */}
              <div className="mb-3">
                <label htmlFor="ct-title" className="form-label">
                  Title <span className="text-danger">*</span>
                </label>
                <input
                  ref={titleRef}
                  type="text"
                  id="ct-title"
                  name="title"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={255}
                  disabled={submitting}
                  aria-required="true"
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>

              {/* Description */}
              <div className="mb-3">
                <label htmlFor="ct-desc" className="form-label">
                  Description <span className="text-muted fw-normal">(optional)</span>
                </label>
                <textarea
                  id="ct-desc"
                  name="description"
                  className="form-control"
                  placeholder="Add more detail…"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Status + Priority side by side */}
              <div className="row g-3">
                <div className="col-6">
                  <label htmlFor="ct-status" className="form-label">Status</label>
                  <select id="ct-status" name="status" className="form-select" value={form.status} onChange={handleChange} disabled={submitting}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <label htmlFor="ct-priority" className="form-label">Priority</label>
                  <select id="ct-priority" name="priority" className="form-select" value={form.priority} onChange={handleChange} disabled={submitting}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal" disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-brand btn-sm d-flex align-items-center gap-2" disabled={submitting}>
                {submitting ? (
                  <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> Creating…</>
                ) : (
                  <><i className="bi bi-plus-lg" aria-hidden="true" /> Create Task</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
