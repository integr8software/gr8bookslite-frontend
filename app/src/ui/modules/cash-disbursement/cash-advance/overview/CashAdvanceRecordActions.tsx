"use client";

import {
  useState } from "react";
import { Ban,
  Edit3,
  Eye,
  ThumbsDown,
  ThumbsUp,
  Undo2 } from "lucide-react";
import {
  CashAdvanceStatuses,
  canApproveCashAdvanceStatus,
  canCancelCashAdvanceStatus,
  canDisapproveCashAdvanceStatus,
  canEditCashAdvanceStatus,
  getCashAdvanceStatusDialogCopy,
  getCashAdvanceEditLink,
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
  const recordLabel = record.transNo;
  const status = record.status;
  const isPosted = status === CashAdvanceStatuses.posted;
  const isDisapproved = status === CashAdvanceStatuses.disapproved;
  const isCancelled = status === CashAdvanceStatuses.cancelled;
  const approvalUndoStatus: CashAdvanceStatus = CashAdvanceStatuses.forApproval;
  const cancelStatus: CashAdvanceStatus = isCancelled ? CashAdvanceStatuses.draft : CashAdvanceStatuses.cancelled;
  const statusDialogCopy = statusToConfirm ? getCashAdvanceStatusDialogCopy(statusToConfirm, recordLabel) : null;
  const canEdit = canEditCashAdvanceStatus(status);
  const items: ModuleActionMenuItem[] = [
    {
      disabled: !canApproveCashAdvanceStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => {
        if (isPosted) {
          onUpdateStatus(record, approvalUndoStatus);
          return;
        }

        setStatusToConfirm(CashAdvanceStatuses.posted);
      },
      type: "button",
    },
    {
      disabled: !canDisapproveCashAdvanceStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => {
        if (isDisapproved) {
          onUpdateStatus(record, approvalUndoStatus);
          return;
        }

        setStatusToConfirm(CashAdvanceStatuses.disapproved);
      },
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelCashAdvanceStatus(status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      onSelect: () => {
        if (isCancelled) {
          onUpdateStatus(record, cancelStatus);
          return;
        }

        setStatusToConfirm(CashAdvanceStatuses.cancelled);
      },
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
          label={`View cash advance ${recordLabel}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getCashAdvanceEditLink(record.id)}
            icon={Edit3}
            label={`Edit cash advance ${recordLabel}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit cash advance ${recordLabel}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={items}
          label={`More actions for cash advance ${recordLabel}`}
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
            if (!statusToConfirm) {
              return;
            }

            onUpdateStatus(record, statusToConfirm);
            setStatusToConfirm(null);
          }}
        />
      ) : null}
    </>
  );
}
