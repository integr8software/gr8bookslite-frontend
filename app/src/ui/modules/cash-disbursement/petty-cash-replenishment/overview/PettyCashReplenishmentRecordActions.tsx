"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  PettyCashReplenishmentStatuses,
  canEditPettyCashReplenishment,
  getPettyCashReplenishmentEditLink,
  getPettyCashReplenishmentViewLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import type {
  PettyCashReplenishmentRecord,
  PettyCashReplenishmentStatus,
  PettyCashReplenishmentUpdateStatusHandler,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function PettyCashReplenishmentRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: PettyCashReplenishmentUpdateStatusHandler;
  record: PettyCashReplenishmentRecord;
}) {
  const [status, setStatus] = useState<PettyCashReplenishmentStatus | null>(null);
  const isPosted = record.status === PettyCashReplenishmentStatuses.Posted;
  const isDisapproved = record.status === PettyCashReplenishmentStatuses.Disapproved;
  const isCancelled = record.status === PettyCashReplenishmentStatuses.Cancelled;
  const canEdit = canEditPettyCashReplenishment(record.status);
  const items: ModuleActionMenuItem[] = [
    {
      type: "button",
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      disabled: record.status !== PettyCashReplenishmentStatuses.ForApproval && !isPosted,
      onSelect: () =>
        isPosted
          ? onUpdateStatus(record, PettyCashReplenishmentStatuses.ForApproval)
          : setStatus(PettyCashReplenishmentStatuses.Posted),
    },
    {
      type: "button",
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      disabled: record.status !== PettyCashReplenishmentStatuses.ForApproval && !isDisapproved,
      tone: isDisapproved ? "default" : "danger",
      onSelect: () =>
        isDisapproved
          ? onUpdateStatus(record, PettyCashReplenishmentStatuses.ForApproval)
          : setStatus(PettyCashReplenishmentStatuses.Disapproved),
    },
    {
      type: "button",
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      disabled: isPosted || isDisapproved,
      tone: isCancelled ? "default" : "danger",
      onSelect: () =>
        isCancelled
          ? onUpdateStatus(record, PettyCashReplenishmentStatuses.Draft)
          : setStatus(PettyCashReplenishmentStatuses.Cancelled),
    },
  ];
  return (
    <>
      <ModuleTableActions className="w-full !justify-center">
        <ModuleTableActionLink
          href={getPettyCashReplenishmentViewLink(record.id)}
          icon={Eye}
          label={`View petty cash replenishment ${record.transactionNo}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getPettyCashReplenishmentEditLink(record.id)}
            icon={Edit3}
            label={`Edit petty cash replenishment ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit petty cash replenishment ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={items}
          label={`More actions for petty cash replenishment ${record.transactionNo}`}
        />
      </ModuleTableActions>
      {status ? (
        <AppDialog
          isOpen
          title={`Mark as ${status}?`}
          description={`This will update ${record.transactionNo} to ${status}.`}
          confirmLabel={`Mark as ${status}`}
          tone={status === PettyCashReplenishmentStatuses.Posted ? "success" : "danger"}
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
