"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Ban, History, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  CashAdvanceStatuses,
  canApproveCashAdvanceStatus,
  canCancelCashAdvanceStatus,
  canDisapproveCashAdvanceStatus,
  getCashAdvanceStatusDialogCopy,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type {
  CashAdvanceRecord,
  CashAdvanceStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { ModuleHistoryEntry } from "@/app/src/types/shared/module/ModuleHistoryTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

const ModuleHistoryDialog = dynamic(
  () =>
    import("@/app/src/ui/shared/module/ModuleHistoryDialog").then(
      (module) => module.ModuleHistoryDialog,
    ),
  { ssr: false },
);

export function CashAdvanceHistoryButton({
  record,
}: {
  record?: CashAdvanceRecord | null;
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historyEntries = createCashAdvanceHistory(record);

  return (
    <>
      <button
        type="button"
        disabled={!record}
        onClick={() => setIsHistoryOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-45"
        aria-label="Open cash advance history"
      >
        <History className="h-4 w-4" aria-hidden="true" />
        History
      </button>
      {isHistoryOpen ? (
        <ModuleHistoryDialog
          description="Status changes and major cash advance events."
          history={historyEntries}
          isOpen
          title="Cash Advance History"
          onClose={() => setIsHistoryOpen(false)}
        />
      ) : null}
    </>
  );
}

export function CashAdvanceViewActions({
  onUpdateStatus,
  record,
}: {
  onUpdateStatus?: (status: CashAdvanceStatus) => void;
  record?: CashAdvanceRecord | null;
}) {
  const [statusToConfirm, setStatusToConfirm] = useState<CashAdvanceStatus | null>(null);
  const recordLabel = record?.transNo ?? "this cash advance";
  const statusDialogCopy = statusToConfirm
    ? getCashAdvanceStatusDialogCopy(statusToConfirm, recordLabel)
    : null;
  const actions = createCashAdvanceViewActionItems({
    onRequestStatusConfirmation: setStatusToConfirm,
    onUpdateStatus,
    record,
  });

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        <ModuleActionMenu items={actions} label="Cash advance actions" />
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">
        {actions.map((action) => {
          if (action.type === "button") {
            return <HeaderActionButton key={action.label} action={action} />;
          }

          return null;
        })}
      </div>
      {statusDialogCopy ? (
        <AppDialog
          isOpen
          title={statusDialogCopy.title}
          description={statusDialogCopy.description}
          cancelLabel="Keep Current Status"
          confirmLabel={statusDialogCopy.confirmLabel}
          iconTone={statusDialogCopy.iconTone}
          pendingLabel={statusDialogCopy.pendingLabel}
          tone={statusDialogCopy.tone}
          onCancel={() => setStatusToConfirm(null)}
          onConfirm={() => {
            if (!statusToConfirm) {
              return;
            }

            onUpdateStatus?.(statusToConfirm);
            setStatusToConfirm(null);
          }}
        />
      ) : null}
    </>
  );
}

function createCashAdvanceHistory(
  record?: CashAdvanceRecord | null,
): ModuleHistoryEntry<CashAdvanceStatus>[] {
  if (!record) {
    return [];
  }

  const createdAt = record.createdAt ?? record.documentDate;
  const updatedAt = record.updatedAt ?? record.createdAt ?? record.documentDate;
  const history: ModuleHistoryEntry<CashAdvanceStatus>[] = [
    {
      action: "Created",
      actor: record.createdBy ?? record.partyName ?? "System",
      createdAt,
      description: `${record.transNo} was created.`,
      id: `ca-history-${record.id}-created`,
      status: CashAdvanceStatuses.draft,
    },
  ];

  if (updatedAt !== createdAt || record.status !== CashAdvanceStatuses.draft) {
    history.push({
      action: "Updated",
      actor: record.updatedBy ?? record.createdBy ?? "System",
      createdAt: updatedAt,
      description: `${record.transNo} is currently ${record.status}.`,
      id: `ca-history-${record.id}-updated`,
      status: record.status,
    });
  }

  return history;
}

function createCashAdvanceViewActionItems({
  onRequestStatusConfirmation,
  onUpdateStatus,
  record,
}: {
  onRequestStatusConfirmation: (status: CashAdvanceStatus) => void;
  onUpdateStatus?: (status: CashAdvanceStatus) => void;
  record?: CashAdvanceRecord | null;
}) {
  const status = record?.status ?? CashAdvanceStatuses.draft;
  const isPosted = status === CashAdvanceStatuses.posted;
  const isDisapproved = status === CashAdvanceStatuses.disapproved;
  const isCancelled = status === CashAdvanceStatuses.cancelled;
  const approvalUndoStatus: CashAdvanceStatus = CashAdvanceStatuses.forApproval;
  const cancelStatus: CashAdvanceStatus = isCancelled
    ? CashAdvanceStatuses.draft
    : CashAdvanceStatuses.cancelled;
  const actions: ModuleActionMenuItem[] = [
    {
      disabled: !onUpdateStatus || !canApproveCashAdvanceStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => {
        if (isPosted) {
          onUpdateStatus?.(approvalUndoStatus);
          return;
        }

        onRequestStatusConfirmation(CashAdvanceStatuses.posted);
      },
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canDisapproveCashAdvanceStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => {
        if (isDisapproved) {
          onUpdateStatus?.(approvalUndoStatus);
          return;
        }

        onRequestStatusConfirmation(CashAdvanceStatuses.disapproved);
      },
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canCancelCashAdvanceStatus(status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      onSelect: () => {
        if (isCancelled) {
          onUpdateStatus?.(cancelStatus);
          return;
        }

        onRequestStatusConfirmation(cancelStatus);
      },
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
  const className = getViewActionButtonClassName(action);

  return (
    <button
      type="button"
      disabled={action.disabled}
      onClick={action.onSelect}
      className={className}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {action.label}
    </button>
  );
}

function getViewActionButtonClassName(
  action: Extract<ModuleActionMenuItem, { type: "button" }>,
) {
  const baseClassName =
    "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold shadow-sm shadow-darknavy/5 transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white";

  if (action.label === "Approve") {
    return `${baseClassName} border-citron/60 bg-citron/20 text-darknavy hover:bg-citron/30 focus-visible:ring-citron/25`;
  }

  if (
    action.label === "Undo Approved" ||
    action.label === "Undo Disapproved" ||
    action.label === "Undo Cancelled"
  ) {
    return `${baseClassName} border-skyblue/35 bg-skyblue/10 text-skyblue hover:bg-skyblue/15 focus-visible:ring-skyblue/20`;
  }

  if (action.tone === "danger") {
    return `${baseClassName} border-coralpink/45 bg-coralpink/5 text-coralpink hover:bg-coralpink/10 focus-visible:ring-coralpink/20`;
  }

  return moduleHeaderActionClassNames.secondary;
}
