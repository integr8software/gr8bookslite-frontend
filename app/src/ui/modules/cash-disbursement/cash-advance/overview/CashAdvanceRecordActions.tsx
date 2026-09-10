"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  CashAdvanceStatuses,
  canApproveCashAdvanceStatus,
  canCancelCashAdvanceStatus,
  canDisapproveCashAdvanceStatus,
  canEditCashAdvanceStatus,
  getCashAdvanceEditLink,
  getCashAdvanceStatusDialogCopy,
  getCashAdvanceViewLink,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type { CashAdvanceRecord, CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function CashAdvanceRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: (record: CashAdvanceRecord, status: CashAdvanceStatus) => void;
  record: CashAdvanceRecord;
}) {
  const [statusToConfirm, setStatusToConfirm] = useState<CashAdvanceStatus | null>(null);
  const status = record.status;
  const isPosted = status === CashAdvanceStatuses.Posted;
  const isDisapproved = status === CashAdvanceStatuses.Disapproved;
  const isCancelled = status === CashAdvanceStatuses.Cancelled;
  const approvalUndoStatus: CashAdvanceStatus = CashAdvanceStatuses.ForApproval;
  const cancelStatus: CashAdvanceStatus = isCancelled
    ? CashAdvanceStatuses.Draft
    : CashAdvanceStatuses.Cancelled;
  const statusDialogCopy = statusToConfirm
    ? getCashAdvanceStatusDialogCopy(statusToConfirm, record.transNo, status)
    : null;
  const canEdit = canEditCashAdvanceStatus(status);
  const items: ModuleActionMenuItem[] = [
    {
      disabled: !canApproveCashAdvanceStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => setStatusToConfirm(isPosted ? approvalUndoStatus : CashAdvanceStatuses.Posted),
      type: "button",
    },
    {
      disabled: !canDisapproveCashAdvanceStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () =>
        setStatusToConfirm(isDisapproved ? approvalUndoStatus : CashAdvanceStatuses.Disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelCashAdvanceStatus(status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      onSelect: () => setStatusToConfirm(cancelStatus),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];

  return (
    <>
      <ModuleTableActions className="!justify-center">
        <ModuleTableActionLink
          href={getCashAdvanceViewLink(record.id)}
          icon={Eye}
          label={`View Cash Advance ${record.transNo}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getCashAdvanceEditLink(record.id)}
            icon={Edit3}
            label={`Edit Cash Advance ${record.transNo}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit Cash Advance ${record.transNo}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={items}
          label={`More actions for Cash Advance ${record.transNo}`}
        />
      </ModuleTableActions>

      {statusDialogCopy ? (
        <AppDialog
          isOpen={statusToConfirm !== null}
          title={statusDialogCopy.title}
          description={statusDialogCopy.description}
          confirmLabel={statusDialogCopy.confirmLabel}
          cancelLabel="Cancel"
          iconTone={statusDialogCopy.iconTone}
          pendingLabel={statusDialogCopy.pendingLabel}
          tone={statusDialogCopy.tone}
          onConfirm={() => {
            if (!statusToConfirm) return;
            const targetStatus = statusToConfirm;
            setStatusToConfirm(null);
            onUpdateStatus(record, targetStatus);
          }}
          onCancel={() => setStatusToConfirm(null)}
        />
      ) : null}
    </>
  );
}
