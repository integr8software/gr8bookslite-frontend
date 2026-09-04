import { Ban, ThumbsDown, ThumbsUp } from "lucide-react";
import { RequestForPaymentStatuses } from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import type {
  RequestForPaymentConfirmationAction,
  RequestForPaymentRecord,
} from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleHeaderActionClassNames, moduleStatusActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function RequestForPaymentStatusActions({
  onRequestConfirmation,
  record,
}: {
  onRequestConfirmation: (action: RequestForPaymentConfirmationAction) => void;
  record?: RequestForPaymentRecord | null;
}) {
  const actions = createRequestForPaymentStatusActionItems({
    onRequestConfirmation,
    record,
  });

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        <ModuleActionMenu items={actions} label="Request for payment actions" />
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

function createRequestForPaymentStatusActionItems({
  onRequestConfirmation,
  record,
}: {
  onRequestConfirmation: (action: RequestForPaymentConfirmationAction) => void;
  record?: RequestForPaymentRecord | null;
}) {
  const status = record?.status ?? RequestForPaymentStatuses.draft;
  const isCancelled = status === RequestForPaymentStatuses.cancelled;
  const isClosed = status === RequestForPaymentStatuses.closed;
  const isApproved = status === RequestForPaymentStatuses.approved;

  const actions: ModuleActionMenuItem[] = [
    {
      disabled: isApproved || isCancelled || isClosed,
      icon: ThumbsUp,
      label: "Approve",
      onSelect: () => onRequestConfirmation("approve"),
      type: "button",
    },
    {
      disabled: status === RequestForPaymentStatuses.disapproved || isCancelled || isClosed,
      icon: ThumbsDown,
      label: "Disapprove",
      onSelect: () => onRequestConfirmation("disapprove"),
      tone: "danger",
      type: "button",
    },
    {
      disabled: isCancelled || isClosed,
      icon: Ban,
      label: "Cancel",
      onSelect: () => onRequestConfirmation("cancel"),
      tone: "danger",
      type: "button",
    },
  ];

  return actions;
}

function HeaderActionButton({ action }: { action: Extract<ModuleActionMenuItem, { type: "button" }> }) {
  const Icon = action.icon;
  const className = getStatusActionButtonClassName(action);

  return (
    <button type="button" disabled={action.disabled} onClick={action.onSelect} className={className}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {action.label}
    </button>
  );
}

function getStatusActionButtonClassName(action: Extract<ModuleActionMenuItem, { type: "button" }>) {
  if (action.label === "Approve") {
    return moduleStatusActionClassNames.approve;
  }

  if (action.label === "Disapprove") {
    return moduleStatusActionClassNames.disapprove;
  }

  if (action.label === "Cancel") {
    return moduleStatusActionClassNames.cancel;
  }

  if (action.tone === "danger") {
    return moduleStatusActionClassNames.danger;
  }

  return moduleHeaderActionClassNames.secondary;
}
