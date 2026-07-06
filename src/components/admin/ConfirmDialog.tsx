'use client';

import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Modal Dialog Body */}
      <div className="relative bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-2xl max-w-md w-full shadow-2xl p-6 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="flex gap-4">
          {isDanger && (
            <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-base font-bold text-[var(--admin-text-primary)]">
              {title}
            </h3>
            <p className="text-xs text-[var(--admin-text-secondary)] leading-relaxed font-semibold">
              {description}
            </p>
          </div>
        </div>

        {/* Buttons footer */}
        <div className="flex justify-end gap-3 mt-6 border-t border-[var(--admin-border)] pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold border border-[var(--admin-border)] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--admin-text-secondary)] transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-colors cursor-pointer
              ${isDanger ? 'bg-red-650 hover:bg-red-550' : 'bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)]'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
