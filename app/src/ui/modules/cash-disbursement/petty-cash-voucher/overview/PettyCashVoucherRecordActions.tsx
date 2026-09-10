"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  PettyCashVoucherStatuses,
  canEditPettyCashVoucher,
  getPettyCashVoucherEditLink,
  getPettyCashVoucherViewLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type {
  PettyCashVoucherRecord,
  PettyCashVoucherStatus,
  PettyCashVoucherUpdateStatusHandler,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function PettyCashVoucherRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: PettyCashVoucherUpdateStatusHandler;
  record: PettyCashVoucherRecord;
}) {
  const [status, setStatus] = useState<PettyCashVoucherStatus | null>(null);
  const isPosted = record.status === PettyCashVoucherStatuses.Posted;
  const isDisapproved = record.status === PettyCashVoucherStatuses.Disapproved;
  const isCancelled = record.status === PettyCashVoucherStatuses.Cancelled;
  const canEdit = canEditPettyCashVoucher(record.status);
  const items: ModuleActionMenuItem[] = [
    {
      type: "button",
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      disabled: record.status !== PettyCashVoucherStatuses.ForApproval && !isPosted,
      onSelect: () => (isPosted ? onUpdateStatus(record, PettyCashVoucherStatuses.ForApproval) : setStatus(PettyCashVoucherStatuses.Posted)),
    },
    {
      type: "button",
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      disabled: record.status !== PettyCashVoucherStatuses.ForApproval && !isDisapproved,
      tone: isDisapproved ? "default" : "danger",
      onSelect: () =>
        isDisapproved ? onUpdateStatus(record, PettyCashVoucherStatuses.ForApproval) : setStatus(PettyCashVoucherStatuses.Disapproved),
    },
    {
      type: "button",
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      disabled: record.status === PettyCashVoucherStatuses.Posted || record.status === PettyCashVoucherStatuses.Disapproved,
      tone: isCancelled ? "default" : "danger",
      onSelect: () => (isCancelled ? onUpdateStatus(record, PettyCashVoucherStatuses.Draft) : setStatus(PettyCashVoucherStatuses.Cancelled)),
    },
  ];

  return (
    <>
      <ModuleTableActions className="w-full !justify-center">
        <ModuleTableActionLink
          href={getPettyCashVoucherViewLink(record.id)}
          icon={Eye}
          label={`View petty cash voucher ${record.transactionNo}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getPettyCashVoucherEditLink(record.id)}
            icon={Edit3}
            label={`Edit petty cash voucher ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit petty cash voucher ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={items}
          label={`More actions for petty cash voucher ${record.transactionNo}`}
        />
      </ModuleTableActions>
      {status ? (
        <AppDialog
          isOpen
          title={`Mark as ${status}?`}
          description={`This will update ${record.transactionNo} to ${status}.`}
          confirmLabel={`Mark as ${status}`}
          tone={status === PettyCashVoucherStatuses.Posted ? "success" : "danger"}
          onCancel={() => setStatus(null)}
          onConfirm={() => {
            onUpdateStatus(record, status);
            setStatus(null);
          }}
        />
      ) : null}
    </>
  );
}
