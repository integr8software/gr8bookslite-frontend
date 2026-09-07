"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  RevolvingFundReplenishmentStatuses,
  canEditRevolvingFundReplenishment,
  getRevolvingFundReplenishmentEditLink,
  getRevolvingFundReplenishmentViewLink,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import type {
  RevolvingFundReplenishmentRecord,
  RevolvingFundReplenishmentStatus,
  RevolvingFundReplenishmentUpdateStatusHandler,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function RevolvingFundReplenishmentRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: RevolvingFundReplenishmentUpdateStatusHandler;
  record: RevolvingFundReplenishmentRecord;
}) {
  const [status, setStatus] = useState<RevolvingFundReplenishmentStatus | null>(null);
  const isPosted = record.status === RevolvingFundReplenishmentStatuses.Posted;
  const isDisapproved = record.status === RevolvingFundReplenishmentStatuses.Disapproved;
  const isCancelled = record.status === RevolvingFundReplenishmentStatuses.Cancelled;
  const canEdit = canEditRevolvingFundReplenishment(record.status);
  const items: ModuleActionMenuItem[] = [
    {
      type: "button",
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      disabled: record.status !== RevolvingFundReplenishmentStatuses.ForApproval && !isPosted,
      onSelect: () =>
        isPosted
          ? onUpdateStatus(record, RevolvingFundReplenishmentStatuses.ForApproval)
          : setStatus(RevolvingFundReplenishmentStatuses.Posted),
    },
    {
      type: "button",
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      disabled: record.status !== RevolvingFundReplenishmentStatuses.ForApproval && !isDisapproved,
      tone: isDisapproved ? "default" : "danger",
      onSelect: () =>
        isDisapproved
          ? onUpdateStatus(record, RevolvingFundReplenishmentStatuses.ForApproval)
          : setStatus(RevolvingFundReplenishmentStatuses.Disapproved),
    },
    {
      type: "button",
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      disabled: isPosted || isDisapproved,
      tone: isCancelled ? "default" : "danger",
      onSelect: () =>
        isCancelled
          ? onUpdateStatus(record, RevolvingFundReplenishmentStatuses.Draft)
          : setStatus(RevolvingFundReplenishmentStatuses.Cancelled),
    },
  ];
  return (
    <>
      <ModuleTableActions className="w-full !justify-center">
        <ModuleTableActionLink
          href={getRevolvingFundReplenishmentViewLink(record.id)}
          icon={Eye}
          label={`View revolving fund replenishment ${record.transactionNo}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getRevolvingFundReplenishmentEditLink(record.id)}
            icon={Edit3}
            label={`Edit revolving fund replenishment ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit revolving fund replenishment ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={items}
          label={`More actions for revolving fund replenishment ${record.transactionNo}`}
        />
      </ModuleTableActions>
      {status ? (
        <AppDialog
          isOpen
          title={`Mark as ${status}?`}
          description={`This will update ${record.transactionNo} to ${status}.`}
          confirmLabel={`Mark as ${status}`}
          tone={status === RevolvingFundReplenishmentStatuses.Posted ? "success" : "danger"}
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
