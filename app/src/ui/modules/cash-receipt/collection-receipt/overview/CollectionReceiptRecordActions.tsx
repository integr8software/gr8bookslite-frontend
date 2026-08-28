import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import {
  EditableCollectionReceiptStatuses,
  CollectionReceiptStatuses,
} from "@/app/src/constants/modules/cash-receipt/collection-receipt/CollectionReceiptConstants";
import type {
  CollectionReceiptRecord,
  CollectionReceiptStatus,
} from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function CollectionReceiptRecordActions({
  baseHref,
  receiptLabel = "collection receipt",
  record,
  onUpdateStatus,
}: {
  baseHref: string;
  receiptLabel?: string;
  record: CollectionReceiptRecord;
  onUpdateStatus: (record: CollectionReceiptRecord, status: CollectionReceiptStatus) => void;
}) {
  const isPosted = record.status === CollectionReceiptStatuses.Posted;
  const isDisapproved = record.status === CollectionReceiptStatuses.Disapproved;
  const isCancelled = record.status === CollectionReceiptStatuses.Cancelled;
  const canEdit = canEditCollectionReceiptStatus(record.status);
  const undoStatus: CollectionReceiptStatus = CollectionReceiptStatuses.Draft;
  const cancelStatus: CollectionReceiptStatus = isCancelled ? CollectionReceiptStatuses.Draft : CollectionReceiptStatuses.Cancelled;
  const postLabel = isPosted ? "Undo Posted" : "Post";
  const disapproveLabel = isDisapproved ? "Undo Disapproved" : "Disapprove";
  const cancelLabel = isCancelled ? "Uncancelled" : "Cancel";
  const overflowItems: ModuleActionMenuItem[] = [
    {
      disabled: !canPostCollectionReceiptStatus(record.status),
      icon: isPosted ? Undo2 : CheckCircle2,
      label: postLabel,
      onSelect: () => onUpdateStatus(record, isPosted ? undoStatus : CollectionReceiptStatuses.Posted),
      type: "button",
    },
    {
      disabled: !canDisapproveCollectionReceiptStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: disapproveLabel,
      onSelect: () => onUpdateStatus(record, isDisapproved ? undoStatus : CollectionReceiptStatuses.Disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelCollectionReceiptStatus(record.status),
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

function canEditCollectionReceiptStatus(status: CollectionReceiptStatus) {
  return EditableCollectionReceiptStatuses.includes(status);
}

function canPostCollectionReceiptStatus(status: CollectionReceiptStatus) {
  return canEditCollectionReceiptStatus(status) || status === CollectionReceiptStatuses.Posted;
}

function canDisapproveCollectionReceiptStatus(status: CollectionReceiptStatus) {
  return canEditCollectionReceiptStatus(status) || status === CollectionReceiptStatuses.Disapproved;
}

function canCancelCollectionReceiptStatus(status: CollectionReceiptStatus) {
  return status !== CollectionReceiptStatuses.Posted;
}
