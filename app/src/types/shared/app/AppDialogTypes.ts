import type { ReactNode } from "react";

export type AppDialogTone = "default" | "danger" | "success" | "warning" | "info" | "question" | "activate" | "deactivate";

export type AppDialogIconTone =
  | "approve"
  | "activate"
  | "cancel"
  | "deactivate"
  | "disapprove"
  | "error"
  | "info"
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
  description: string;
  iconTone?: AppDialogIconTone | false;
  isOpen: boolean;
  isPending?: boolean;
  pendingLabel?: string;
  showCancel?: boolean;
  title: string;
  tone?: AppDialogTone;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};
