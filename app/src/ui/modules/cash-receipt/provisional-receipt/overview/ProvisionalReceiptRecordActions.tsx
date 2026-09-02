import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import {
  EditableProvisionalReceiptStatuses,
  ProvisionalReceiptStatuses,
} from "@/app/src/constants/modules/cash-receipt/provisional-receipt/ProvisionalReceiptConstants";
import type {
  ProvisionalReceiptRecord,
  ProvisionalReceiptStatus,
} from "@/app/src/types/modules/cash-receipt/provisional-receipt/ProvisionalReceiptTypes";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function ProvisionalReceiptRecordActions({
  baseHref,
  receiptLabel = "provisional receipt",
  record,
  onUpdateStatus,
}: {
  baseHref: string;
  receiptLabel?: string;
  record: ProvisionalReceiptRecord;
  onUpdateStatus: (record: ProvisionalReceiptRecord, status: ProvisionalReceiptStatus) => void;
}) {
  const isPosted = record.status === ProvisionalReceiptStatuses.Posted;
  const isDisapproved = record.status === ProvisionalReceiptStatuses.Disapproved;
  const isCancelled = record.status === ProvisionalReceiptStatuses.Cancelled;
  const canEdit = canEditProvisionalReceiptStatus(record.status);
  const undoStatus: ProvisionalReceiptStatus = ProvisionalReceiptStatuses.Draft;
  const cancelStatus: ProvisionalReceiptStatus = isCancelled ? ProvisionalReceiptStatuses.Draft : ProvisionalReceiptStatuses.Cancelled;
  const postLabel = isPosted ? "Undo Posted" : "Post";
  const disapproveLabel = isDisapproved ? "Undo Disapproved" : "Disapprove";
  const cancelLabel = isCancelled ? "Uncancelled" : "Cancel";
  const overflowItems: ModuleActionMenuItem[] = [
    {
      disabled: !canPostProvisionalReceiptStatus(record.status),
      icon: isPosted ? Undo2 : CheckCircle2,
      label: postLabel,
      onSelect: () => onUpdateStatus(record, isPosted ? undoStatus : ProvisionalReceiptStatuses.Posted),
      type: "button",
    },
    {
      disabled: !canDisapproveProvisionalReceiptStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: disapproveLabel,
      onSelect: () => onUpdateStatus(record, isDisapproved ? undoStatus : ProvisionalReceiptStatuses.Disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelProvisionalReceiptStatus(record.status),
      icon: isCancelled ? Undo2 : Ban,
      label: cancelLabel,
      onSelect: () => onUpdateStatus(record, cancelStatus),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];

  return (
    <ModuleTableActions className="justify-center!">
      <ModuleTableActionLink
        href={`${baseHref}/view/${record.id}`}
        icon={Eye}
        label={`View ${receiptLabel} ${record.receiptNo}`}
        title="View"
        variant="view"
      />
      {canEdit ? (
        <ModuleTableActionLink
          href={`${baseHref}/edit/${record.id}`}
          icon={Edit3}
          label={`Edit ${receiptLabel} ${record.receiptNo}`}
          title="Edit"
          variant="edit"
        />
      ) : (
        <ModuleTableActionButton disabled icon={Edit3} label={`Edit ${receiptLabel} ${record.receiptNo}`} title="Edit" variant="edit" />
      )}
      <ModuleActionMenu
        className="[&>button]:h-9 [&>button]:w-9"
        items={overflowItems}
        label={`More actions for ${receiptLabel} ${record.receiptNo}`}
      />
    </ModuleTableActions>
  );
}

function canEditProvisionalReceiptStatus(status: ProvisionalReceiptStatus) {
  return EditableProvisionalReceiptStatuses.includes(status);
}

function canPostProvisionalReceiptStatus(status: ProvisionalReceiptStatus) {
  return canEditProvisionalReceiptStatus(status) || status === ProvisionalReceiptStatuses.Posted;
}

function canDisapproveProvisionalReceiptStatus(status: ProvisionalReceiptStatus) {
  return canEditProvisionalReceiptStatus(status) || status === ProvisionalReceiptStatuses.Disapproved;
}

function canCancelProvisionalReceiptStatus(status: ProvisionalReceiptStatus) {
  return status !== ProvisionalReceiptStatuses.Posted;
}
