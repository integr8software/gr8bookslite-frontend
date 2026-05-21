"use client";

import { useEffect } from "react";

type AppConfirmDialogTone = "default" | "danger";

type AppConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  isOpen: boolean;
  isPending?: boolean;
  title: string;
  tone?: AppConfirmDialogTone;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AppConfirmDialog({
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  description,
  isOpen,
  isPending = false,
  title,
  tone = "default",
  onCancel,
  onConfirm,
}: AppConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-80 flex items-center justify-center bg-darknavy/45 px-4 py-6 backdrop-blur-none"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-confirm-dialog-title"
        aria-describedby="app-confirm-dialog-description"
        className="w-full max-w-md rounded-lg border border-darknavy/10 bg-white p-5 shadow-[0_28px_90px_rgba(33,39,56,0.24)]"
      >
        <h2
          id="app-confirm-dialog-title"
          className="text-base font-semibold text-darknavy"
        >
          {title}
        </h2>
        <p
          id="app-confirm-dialog-description"
          className="mt-2 text-sm leading-6 text-darknavy/62"
        >
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={getConfirmButtonClassName(tone)}
          >
            {isPending ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function getConfirmButtonClassName(tone: AppConfirmDialogTone) {
  const baseClassName =
    "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2";

  if (tone === "danger") {
    return `${baseClassName} bg-coralpink hover:bg-coralpink/90 focus-visible:ring-coralpink/35`;
  }

  return `${baseClassName} bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500/35`;
}
