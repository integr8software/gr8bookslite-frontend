"use client";

import { useState } from "react";
import { Ban, Eye, Pencil, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  CashAdvanceHref,
  CashAdvanceStatuses,
  canApproveCashAdvanceStatus,
  canCancelCashAdvanceStatus,
  canDisapproveCashAdvanceStatus,
  canEditCashAdvanceStatus,
  getCashAdvanceStatusDialogCopy,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type {
  CashAdvanceRecord,
  CashAdvanceStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

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
  const items: ModuleActionMenuItem[] = [
    {
      href: `${CashAdvanceHref}/view/${record.id}`,
      icon: Eye,
      label: "View",
      type: "link",
    },
    ...(canEditCashAdvanceStatus(status)
      ? [
          {
            href: `${CashAdvanceHref}/edit/${record.id}`,
            icon: Pencil,
            label: "Edit",
            type: "link",
          } satisfies ModuleActionMenuItem,
        ]
      : []),
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
        <ModuleActionMenu
          items={items}
          label={`Actions for cash advance ${record.transNo}`}
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
