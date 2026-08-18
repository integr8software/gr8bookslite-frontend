"use client";

import { useState } from "react";
import { Ban, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import { CashDisbursementViewActionButtonClassName } from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";
import {
  CashAdvanceStatuses,
  canApproveCashAdvanceStatus,
  canCancelCashAdvanceStatus,
  canDisapproveCashAdvanceStatus,
  getCashAdvanceStatusDialogCopy,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type { CashAdvanceRecord, CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function CashAdvanceViewActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus?: (status: CashAdvanceStatus) => void;
  record?: CashAdvanceRecord | null;
}) {
  const [statusToConfirm, setStatusToConfirm] = useState<CashAdvanceStatus | null>(null);
  const recordLabel = record?.transNo ?? "this cash advance";
  const statusDialogCopy = statusToConfirm ? getCashAdvanceStatusDialogCopy(statusToConfirm, recordLabel) : null;
  const actions = createCashAdvanceViewActionItems({
    onRequestStatusConfirmation: setStatusToConfirm,
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

function createCashAdvanceViewActionItems({
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
      onSelect: () => {
        if (isPosted) {
          onUpdateStatus?.(approvalUndoStatus);
          return;
        }

        onRequestStatusConfirmation(CashAdvanceStatuses.posted);
      },
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canDisapproveCashAdvanceStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => {
        if (isDisapproved) {
          onUpdateStatus?.(approvalUndoStatus);
          return;
        }

        onRequestStatusConfirmation(CashAdvanceStatuses.disapproved);
      },
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canCancelCashAdvanceStatus(status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      onSelect: () => {
        if (isCancelled) {
          onUpdateStatus?.(cancelStatus);
          return;
        }

        onRequestStatusConfirmation(cancelStatus);
      },
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
