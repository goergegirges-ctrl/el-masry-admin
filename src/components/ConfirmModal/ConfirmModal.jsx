import React, { useEffect } from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, confirmLabel = 'تأكيد', cancelLabel = 'إلغاء', onConfirm, onCancel, danger = true, loading = false }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="cm-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="cm-box" onClick={(e) => e.stopPropagation()}>
        <div className={`cm-icon-ring ${danger ? 'danger' : 'info'}`}>
          {danger ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
        </div>
        <h4 className="cm-title">{title}</h4>
        <p className="cm-message">{message}</p>
        <div className="cm-actions">
          <button className="cm-btn cm-cancel" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button className={`cm-btn cm-confirm ${danger ? 'danger' : ''}`} onClick={onConfirm} disabled={loading}>
            {loading ? <span className="cm-spinner" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
