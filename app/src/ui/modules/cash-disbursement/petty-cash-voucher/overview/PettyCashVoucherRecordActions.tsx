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
  PettyCashVoucherStatuses,
  canApprovePettyCashVoucherStatus,
  canCancelPettyCashVoucherStatus,
  canDisapprovePettyCashVoucherStatus,
  canEditPettyCashVoucherStatus,
  getPettyCashVoucherStatusDialogCopy,
  getPettyCashVoucherEditLink,
  getPettyCashVoucherViewLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type {
  PettyCashVoucherRecordActionsProps,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function PettyCashVoucherRecordActions({ onUpdateStatus, record }: PettyCashVoucherRecordActionsProps) {
  const [statusToConfirm, setStatusToConfirm] = useState<PettyCashVoucherStatus | null>(null);
  const isPosted = record.status === PettyCashVoucherStatuses.Posted;
  const isDisapproved = record.status === PettyCashVoucherStatuses.Disapproved;
  const isCancelled = record.status === PettyCashVoucherStatuses.Cancelled;
  const undoStatus: PettyCashVoucherStatus = PettyCashVoucherStatuses.ForApproval;
  const canEdit = canEditPettyCashVoucherStatus(record.status);
  const actionItems: ModuleActionMenuItem[] = [
    {
      disabled: !canApprovePettyCashVoucherStatus(record.status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => setStatusToConfirm(isPosted ? undoStatus : PettyCashVoucherStatuses.Posted),
      type: "button",
    },
    {
      disabled: !canDisapprovePettyCashVoucherStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => setStatusToConfirm(isDisapproved ? undoStatus : PettyCashVoucherStatuses.Disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelPettyCashVoucherStatus(record.status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      onSelect: () => setStatusToConfirm(isCancelled ? undoStatus : PettyCashVoucherStatuses.Cancelled),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];
  const dialogCopy = statusToConfirm ? getPettyCashVoucherStatusDialogCopy(statusToConfirm, record.voucherNo) : null;

  return (
    <>
      <ModuleTableActions className="w-full !justify-center">
        <ModuleTableActionLink
          href={getPettyCashVoucherViewLink(record.id)}
          icon={Eye}
          label={`View petty cash voucher ${record.voucherNo}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getPettyCashVoucherEditLink(record.id)}
            icon={Edit3}
            label={`Edit petty cash voucher ${record.voucherNo}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit petty cash voucher ${record.voucherNo}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={actionItems}
          label={`More actions for petty cash voucher ${record.voucherNo}`}
        />
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
