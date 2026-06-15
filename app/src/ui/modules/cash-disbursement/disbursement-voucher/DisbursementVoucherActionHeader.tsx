import Link from "next/link";
import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import { DisbursementVoucherHref } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type {
  DisbursementTransactionRecord,
  DisbursementVoucherActionMode,
  DisbursementVoucherRecord,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
  AppCopyFromDropdown,
  type AppCopyFromRecord,
} from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

type DisbursementVoucherActionHeaderProps = {
  mode: DisbursementVoucherActionMode;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
  onEditVoucher?: () => void;
  onDeleteVoucher?: () => void;
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
  onEditVoucher,
  onDeleteVoucher,
  onSubmit,
  copyFromRecords = [],
  copyFromSources = [],
  onCopyFrom,
  returnHref = DisbursementVoucherHref,
}: DisbursementVoucherActionHeaderProps) {
  const accentPrimaryActionClassName =
    "theme-accent-contrast-text inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20";
  const title =
    mode === "view"
      ? voucher?.voucherNo
        ? `View Disbursement Voucher - ${voucher.voucherNo}`
        : "View Disbursement Voucher"
      : mode === "edit"
        ? voucher?.voucherNo
          ? `Edit Disbursement Voucher - ${voucher.voucherNo}`
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
      actionsClassName="items-center"
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
            <>
              {voucher ? (
                <button
                  type="button"
                  onClick={onEditVoucher}
                  className={accentPrimaryActionClassName}
                >
                  <Edit3 className="h-4 w-4" aria-hidden="true" />
                  Edit Voucher
                </button>
              ) : (
                <span className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/10 px-4 text-sm font-semibold text-darknavy/35">
                  Edit Voucher
                </span>
              )}
              {voucher && onDeleteVoucher ? (
                <button
                  type="button"
                  onClick={onDeleteVoucher}
                  className={moduleHeaderActionClassNames.danger}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </button>
              ) : null}
            </>
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
                className={accentPrimaryActionClassName}
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
