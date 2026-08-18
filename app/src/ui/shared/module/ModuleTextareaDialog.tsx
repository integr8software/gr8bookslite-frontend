"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";

type ModuleTextareaDialogProps = {
  detailLabel?: string | null;
  isOpen: boolean;
  isReadonly: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  subtitle?: string;
  textareaId: string;
  title: string;
  value: string;
};

export function ModuleTextareaDialog({
  detailLabel = "Details",
  isOpen,
  isReadonly,
  onClose,
  onSave,
  subtitle,
  textareaId,
  title,
  value,
}: ModuleTextareaDialogProps) {
  const [draft, setDraft] = useState(value);
  const titleId = `${textareaId}-dialog-title`;

  if (!isOpen) {
    return null;
  }

  const portalElement = typeof document === "undefined" ? null : document.body;

  if (!portalElement) {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-white/20 bg-white shadow-[0_28px_90px_rgba(33,39,56,0.28)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-5 py-4">
          <div className="min-w-0">
            {detailLabel ? (
              <h2 id={titleId} className="text-lg font-semibold text-darknavy">
                {title}
              </h2>
            ) : (
              <label id={titleId} htmlFor={textareaId} className="block text-lg font-semibold text-darknavy">
                {title}
              </label>
            )}
            {subtitle ? <p className="mt-1 truncate text-sm text-darknavy/55">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy/60 transition hover:bg-skyblue/10 hover:text-darknavy"
            aria-label={`Close ${title.toLowerCase()} dialog`}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 py-4">
          {detailLabel ? (
            <label htmlFor={textareaId} className="text-sm font-semibold text-darknavy">
              {detailLabel}
            </label>
          ) : null}
            <AppLimitedTextarea
              id={textareaId}
              value={draft}
            readOnly={isReadonly}
            onChange={(event) => setDraft(event.target.value)}
            className={`${detailLabel ? "mt-2 " : ""}min-h-48 w-full rounded-lg border border-darknavy/12 bg-white px-3 py-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65`}
            counterMode="used"
          />
        </div>
        <div className="shrink-0 border-t border-darknavy/10 px-5 py-4">
          <div className="flex justify-end gap-2">
            {isReadonly ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onSave(draft)}
                  className="theme-accent-contrast-text inline-flex h-10 items-center justify-center rounded-md bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85"
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>,
    portalElement,
  );
}
