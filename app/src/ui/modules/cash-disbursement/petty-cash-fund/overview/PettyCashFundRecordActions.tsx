"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  PettyCashFundStatuses,
  canEditPettyCashFund,
  getPettyCashFundEditLink,
  getPettyCashFundViewLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type {
  PettyCashFundRecord,
  PettyCashFundStatus,
  PettyCashFundUpdateStatusHandler,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function PettyCashFundRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: PettyCashFundUpdateStatusHandler;
  record: PettyCashFundRecord;
}) {
  const [status, setStatus] = useState<PettyCashFundStatus | null>(null);
  const isPosted = record.status === PettyCashFundStatuses.Posted;
  const isDisapproved = record.status === PettyCashFundStatuses.Disapproved;
  const isCancelled = record.status === PettyCashFundStatuses.Cancelled;
  const canEdit = canEditPettyCashFund(record.status);
  const items: ModuleActionMenuItem[] = [
    {
      type: "button",
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      disabled: record.status !== PettyCashFundStatuses.ForApproval && !isPosted,
      onSelect: () => (isPosted ? onUpdateStatus(record, PettyCashFundStatuses.ForApproval) : setStatus(PettyCashFundStatuses.Posted)),
    },
    {
      type: "button",
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      disabled: record.status !== PettyCashFundStatuses.ForApproval && !isDisapproved,
      tone: isDisapproved ? "default" : "danger",
      onSelect: () =>
        isDisapproved ? onUpdateStatus(record, PettyCashFundStatuses.ForApproval) : setStatus(PettyCashFundStatuses.Disapproved),
    },
    {
      type: "button",
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      disabled: record.status === PettyCashFundStatuses.Posted || record.status === PettyCashFundStatuses.Disapproved,
      tone: isCancelled ? "default" : "danger",
      onSelect: () => (isCancelled ? onUpdateStatus(record, PettyCashFundStatuses.Draft) : setStatus(PettyCashFundStatuses.Cancelled)),
    },
  ];

  return (
    <>
      <ModuleTableActions className="w-full !justify-center">
        <ModuleTableActionLink
          href={getPettyCashFundViewLink(record.id)}
          icon={Eye}
          label={`View petty cash fund ${record.transactionNo}`}
          title="View"
          variant="view"
        />
        {canEdit ? (
          <ModuleTableActionLink
            href={getPettyCashFundEditLink(record.id)}
            icon={Edit3}
            label={`Edit petty cash fund ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        ) : (
          <ModuleTableActionButton
            disabled
            icon={Edit3}
            label={`Edit petty cash fund ${record.transactionNo}`}
            title="Edit"
            variant="edit"
          />
        )}
        <ModuleActionMenu
          className="[&>button]:h-9 [&>button]:w-9"
          items={items}
          label={`More actions for petty cash fund ${record.transactionNo}`}
        />
      </ModuleTableActions>
      {status ? (
        <AppDialog
          isOpen
          title={`Mark as ${status}?`}
          description={`This will update ${record.transactionNo} to ${status}.`}
          confirmLabel={`Mark as ${status}`}
          tone={status === PettyCashFundStatuses.Posted ? "success" : "danger"}
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
