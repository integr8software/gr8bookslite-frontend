import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DisbursementVoucherHref } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
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
import { ModuleSaveButton } from "@/app/src/ui/shared/module/ModuleSaveButton";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import {
  AppCopyFromDropdown,
  type AppCopyFromRecord,
} from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";
import { DisbursementVoucherViewActions } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherViewActions";

type DisbursementVoucherActionHeaderProps = {
  mode: DisbursementVoucherActionMode;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
  onUpdateStatus?: (status: DisbursementVoucherStatus) => void;
  onPreview?: () => void;
  onSubmit?: () => void;
  onSaveDraft?: () => void;
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
  onPreview,
  onSubmit,
  onSaveDraft,
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
      actionsClassName="items-center justify-end gap-2"
      actions={
        <>
          <Link
            href={returnHref}
            className={moduleHeaderActionClassNames.secondary}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          {onPreview ? <ReportPreviewAction onPreview={onPreview} /> : null}
          {mode === "view" ? (
            <DisbursementVoucherViewActions
              transaction={transaction}
              voucher={voucher}
              onUpdateStatus={onUpdateStatus}
            />
          ) : (
            <span className="inline-flex shrink-0 items-center gap-2">
              {mode === "add" && onCopyFrom ? (
                <AppCopyFromDropdown
                  records={copyFromRecords}
                  sources={copyFromSources}
                  onApply={onCopyFrom}
                />
              ) : null}
              <ModuleSaveButton
                onSave={onSubmit}
                menuItems={[
                  {
                    label: "Save As Draft",
                    onSelect: onSaveDraft,
                  },
                ]}
              />
            </span>
          )}
        </>
      }
    />
  );
}
