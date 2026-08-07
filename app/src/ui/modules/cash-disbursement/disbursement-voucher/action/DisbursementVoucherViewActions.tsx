import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import {
  Ban,
  CheckCircle2,
  Edit3,
  History,
  ThumbsDown,
  Undo2,
} from "lucide-react";
import {
  DisbursementVoucherHref,
  DisbursementVoucherStatuses,
  canApproveDisbursementVoucherStatus,
  canCancelDisbursementVoucherStatus,
  canDisapproveDisbursementVoucherStatus,
  canEditDisbursementVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type {
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

const ModuleHistoryDialog = dynamic(
  () =>
    import("@/app/src/ui/shared/module/ModuleHistoryDialog").then(
      (module) => module.ModuleHistoryDialog,
    ),
  { ssr: false },
);

export function DisbursementVoucherViewActions({
  onUpdateStatus,
  transaction,
  voucher,
}: {
  onUpdateStatus?: (status: DisbursementVoucherStatus) => void;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [cancelStatusToConfirm, setCancelStatusToConfirm] =
    useState<DisbursementVoucherStatus | null>(null);
  const recordLabel =
    voucher?.voucherNo ?? transaction?.transactionNo ?? "this disbursement voucher";
  const actions = createDisbursementVoucherViewActionItems({
    onOpenHistory: () => setIsHistoryOpen(true),
    onRequestCancel: setCancelStatusToConfirm,
    onUpdateStatus,
    transaction,
    voucher,
  });

  return (
    <>
      <div className="flex lg:hidden">
        <ModuleActionMenu
          items={actions}
          label="Disbursement voucher actions"
        />
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">
        {actions.map((action) => {
          if (action.type === "button") {
            return <HeaderActionButton key={action.label} action={action} />;
          }

          const Icon = action.icon;

          return (
            <Link
              key={action.label}
              href={action.href}
              className={moduleHeaderActionClassNames.secondary}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {action.label}
            </Link>
          );
        })}
      </div>
      {isHistoryOpen ? (
        <ModuleHistoryDialog
          description="Status changes and major disbursement voucher events."
          history={voucher?.history ?? []}
          isOpen
          title="Disbursement Voucher History"
          onClose={() => setIsHistoryOpen(false)}
        />
      ) : null}
      <AppDialog
        isOpen={Boolean(cancelStatusToConfirm)}
        title="Cancel disbursement voucher?"
        description={`This will mark ${recordLabel} as cancelled.`}
        confirmLabel="Cancel Voucher"
        pendingLabel="Cancelling..."
        tone="danger"
        onCancel={() => setCancelStatusToConfirm(null)}
        onConfirm={() => {
          if (!cancelStatusToConfirm) {
            return;
          }

          onUpdateStatus?.(cancelStatusToConfirm);
          setCancelStatusToConfirm(null);
        }}
      />
    </>
  );
}

function createDisbursementVoucherViewActionItems({
  onOpenHistory,
  onRequestCancel,
  onUpdateStatus,
  transaction,
  voucher,
}: {
  onOpenHistory: () => void;
  onRequestCancel: (status: DisbursementVoucherStatus) => void;
  onUpdateStatus?: (status: DisbursementVoucherStatus) => void;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  const status = voucher?.status ?? transaction?.status ?? "Draft";
  const canEdit = voucher && canEditDisbursementVoucherStatus(status);
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
    ...(canEdit
      ? [
          {
            href: `${DisbursementVoucherHref}/edit/${transaction?.id ?? voucher.transactionId}`,
            icon: Edit3,
            label: "Edit",
            type: "link",
          } satisfies ModuleActionMenuItem,
        ]
      : []),
    {
      disabled:
        !onUpdateStatus || !canApproveDisbursementVoucherStatus(status),
      icon: isPosted ? Undo2 : CheckCircle2,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () =>
        onUpdateStatus?.(
          isPosted ? approvalUndoStatus : DisbursementVoucherStatuses.posted,
        ),
      type: "button",
    },
    {
      disabled:
        !onUpdateStatus || !canDisapproveDisbursementVoucherStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () =>
        onUpdateStatus?.(
          isDisapproved
            ? approvalUndoStatus
            : DisbursementVoucherStatuses.disapproved,
        ),
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

        onRequestCancel(cancelStatus);
      },
      tone: isCancelled ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !voucher,
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
