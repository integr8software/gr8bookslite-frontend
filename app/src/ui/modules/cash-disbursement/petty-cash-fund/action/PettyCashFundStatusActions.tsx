import { Ban, ThumbsDown, ThumbsUp } from "lucide-react";
import { PettyCashFundStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import type {
  PettyCashFundConfirmationAction,
  PettyCashFundRecord,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleHeaderActionClassNames, moduleStatusActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function PettyCashFundStatusActions({
  onRequestConfirmation,
  record,
}: {
  onRequestConfirmation: (action: PettyCashFundConfirmationAction) => void;
  record?: PettyCashFundRecord | null;
}) {
  const actions = createPettyCashFundStatusActionItems({
    onRequestConfirmation,
    record,
  });

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        <ModuleActionMenu items={actions} label="Petty cash fund actions" />
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

function createPettyCashFundStatusActionItems({
  onRequestConfirmation,
  record,
}: {
  onRequestConfirmation: (action: PettyCashFundConfirmationAction) => void;
  record?: PettyCashFundRecord | null;
}) {
  const status = record?.status ?? PettyCashFundStatuses.Draft;
  const isCancelled = status === PettyCashFundStatuses.Cancelled;
  const isPosted = status === PettyCashFundStatuses.Posted;
  const actions: ModuleActionMenuItem[] = [
    {
      disabled: isPosted || isCancelled,
      icon: ThumbsUp,
      label: "Approve",
      onSelect: () => onRequestConfirmation("approve"),
      type: "button",
    },
    {
      disabled: status === PettyCashFundStatuses.Disapproved || isCancelled,
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
