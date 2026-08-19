"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  DisbursementVoucherLink,
  getDisbursementVoucherStatusDialogCopy,
  getDisbursementVoucherSubmitDialogCopy,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type {
  DisbursementVoucherActionHeaderProps,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleActionButton } from "@/app/src/ui/shared/module/ModuleActionButton";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { VoucherReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";
import { DisbursementVoucherViewActions } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherViewActions";

export function DisbursementVoucherActionHeader({
  mode,
  pendingSubmitStatus,
  transaction,
  voucher,
  onUpdateStatus,
  onPreview,
  onSubmit,
  onSaveDraft,
  copyFromRecords = [],
  copyFromSources = [],
  onCopyFrom,
  onCancelSubmit,
  onConfirmSubmit,
  returnLink = DisbursementVoucherLink,
}: DisbursementVoucherActionHeaderProps) {
  const [statusToConfirm, setStatusToConfirm] = useState<DisbursementVoucherStatus | null>(null);
  const titleLabel =
    mode === "view"
      ? voucher?.voucherNo
        ? `View Disbursement Voucher | ${voucher.voucherNo}`
        : "View Disbursement Voucher"
      : mode === "edit"
        ? voucher?.voucherNo
          ? `Edit Disbursement Voucher | ${voucher.voucherNo}`
          : "Edit Disbursement Voucher"
        : "Add Disbursement Voucher";
  const title = (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span>{titleLabel}</span>
      {voucher?.status ? <ModuleStatusBadge status={voucher.status} /> : null}
    </span>
  );
  const helperText =
    mode === "view"
      ? "Review the transaction source and choose whether to create or update a voucher."
      : "Complete the voucher header and accounting entries on one page before saving.";
  const transactionLabel = transaction?.transactionNo ?? "Disbursement voucher";
  const recordLabel = voucher?.voucherNo ?? transaction?.transactionNo ?? "this disbursement voucher";
  const submitDialogCopy = pendingSubmitStatus
    ? getDisbursementVoucherSubmitDialogCopy(mode, pendingSubmitStatus)
    : null;
  const statusDialogCopy = statusToConfirm
    ? getDisbursementVoucherStatusDialogCopy(statusToConfirm, recordLabel, voucher?.status ?? transaction?.status)
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
          <Link href={returnLink} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          {mode === "view" ? (
            <DisbursementVoucherViewActions
              transaction={transaction}
              voucher={voucher}
              onRequestStatusConfirmation={setStatusToConfirm}
              onUpdateStatus={onUpdateStatus}
              onPreview={onPreview}
            />
          ) : (
            <span className="inline-flex shrink-0 items-center gap-2">
              {onPreview ? <VoucherReportPreviewAction onPreview={onPreview} /> : null}
              {mode === "add" && onCopyFrom ? (
                <AppCopyFromDropdown records={copyFromRecords} sources={copyFromSources} onApply={onCopyFrom} />
              ) : null}
              <ModuleActionButton
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
          pendingLabel={submitDialogCopy.pendingLabel}
          tone="question"
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
