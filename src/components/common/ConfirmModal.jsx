import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
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
    danger: <AlertTriangle className="h-6 w-6 text-red-600" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-600" />,
    info: <Info className="h-6 w-6 text-blue-600" />
  };

  const bgColors = {
    danger: 'bg-red-50',
    warning: 'bg-amber-50',
    info: 'bg-blue-50'
  };

  const buttonVariants = {
    danger: 'danger',
    warning: 'primary',
    info: 'primary'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 rounded-full p-2 ${bgColors[variant]}`}>
          {icons[variant]}
        </div>
        <div className="mt-1 text-sm text-gray-600">
          {message}
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={buttonVariants[variant]} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
