import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CashVoucherHref } from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import type { CashVoucherActionHeaderProps } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleSaveButton } from "@/app/src/ui/shared/module/ModuleSaveButton";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";
import { CashVoucherViewActions } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/action/CashVoucherViewActions";

export function CashVoucherActionHeader({
  mode,
  transaction,
  voucher,
  onUpdateStatus,
  onPreview,
  onSubmit,
  onSaveDraft,
  copyFromRecords = [],
  copyFromSources = [],
  onCopyFrom,
  returnHref = CashVoucherHref,
}: CashVoucherActionHeaderProps) {
  const titleLabel =
    mode === "view"
      ? voucher?.voucherNo
        ? `View Cash Voucher | ${voucher.voucherNo}`
        : "View Cash Voucher"
      : mode === "edit"
        ? voucher?.voucherNo
          ? `Edit Cash Voucher | ${voucher.voucherNo}`
          : "Edit Cash Voucher"
        : "Add Cash Voucher";
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
  const transactionLabel = transaction?.transactionNo ?? "CashVoucher voucher";

  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      eyebrow={transactionLabel}
      title={title}
      description={helperText}
      actionsClassName="items-center justify-end gap-2"
      actions={
        <>
          <Link href={returnHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          {mode === "view" ? (
            <CashVoucherViewActions
              transaction={transaction}
              voucher={voucher}
              onUpdateStatus={onUpdateStatus}
              onPreview={onPreview}
            />
          ) : (
            <span className="inline-flex shrink-0 items-center gap-2">
              {onPreview ? <ReportPreviewAction onPreview={onPreview} /> : null}
              {mode === "add" && onCopyFrom ? (
                <AppCopyFromDropdown records={copyFromRecords} sources={copyFromSources} onApply={onCopyFrom} />
              ) : null}
              <ModuleSaveButton
                onSave={onSubmit}
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
  );
}


