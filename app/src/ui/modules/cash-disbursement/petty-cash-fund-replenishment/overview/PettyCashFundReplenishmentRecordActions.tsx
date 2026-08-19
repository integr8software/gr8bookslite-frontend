"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  PettyCashFundReplenishmentStatuses,
  canEditPettyCashFundReplenishment,
  getPettyCashFundReplenishmentEditLink,
  getPettyCashFundReplenishmentViewLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import type {
  PettyCashFundReplenishmentRecord,
  PettyCashFundReplenishmentStatus,
  PettyCashFundReplenishmentUpdateStatusHandler,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function PettyCashFundReplenishmentRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: PettyCashFundReplenishmentUpdateStatusHandler;
  record: PettyCashFundReplenishmentRecord;
}) {
  const [status, setStatus] = useState<PettyCashFundReplenishmentStatus | null>(null);
  const isPosted = record.status === PettyCashFundReplenishmentStatuses.posted;
  const isDisapproved = record.status === PettyCashFundReplenishmentStatuses.disapproved;
  const isCancelled = record.status === PettyCashFundReplenishmentStatuses.cancelled;
  const canEdit = canEditPettyCashFundReplenishment(record.status);
  const items: ModuleActionMenuItem[] = [
    {
      type: "button",
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      disabled: record.status !== PettyCashFundReplenishmentStatuses.forApproval && !isPosted,
      onSelect: () =>
        isPosted
          ? onUpdateStatus(record, PettyCashFundReplenishmentStatuses.forApproval)
          : setStatus(PettyCashFundReplenishmentStatuses.posted),
    },
    {
      type: "button",
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      disabled: record.status !== PettyCashFundReplenishmentStatuses.forApproval && !isDisapproved,
      tone: isDisapproved ? "default" : "danger",
      onSelect: () =>
        isDisapproved
          ? onUpdateStatus(record, PettyCashFundReplenishmentStatuses.forApproval)
          : setStatus(PettyCashFundReplenishmentStatuses.disapproved),
    },
    {
      type: "button",
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      disabled: isPosted || isDisapproved,
      tone: isCancelled ? "default" : "danger",
      onSelect: () =>
        isCancelled
          ? onUpdateStatus(record, PettyCashFundReplenishmentStatuses.draft)
          : setStatus(PettyCashFundReplenishmentStatuses.cancelled),
    },
  ];
  return (
    <>
      <ModuleTableActions className="w-full !justify-center">
        <ModuleTableActionLink
          href={getPettyCashFundReplenishmentViewLink(record.id)}
          icon={Eye}
          label={`View petty cash fund replenishment ${record.transactionNo}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getPettyCashFundReplenishmentEditLink(record.id)}
            icon={Edit3}
            label={`Edit petty cash fund replenishment ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit petty cash fund replenishment ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={items}
          label={`More actions for petty cash fund replenishment ${record.transactionNo}`}
        />
      </ModuleTableActions>
      {status ? (
        <AppDialog
          isOpen
          title={`Mark as ${status}?`}
          description={`This will update ${record.transactionNo} to ${status}.`}
          confirmLabel={`Mark as ${status}`}
          tone={status === PettyCashFundReplenishmentStatuses.posted ? "success" : "danger"}
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
