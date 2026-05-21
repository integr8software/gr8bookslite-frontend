import Link from "next/link";
import { ArrowRight, NotebookPen } from "lucide-react";
import { DisbursementVoucherHref } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { formatCurrency } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type { DisbursementVoucherPreviewRow } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export function DisbursementVoucherHeader({
  previewRows,
}: {
  previewRows: DisbursementVoucherPreviewRow[];
}) {
  const vouchers = previewRows.filter((row) => row.voucher).map((row) => row.voucher);
  const approvedAmount = vouchers
    .filter((voucher) => voucher?.status === "Approved")
    .reduce((sum, voucher) => sum + (voucher?.amount ?? 0), 0);
  const pendingAmount = vouchers
    .filter((voucher) => voucher?.status === "Pending Review")
    .reduce((sum, voucher) => sum + (voucher?.amount ?? 0), 0);
  const totalAmount = vouchers.reduce(
    (sum, voucher) => sum + (voucher?.amount ?? 0),
    0,
  );
  const stats = [
    {
      label: "Tracked transactions",
      value: String(previewRows.length),
      helper: "Ready for disbursement review",
      tone: "bg-offwhite",
    },
    {
      label: "Live vouchers",
      value: String(vouchers.length),
      helper: formatCurrency(totalAmount),
      tone: "bg-skyblue/15",
    },
    {
      label: "Approved releases",
      value: formatCurrency(approvedAmount),
      helper: `${vouchers.filter((voucher) => voucher?.status === "Approved").length} vouchers`,
      tone: "bg-citron/25",
    },
    {
      label: "Pending review",
      value: formatCurrency(pendingAmount),
      helper: `${vouchers.filter((voucher) => voucher?.status === "Pending Review").length} vouchers`,
      tone: "bg-coralpink/12",
    },
  ];

  return (
    <section className="overflow-hidden rounded-[28px] border border-darknavy/10 bg-[linear-gradient(135deg,rgba(236,242,239,0.96),rgba(255,255,255,1)_42%,rgba(87,196,229,0.12))] shadow-[0_30px_80px_rgba(33,39,56,0.08)]">
      <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between lg:p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-darknavy/10 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-darknavy/65">
            <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
            Cash Disbursement Desk
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-darknavy sm:text-4xl">
            Disbursement voucher control center
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-darknavy/60 sm:text-base">
            Search source transactions, preview linked vouchers, and move into a
            guided multi-step voucher workflow when a transaction is ready.
          </p>
        </div>
        <Link
          href={`${DisbursementVoucherHref}/add`}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-darknavy px-5 text-sm font-semibold text-white shadow-lg shadow-darknavy/15 transition hover:-translate-y-0.5 hover:bg-darknavy/95"
        >
          Start New Voucher
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid gap-4 border-t border-darknavy/8 bg-white/75 p-6 sm:grid-cols-2 xl:grid-cols-4 xl:p-8">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className={`rounded-[24px] border border-darknavy/8 p-5 ${stat.tone}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-darknavy/45">
              {stat.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-darknavy">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-darknavy/55">{stat.helper}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
