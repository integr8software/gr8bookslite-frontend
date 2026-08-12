import { Ban, CheckCircle2, Edit3, Eye, ThumbsDown, Undo2 } from "lucide-react";
import {
  BillingStatementHref,
  BillingStatementStatuses,
} from "@/app/src/constants/modules/sales/billing-statement/BillingStatementConstants";
import type {
  BillingStatementRecord,
  BillingStatementStatus,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  ModuleTableActionButton,
  ModuleTableActionLink,
  ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type BillingStatementRecordActionsProps = {
  statement: BillingStatementRecord;
  onUpdateStatus: (
    statement: BillingStatementRecord,
    status: BillingStatementStatus,
  ) => void;
};

export function BillingStatementRecordActions({
  onUpdateStatus,
  statement,
}: BillingStatementRecordActionsProps) {
  const isPosted = statement.status === BillingStatementStatuses.posted;
  const isDisapproved = statement.status === BillingStatementStatuses.disapproved;
  const isCancelled = statement.status === BillingStatementStatuses.cancelled;
  const canEdit = canEditBillingStatementStatus(statement.status);
  const postLabel = isPosted ? "Undo Posted" : "Post";
  const disapproveLabel = isDisapproved ? "Undo Disapproved" : "Disapprove";
  const cancelLabel = isCancelled ? "Uncancelled" : "Cancel";
  const undoStatus: BillingStatementStatus = BillingStatementStatuses.draft;
  const cancelStatus: BillingStatementStatus = isCancelled
    ? BillingStatementStatuses.draft
    : BillingStatementStatuses.cancelled;
  const overflowItems: ModuleActionMenuItem[] = [
    {
      disabled: !canPostBillingStatementStatus(statement.status),
      icon: isPosted ? Undo2 : CheckCircle2,
      label: postLabel,
      onSelect: () =>
        onUpdateStatus(
          statement,
          isPosted ? undoStatus : BillingStatementStatuses.posted,
        ),
      type: "button",
    },
    {
      disabled: !canDisapproveBillingStatementStatus(statement.status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: disapproveLabel,
      onSelect: () =>
        onUpdateStatus(
          statement,
          isDisapproved ? undoStatus : BillingStatementStatuses.disapproved,
        ),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelBillingStatementStatus(statement.status),
      icon: isCancelled ? Undo2 : Ban,
      label: cancelLabel,
      onSelect: () => onUpdateStatus(statement, cancelStatus),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];

  return (
    <ModuleTableActions className="justify-center!">
      <ModuleTableActionLink
        href={`${BillingStatementHref}/view/${statement.id}`}
        icon={Eye}
        label={`View billing statement ${statement.transNo}`}
        title="View"
        variant="view"
      />
      {canEdit ? (
        <ModuleTableActionLink
          href={`${BillingStatementHref}/edit/${statement.id}`}
          icon={Edit3}
          label={`Edit billing statement ${statement.transNo}`}
          title="Edit"
          variant="edit"
        />
      ) : (
        <ModuleTableActionButton
          disabled
          icon={Edit3}
          label={`Edit billing statement ${statement.transNo}`}
          title="Edit"
          variant="edit"
        />
      )}
      <ModuleActionMenu
        className="[&>button]:h-9 [&>button]:w-9"
        items={overflowItems}
        label={`More actions for billing statement ${statement.transNo}`}
      />
    </ModuleTableActions>
  );
}

function canEditBillingStatementStatus(status: BillingStatementStatus) {
  return (
    status === BillingStatementStatuses.draft ||
    status === BillingStatementStatuses.forApproval
  );
}

function canPostBillingStatementStatus(status: BillingStatementStatus) {
  return (
    status === BillingStatementStatuses.draft ||
    status === BillingStatementStatuses.forApproval ||
    status === BillingStatementStatuses.posted
  );
}

function canDisapproveBillingStatementStatus(status: BillingStatementStatus) {
  return (
    status === BillingStatementStatuses.draft ||
    status === BillingStatementStatuses.forApproval ||
    status === BillingStatementStatuses.disapproved
  );
}

function canCancelBillingStatementStatus(status: BillingStatementStatus) {
  return status !== BillingStatementStatuses.posted;
}
