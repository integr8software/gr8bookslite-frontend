import Link from "next/link";
import { ArrowLeft, Edit3, FilePlus2, Save, Trash2 } from "lucide-react";
import { DisbursementVoucherHref } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type {
  DisbursementTransactionRecord,
  DisbursementVoucherActionMode,
  DisbursementVoucherRecord,
  WorkflowStep,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

type DisbursementVoucherActionHeaderProps = {
  canCreateAnother?: boolean;
  currentStep?: WorkflowStep;
  mode: DisbursementVoucherActionMode;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
  onCreateVoucher?: () => void;
  onEditVoucher?: () => void;
  onDeleteVoucher?: () => void;
  onSubmit?: () => void;
};

export function DisbursementVoucherActionHeader({
  canCreateAnother = true,
  currentStep,
  mode,
  transaction,
  voucher,
  onCreateVoucher,
  onEditVoucher,
  onDeleteVoucher,
  onSubmit,
}: DisbursementVoucherActionHeaderProps) {
  const accentPrimaryActionClassName =
    "theme-accent-contrast-text inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20";
  const title =
    mode === "view"
      ? "Voucher Preview"
      : mode === "edit"
        ? "Edit Disbursement Voucher"
        : "New Disbursement Voucher";
  const helperText =
    mode === "view"
      ? "Review the transaction source and choose whether to create or update a voucher."
      : currentStep === "entries"
        ? "Keep the debit and credit sides in balance before moving to review."
        : currentStep === "review"
          ? "Confirm the complete disbursement package before saving."
          : "Capture the payment setup before building the ledger entries.";
  const transactionLabel = transaction?.transactionNo ?? "Voucher workflow";

  return (
    <ModuleHeader
      eyebrow={transactionLabel}
      title={title}
      description={helperText}
      actionsClassName="items-center"
      actions={
        <>
          <Link
            href={DisbursementVoucherHref}
            className={moduleHeaderActionClassNames.secondary}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Table
          </Link>
          {mode === "view" ? (
            <>
              <Link
                href={
                  canCreateAnother
                    ? `${DisbursementVoucherHref}/add?transactionId=${transaction?.id ?? ""}`
                    : "#"
                }
                aria-disabled={!canCreateAnother}
                onClick={(event) => {
                  if (!canCreateAnother) {
                    event.preventDefault();
                    return;
                  }

                  if (onCreateVoucher) {
                    event.preventDefault();
                    onCreateVoucher();
                  }
                }}
                className={
                  canCreateAnother
                    ? moduleHeaderActionClassNames.secondary
                    : "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-darknavy/8 px-4 text-sm font-semibold text-darknavy/35"
                }
              >
                <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                New Voucher
              </Link>
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
            <button
              type="button"
              onClick={onSubmit}
              className={accentPrimaryActionClassName}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Save Voucher
            </button>
          )}
        </>
      }
    />
  );
}
