"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  RevolvingFundHref,
  RevolvingFundStatuses,
  canEditRevolvingFund,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund/RevolvingFundConstants";
import type {
  RevolvingFundRecord,
  RevolvingFundStatus,
  RevolvingFundUpdateStatusHandler,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function RevolvingFundRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: RevolvingFundUpdateStatusHandler;
  record: RevolvingFundRecord;
}) {
  const [status, setStatus] = useState<RevolvingFundStatus | null>(null);
  const isPosted = record.status === RevolvingFundStatuses.posted;
  const isDisapproved = record.status === RevolvingFundStatuses.disapproved;
  const isCancelled = record.status === RevolvingFundStatuses.cancelled;
  const items: ModuleActionMenuItem[] = [
    { type: "link", href: `${RevolvingFundHref}/view/${record.id}`, icon: Eye, label: "View" },
    ...(canEditRevolvingFund(record.status)
      ? [{ type: "link" as const, href: `${RevolvingFundHref}/edit/${record.id}`, icon: Edit3, label: "Edit" }]
      : []),
    {
      type: "button",
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      disabled: record.status !== RevolvingFundStatuses.forApproval && !isPosted,
      onSelect: () => isPosted
        ? onUpdateStatus(record, RevolvingFundStatuses.forApproval)
        : setStatus(RevolvingFundStatuses.posted),
    },
    {
      type: "button",
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      disabled: record.status !== RevolvingFundStatuses.forApproval && !isDisapproved,
      tone: isDisapproved ? "default" : "danger",
      onSelect: () => isDisapproved
        ? onUpdateStatus(record, RevolvingFundStatuses.forApproval)
        : setStatus(RevolvingFundStatuses.disapproved),
    },
    {
      type: "button",
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      disabled: record.status === RevolvingFundStatuses.posted || record.status === RevolvingFundStatuses.disapproved,
      tone: isCancelled ? "default" : "danger",
      onSelect: () => isCancelled
        ? onUpdateStatus(record, RevolvingFundStatuses.draft)
        : setStatus(RevolvingFundStatuses.cancelled),
    },
  ];
  return (
    <>
      <ModuleTableActions className="w-full !justify-center">
        <ModuleActionMenu items={items} label={`Actions for revolving fund ${record.transactionNo}`} />
      </ModuleTableActions>
      {status ? (
        <AppDialog
          isOpen
          title={`Mark as ${status}?`}
          description={`This will update ${record.transactionNo} to ${status}.`}
          confirmLabel={`Mark as ${status}`}
          tone={status === RevolvingFundStatuses.posted ? "success" : "danger"}
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

