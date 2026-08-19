import {
  useState } from "react";
import { Ban,
  Edit3,
  Eye,
  ThumbsDown,
  ThumbsUp,
  Undo2 } from "lucide-react";
import {
  CashVoucherStatuses,
  canApproveCashVoucherStatus,
  canCancelCashVoucherStatus,
  canDisapproveCashVoucherStatus,
  canEditCashVoucherStatus,
  getCashVoucherStatusDialogCopy,
  getCashVoucherEditLink,
  getCashVoucherViewLink,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import type {
  CashVoucherPreviewRow,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

export function CashVoucherRecordActions({
  row,
  onUpdateStatus,
}: {
  row: CashVoucherPreviewRow;
  onUpdateStatus: (row: CashVoucherPreviewRow, status: CashVoucherStatus) => void;
}) {
  const [statusToConfirm, setStatusToConfirm] = useState<CashVoucherStatus | null>(null);
  const transactionId = row.transaction.id;
  const recordLabel = row.voucher?.voucherNo ?? row.transaction.transactionNo;
  const status = row.voucher?.status ?? row.transaction.status;
  const canEdit = row.voucher && canEditCashVoucherStatus(status);
  const isPosted = status === CashVoucherStatuses.posted;
  const isDisapproved = status === CashVoucherStatuses.disapproved;
  const isCancelled = status === CashVoucherStatuses.cancelled;
  const approvalUndoStatus: CashVoucherStatus = CashVoucherStatuses.forApproval;
  const cancelStatus: CashVoucherStatus = isCancelled
    ? row.voucher
      ? CashVoucherStatuses.draft
      : CashVoucherStatuses.forApproval
    : CashVoucherStatuses.cancelled;
  const statusDialogCopy = statusToConfirm ? getCashVoucherStatusDialogCopy(statusToConfirm, recordLabel, status) : null;
  const items: ModuleActionMenuItem[] = [
    {
      disabled: !canApproveCashVoucherStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => setStatusToConfirm(isPosted ? approvalUndoStatus : CashVoucherStatuses.posted),
      type: "button",
    },
    {
      disabled: !canDisapproveCashVoucherStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => setStatusToConfirm(isDisapproved ? approvalUndoStatus : CashVoucherStatuses.disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelCashVoucherStatus(status),
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
          href={getCashVoucherViewLink(transactionId)}
          icon={Eye}
          label={`View cash voucher ${recordLabel}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getCashVoucherEditLink(transactionId)}
            icon={Edit3}
            label={`Edit cash voucher ${recordLabel}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit cash voucher ${recordLabel}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={items}
          label={`More actions for cash voucher ${recordLabel}`}
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


