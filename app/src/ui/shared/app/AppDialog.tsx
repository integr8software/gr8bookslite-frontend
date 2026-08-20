"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, FilePenLine, LoaderCircle, Power, PowerOff, RotateCcw, Save, ThumbsDown, ThumbsUp } from "lucide-react";
import type { AppDialogIconTone, AppDialogProps, AppDialogTone } from "@/app/src/types/shared/app/AppDialogTypes";

const AppDialogSuccessTone = "success";
const AppDialogActivateTone = "activate";
const AppDialogDeactivateTone = "deactivate";

export function AppDialog({
  animateIcon = true,
  cancelLabel = "Cancel",
  closeOnBackdrop = true,
  closeOnEscape = true,
  confirmIcon,
  confirmLabel = "Confirm",
  confirmationLabel = "Confirmation",
  confirmationPhrase,
  description,
  iconTone,
  isOpen,
  isPending = false,
  pendingLabel,
  showCancel = true,
  title,
  tone = "default",
  onCancel,
  onConfirm,
}: AppDialogProps) {
  const [confirmationValue, setConfirmationValue] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const isConfirmPending = isPending || isConfirming;
  const resolvedPendingLabel = pendingLabel ?? getDefaultPendingLabel(tone);
  const canConfirm = !confirmationPhrase || confirmationValue.trim().toLowerCase() === confirmationPhrase.toLowerCase();
  const resolvedIconTone = iconTone === false ? null : (iconTone ?? getDefaultIconTone(tone));

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
      if (event.key === "Escape" && closeOnEscape && !isConfirmPending) {
        handleCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEscape, isOpen, isConfirmPending, handleCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="app-dialog-backdrop fixed inset-0 z-140 flex items-center justify-center bg-slate-950/20 px-4 py-6 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && closeOnBackdrop && !isConfirmPending) {
          handleCancel();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby="app-dialog-description"
        className="app-dialog-panel w-full max-w-md rounded-lg border border-darknavy/10 bg-white p-5 shadow-[0_28px_90px_rgba(33,39,56,0.24)]"
      >
        {resolvedIconTone ? <AppDialogStatusIcon animate={animateIcon} tone={resolvedIconTone} /> : null}
        <h2 id="app-dialog-title" className="text-center text-base font-semibold text-darknavy">
          {title}
        </h2>
        <p id="app-dialog-description" className="mt-2 text-center text-sm leading-6 text-darknavy/62">
          {description}
        </p>
        {confirmationPhrase ? (
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-darknavy">{confirmationLabel}</span>
            <input
              value={confirmationValue}
              onChange={(event) => setConfirmationValue(event.target.value)}
              disabled={isConfirmPending}
              placeholder={confirmationPhrase}
              className="mt-2 h-11 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy shadow-sm outline-none transition placeholder:text-darknavy/28 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
            />
          </label>
        ) : null}
        <div className="mt-5 flex justify-center gap-2">
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
                <AnimatedPendingLabel label={resolvedPendingLabel} />
              </>
            ) : (
              <>
                {confirmIcon ? (
                  <span className="h-4 w-4 shrink-0 [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">
                    {confirmIcon}
                  </span>
                ) : null}
                {confirmLabel}
              </>
            )}
          </button>
          {showCancel ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isConfirmPending}
              className="app-dialog-cancel-button inline-flex h-10 min-w-32 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
            >
              {cancelLabel}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function AnimatedPendingLabel({ label }: { label: string }) {
  const baseLabel = label.trim().replace(/\.+$/, "");
  const accessibleLabel = `${baseLabel}...`;

  return (
    <span className="inline-flex items-baseline" aria-label={accessibleLabel}>
      <span aria-hidden="true">{baseLabel}</span>
      <span className="inline-flex w-[1.15em] justify-start" aria-hidden="true">
        <span className="animate-pulse">.</span>
        <span className="animate-pulse [animation-delay:160ms]">.</span>
        <span className="animate-pulse [animation-delay:320ms]">.</span>
      </span>
    </span>
  );
}

function AppDialogStatusIcon({ animate, tone }: { animate: boolean; tone: AppDialogIconTone }) {
  const isDoubleMark = tone === "error";
  const StatusIcon =
    tone === AppDialogActivateTone
      ? Power
      : tone === "approve"
        ? ThumbsUp
        : tone === "cancel"
          ? Ban
          : tone === "undo"
            ? RotateCcw
            : tone === "save"
              ? Save
              : tone === "update"
                ? FilePenLine
                : tone === AppDialogDeactivateTone
                  ? PowerOff
                  : tone === "disapprove"
                    ? ThumbsDown
                    : null;

  return (
    <span
      className={`app-dialog-status-icon app-dialog-status-icon--${tone}`}
      data-animated={animate ? "true" : "false"}
      aria-hidden="true"
    >
      {StatusIcon ? (
        <StatusIcon className="app-dialog-status-icon-symbol" strokeWidth={2.2} />
      ) : (
        <>
          <span className="app-dialog-status-icon-mark" />
          {isDoubleMark ? <span className="app-dialog-status-icon-mark" /> : null}
        </>
      )}
    </span>
  );
}

function getDefaultIconTone(tone: AppDialogTone): AppDialogIconTone | null {
  if (tone === AppDialogActivateTone) {
    return AppDialogActivateTone;
  }

  if (tone === AppDialogDeactivateTone) {
    return AppDialogDeactivateTone;
  }

  if (tone === "danger") {
    return "error";
  }

  if (tone === AppDialogSuccessTone) {
    return AppDialogSuccessTone;
  }

  if (tone === "warning") {
    return "warning";
  }

  if (tone === "info") {
    return "info";
  }

  if (tone === "question") {
    return "question";
  }

  return null;
}

function getDefaultPendingLabel(tone: AppDialogTone) {
  if (tone === AppDialogActivateTone) {
    return "Activating...";
  }

  if (tone === AppDialogDeactivateTone) {
    return "Inactivating...";
  }

  return "Please wait...";
}

function getConfirmButtonClassName({ isDisabled, isPending, tone }: { isDisabled: boolean; isPending: boolean; tone: AppDialogTone }) {
  const baseClassName =
    "inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2";
  const disabledClassName = isDisabled && !isPending ? "cursor-not-allowed opacity-55" : "";
  const pendingClassName = isPending ? "cursor-wait opacity-100" : "";

  if (tone === "danger") {
    return `${baseClassName} ${disabledClassName} ${pendingClassName} bg-coralpink text-white hover:bg-coralpink/90 focus-visible:ring-coralpink/35`;
  }

  if (tone === AppDialogActivateTone) {
    return `${baseClassName} ${disabledClassName} ${pendingClassName} bg-emerald-500 text-white hover:bg-emerald-500/90 focus-visible:ring-emerald-500/35`;
  }

  if (tone === AppDialogSuccessTone) {
    return `${baseClassName} ${disabledClassName} ${pendingClassName} bg-emerald-500 text-white hover:bg-emerald-500/90 focus-visible:ring-emerald-500/35`;
  }

  if (tone === AppDialogDeactivateTone) {
    return `${baseClassName} ${disabledClassName} ${pendingClassName} bg-coralpink text-white hover:bg-coralpink/90 focus-visible:ring-coralpink/35`;
  }

  return `${baseClassName} ${disabledClassName} ${pendingClassName} app-dialog-primary-button`;
}
