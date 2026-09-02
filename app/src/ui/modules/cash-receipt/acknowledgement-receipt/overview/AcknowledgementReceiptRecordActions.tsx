import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import {
  EditableAcknowledgementReceiptStatuses,
  AcknowledgementReceiptStatuses,
} from "@/app/src/constants/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptConstants";
import type {
  AcknowledgementReceiptRecord,
  AcknowledgementReceiptStatus,
} from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function AcknowledgementReceiptRecordActions({
  baseHref,
  receiptLabel = "acknowledgement receipt",
  record,
  onUpdateStatus,
}: {
  baseHref: string;
  receiptLabel?: string;
  record: AcknowledgementReceiptRecord;
  onUpdateStatus: (record: AcknowledgementReceiptRecord, status: AcknowledgementReceiptStatus) => void;
}) {
  const isPosted = record.status === AcknowledgementReceiptStatuses.Posted;
  const isDisapproved = record.status === AcknowledgementReceiptStatuses.Disapproved;
  const isCancelled = record.status === AcknowledgementReceiptStatuses.Cancelled;
  const canEdit = canEditAcknowledgementReceiptStatus(record.status);
  const undoStatus: AcknowledgementReceiptStatus = AcknowledgementReceiptStatuses.Draft;
  const cancelStatus: AcknowledgementReceiptStatus = isCancelled
    ? AcknowledgementReceiptStatuses.Draft
    : AcknowledgementReceiptStatuses.Cancelled;
  const postLabel = isPosted ? "Undo Posted" : "Post";
  const disapproveLabel = isDisapproved ? "Undo Disapproved" : "Disapprove";
  const cancelLabel = isCancelled ? "Uncancelled" : "Cancel";
  const overflowItems: ModuleActionMenuItem[] = [
    {
      disabled: !canPostAcknowledgementReceiptStatus(record.status),
      icon: isPosted ? Undo2 : CheckCircle2,
      label: postLabel,
      onSelect: () => onUpdateStatus(record, isPosted ? undoStatus : AcknowledgementReceiptStatuses.Posted),
      type: "button",
    },
    {
      disabled: !canDisapproveAcknowledgementReceiptStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: disapproveLabel,
      onSelect: () => onUpdateStatus(record, isDisapproved ? undoStatus : AcknowledgementReceiptStatuses.Disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelAcknowledgementReceiptStatus(record.status),
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

function canEditAcknowledgementReceiptStatus(status: AcknowledgementReceiptStatus) {
  return EditableAcknowledgementReceiptStatuses.includes(status);
}

function canPostAcknowledgementReceiptStatus(status: AcknowledgementReceiptStatus) {
  return canEditAcknowledgementReceiptStatus(status) || status === AcknowledgementReceiptStatuses.Posted;
}

function canDisapproveAcknowledgementReceiptStatus(status: AcknowledgementReceiptStatus) {
  return canEditAcknowledgementReceiptStatus(status) || status === AcknowledgementReceiptStatuses.Disapproved;
}

function canCancelAcknowledgementReceiptStatus(status: AcknowledgementReceiptStatus) {
  return status !== AcknowledgementReceiptStatuses.Posted;
}
