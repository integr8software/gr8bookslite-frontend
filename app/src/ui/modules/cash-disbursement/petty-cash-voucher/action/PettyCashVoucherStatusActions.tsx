import { Ban, ThumbsDown, ThumbsUp } from "lucide-react";
import { PettyCashVoucherStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import type {
  PettyCashVoucherConfirmationAction,
  PettyCashVoucherRecord,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleHeaderActionClassNames, moduleStatusActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function PettyCashVoucherStatusActions({
  onRequestConfirmation,
  record,
}: {
  onRequestConfirmation: (action: PettyCashVoucherConfirmationAction) => void;
  record?: PettyCashVoucherRecord | null;
}) {
  const actions = createPettyCashVoucherStatusActionItems({
    onRequestConfirmation,
    record,
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
  onRequestConfirmation,
  record,
}: {
  onRequestConfirmation: (action: PettyCashVoucherConfirmationAction) => void;
  record?: PettyCashVoucherRecord | null;
}) {
  const status = record?.status ?? PettyCashVoucherStatuses.Draft;
  const isCancelled = status === PettyCashVoucherStatuses.Cancelled;
  const isPosted = status === PettyCashVoucherStatuses.Posted;
  const actions: ModuleActionMenuItem[] = [
    {
      disabled: isPosted || isCancelled,
      icon: ThumbsUp,
      label: "Approve",
      onSelect: () => onRequestConfirmation("approve"),
      type: "button",
    },
    {
      disabled: status === PettyCashVoucherStatuses.Disapproved || isCancelled,
      icon: ThumbsDown,
      label: "Disapprove",
      onSelect: () => onRequestConfirmation("disapprove"),
      tone: "danger",
      type: "button",
    },
    {
      disabled: isCancelled,
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
