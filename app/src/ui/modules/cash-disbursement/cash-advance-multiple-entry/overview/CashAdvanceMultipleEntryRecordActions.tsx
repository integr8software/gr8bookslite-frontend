"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  CashAdvanceMultipleEntryStatuses,
  getCashAdvanceMultipleEntryEditLink,
  getCashAdvanceMultipleEntryStatusDialogCopy,
  getCashAdvanceMultipleEntryViewLink,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import type { CashAdvanceMultipleEntryRecord } from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function CashAdvanceMultipleEntryRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: (record: CashAdvanceMultipleEntryRecord, status: CashAdvanceStatus) => void;
  record: CashAdvanceMultipleEntryRecord;
}) {
  const [statusToConfirm, setStatusToConfirm] = useState<CashAdvanceStatus | null>(null);
  const status = record.status;
  const isPosted = status === CashAdvanceMultipleEntryStatuses.posted;
  const isDisapproved = status === CashAdvanceMultipleEntryStatuses.disapproved;
  const isCancelled = status === CashAdvanceMultipleEntryStatuses.cancelled;
  const approvalUndoStatus: CashAdvanceStatus = CashAdvanceMultipleEntryStatuses.forApproval;
  const cancelStatus: CashAdvanceStatus = isCancelled
    ? CashAdvanceMultipleEntryStatuses.draft
    : CashAdvanceMultipleEntryStatuses.cancelled;
  const statusDialogCopy = statusToConfirm
    ? getCashAdvanceMultipleEntryStatusDialogCopy(statusToConfirm, record.transNo, status)
    : null;
  const canEdit = canEditStatus(status);
  const items: ModuleActionMenuItem[] = [
    {
      disabled: !canApproveStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => setStatusToConfirm(isPosted ? approvalUndoStatus : CashAdvanceMultipleEntryStatuses.posted),
      type: "button",
    },
    {
      disabled: !canDisapproveStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () =>
        setStatusToConfirm(isDisapproved ? approvalUndoStatus : CashAdvanceMultipleEntryStatuses.disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelStatus(status),
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
          href={getCashAdvanceMultipleEntryViewLink(record.id)}
          icon={Eye}
          label={`View Cash Advance Multiple Entry ${record.transNo}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getCashAdvanceMultipleEntryEditLink(record.id)}
            icon={Edit3}
            label={`Edit Cash Advance Multiple Entry ${record.transNo}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit Cash Advance Multiple Entry ${record.transNo}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={items}
          label={`More actions for Cash Advance Multiple Entry ${record.transNo}`}
        />
      </ModuleTableActions>
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
            if (statusToConfirm) onUpdateStatus(record, statusToConfirm);
            setStatusToConfirm(null);
          }}
        />
      ) : null}
    </>
  );
}

function canEditStatus(status: CashAdvanceStatus) {
  return status === CashAdvanceMultipleEntryStatuses.draft || status === CashAdvanceMultipleEntryStatuses.forApproval;
}

function canApproveStatus(status: CashAdvanceStatus) {
  return status === CashAdvanceMultipleEntryStatuses.forApproval || status === CashAdvanceMultipleEntryStatuses.posted;
}

function canDisapproveStatus(status: CashAdvanceStatus) {
  return status === CashAdvanceMultipleEntryStatuses.forApproval || status === CashAdvanceMultipleEntryStatuses.disapproved;
}

function canCancelStatus(status: CashAdvanceStatus) {
  return (
    status === CashAdvanceMultipleEntryStatuses.draft ||
    status === CashAdvanceMultipleEntryStatuses.forApproval ||
    status === CashAdvanceMultipleEntryStatuses.cancelled
  );
}
