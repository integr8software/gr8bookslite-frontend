import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import {
	ServiceInvoiceHref,
	ServiceInvoiceStatuses,
} from "@/app/src/constants/modules/sales/service-invoice/ServiceInvoiceConstants";
import type {
  ServiceInvoiceRecord,
  ServiceInvoiceStatus,
} from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function ServiceInvoiceRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: (record: ServiceInvoiceRecord, status: ServiceInvoiceStatus) => void;
  record: ServiceInvoiceRecord;
}) {
  const isPosted = record.status === ServiceInvoiceStatuses.posted;
  const isDisapproved = record.status === ServiceInvoiceStatuses.disapproved;
  const isCancelled = record.status === ServiceInvoiceStatuses.cancelled;
  const canEdit = canEditServiceInvoiceStatus(record.status);
  const postLabel = isPosted ? "Undo Posted" : "Post";
  const disapproveLabel = isDisapproved ? "Undo Disapproved" : "Disapprove";
  const cancelLabel = isCancelled ? "Uncancelled" : "Cancel";
  const undoStatus: ServiceInvoiceStatus = ServiceInvoiceStatuses.draft;
  const cancelStatus: ServiceInvoiceStatus = isCancelled
    ? ServiceInvoiceStatuses.draft
    : ServiceInvoiceStatuses.cancelled;
  const overflowItems: ModuleActionMenuItem[] = [
    {
      disabled: !canPostServiceInvoiceStatus(record.status),
      icon: isPosted ? Undo2 : CheckCircle2,
      label: postLabel,
      onSelect: () =>
        onUpdateStatus(record, isPosted ? undoStatus : ServiceInvoiceStatuses.posted),
      type: "button",
    },
    {
      disabled: !canDisapproveServiceInvoiceStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: disapproveLabel,
      onSelect: () =>
        onUpdateStatus(
          record,
          isDisapproved ? undoStatus : ServiceInvoiceStatuses.disapproved,
        ),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelServiceInvoiceStatus(record.status),
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
        href={`${ServiceInvoiceHref}/view/${record.id}`}
        icon={Eye}
        label={`View service invoice ${record.transactionNo}`}
        title="View"
        variant="view"
      />
      {canEdit ? (
        <ModuleTableActionLink
          href={`${ServiceInvoiceHref}/edit/${record.id}`}
          icon={Edit3}
          label={`Edit service invoice ${record.transactionNo}`}
          title="Edit"
          variant="edit"
        />
      ) : (
        <ModuleTableActionButton
          disabled
          icon={Edit3}
          label={`Edit service invoice ${record.transactionNo}`}
          title="Edit"
          variant="edit"
        />
      )}
      <ModuleActionMenu
        className="[&>button]:h-9 [&>button]:w-9"
        items={overflowItems}
        label={`More actions for service invoice ${record.transactionNo}`}
      />
    </ModuleTableActions>
  );
}

function canEditServiceInvoiceStatus(status: ServiceInvoiceStatus) {
  return (
    status === ServiceInvoiceStatuses.draft ||
    status === ServiceInvoiceStatuses.forApproval
  );
}

function canPostServiceInvoiceStatus(status: ServiceInvoiceStatus) {
  return (
    status === ServiceInvoiceStatuses.draft ||
    status === ServiceInvoiceStatuses.forApproval ||
    status === ServiceInvoiceStatuses.posted
  );
}

function canDisapproveServiceInvoiceStatus(status: ServiceInvoiceStatus) {
  return (
    status === ServiceInvoiceStatuses.draft ||
    status === ServiceInvoiceStatuses.forApproval ||
    status === ServiceInvoiceStatuses.disapproved
  );
}

function canCancelServiceInvoiceStatus(status: ServiceInvoiceStatus) {
  return status !== ServiceInvoiceStatuses.posted;
}
