import React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) {
  const icons = {
    danger: <AlertCircle className="h-6 w-6 text-rose-600" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-600" />,
    info: <Info className="h-6 w-6 text-blue-600" />
  };

  const bgColors = {
    danger: 'bg-rose-50 border border-rose-100',
    warning: 'bg-amber-50 border border-amber-100',
    info: 'bg-blue-50 border border-blue-100'
  };

  const buttonVariants = {
    danger: 'danger',
    warning: 'primary',
    info: 'primary'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start space-x-3.5">
        <div className={`shrink-0 rounded-xl p-2.5 ${bgColors[variant] || bgColors.danger}`}>
          {icons[variant] || icons.danger}
        </div>
        <div className="mt-0.5 text-sm text-slate-600 leading-relaxed">
          {message}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
        <Button variant="outline" onClick={onClose} disabled={loading} size="sm">
          {cancelText}
        </Button>
        <Button variant={buttonVariants[variant] || 'danger'} onClick={onConfirm} loading={loading} size="sm">
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
