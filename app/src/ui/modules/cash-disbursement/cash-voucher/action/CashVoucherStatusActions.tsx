import { Ban, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import { CashDisbursementStatusActionButtonClassName } from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";
import {
  CashVoucherStatuses,
  canApproveCashVoucherStatus,
  canCancelCashVoucherStatus,
  canDisapproveCashVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import type {
  CashVoucherTransactionRecord,
  CashVoucherRecord,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { VoucherReportPreviewFormat } from "@/app/src/types/shared/reports/ReportTypes";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { VoucherReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { CashVoucherActionHistory } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/action/CashVoucherActionHistory";

export function CashVoucherStatusActions({
  onRequestStatusConfirmation,
  onUpdateStatus,
  onPreview,
  transaction,
  voucher,
}: {
  onRequestStatusConfirmation: (status: CashVoucherStatus) => void;
  onUpdateStatus?: (status: CashVoucherStatus) => void;
  onPreview?: (format: VoucherReportPreviewFormat) => void;
  transaction?: CashVoucherTransactionRecord;
  voucher?: CashVoucherRecord;
}) {
  const actions = createCashVoucherStatusActionItems({
    onRequestStatusConfirmation,
    onUpdateStatus,
    transaction,
    voucher,
  });
  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        {onPreview ? <VoucherReportPreviewAction onPreview={onPreview} /> : null}
        <CashVoucherActionHistory transaction={transaction} voucher={voucher} />
        <ModuleActionMenu items={actions} label="Cash Voucher Actions" />
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">
        {onPreview ? <VoucherReportPreviewAction onPreview={onPreview} /> : null}
        <CashVoucherActionHistory transaction={transaction} voucher={voucher} />
        {actions.map((action) => {
          if (action.type === "button") {
            return <HeaderActionButton key={action.label} action={action} />;
          }

          return null;
        })}
      </div>
    </>
  );
}

function createCashVoucherStatusActionItems({
  onRequestStatusConfirmation,
  onUpdateStatus,
  transaction,
  voucher,
}: {
  onRequestStatusConfirmation: (status: CashVoucherStatus) => void;
  onUpdateStatus?: (status: CashVoucherStatus) => void;
  transaction?: CashVoucherTransactionRecord;
  voucher?: CashVoucherRecord;
}) {
  const status = voucher?.status ?? transaction?.status ?? CashVoucherStatuses.draft;
  const isPosted = status === CashVoucherStatuses.posted;
  const isDisapproved = status === CashVoucherStatuses.disapproved;
  const isCancelled = status === CashVoucherStatuses.cancelled;
  const approvalUndoStatus: CashVoucherStatus = CashVoucherStatuses.forApproval;
  const cancelStatus: CashVoucherStatus = isCancelled
    ? voucher
      ? CashVoucherStatuses.draft
      : CashVoucherStatuses.forApproval
    : CashVoucherStatuses.cancelled;
  const actions: ModuleActionMenuItem[] = [
    {
      disabled: !onUpdateStatus || !canApproveCashVoucherStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => onRequestStatusConfirmation(isPosted ? approvalUndoStatus : CashVoucherStatuses.posted),
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canDisapproveCashVoucherStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => onRequestStatusConfirmation(isDisapproved ? approvalUndoStatus : CashVoucherStatuses.disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canCancelCashVoucherStatus(status),
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
  const className = getStatusActionButtonClassName(action);

  return (
    <button type="button" disabled={action.disabled} onClick={action.onSelect} className={className}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {action.label}
    </button>
  );
}

function getStatusActionButtonClassName(action: Extract<ModuleActionMenuItem, { type: "button" }>) {
  if (action.label === "Approve") {
    return `${CashDisbursementStatusActionButtonClassName} border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500/15`;
  }

  if (action.label === "Disapprove") {
    return `${CashDisbursementStatusActionButtonClassName} border-red-200 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-500/15`;
  }

  if (action.label === "Cancel") {
    return `${CashDisbursementStatusActionButtonClassName} border-amber-200 bg-white text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-500/15`;
  }

  if (action.label === "Undo Approved" || action.label === "Undo Disapproved" || action.label === "Undo Cancelled") {
    return `${CashDisbursementStatusActionButtonClassName} border-skyblue/35 bg-skyblue/10 text-skyblue hover:bg-skyblue/15 focus-visible:ring-skyblue/20`;
  }

  if (action.tone === "danger") {
    return `${CashDisbursementStatusActionButtonClassName} border-coralpink/45 bg-coralpink/5 text-coralpink hover:bg-coralpink/10 focus-visible:ring-coralpink/20`;
  }

  return moduleHeaderActionClassNames.secondary;
}
