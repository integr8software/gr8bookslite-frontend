"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import {
  CashVoucherLink,
  canEditCashVoucherStatus,
  getCashVoucherEditLink,
  getCashVoucherStatusDialogCopy,
  getCashVoucherSubmitDialogCopy,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import type {
  CashVoucherActionHeaderProps,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleDraftDiscardAction } from "@/app/src/ui/shared/module/ModuleDraftDiscardAction";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { VoucherReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";
import { CashVoucherStatusActions } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/action/CashVoucherStatusActions";

export function CashVoucherActionHeader({
  mode,
  hasDiscardableChanges,
  isSubmitting,
  pendingSubmitStatus,
  transaction,
  voucher,
  onBack,
  onDiscard,
  onUpdateStatus,
  onPreview,
  onSubmit,
  onSaveDraft,
  copyFromRecords = [],
  copyFromSources = [],
  onCopyFrom,
  onCancelSubmit,
  onConfirmSubmit,
  returnLink = CashVoucherLink,
}: CashVoucherActionHeaderProps) {
  const [statusToConfirm, setStatusToConfirm] = useState<CashVoucherStatus | null>(null);
  const transactionLabel = transaction?.transactionNo ?? "Cash Voucher";
  const recordLabel = voucher?.voucherNo ?? transaction?.transactionNo ?? "this cash voucher";
  const title =
    mode === "add" ? (
      "Add Cash Voucher"
    ) : (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>
          {mode === "view" ? "View" : "Edit"} Cash Voucher | {recordLabel}
        </span>
        {voucher?.status ? <ModuleStatusBadge status={voucher.status} /> : null}
      </span>
    );
  const helperText =
    mode === "view"
      ? "Review the transaction source and choose whether to create or update a voucher."
      : "Complete the voucher header and accounting entries on one page before saving.";
  const submitDialogCopy = pendingSubmitStatus ? getCashVoucherSubmitDialogCopy(mode, pendingSubmitStatus) : null;
  const statusDialogCopy = statusToConfirm
    ? getCashVoucherStatusDialogCopy(statusToConfirm, recordLabel, voucher?.status ?? transaction?.status)
    : null;

  return (
    <>
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        eyebrow={transactionLabel}
        title={title}
        description={helperText}
        actionsClassName="items-center justify-end gap-2"
        actions={
          <>
            <Link href={returnLink} className={moduleHeaderActionClassNames.secondary} onClick={onBack}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            {mode !== "view" && onDiscard ? (
              <ModuleDraftDiscardAction
                hasChanges={hasDiscardableChanges}
                href={returnLink}
                mode={mode}
                onDiscard={onDiscard}
              />
            ) : null}
            {mode === "view" ? (
              <>
                <CashVoucherStatusActions
                  transaction={transaction}
                  voucher={voucher}
                  onRequestStatusConfirmation={setStatusToConfirm}
                  onUpdateStatus={onUpdateStatus}
                  onPreview={onPreview}
                />
                {transaction && voucher && canEditCashVoucherStatus(voucher.status) ? (
                  <Link href={getCashVoucherEditLink(transaction.id)} className={moduleHeaderActionClassNames.primary}>
                    <Edit3 className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Link>
                ) : null}
              </>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-2">
                {onPreview ? <VoucherReportPreviewAction onPreview={onPreview} /> : null}
                {mode === "add" && onCopyFrom ? (
                  <AppCopyFromDropdown enableSourceSearch records={copyFromRecords} sources={copyFromSources} onApply={onCopyFrom} />
                ) : null}
                <ModuleActionButton
                  disabled={isSubmitting}
                  label={isSubmitting ? "Saving..." : mode === "edit" ? "Update" : "Save"}
                  onAction={onSubmit}
                  menuItems={
                    mode === "add" && onSaveDraft
                      ? [
                          {
                            label: "Save As Draft",
                            onSelect: onSaveDraft,
                          },
                        ]
                      : []
                  }
                />
              </span>
            )}
          </>
        }
      />
      {submitDialogCopy ? (
        <AppDialog
          isOpen
          title={submitDialogCopy.title}
          description={submitDialogCopy.description}
          confirmLabel={submitDialogCopy.confirmLabel}
          cancelLabel="Continue Editing"
          iconTone={submitDialogCopy.iconTone}
          pendingLabel={submitDialogCopy.pendingLabel}
          tone="default"
          onCancel={onCancelSubmit}
          onConfirm={onConfirmSubmit}
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
            if (statusToConfirm) onUpdateStatus?.(statusToConfirm);
            setStatusToConfirm(null);
          }}
        />
      ) : null}
    </>
  );
}
