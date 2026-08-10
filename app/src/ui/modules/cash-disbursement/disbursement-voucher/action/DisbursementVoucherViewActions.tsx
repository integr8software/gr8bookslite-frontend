import dynamic from "next/dynamic";
import { useState } from "react";
import {
  Ban,
  History,
  ThumbsDown,
  ThumbsUp,
  Undo2,
} from "lucide-react";
import {
  DisbursementVoucherStatuses,
  canApproveDisbursementVoucherStatus,
  canCancelDisbursementVoucherStatus,
  canDisapproveDisbursementVoucherStatus,
  getDisbursementVoucherStatusDialogCopy,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type {
  DisbursementVoucherHistoryEntry,
  DisbursementTransactionRecord,
  DisbursementVoucherRecord,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

const ModuleHistoryDialog = dynamic(
  () =>
    import("@/app/src/ui/shared/module/ModuleHistoryDialog").then(
      (module) => module.ModuleHistoryDialog,
    ),
  { ssr: false },
);

export function DisbursementVoucherViewActions({
  onUpdateStatus,
  onPreview,
  transaction,
  voucher,
}: {
  onUpdateStatus?: (status: DisbursementVoucherStatus) => void;
  onPreview?: () => void;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [statusToConfirm, setStatusToConfirm] =
    useState<DisbursementVoucherStatus | null>(null);
  const recordLabel =
    voucher?.voucherNo ?? transaction?.transactionNo ?? "this disbursement voucher";
  const historyEntries = createDisbursementVoucherViewHistory({
    recordLabel,
    transaction,
    voucher,
  });
  const statusDialogCopy = statusToConfirm
    ? getDisbursementVoucherStatusDialogCopy(statusToConfirm, recordLabel)
    : null;
  const actions = createDisbursementVoucherViewActionItems({
    onOpenHistory: () => setIsHistoryOpen(true),
    onRequestStatusConfirmation: setStatusToConfirm,
    onUpdateStatus,
    transaction,
    voucher,
  });
  const visibleActions = actions.filter((action) => action.label !== "History");
  const historyAction = actions.find(
    (action): action is Extract<ModuleActionMenuItem, { type: "button" }> =>
      action.type === "button" && action.label === "History",
  );

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        {historyAction ? <HeaderHistoryButton action={historyAction} /> : null}
        {onPreview ? <ReportPreviewAction onPreview={onPreview} /> : null}
        <ModuleActionMenu
          items={visibleActions}
          label="Disbursement voucher actions"
        />
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">
        {historyAction ? <HeaderHistoryButton action={historyAction} /> : null}
        {onPreview ? <ReportPreviewAction onPreview={onPreview} /> : null}
        {visibleActions.map((action) => {
          if (action.type === "button") {
            return <HeaderActionButton key={action.label} action={action} />;
          }

          return null;
        })}
      </div>
      {isHistoryOpen ? (
        <ModuleHistoryDialog
          description="Status changes and major disbursement voucher events."
          history={historyEntries}
          isOpen
          title="Disbursement Voucher History"
          onClose={() => setIsHistoryOpen(false)}
        />
      ) : null}
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

function createDisbursementVoucherViewActionItems({
  onOpenHistory,
  onRequestStatusConfirmation,
  onUpdateStatus,
  transaction,
  voucher,
}: {
  onOpenHistory: () => void;
  onRequestStatusConfirmation: (status: DisbursementVoucherStatus) => void;
  onUpdateStatus?: (status: DisbursementVoucherStatus) => void;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  const status = voucher?.status ?? transaction?.status ?? "Draft";
  const isPosted = status === DisbursementVoucherStatuses.posted;
  const isDisapproved = status === DisbursementVoucherStatuses.disapproved;
  const isCancelled = status === DisbursementVoucherStatuses.cancelled;
  const approvalUndoStatus: DisbursementVoucherStatus =
    DisbursementVoucherStatuses.forApproval;
  const cancelStatus: DisbursementVoucherStatus = isCancelled
    ? voucher
      ? DisbursementVoucherStatuses.draft
      : DisbursementVoucherStatuses.forApproval
    : DisbursementVoucherStatuses.cancelled;
  const actions: ModuleActionMenuItem[] = [
    {
      disabled:
        !onUpdateStatus || !canApproveDisbursementVoucherStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => {
        if (isPosted) {
          onUpdateStatus?.(approvalUndoStatus);
          return;
        }

        onRequestStatusConfirmation(DisbursementVoucherStatuses.posted);
      },
      type: "button",
    },
    {
      disabled:
        !onUpdateStatus || !canDisapproveDisbursementVoucherStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => {
        if (isDisapproved) {
          onUpdateStatus?.(approvalUndoStatus);
          return;
        }

        onRequestStatusConfirmation(DisbursementVoucherStatuses.disapproved);
      },
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled:
        !onUpdateStatus || !canCancelDisbursementVoucherStatus(status),
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
    {
      icon: History,
      label: "History",
      onSelect: onOpenHistory,
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

function HeaderHistoryButton({
  action,
}: {
  action: Extract<ModuleActionMenuItem, { type: "button" }>;
}) {
  const Icon = action.icon;

  return (
    <button
      type="button"
      disabled={action.disabled}
      onClick={action.onSelect}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-45"
      aria-label="Open disbursement voucher history"
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

function createDisbursementVoucherViewHistory({
  recordLabel,
  transaction,
  voucher,
}: {
  recordLabel: string;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}): DisbursementVoucherHistoryEntry[] {
  if (voucher?.history?.length) {
    return voucher.history;
  }

  if (!transaction) {
    return [];
  }

  const sourceDate =
    transaction.updatedAt ?? transaction.createdAt ?? transaction.transactionDate;

  return [
    {
      action: "Source Transaction",
      actor: transaction.updatedBy ?? transaction.createdBy ?? "System",
      createdAt: sourceDate,
      description: `${recordLabel} is available for disbursement voucher processing.`,
      id: `dv-history-${transaction.id}-source`,
      status: transaction.status,
    },
  ];
}
