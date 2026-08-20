import { Ban, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import { CashDisbursementStatusActionButtonClassName } from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";
import {
  CashAdvanceStatuses,
  canApproveCashAdvanceStatus,
  canCancelCashAdvanceStatus,
  canDisapproveCashAdvanceStatus,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type { CashAdvanceRecord, CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function CashAdvanceStatusActions({
  onRequestStatusConfirmation,
  onUpdateStatus,
  record,
}: {
  onRequestStatusConfirmation: (status: CashAdvanceStatus) => void;
  onUpdateStatus?: (status: CashAdvanceStatus) => void;
  record?: CashAdvanceRecord | null;
}) {
  const actions = createCashAdvanceStatusActionItems({
    onRequestStatusConfirmation,
    onUpdateStatus,
    record,
  });

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        <ModuleActionMenu items={actions} label="Cash advance actions" />
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">
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

function createCashAdvanceStatusActionItems({
  onRequestStatusConfirmation,
  onUpdateStatus,
  record,
}: {
  onRequestStatusConfirmation: (status: CashAdvanceStatus) => void;
  onUpdateStatus?: (status: CashAdvanceStatus) => void;
  record?: CashAdvanceRecord | null;
}) {
  const status = record?.status ?? CashAdvanceStatuses.draft;
  const isPosted = status === CashAdvanceStatuses.posted;
  const isDisapproved = status === CashAdvanceStatuses.disapproved;
  const isCancelled = status === CashAdvanceStatuses.cancelled;
  const approvalUndoStatus: CashAdvanceStatus = CashAdvanceStatuses.forApproval;
  const cancelStatus: CashAdvanceStatus = isCancelled ? CashAdvanceStatuses.draft : CashAdvanceStatuses.cancelled;
  const actions: ModuleActionMenuItem[] = [
    {
      disabled: !onUpdateStatus || !canApproveCashAdvanceStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => onRequestStatusConfirmation(isPosted ? approvalUndoStatus : CashAdvanceStatuses.posted),
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canDisapproveCashAdvanceStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => onRequestStatusConfirmation(isDisapproved ? approvalUndoStatus : CashAdvanceStatuses.disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canCancelCashAdvanceStatus(status),
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
