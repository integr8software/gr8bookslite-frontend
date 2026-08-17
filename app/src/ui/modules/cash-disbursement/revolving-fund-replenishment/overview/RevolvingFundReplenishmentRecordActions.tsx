"use client";

import { useState } from "react";
import { Ban, Edit3, Eye, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  RevolvingFundReplenishmentHref,
  RevolvingFundReplenishmentStatuses,
  canEditRevolvingFundReplenishment,
} from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import type {
  RevolvingFundReplenishmentRecord,
  RevolvingFundReplenishmentStatus,
  RevolvingFundReplenishmentUpdateStatusHandler,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function RevolvingFundReplenishmentRecordActions({ onUpdateStatus, record }: { onUpdateStatus: RevolvingFundReplenishmentUpdateStatusHandler; record: RevolvingFundReplenishmentRecord }) {
  const [status, setStatus] = useState<RevolvingFundReplenishmentStatus | null>(null);
  const isPosted = record.status === RevolvingFundReplenishmentStatuses.posted;
  const isDisapproved = record.status === RevolvingFundReplenishmentStatuses.disapproved;
  const isCancelled = record.status === RevolvingFundReplenishmentStatuses.cancelled;
  const items: ModuleActionMenuItem[] = [
    { type: "link", href: `${RevolvingFundReplenishmentHref}/view/${record.id}`, icon: Eye, label: "View" },
    ...(canEditRevolvingFundReplenishment(record.status) ? [{ type: "link" as const, href: `${RevolvingFundReplenishmentHref}/edit/${record.id}`, icon: Edit3, label: "Edit" }] : []),
    { type: "button", icon: isPosted ? Undo2 : ThumbsUp, label: isPosted ? "Undo Approved" : "Approve", disabled: record.status !== RevolvingFundReplenishmentStatuses.forApproval && !isPosted, onSelect: () => isPosted ? onUpdateStatus(record, RevolvingFundReplenishmentStatuses.forApproval) : setStatus(RevolvingFundReplenishmentStatuses.posted) },
    { type: "button", icon: isDisapproved ? Undo2 : ThumbsDown, label: isDisapproved ? "Undo Disapproved" : "Disapprove", disabled: record.status !== RevolvingFundReplenishmentStatuses.forApproval && !isDisapproved, tone: isDisapproved ? "default" : "danger", onSelect: () => isDisapproved ? onUpdateStatus(record, RevolvingFundReplenishmentStatuses.forApproval) : setStatus(RevolvingFundReplenishmentStatuses.disapproved) },
    { type: "button", icon: isCancelled ? Undo2 : Ban, label: isCancelled ? "Undo Cancelled" : "Cancel", disabled: isPosted || isDisapproved, tone: isCancelled ? "default" : "danger", onSelect: () => isCancelled ? onUpdateStatus(record, RevolvingFundReplenishmentStatuses.draft) : setStatus(RevolvingFundReplenishmentStatuses.cancelled) },
  ];
  return (
    <>
      <ModuleTableActions className="w-full !justify-center">
        <ModuleActionMenu items={items} label={`Actions for revolving fund replenishment ${record.transactionNo}`} />
      </ModuleTableActions>
      {status ? <AppDialog isOpen title={`Mark as ${status}?`} description={`This will update ${record.transactionNo} to ${status}.`} confirmLabel={`Mark as ${status}`} tone={status === RevolvingFundReplenishmentStatuses.posted ? "success" : "danger"} onCancel={() => setStatus(null)} onConfirm={() => { onUpdateStatus(record, status); setStatus(null); }} /> : null}
    </>
  );
}

