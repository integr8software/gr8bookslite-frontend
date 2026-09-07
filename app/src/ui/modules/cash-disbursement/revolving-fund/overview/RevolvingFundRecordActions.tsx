"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  RevolvingFundStatuses,
  canEditRevolvingFund,
  getRevolvingFundEditLink,
  getRevolvingFundViewLink,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import type {
  RevolvingFundRecord,
  RevolvingFundStatus,
  RevolvingFundUpdateStatusHandler,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function RevolvingFundRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: RevolvingFundUpdateStatusHandler;
  record: RevolvingFundRecord;
}) {
  const [status, setStatus] = useState<RevolvingFundStatus | null>(null);
  const isPosted = record.status === RevolvingFundStatuses.Posted;
  const isDisapproved = record.status === RevolvingFundStatuses.Disapproved;
  const isCancelled = record.status === RevolvingFundStatuses.Cancelled;
  const canEdit = canEditRevolvingFund(record.status);
  const items: ModuleActionMenuItem[] = [
    {
      type: "button",
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      disabled: record.status !== RevolvingFundStatuses.ForApproval && !isPosted,
      onSelect: () => (isPosted ? onUpdateStatus(record, RevolvingFundStatuses.ForApproval) : setStatus(RevolvingFundStatuses.Posted)),
    },
    {
      type: "button",
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      disabled: record.status !== RevolvingFundStatuses.ForApproval && !isDisapproved,
      tone: isDisapproved ? "default" : "danger",
      onSelect: () =>
        isDisapproved ? onUpdateStatus(record, RevolvingFundStatuses.ForApproval) : setStatus(RevolvingFundStatuses.Disapproved),
    },
    {
      type: "button",
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      disabled: record.status === RevolvingFundStatuses.Posted || record.status === RevolvingFundStatuses.Disapproved,
      tone: isCancelled ? "default" : "danger",
      onSelect: () => (isCancelled ? onUpdateStatus(record, RevolvingFundStatuses.Draft) : setStatus(RevolvingFundStatuses.Cancelled)),
    },
  ];

  return (
    <>
      <ModuleTableActions className="w-full !justify-center">
        <ModuleTableActionLink
          href={getRevolvingFundViewLink(record.id)}
          icon={Eye}
          label={`View revolving fund ${record.transactionNo}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getRevolvingFundEditLink(record.id)}
            icon={Edit3}
            label={`Edit revolving fund ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit revolving fund ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={items}
          label={`More actions for revolving fund ${record.transactionNo}`}
        />
      </ModuleTableActions>
      {status ? (
        <AppDialog
          isOpen
          title={`Mark as ${status}?`}
          description={`This will update ${record.transactionNo} to ${status}.`}
          confirmLabel={`Mark as ${status}`}
          tone={status === RevolvingFundStatuses.Posted ? "success" : "danger"}
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
