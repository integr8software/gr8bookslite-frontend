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
  BankReconciliationHref,
  canApproveBankReconciliationStatus,
  canCancelBankReconciliationStatus,
  canDisapproveBankReconciliationStatus,
  canEditBankReconciliationStatus,
} from "@/app/src/constants/modules/cash-receipt/bank-reconciliation/BankReconciliationConstants";
import type {
  BankReconciliationRecord,
  BankReconciliationStatus,
} from "@/app/src/types/modules/cash-receipt/bank-reconciliation/BankReconciliationTypes";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type BankReconciliationRecordActionsProps = {
  record: BankReconciliationRecord;
  onUpdateStatus: (
    record: BankReconciliationRecord,
    status: BankReconciliationStatus,
  ) => void;
};

export function BankReconciliationRecordActions({
  record,
  onUpdateStatus,
}: BankReconciliationRecordActionsProps) {
  const actionItems = createBankReconciliationActionItems(
    record,
    onUpdateStatus,
  );

  return (
    <ModuleTableActions className="w-full !justify-center">
      <ModuleActionMenu
        items={actionItems}
        label={`Actions for reconciliation ${record.brNo}`}
      />
    </ModuleTableActions>
  );
}

export function createBankReconciliationActionItems(
  record: BankReconciliationRecord,
  onUpdateStatus: (
    record: BankReconciliationRecord,
    status: BankReconciliationStatus,
  ) => void,
): ModuleActionMenuItem[] {
  const isPosted = record.status === "Posted";
  const isDisapproved = record.status === "Disapproved";
  const isCancelled = record.status === "Cancelled";
  const approvalUndoStatus: BankReconciliationStatus = "For Approval";
  const cancelStatus: BankReconciliationStatus = isCancelled
    ? "For Approval"
    : "Cancelled";

  return [
    {
      href: `${BankReconciliationHref}/view/${record.id}`,
      icon: Eye,
      label: "View",
      type: "link",
    },
    ...(canEditBankReconciliationStatus(record.status)
      ? [
          {
            href: `${BankReconciliationHref}/edit/${record.id}`,
            icon: Edit3,
            label: "Edit",
            type: "link",
          } satisfies ModuleActionMenuItem,
        ]
      : []),
    {
      disabled: !canApproveBankReconciliationStatus(record.status),
      icon: isPosted ? Undo2 : PackageCheck,
      label: isPosted ? "Undo Posted" : "Approve",
      onSelect: () =>
        onUpdateStatus(record, isPosted ? approvalUndoStatus : "Posted"),
      type: "button",
    },
    {
      disabled: !canDisapproveBankReconciliationStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () =>
        onUpdateStatus(
          record,
          isDisapproved ? approvalUndoStatus : "Disapproved",
        ),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelBankReconciliationStatus(record.status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Uncancelled" : "Cancel",
      onSelect: () => onUpdateStatus(record, cancelStatus),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];
}
