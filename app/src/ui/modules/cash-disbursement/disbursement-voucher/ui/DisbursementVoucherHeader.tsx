import { ArrowRight, FileCheck2, NotebookPen, ReceiptText } from "lucide-react";
import type { DisbursementVoucherPreviewRow } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
  ModuleHeader,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
  ModuleMetrics,
  type ModuleMetricItem,
} from "@/app/src/ui/shared/module/ModuleMetrics";

export function DisbursementVoucherHeader({
  previewRows,
  onStartVoucher,
}: {
  previewRows: DisbursementVoucherPreviewRow[];
  onStartVoucher: () => void;
}) {
  const accentPrimaryActionClassName =
    "theme-accent-contrast-text inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20";
  const linkedVoucherCount = previewRows.filter((row) => row.voucher).length;
  const pendingVoucherCount = previewRows.length - linkedVoucherCount;
  const metrics: ModuleMetricItem[] = [
    {
      icon: NotebookPen,
      label: "Visible transactions",
      tone: "blue",
      value: previewRows.length,
      helper: "Current rows available in the voucher desk.",
    },
    {
      icon: FileCheck2,
      label: "Linked vouchers",
      tone: "emerald",
      value: linkedVoucherCount,
      helper: "Transactions that already have a voucher attached.",
    },
    {
      icon: ReceiptText,
      label: "Ready to create",
      tone: "amber",
      value: pendingVoucherCount,
      helper: "Transactions still waiting for voucher encoding.",
    },
  ];

  return (
    <section className="grid gap-5">
      <div className="rounded-[28px] border border-darknavy/10 bg-white p-6 shadow-[0_18px_60px_rgba(33,39,56,0.08)] lg:p-8">
        <ModuleHeader
          eyebrow="Cash Disbursement Desk"
          title="Disbursement voucher control center"
          description="Search source transactions, preview linked vouchers, and launch the shared drawer form for new or edit encoding when a transaction is ready."
          actions={
            <button
              type="button"
              onClick={onStartVoucher}
              className={accentPrimaryActionClassName}
            >
              Start New Voucher
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          }
        />
      </div>
      <ModuleMetrics metrics={metrics} />
    </section>
  );
}
