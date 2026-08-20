import { Ban, ThumbsDown, ThumbsUp } from "lucide-react";
import { CashDisbursementStatusActionButtonClassName } from "@/app/src/constants/modules/cash-disbursement/CashDisbursementConstants";
import { PettyCashFundReplenishmentStatuses } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import type {
  PettyCashFundReplenishmentConfirmationAction,
  PettyCashFundReplenishmentRecord,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentTypes";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function PettyCashFundReplenishmentStatusActions({
  onRequestConfirmation,
  record,
}: {
  onRequestConfirmation: (action: PettyCashFundReplenishmentConfirmationAction) => void;
  record?: PettyCashFundReplenishmentRecord | null;
}) {
  const actions = createPettyCashFundReplenishmentStatusActionItems({
    onRequestConfirmation,
    record,
  });

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        <ModuleActionMenu items={actions} label="Petty cash fund replenishment actions" />
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

function createPettyCashFundReplenishmentStatusActionItems({
  onRequestConfirmation,
  record,
}: {
  onRequestConfirmation: (action: PettyCashFundReplenishmentConfirmationAction) => void;
  record?: PettyCashFundReplenishmentRecord | null;
}) {
  const status = record?.status ?? PettyCashFundReplenishmentStatuses.draft;
  const isCancelled = status === PettyCashFundReplenishmentStatuses.cancelled;
  const isPosted = status === PettyCashFundReplenishmentStatuses.posted;
  const actions: ModuleActionMenuItem[] = [
    {
      disabled: isPosted || isCancelled,
      icon: ThumbsUp,
      label: "Approve",
      onSelect: () => onRequestConfirmation("approve"),
      type: "button",
    },
    {
      disabled: status === PettyCashFundReplenishmentStatuses.disapproved || isCancelled,
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
    return `${CashDisbursementStatusActionButtonClassName} border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500/15`;
  }

  if (action.label === "Disapprove") {
    return `${CashDisbursementStatusActionButtonClassName} border-red-200 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-500/15`;
  }

  if (action.label === "Cancel") {
    return `${CashDisbursementStatusActionButtonClassName} border-amber-200 bg-white text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-500/15`;
  }

  if (action.tone === "danger") {
    return `${CashDisbursementStatusActionButtonClassName} border-coralpink/45 bg-coralpink/5 text-coralpink hover:bg-coralpink/10 focus-visible:ring-coralpink/20`;
  }

  return moduleHeaderActionClassNames.secondary;
}
