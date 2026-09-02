"use client";

import {
  Ban,
  Edit3,
  Eye,
  PackageCheck,
  ThumbsDown,
  Undo2,
} from "lucide-react";
import {
  DebitMemoHref,
  canApproveDebitMemoStatus,
  canCancelDebitMemoStatus,
  canDisapproveDebitMemoStatus,
  canEditDebitMemoStatus,
} from "@/app/src/constants/modules/general-journal/debit-memo/DebitMemoConstants";
import type {
  DebitMemoRecord,
  DebitMemoStatus,
} from "@/app/src/types/modules/general-journal/debit-memo/DebitMemoTypes";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type DebitMemoRecordActionsProps = {
  record: DebitMemoRecord;
  onUpdateStatus: (record: DebitMemoRecord, status: DebitMemoStatus) => void;
};

export function DebitMemoRecordActions({
  record,
  onUpdateStatus,
}: DebitMemoRecordActionsProps) {
  const actionItems = createDebitMemoActionItems(record, onUpdateStatus);

  return (
    <ModuleTableActions className="w-full !justify-center">
      <ModuleActionMenu
        items={actionItems}
        label={`Actions for debit memo ${record.transactionNo}`}
      />
    </ModuleTableActions>
  );
}

export function createDebitMemoActionItems(
  record: DebitMemoRecord,
  onUpdateStatus: (record: DebitMemoRecord, status: DebitMemoStatus) => void,
): ModuleActionMenuItem[] {
  const isPosted = record.status === "Posted";
  const isDisapproved = record.status === "Disapproved";
  const isCancelled = record.status === "Cancelled";
  const approvalUndoStatus: DebitMemoStatus = "For Approval";
  const cancelStatus: DebitMemoStatus = isCancelled ? "For Approval" : "Cancelled";

  return [
    {
      href: `${DebitMemoHref}/view/${record.id}`,
      icon: Eye,
      label: "View",
      type: "link",
    },
    ...(canEditDebitMemoStatus(record.status)
      ? [
          {
            href: `${DebitMemoHref}/edit/${record.id}`,
            icon: Edit3,
            label: "Edit",
            type: "link",
          } satisfies ModuleActionMenuItem,
        ]
      : []),
    {
      disabled: !canApproveDebitMemoStatus(record.status),
      icon: isPosted ? Undo2 : PackageCheck,
      label: isPosted ? "Undo Posted" : "Approve",
      onSelect: () => onUpdateStatus(record, isPosted ? approvalUndoStatus : "Posted"),
      type: "button",
    },
    {
      disabled: !canDisapproveDebitMemoStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => onUpdateStatus(record, isDisapproved ? approvalUndoStatus : "Disapproved"),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelDebitMemoStatus(record.status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Uncancelled" : "Cancel",
      onSelect: () => onUpdateStatus(record, cancelStatus),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];
}
