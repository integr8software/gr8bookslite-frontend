import { ArrowRight, NotebookPen } from "lucide-react";
import type { DisbursementVoucherPreviewRow } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export function DisbursementVoucherHeader({
  previewRows,
  onStartVoucher,
}: {
  previewRows: DisbursementVoucherPreviewRow[];
  onStartVoucher: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-darknavy/10">
      <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between lg:p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-darknavy/10 bg-darknavy/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-darknavy/65">
            <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
            Cash Disbursement Desk
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-darknavy sm:text-4xl">
            Disbursement voucher control center
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-darknavy/60 sm:text-base">
            Search source transactions, preview linked vouchers, and launch the
            shared drawer form for new or edit encoding when a transaction is ready.
          </p>
          <p className="mt-3 text-sm font-medium text-darknavy/55">
            {previewRows.length} transactions currently visible in the voucher desk.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartVoucher}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-darknavy px-5 text-sm font-semibold text-white shadow-lg shadow-darknavy/15 transition hover:-translate-y-0.5 hover:bg-darknavy/95"
        >
          Start New Voucher
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
