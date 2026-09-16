/**
 * EditTaskModal — edit a task's title, description, and priority.
 * Opened programmatically with a task object passed as `task` prop.
 */
import React, { useEffect, useRef, useState } from 'react';

const PRIORITIES = ['Low', 'Medium', 'High'];

export default function EditTaskModal({ task, onSave }) {
  const [form, setForm]           = useState({ title: '', description: '', priority: 'Medium' });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]   = useState('');
  const titleRef = useRef(null);

  // Populate form whenever a new task is passed in
  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title       ?? '',
        description: task.description ?? '',
        priority:    task.priority    ?? 'Medium',
      });
      setErrors({});
      setApiError('');
    }
  }, [task]);

  // Focus title on open
  useEffect(() => {
    const modalEl = document.getElementById('editTaskModal');
    if (!modalEl) return;
    const onShown = () => titleRef.current?.focus();
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
      await onSave(task.id, {
        title:       form.title.trim(),
        description: form.description.trim() || null,
        priority:    form.priority,
      });
      const modalEl = document.getElementById('editTaskModal');
      window.bootstrap?.Modal.getInstance(modalEl)?.hide();
    } catch (err) {
      setApiError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade" id="editTaskModal" tabIndex="-1" aria-labelledby="editTaskModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="editTaskModalLabel">
              <i className="bi bi-pencil-square me-2" aria-hidden="true" />
              Edit Task
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">
              {apiError && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill" />
                  {apiError}
                </div>
              )}

              {/* Title */}
              <div className="mb-3">
                <label htmlFor="et-title" className="form-label">
                  Title <span className="text-danger">*</span>
                </label>
                <input
                  ref={titleRef}
                  type="text"
                  id="et-title"
                  name="title"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
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
                <label htmlFor="et-desc" className="form-label">
                  Description <span className="text-muted fw-normal">(optional)</span>
                </label>
                <textarea
                  id="et-desc"
                  name="description"
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="et-priority" className="form-label">Priority</label>
                <select id="et-priority" name="priority" className="form-select" value={form.priority} onChange={handleChange} disabled={submitting}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal" disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-brand btn-sm d-flex align-items-center gap-2" disabled={submitting}>
                {submitting ? (
                  <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> Saving…</>
                ) : (
                  <><i className="bi bi-floppy" aria-hidden="true" /> Save Changes</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
