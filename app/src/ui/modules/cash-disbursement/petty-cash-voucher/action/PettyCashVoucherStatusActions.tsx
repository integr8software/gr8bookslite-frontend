import { Ban, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  PettyCashVoucherStatuses,
  canApprovePettyCashVoucherStatus,
  canCancelPettyCashVoucherStatus,
  canDisapprovePettyCashVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type {
  PettyCashVoucherFormStatus,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleStatusActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function PettyCashVoucherStatusActions({
  status,
  onRequestStatus,
}: {
  status: PettyCashVoucherFormStatus;
  onRequestStatus: (status: PettyCashVoucherStatus) => void;
}) {
  const actions = createPettyCashVoucherStatusActionItems({
    status,
    onRequestStatus,
  });

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        <ModuleActionMenu items={actions} label="Petty cash voucher actions" />
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">
        {actions.map((action) => {
          if (action.type === "button") {
            return <HeaderActionButton key={action.label} action={action} />;
          }

          return null;
        })}
      </div>
    </>
  );
}

function createPettyCashVoucherStatusActionItems({
  status,
  onRequestStatus,
}: {
  status: PettyCashVoucherFormStatus;
  onRequestStatus: (status: PettyCashVoucherStatus) => void;
}) {
  const isPosted = status === PettyCashVoucherStatuses.posted;
  const isDisapproved = status === PettyCashVoucherStatuses.disapproved;
  const isCancelled = status === PettyCashVoucherStatuses.cancelled;
  const actions: ModuleActionMenuItem[] = [
    {
      disabled: !canApprovePettyCashVoucherStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => onRequestStatus(isPosted ? PettyCashVoucherStatuses.forApproval : PettyCashVoucherStatuses.posted),
      type: "button",
    },
    {
      disabled: !canDisapprovePettyCashVoucherStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => onRequestStatus(isDisapproved ? PettyCashVoucherStatuses.forApproval : PettyCashVoucherStatuses.disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !canCancelPettyCashVoucherStatus(status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      onSelect: () => onRequestStatus(isCancelled ? PettyCashVoucherStatuses.forApproval : PettyCashVoucherStatuses.cancelled),
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
  ];

  return actions;
}

function HeaderActionButton({
  action,
}: {
  action: Extract<ModuleActionMenuItem, { type: "button" }>;
}) {
  const Icon = action.icon;
  const className = getActionButtonClassName(action);

  return (
    <button type="button" disabled={action.disabled} onClick={action.onSelect} className={className}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {action.label}
    </button>
  );
}

function getActionButtonClassName(action: Extract<ModuleActionMenuItem, { type: "button" }>) {
  if (action.label === "Approve") {
    return moduleStatusActionClassNames.approve;
  }

  if (action.label === "Disapprove") {
    return moduleStatusActionClassNames.disapprove;
  }

  if (action.label === "Cancel") {
    return moduleStatusActionClassNames.cancel;
  }

  return moduleStatusActionClassNames.undo;
}
