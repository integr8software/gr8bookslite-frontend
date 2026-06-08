"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

export type AppDialogTone = "default" | "danger" | "success";

export type AppDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  confirmationLabel?: string;
  confirmationPhrase?: string;
  description: string;
  isOpen: boolean;
  isPending?: boolean;
  pendingLabel?: string;
  showCancel?: boolean;
  title: string;
  tone?: AppDialogTone;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};

export function AppDialog({
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  confirmationLabel = "Confirmation",
  confirmationPhrase,
  description,
  isOpen,
  isPending = false,
  pendingLabel = "Please wait...",
  showCancel = true,
  title,
  tone = "default",
  onCancel,
  onConfirm,
}: AppDialogProps) {
  const [confirmationValue, setConfirmationValue] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const isConfirmPending = isPending || isConfirming;
  const canConfirm =
    !confirmationPhrase ||
    confirmationValue.trim().toLowerCase() === confirmationPhrase.toLowerCase();

  const handleCancel = useCallback(() => {
    if (isConfirmPending) {
      return;
    }

    setConfirmationValue("");
    onCancel();
  }, [isConfirmPending, onCancel]);

  const handleConfirm = useCallback(async () => {
    if (isConfirmPending || !canConfirm) {
      return;
    }

    setConfirmationValue("");
    setIsConfirming(true);

    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  }, [canConfirm, isConfirmPending, onConfirm]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isConfirmPending) {
        handleCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isConfirmPending, handleCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="app-dialog-backdrop fixed inset-0 z-80 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isConfirmPending) {
          handleCancel();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby="app-dialog-description"
        className="w-full max-w-md rounded-lg border border-darknavy/10 bg-white p-5 shadow-[0_28px_90px_rgba(33,39,56,0.24)]"
      >
        <h2
          id="app-dialog-title"
          className="text-base font-semibold text-darknavy"
        >
          {title}
        </h2>
        <p
          id="app-dialog-description"
          className="mt-2 text-sm leading-6 text-darknavy/62"
        >
          {description}
        </p>
        {confirmationPhrase ? (
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-darknavy">
              {confirmationLabel}
            </span>
            <input
              value={confirmationValue}
              onChange={(event) => setConfirmationValue(event.target.value)}
              disabled={isConfirmPending}
              placeholder={confirmationPhrase}
              className="mt-2 h-11 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy shadow-sm outline-none transition placeholder:text-darknavy/28 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
            />
          </label>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          {showCancel ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isConfirmPending}
              className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isConfirmPending || !canConfirm}
            aria-busy={isConfirmPending}
            className={getConfirmButtonClassName({
              isDisabled: !canConfirm,
              isPending: isConfirmPending,
              tone,
            })}
          >
            {isConfirmPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                {pendingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

function getConfirmButtonClassName({
  isDisabled,
  isPending,
  tone,
}: {
  isDisabled: boolean;
  isPending: boolean;
  tone: AppDialogTone;
}) {
  const baseClassName =
    "inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2";
  const disabledClassName =
    isDisabled && !isPending ? "cursor-not-allowed opacity-55" : "";
  const pendingClassName = isPending ? "cursor-wait opacity-100" : "";

  if (tone === "danger") {
    return `${baseClassName} ${disabledClassName} ${pendingClassName} bg-coralpink text-white hover:bg-coralpink/90 focus-visible:ring-coralpink/35`;
  }

  return `${baseClassName} ${disabledClassName} ${pendingClassName} theme-accent-contrast-text bg-skyblue hover:bg-skyblue/85 focus-visible:ring-skyblue/35`;
}
