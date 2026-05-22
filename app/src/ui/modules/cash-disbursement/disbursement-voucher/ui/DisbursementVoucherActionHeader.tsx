import Link from "next/link";
import { ArrowLeft, Edit3, FilePlus2, Save, Trash2 } from "lucide-react";
import { DisbursementVoucherHref } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type {
  DisbursementTransactionRecord,
  DisbursementVoucherActionMode,
  DisbursementVoucherRecord,
  WorkflowStep,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

type DisbursementVoucherActionHeaderProps = {
  canCreateAnother?: boolean;
  currentStep?: WorkflowStep;
  mode: DisbursementVoucherActionMode;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
  onDeleteVoucher?: () => void;
  onSubmit?: () => void;
};

export function DisbursementVoucherActionHeader({
  canCreateAnother = true,
  currentStep,
  mode,
  transaction,
  voucher,
  onDeleteVoucher,
  onSubmit,
}: DisbursementVoucherActionHeaderProps) {
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

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/45">
          {transaction?.transactionNo ?? "Voucher workflow"}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-darknavy">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-darknavy/60">
          {helperText}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={DisbursementVoucherHref}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:border-skyblue/40"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Table
        </Link>
        {mode === "view" ? (
          <>
            <Link
              href={`${DisbursementVoucherHref}/add?transactionId=${transaction?.id ?? ""}`}
              aria-disabled={!canCreateAnother}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                canCreateAnother
                  ? "bg-citron text-darknavy hover:bg-citron/85"
                  : "cursor-not-allowed bg-darknavy/8 text-darknavy/35"
              }`}
            >
              <FilePlus2 className="h-4 w-4" aria-hidden="true" />
              New Voucher
            </Link>
            {voucher ? (
              <Link
                href={`${DisbursementVoucherHref}/edit/${transaction?.id ?? ""}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-darknavy px-4 text-sm font-semibold text-white transition hover:bg-darknavy/92"
              >
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                Edit Voucher
              </Link>
            ) : (
              <span className="inline-flex h-11 items-center justify-center rounded-full border border-darknavy/10 px-4 text-sm font-semibold text-darknavy/35">
                Edit Voucher
              </span>
            )}
            {voucher && onDeleteVoucher ? (
              <button
                type="button"
                onClick={onDeleteVoucher}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-coralpink/30 bg-white px-4 text-sm font-semibold text-coralpink transition hover:bg-coralpink/10"
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-darknavy px-4 text-sm font-semibold text-white transition hover:bg-darknavy/92"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save Voucher
          </button>
        )}
      </div>
    </div>
  );
}
