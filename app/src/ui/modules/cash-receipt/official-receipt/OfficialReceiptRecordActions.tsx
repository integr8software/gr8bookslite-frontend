import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import type {
  OfficialReceiptRecord,
  OfficialReceiptStatus,
} from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function OfficialReceiptRecordActions({
  baseHref,
  receiptLabel = "official receipt",
  record,
  onUpdateStatus,
}: {
  baseHref: string;
  receiptLabel?: string;
  record: OfficialReceiptRecord;
  onUpdateStatus: (record: OfficialReceiptRecord, status: OfficialReceiptStatus) => void;
}) {
  const isApproved = record.status === "Approved";
  const isDisapproved = record.status === "Disapproved";
  const isCancelled = record.status === "Cancelled";
  const undoStatus: OfficialReceiptStatus = "Active";
  const cancelStatus: OfficialReceiptStatus = isCancelled ? "Draft" : "Cancelled";
  const items: ModuleActionMenuItem[] = [
    {
      href: `${baseHref}/view/${record.id}`,
      icon: Eye,
      label: "View",
      type: "link",
    },
    ...(canEditOfficialReceiptStatus(record.status)
      ? [
          {
            href: `${baseHref}/edit/${record.id}`,
            icon: Edit3,
            label: "Edit",
            type: "link",
          } satisfies ModuleActionMenuItem,
        ]
      : []),
    {
      disabled: !canApproveOfficialReceiptStatus(record.status),
      icon: isApproved ? Undo2 : CheckCircle2,
      label: isApproved ? "Undo Approved" : "Approve",
      onSelect: () => onUpdateStatus(record, isApproved ? undoStatus : "Approved"),
      type: "button",
    },
    {
      disabled: !canDisapproveOfficialReceiptStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => onUpdateStatus(record, isDisapproved ? undoStatus : "Disapproved"),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelOfficialReceiptStatus(record.status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Uncancelled" : "Cancel",
      onSelect: () => onUpdateStatus(record, cancelStatus),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];

  return (
    <ModuleTableActions className="!justify-center">
      <ModuleActionMenu items={items} label={`Actions for ${receiptLabel} ${record.receiptNo}`} />
    </ModuleTableActions>
  );
}

function canEditOfficialReceiptStatus(status: OfficialReceiptStatus) {
  return status === "Active" || status === "Draft" || status === "Pending";
}

function canApproveOfficialReceiptStatus(status: OfficialReceiptStatus) {
  return status === "Active" || status === "Draft" || status === "Pending" || status === "Approved";
}

function canDisapproveOfficialReceiptStatus(status: OfficialReceiptStatus) {
  return status === "Active" || status === "Draft" || status === "Pending" || status === "Disapproved";
}

function canCancelOfficialReceiptStatus(status: OfficialReceiptStatus) {
  return status !== "Closed";
}
