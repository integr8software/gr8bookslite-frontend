import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Edit3,
  History,
  Save,
  ThumbsDown,
  Undo2,
  X,
} from "lucide-react";
import {
  DisbursementVoucherHref,
  canApproveDisbursementVoucherStatus,
  canCancelDisbursementVoucherStatus,
  canDisapproveDisbursementVoucherStatus,
  canEditDisbursementVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type {
  DisbursementTransactionRecord,
  DisbursementVoucherActionMode,
  DisbursementVoucherRecord,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
  ModuleActionMenu,
  type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
  AppCopyFromDropdown,
  type AppCopyFromRecord,
} from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

const ModuleHistoryDialog = dynamic(
  () =>
    import("@/app/src/ui/shared/module/ModuleHistoryDialog").then(
      (module) => module.ModuleHistoryDialog,
    ),
  { ssr: false },
);

type DisbursementVoucherActionHeaderProps = {
  mode: DisbursementVoucherActionMode;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
  onUpdateStatus?: (status: DisbursementVoucherStatus) => void;
  onSubmit?: () => void;
  copyFromRecords?: AppCopyFromRecord[];
  copyFromSources?: string[];
  onCopyFrom?: (recordIds: string[]) => void;
  returnHref?: string;
};

export function DisbursementVoucherActionHeader({
  mode,
  transaction,
  voucher,
  onUpdateStatus,
  onSubmit,
  copyFromRecords = [],
  copyFromSources = [],
  onCopyFrom,
  returnHref = DisbursementVoucherHref,
}: DisbursementVoucherActionHeaderProps) {
  const title =
    mode === "view"
      ? voucher?.voucherNo
        ? `View Disbursement Voucher | ${voucher.voucherNo}`
        : "View Disbursement Voucher"
      : mode === "edit"
        ? voucher?.voucherNo
          ? `Edit Disbursement Voucher | ${voucher.voucherNo}`
          : "Edit Disbursement Voucher"
        : "Add Disbursement Voucher";
  const helperText =
    mode === "view"
      ? "Review the transaction source and choose whether to create or update a voucher."
      : "Complete the voucher header and accounting entries on one page before saving.";
  const transactionLabel = transaction?.transactionNo ?? "Disbursement voucher";

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      eyebrow={transactionLabel}
      title={title}
      description={helperText}
      actionsClassName="items-center gap-1"
      actions={
        <>
          <Link
            href={returnHref}
            className={moduleHeaderActionClassNames.secondary}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          {mode === "view" ? (
            <DisbursementVoucherViewActions
              transaction={transaction}
              voucher={voucher}
              onUpdateStatus={onUpdateStatus}
            />
          ) : (
            <>
              <Link
                href={returnHref}
                className={moduleHeaderActionClassNames.secondary}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </Link>
              {mode === "add" && onCopyFrom ? (
                <AppCopyFromDropdown
                  records={copyFromRecords}
                  sources={copyFromSources}
                  onApply={onCopyFrom}
                />
              ) : null}
              <button
                type="button"
                onClick={onSubmit}
                className={moduleHeaderActionClassNames.primary}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save
              </button>
            </>
          )}
        </>
      }
    />
  );
}

function DisbursementVoucherViewActions({
  onUpdateStatus,
  transaction,
  voucher,
}: {
  onUpdateStatus?: (status: DisbursementVoucherStatus) => void;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const actions = createDisbursementVoucherViewActionItems({
    onOpenHistory: () => setIsHistoryOpen(true),
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
          onClose={() => setIsHistoryOpen(false)}
        />
      ) : null}
    </>
  );
}

function createDisbursementVoucherViewActionItems({
  onOpenHistory,
  onUpdateStatus,
  transaction,
  voucher,
}: {
  onOpenHistory: () => void;
  onUpdateStatus?: (status: DisbursementVoucherStatus) => void;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  const status = voucher?.status ?? transaction?.status ?? "Draft";
  const canEdit = voucher && canEditDisbursementVoucherStatus(status);
  const isApproved = status === "Approved";
  const isDisapproved = status === "Disapproved";
  const isCancelled = status === "Cancelled";
  const approvalUndoStatus: DisbursementVoucherStatus = "Active";
  const cancelStatus: DisbursementVoucherStatus = isCancelled
    ? voucher
      ? "Draft"
      : "Pending"
    : "Cancelled";
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
      icon: isApproved ? Undo2 : CheckCircle2,
      label: isApproved ? "Undo Approved" : "Approve",
      onSelect: () =>
        onUpdateStatus?.(isApproved ? approvalUndoStatus : "Approved"),
      type: "button",
    },
    {
      disabled:
        !onUpdateStatus || !canDisapproveDisbursementVoucherStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () =>
        onUpdateStatus?.(
          isDisapproved ? approvalUndoStatus : "Disapproved",
        ),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled:
        !onUpdateStatus || !canCancelDisbursementVoucherStatus(status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Uncancelled" : "Cancel",
      onSelect: () => onUpdateStatus?.(cancelStatus),
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
    action.label === "Uncancelled"
  ) {
    return `${baseClassName} border-skyblue/35 bg-skyblue/10 text-skyblue hover:bg-skyblue/15 focus-visible:ring-skyblue/20`;
  }

  if (action.label === "Cancel") {
    return `${baseClassName} border-darknavy/12 bg-white text-darknavy/70 hover:bg-darknavy/5 hover:text-darknavy focus-visible:ring-darknavy/10`;
  }

  if (action.tone === "danger") {
    return `${baseClassName} border-coralpink/45 bg-coralpink/5 text-coralpink hover:bg-coralpink/10 focus-visible:ring-coralpink/20`;
  }

  return moduleHeaderActionClassNames.secondary;
}
