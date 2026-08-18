import { useState } from "react";
import { Ban, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import { CashDisbursementViewActionButtonClassName } from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";
import {
  DisbursementVoucherStatuses,
  canApproveDisbursementVoucherStatus,
  canCancelDisbursementVoucherStatus,
  canDisapproveDisbursementVoucherStatus,
  getDisbursementVoucherStatusDialogCopy,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type {
  DisbursementTransactionRecord,
  DisbursementVoucherRecord,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { DisbursementVoucherActionHistory } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherActionHistory";

export function DisbursementVoucherViewActions({
  onUpdateStatus,
  onPreview,
  transaction,
  voucher,
}: {
  onUpdateStatus?: (status: DisbursementVoucherStatus) => void;
  onPreview?: () => void;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  const [statusToConfirm, setStatusToConfirm] = useState<DisbursementVoucherStatus | null>(null);
  const recordLabel = voucher?.voucherNo ?? transaction?.transactionNo ?? "this disbursement voucher";
  const statusDialogCopy = statusToConfirm
    ? getDisbursementVoucherStatusDialogCopy(statusToConfirm, recordLabel, voucher?.status ?? transaction?.status)
    : null;
  const actions = createDisbursementVoucherViewActionItems({
    onRequestStatusConfirmation: setStatusToConfirm,
    onUpdateStatus,
    transaction,
    voucher,
  });
  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        {onPreview ? <ReportPreviewAction onPreview={onPreview} /> : null}
        <DisbursementVoucherActionHistory transaction={transaction} voucher={voucher} />
        <ModuleActionMenu items={actions} label="Disbursement voucher actions" />
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">
        {onPreview ? <ReportPreviewAction onPreview={onPreview} /> : null}
        <DisbursementVoucherActionHistory transaction={transaction} voucher={voucher} />
        {actions.map((action) => {
          if (action.type === "button") {
            return <HeaderActionButton key={action.label} action={action} />;
          }

          return null;
        })}
      </div>
      {statusDialogCopy ? (
        <AppDialog
          isOpen
          title={statusDialogCopy.title}
          description={statusDialogCopy.description}
          cancelLabel="Keep Current Status"
          confirmLabel={statusDialogCopy.confirmLabel}
          iconTone={statusDialogCopy.iconTone}
          pendingLabel={statusDialogCopy.pendingLabel}
          tone={statusDialogCopy.tone}
          onCancel={() => setStatusToConfirm(null)}
          onConfirm={() => {
            if (!statusToConfirm) {
              return;
            }

            onUpdateStatus?.(statusToConfirm);
            setStatusToConfirm(null);
          }}
        />
      ) : null}
    </>
  );
}

function createDisbursementVoucherViewActionItems({
  onRequestStatusConfirmation,
  onUpdateStatus,
  transaction,
  voucher,
}: {
  onRequestStatusConfirmation: (status: DisbursementVoucherStatus) => void;
  onUpdateStatus?: (status: DisbursementVoucherStatus) => void;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  const status = voucher?.status ?? transaction?.status ?? DisbursementVoucherStatuses.draft;
  const isPosted = status === DisbursementVoucherStatuses.posted;
  const isDisapproved = status === DisbursementVoucherStatuses.disapproved;
  const isCancelled = status === DisbursementVoucherStatuses.cancelled;
  const approvalUndoStatus: DisbursementVoucherStatus = DisbursementVoucherStatuses.forApproval;
  const cancelStatus: DisbursementVoucherStatus = isCancelled
    ? voucher
      ? DisbursementVoucherStatuses.draft
      : DisbursementVoucherStatuses.forApproval
    : DisbursementVoucherStatuses.cancelled;
  const actions: ModuleActionMenuItem[] = [
    {
      disabled: !onUpdateStatus || !canApproveDisbursementVoucherStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => onRequestStatusConfirmation(isPosted ? approvalUndoStatus : DisbursementVoucherStatuses.posted),
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canDisapproveDisbursementVoucherStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => onRequestStatusConfirmation(isDisapproved ? approvalUndoStatus : DisbursementVoucherStatuses.disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canCancelDisbursementVoucherStatus(status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      onSelect: () => onRequestStatusConfirmation(cancelStatus),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];

  return actions;
}

function HeaderActionButton({ action }: { action: Extract<ModuleActionMenuItem, { type: "button" }> }) {
  const Icon = action.icon;
  const className = getViewActionButtonClassName(action);

  return (
    <button type="button" disabled={action.disabled} onClick={action.onSelect} className={className}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {action.label}
    </button>
  );
}

function getViewActionButtonClassName(action: Extract<ModuleActionMenuItem, { type: "button" }>) {
  if (action.label === "Approve") {
    return `${CashDisbursementViewActionButtonClassName} border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500/15`;
  }

  if (action.label === "Disapprove") {
    return `${CashDisbursementViewActionButtonClassName} border-red-200 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-500/15`;
  }

  if (action.label === "Cancel") {
    return `${CashDisbursementViewActionButtonClassName} border-amber-200 bg-white text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-500/15`;
  }

  if (action.label === "Undo Approved" || action.label === "Undo Disapproved" || action.label === "Undo Cancelled") {
    return `${CashDisbursementViewActionButtonClassName} border-skyblue/35 bg-skyblue/10 text-skyblue hover:bg-skyblue/15 focus-visible:ring-skyblue/20`;
  }

  if (action.tone === "danger") {
    return `${CashDisbursementViewActionButtonClassName} border-coralpink/45 bg-coralpink/5 text-coralpink hover:bg-coralpink/10 focus-visible:ring-coralpink/20`;
  }

  return moduleHeaderActionClassNames.secondary;
}
