import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  DisbursementVoucherStatuses,
  canApproveDisbursementVoucherStatus,
  canCancelDisbursementVoucherStatus,
  canDisapproveDisbursementVoucherStatus,
  canEditDisbursementVoucherStatus,
  getDisbursementVoucherStatusDialogCopy,
  getDisbursementVoucherEditLink,
  getDisbursementVoucherViewLink,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type {
  DisbursementVoucherPreviewRow,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

export function DisbursementVoucherRecordActions({
  row,
  onUpdateStatus,
}: {
  row: DisbursementVoucherPreviewRow;
  onUpdateStatus: (row: DisbursementVoucherPreviewRow, status: DisbursementVoucherStatus) => void;
}) {
  const [statusToConfirm, setStatusToConfirm] = useState<DisbursementVoucherStatus | null>(null);
  const transactionId = row.transaction.id;
  const recordLabel = row.voucher?.voucherNo ?? row.transaction.transactionNo;
  const status = row.voucher?.status ?? row.transaction.status;
  const canEdit = row.voucher && canEditDisbursementVoucherStatus(status);
  const isPosted = status === DisbursementVoucherStatuses.posted;
  const isDisapproved = status === DisbursementVoucherStatuses.disapproved;
  const isCancelled = status === DisbursementVoucherStatuses.cancelled;
  const approvalUndoStatus: DisbursementVoucherStatus = DisbursementVoucherStatuses.forApproval;
  const cancelStatus: DisbursementVoucherStatus = isCancelled
    ? row.voucher
      ? DisbursementVoucherStatuses.draft
      : DisbursementVoucherStatuses.forApproval
    : DisbursementVoucherStatuses.cancelled;
  const statusDialogCopy = statusToConfirm ? getDisbursementVoucherStatusDialogCopy(statusToConfirm, recordLabel, status) : null;
  const items: ModuleActionMenuItem[] = [
    {
      disabled: !canApproveDisbursementVoucherStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => setStatusToConfirm(isPosted ? approvalUndoStatus : DisbursementVoucherStatuses.posted),
      type: "button",
    },
    {
      disabled: !canDisapproveDisbursementVoucherStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => setStatusToConfirm(isDisapproved ? approvalUndoStatus : DisbursementVoucherStatuses.disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelDisbursementVoucherStatus(status),
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
          href={getDisbursementVoucherViewLink(transactionId)}
          icon={Eye}
          label={`View disbursement voucher ${recordLabel}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getDisbursementVoucherEditLink(transactionId)}
            icon={Edit3}
            label={`Edit disbursement voucher ${recordLabel}`}
            title="Edit"
            variant="edit"
          />
        ) : null}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={items}
          label={`More actions for disbursement voucher ${recordLabel}`}
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

            onUpdateStatus(row, statusToConfirm);
            setStatusToConfirm(null);
          }}
        />
      ) : null}
    </>
  );
}
