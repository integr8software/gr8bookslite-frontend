import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import { AcknowledgementReceiptHref } from "@/app/src/constants/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptConstants";
import type {
  AcknowledgementReceiptRecord,
  AcknowledgementReceiptStatus,
} from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function AcknowledgementReceiptRecordActions({
  record,
  onUpdateStatus,
}: {
  record: AcknowledgementReceiptRecord;
  onUpdateStatus: (
    record: AcknowledgementReceiptRecord,
    status: AcknowledgementReceiptStatus,
  ) => void;
}) {
  const isApproved = record.status === "Approved";
  const isDisapproved = record.status === "Disapproved";
  const isCancelled = record.status === "Cancelled";
  const undoStatus: AcknowledgementReceiptStatus = "Active";
  const cancelStatus: AcknowledgementReceiptStatus = isCancelled ? "Draft" : "Cancelled";
  const items: ModuleActionMenuItem[] = [
    {
      href: `${AcknowledgementReceiptHref}/view/${record.id}`,
      icon: Eye,
      label: "View",
      type: "link",
    },
    ...(canEditAcknowledgementReceiptStatus(record.status)
      ? [
          {
            href: `${AcknowledgementReceiptHref}/edit/${record.id}`,
            icon: Edit3,
            label: "Edit",
            type: "link",
          } satisfies ModuleActionMenuItem,
        ]
      : []),
    {
      disabled: !canApproveAcknowledgementReceiptStatus(record.status),
      icon: isApproved ? Undo2 : CheckCircle2,
      label: isApproved ? "Undo Approved" : "Approve",
      onSelect: () => onUpdateStatus(record, isApproved ? undoStatus : "Approved"),
      type: "button",
    },
    {
      disabled: !canDisapproveAcknowledgementReceiptStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () =>
        onUpdateStatus(record, isDisapproved ? undoStatus : "Disapproved"),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelAcknowledgementReceiptStatus(record.status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Uncancelled" : "Cancel",
      onSelect: () => onUpdateStatus(record, cancelStatus),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];

  return (
    <ModuleTableActions className="!justify-center">
      <ModuleActionMenu
        items={items}
        label={`Actions for Acknowledgement Receipt ${record.receiptNo}`}
      />
    </ModuleTableActions>
  );
}

function canEditAcknowledgementReceiptStatus(status: AcknowledgementReceiptStatus) {
  return status === "Active" || status === "Draft" || status === "Pending";
}

function canApproveAcknowledgementReceiptStatus(status: AcknowledgementReceiptStatus) {
  return status === "Active" || status === "Draft" || status === "Pending" || status === "Approved";
}

function canDisapproveAcknowledgementReceiptStatus(status: AcknowledgementReceiptStatus) {
  return status === "Active" || status === "Draft" || status === "Pending" || status === "Disapproved";
}

function canCancelAcknowledgementReceiptStatus(status: AcknowledgementReceiptStatus) {
  return status !== "Closed";
}
