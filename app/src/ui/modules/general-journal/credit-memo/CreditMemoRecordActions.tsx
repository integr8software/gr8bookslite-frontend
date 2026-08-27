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
  CreditMemoHref,
  canApproveCreditMemoStatus,
  canCancelCreditMemoStatus,
  canDisapproveCreditMemoStatus,
  canEditCreditMemoStatus,
} from "@/app/src/constants/modules/general-journal/credit-memo/CreditMemoConstants";
import type {
  CreditMemoRecord,
  CreditMemoStatus,
} from "@/app/src/types/modules/general-journal/credit-memo/CreditMemoTypes";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type CreditMemoRecordActionsProps = {
  record: CreditMemoRecord;
  onUpdateStatus: (record: CreditMemoRecord, status: CreditMemoStatus) => void;
};

export function CreditMemoRecordActions({
  record,
  onUpdateStatus,
}: CreditMemoRecordActionsProps) {
  const actionItems = createCreditMemoActionItems(record, onUpdateStatus);

  return (
    <ModuleTableActions className="w-full !justify-center">
      <ModuleActionMenu
        items={actionItems}
        label={`Actions for credit memo ${record.transactionNo}`}
      />
    </ModuleTableActions>
  );
}

export function createCreditMemoActionItems(
  record: CreditMemoRecord,
  onUpdateStatus: (record: CreditMemoRecord, status: CreditMemoStatus) => void,
): ModuleActionMenuItem[] {
  const isPosted = record.status === "Posted";
  const isDisapproved = record.status === "Disapproved";
  const isCancelled = record.status === "Cancelled";
  const approvalUndoStatus: CreditMemoStatus = "For Approval";
  const cancelStatus: CreditMemoStatus = isCancelled ? "For Approval" : "Cancelled";

  return [
    {
      href: `${CreditMemoHref}/view/${record.id}`,
      icon: Eye,
      label: "View",
      type: "link",
    },
    ...(canEditCreditMemoStatus(record.status)
      ? [
          {
            href: `${CreditMemoHref}/edit/${record.id}`,
            icon: Edit3,
            label: "Edit",
            type: "link",
          } satisfies ModuleActionMenuItem,
        ]
      : []),
    {
      disabled: !canApproveCreditMemoStatus(record.status),
      icon: isPosted ? Undo2 : PackageCheck,
      label: isPosted ? "Undo Posted" : "Approve",
      onSelect: () => onUpdateStatus(record, isPosted ? approvalUndoStatus : "Posted"),
      type: "button",
    },
    {
      disabled: !canDisapproveCreditMemoStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => onUpdateStatus(record, isDisapproved ? approvalUndoStatus : "Disapproved"),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelCreditMemoStatus(record.status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Uncancelled" : "Cancel",
      onSelect: () => onUpdateStatus(record, cancelStatus),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];
}
