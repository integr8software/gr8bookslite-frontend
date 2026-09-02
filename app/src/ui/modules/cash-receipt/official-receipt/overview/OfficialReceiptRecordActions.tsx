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
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

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
  const canEdit = canEditOfficialReceiptStatus(record.status);
  const undoStatus: OfficialReceiptStatus = OfficialReceiptStatuses.Draft;
  const cancelStatus: OfficialReceiptStatus = isCancelled ? OfficialReceiptStatuses.Draft : OfficialReceiptStatuses.Cancelled;
  const postLabel = isPosted ? "Undo Posted" : "Post";
  const disapproveLabel = isDisapproved ? "Undo Disapproved" : "Disapprove";
  const cancelLabel = isCancelled ? "Uncancelled" : "Cancel";
  const overflowItems: ModuleActionMenuItem[] = [
    {
      disabled: !canPostOfficialReceiptStatus(record.status),
      icon: isPosted ? Undo2 : CheckCircle2,
      label: postLabel,
      onSelect: () => onUpdateStatus(record, isPosted ? undoStatus : OfficialReceiptStatuses.Posted),
      type: "button",
    },
    {
      disabled: !canDisapproveOfficialReceiptStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: disapproveLabel,
      onSelect: () => onUpdateStatus(record, isDisapproved ? undoStatus : OfficialReceiptStatuses.Disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelOfficialReceiptStatus(record.status),
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
        <ModuleTableActionButton
          disabled
          icon={Edit3}
          label={`Edit ${receiptLabel} ${record.receiptNo}`}
          title="Edit"
          variant="edit"
        />
      )}
      <ModuleActionMenu
        className="[&>button]:h-9 [&>button]:w-9"
        items={overflowItems}
        label={`More actions for ${receiptLabel} ${record.receiptNo}`}
      />
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
