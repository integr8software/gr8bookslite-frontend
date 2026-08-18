"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  PettyCashVoucherHref,
  PettyCashVoucherStatuses,
  canApprovePettyCashVoucherStatus,
  canCancelPettyCashVoucherStatus,
  canDisapprovePettyCashVoucherStatus,
  canEditPettyCashVoucherStatus,
  getPettyCashVoucherStatusDialogCopy,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type {
  PettyCashVoucherRecordActionsProps,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function PettyCashVoucherRecordActions({ onUpdateStatus, record }: PettyCashVoucherRecordActionsProps) {
  const [statusToConfirm, setStatusToConfirm] = useState<PettyCashVoucherStatus | null>(null);
  const isPosted = record.status === PettyCashVoucherStatuses.posted;
  const isDisapproved = record.status === PettyCashVoucherStatuses.disapproved;
  const isCancelled = record.status === PettyCashVoucherStatuses.cancelled;
  const undoStatus: PettyCashVoucherStatus = PettyCashVoucherStatuses.forApproval;
  const actionItems: ModuleActionMenuItem[] = [
    {
      href: `${PettyCashVoucherHref}/view/${record.id}`,
      icon: Eye,
      label: "View",
      type: "link",
    },
    ...(canEditPettyCashVoucherStatus(record.status)
      ? [
          {
            href: `${PettyCashVoucherHref}/edit/${record.id}`,
            icon: Edit3,
            label: "Edit",
            type: "link",
          } satisfies ModuleActionMenuItem,
        ]
      : []),
    {
      disabled: !canApprovePettyCashVoucherStatus(record.status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => setStatusToConfirm(isPosted ? undoStatus : PettyCashVoucherStatuses.posted),
      type: "button",
    },
    {
      disabled: !canDisapprovePettyCashVoucherStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => setStatusToConfirm(isDisapproved ? undoStatus : PettyCashVoucherStatuses.disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelPettyCashVoucherStatus(record.status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      onSelect: () => setStatusToConfirm(isCancelled ? undoStatus : PettyCashVoucherStatuses.cancelled),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];
  const dialogCopy = statusToConfirm ? getPettyCashVoucherStatusDialogCopy(statusToConfirm, record.voucherNo) : null;

  return (
    <>
      <ModuleTableActions className="w-full !justify-center">
        <ModuleActionMenu items={actionItems} label={`Actions for petty cash voucher ${record.voucherNo}`} />
      </ModuleTableActions>
      {dialogCopy && statusToConfirm ? (
        <AppDialog
          isOpen
          cancelLabel="Keep Current Status"
          confirmLabel={dialogCopy.confirmLabel}
          description={dialogCopy.description}
          iconTone={dialogCopy.iconTone}
          pendingLabel={dialogCopy.pendingLabel}
          title={dialogCopy.title}
          tone={dialogCopy.tone}
          onCancel={() => setStatusToConfirm(null)}
          onConfirm={async () => {
            await onUpdateStatus(record, statusToConfirm);
            setStatusToConfirm(null);
          }}
        />
      ) : null}
    </>
  );
}
