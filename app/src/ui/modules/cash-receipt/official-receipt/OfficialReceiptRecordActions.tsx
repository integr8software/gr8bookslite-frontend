import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import {
  EditableOfficialReceiptStatuses,
  OfficialReceiptStatuses,
} from "@/app/src/constants/modules/cash-receipt/official-receipt/OfficialReceiptConstants";
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
  const isPosted = record.status === OfficialReceiptStatuses.Posted;
  const isDisapproved = record.status === OfficialReceiptStatuses.Disapproved;
  const isCancelled = record.status === OfficialReceiptStatuses.Cancelled;
  const undoStatus: OfficialReceiptStatus = OfficialReceiptStatuses.Draft;
  const cancelStatus: OfficialReceiptStatus = isCancelled ? OfficialReceiptStatuses.Draft : OfficialReceiptStatuses.Cancelled;
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
      disabled: !canPostOfficialReceiptStatus(record.status),
      icon: isPosted ? Undo2 : CheckCircle2,
      label: isPosted ? "Undo Posted" : "Post",
      onSelect: () => onUpdateStatus(record, isPosted ? undoStatus : OfficialReceiptStatuses.Posted),
      type: "button",
    },
    {
      disabled: !canDisapproveOfficialReceiptStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => onUpdateStatus(record, isDisapproved ? undoStatus : OfficialReceiptStatuses.Disapproved),
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
  return EditableOfficialReceiptStatuses.includes(status);
}

function canPostOfficialReceiptStatus(status: OfficialReceiptStatus) {
  return canEditOfficialReceiptStatus(status) || status === OfficialReceiptStatuses.Posted;
}

function canDisapproveOfficialReceiptStatus(status: OfficialReceiptStatus) {
  return canEditOfficialReceiptStatus(status) || status === OfficialReceiptStatuses.Disapproved;
}

function canCancelOfficialReceiptStatus(status: OfficialReceiptStatus) {
  return status !== OfficialReceiptStatuses.Posted;
}
