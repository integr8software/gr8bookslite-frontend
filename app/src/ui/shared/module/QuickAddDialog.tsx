"use client";

import { useEffect, useId, type ReactNode } from "react";

type QuickAddDialogProps = {
  children: ReactNode;
  error?: string;
  isOpen: boolean;
  isPending: boolean;
  saveDisabled?: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void | Promise<void>;
};

export function QuickAddDialog({
  children,
  error,
  isOpen,
  isPending,
  saveDisabled = false,
  title,
  onClose,
  onSave,
}: QuickAddDialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        onClose();
        return;
      }

      if (event.key === "Enter" && !isPending && !saveDisabled) {
        event.preventDefault();
        void onSave();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose, onSave, saveDisabled]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/20 px-4 py-6 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-lg border border-darknavy/10 bg-white p-5 shadow-[0_28px_90px_rgba(33,39,56,0.24)]"
      >
        <h2 id={titleId} className="text-base font-semibold text-darknavy">
          {title}
        </h2>
        <div className="mt-5 grid gap-4">{children}</div>
        {error ? <p className="mt-2 text-sm font-semibold text-coralpink">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="inline-flex h-10 min-w-28 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending || saveDisabled}
            onClick={() => void onSave()}
            className="app-dialog-primary-button inline-flex h-10 min-w-32 items-center justify-center rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            Save
          </button>
        </div>
      </section>
    </div>
  );
}
