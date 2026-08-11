import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import {
	BillingHref,
	BillingStatuses,
} from "@/app/src/constants/modules/sales/billing/BillingConstants";
import type {
  BillingRecord,
  BillingStatus,
} from "@/app/src/types/modules/sales/billing/BillingTypes";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function BillingRecordActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus: (record: BillingRecord, status: BillingStatus) => void;
  record: BillingRecord;
}) {
  const isPosted = record.status === BillingStatuses.posted;
  const isDisapproved = record.status === BillingStatuses.disapproved;
  const isCancelled = record.status === BillingStatuses.cancelled;
  const canEdit = canEditBillingStatus(record.status);
  const postLabel = isPosted ? "Undo Posted" : "Post";
  const disapproveLabel = isDisapproved ? "Undo Disapproved" : "Disapprove";
  const cancelLabel = isCancelled ? "Uncancelled" : "Cancel";
  const undoStatus: BillingStatus = BillingStatuses.draft;
  const cancelStatus: BillingStatus = isCancelled
    ? BillingStatuses.draft
    : BillingStatuses.cancelled;
  const overflowItems: ModuleActionMenuItem[] = [
    {
      disabled: !canPostBillingStatus(record.status),
      icon: isPosted ? Undo2 : CheckCircle2,
      label: postLabel,
      onSelect: () =>
        onUpdateStatus(record, isPosted ? undoStatus : BillingStatuses.posted),
      type: "button",
    },
    {
      disabled: !canDisapproveBillingStatus(record.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: disapproveLabel,
      onSelect: () =>
        onUpdateStatus(
          record,
          isDisapproved ? undoStatus : BillingStatuses.disapproved,
        ),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelBillingStatus(record.status),
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
        href={`${BillingHref}/view/${record.id}`}
        icon={Eye}
        label={`View billing ${record.transactionNo}`}
        title="View"
        variant="view"
      />
      {canEdit ? (
        <ModuleTableActionLink
          href={`${BillingHref}/edit/${record.id}`}
          icon={Edit3}
          label={`Edit billing ${record.transactionNo}`}
          title="Edit"
          variant="edit"
        />
      ) : (
        <ModuleTableActionButton
          disabled
          icon={Edit3}
          label={`Edit billing ${record.transactionNo}`}
          title="Edit"
          variant="edit"
        />
      )}
      <ModuleActionMenu
        className="[&>button]:h-9 [&>button]:w-9"
        items={overflowItems}
        label={`More actions for billing ${record.transactionNo}`}
      />
    </ModuleTableActions>
  );
}

function canEditBillingStatus(status: BillingStatus) {
  return (
    status === BillingStatuses.draft ||
    status === BillingStatuses.forApproval
  );
}

function canPostBillingStatus(status: BillingStatus) {
  return (
    status === BillingStatuses.draft ||
    status === BillingStatuses.forApproval ||
    status === BillingStatuses.posted
  );
}

function canDisapproveBillingStatus(status: BillingStatus) {
  return (
    status === BillingStatuses.draft ||
    status === BillingStatuses.forApproval ||
    status === BillingStatuses.disapproved
  );
}

function canCancelBillingStatus(status: BillingStatus) {
  return status !== BillingStatuses.posted;
}
