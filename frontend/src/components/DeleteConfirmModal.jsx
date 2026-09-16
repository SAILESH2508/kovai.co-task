/**
 * DeleteConfirmModal — confirms before permanently deleting a task.
 */
import React, { useState } from 'react';

export default function DeleteConfirmModal({ task, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');

  const handleConfirm = async () => {
    setDeleting(true);
    setError('');
    try {
      await onConfirm(task.id);
      const modalEl = document.getElementById('deleteConfirmModal');
      window.bootstrap?.Modal.getInstance(modalEl)?.hide();
    } catch (err) {
      setError(err.message || 'Failed to delete task.');
      setDeleting(false);
    }
  };

  return (
    <div className="modal fade" id="deleteConfirmModal" tabIndex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content delete-modal">
          <div className="modal-header">
            <h5 className="modal-title" id="deleteConfirmModalLabel">
              <i className="bi bi-trash3 me-2" aria-hidden="true" />
              Delete Task
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <div className="modal-body">
            {error && (
              <div className="alert alert-danger py-2 small mb-3" role="alert">{error}</div>
            )}
            <p className="mb-1" style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>
              Are you sure you want to delete:
            </p>
            <p className="fw-semibold mb-0" style={{ fontSize: '0.9rem', color: 'var(--gray-900)', wordBreak: 'break-word' }}>
              "{task?.title}"
            </p>
            <p className="mt-2 mb-0" style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
              This action cannot be undone.
            </p>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal" disabled={deleting}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger d-flex align-items-center gap-2"
              onClick={handleConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> Deleting…</>
              ) : (
                <><i className="bi bi-trash3" aria-hidden="true" /> Delete</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
