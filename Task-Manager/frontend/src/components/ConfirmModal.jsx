import React, { useEffect } from 'react';
import "./ConfirmModal.css"
export default function ConfirmModal({
  visible,
  title = "Confirm",
  message = "",
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  // Close modal on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && visible) onCancel?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [visible, onCancel]);

  if (!visible) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card" role="dialog" aria-modal="true">
        <h3>{title}</h3>
        <p>{message}</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={onCancel} className="btn ghost">{cancelText}</button>
          <button onClick={onConfirm} className="btn danger">{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
