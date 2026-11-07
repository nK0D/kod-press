'use client';

import React from 'react';

/** A submit button that asks for confirmation first (e.g. permanent deletes). */
export function ConfirmButton({
  confirmMessage,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { confirmMessage: string }) {
  return (
    <button
      {...props}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
        props.onClick?.(event);
      }}
    />
  );
}

/** Header checkbox that toggles every `ids` checkbox in its form. */
export function SelectAllCheckbox({ label }: { label: string }) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      className="h-3.5 w-3.5 rounded border-slate-300 accent-[var(--admin-accent)]"
      onChange={(event) => {
        const checked = event.currentTarget.checked;
        event.currentTarget.form?.querySelectorAll<HTMLInputElement>('input[name="ids"]').forEach((box) => {
          box.checked = checked;
        });
      }}
    />
  );
}
