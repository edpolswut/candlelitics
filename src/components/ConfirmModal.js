import React from 'react';
import { createPortal } from 'react-dom';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3>{title || 'Confirmar Ação'}</h3>
          <button onClick={onClose} className="confirm-modal-close">&times;</button>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-confirm-delete" onClick={() => { onConfirm(); onClose(); }}>
            Confirmar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;