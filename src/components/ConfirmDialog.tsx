import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="confirm-modal-box"
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {isDestructive ? (
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 border border-orange-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <button
            id="close-confirm-btn"
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            id="cancel-dialog-btn"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            id="confirm-action-btn"
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-xl text-white font-medium text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
