import type { ReactNode } from "react";

export type AppDialogTone = "default" | "neutral" | "danger" | "success" | "warning" | "info" | "question" | "activate" | "deactivate";

export type AppDialogIconTone =
  | "approve"
  | "activate"
  | "cancel"
  | "deactivate"
  | "disapprove"
  | "error"
  | "info"
  | "neutral"
  | "question"
  | "save"
  | "success"
  | "undo"
  | "update"
  | "warning";

export type AppDialogProps = {
  animateIcon?: boolean;
  cancelLabel?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  confirmIcon?: ReactNode;
  confirmLabel?: string;
  confirmationLabel?: string;
  confirmationPhrase?: string;
  content?: ReactNode;
  description: string;
  iconTone?: AppDialogIconTone | false;
  isOpen: boolean;
  isPending?: boolean;
  pendingLabel?: string;
  showCancel?: boolean;
  statusIcon?: ReactNode;
  title: string;
  tone?: AppDialogTone;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};
