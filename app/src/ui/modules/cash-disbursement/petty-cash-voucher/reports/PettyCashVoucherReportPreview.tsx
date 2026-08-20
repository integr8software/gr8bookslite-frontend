import type { PettyCashVoucherActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

export function PettyCashVoucherReportPreview({
  isOpen,
  onClose,
  onGeneratePdf,
  page,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf: () => void;
  page: PettyCashVoucherActionPageState;
}) {
  const amount = Number(page.values.amount.replace(/,/g, "")) || 0;
  const netAmount = Number(page.values.netAmount.replace(/,/g, "")) || 0;
  const vatAmount = Number(page.values.vatAmount.replace(/,/g, "")) || 0;

  return (
    <ReportPreviewDrawer
      isOpen={isOpen}
      eyebrow="Cash disbursement"
      title="Petty Cash Voucher Preview"
      description="Review the petty cash voucher details before printing."
      onClose={onClose}
      onGeneratePdf={onGeneratePdf}
    >
      <article className="mx-auto min-w-[48rem] max-w-4xl bg-white p-12 text-darknavy shadow-sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-darknavy/55">Gr8Books</p>
          <h1 className="mt-2 text-2xl font-bold">Petty Cash Voucher</h1>
          <p className="mt-1 text-sm text-darknavy/60">{page.values.transactionNo || "-"}</p>
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-y border-darknavy/10 py-6 text-sm">
          <ReportValue label="Party" value={`${page.values.partyName || "-"} (${page.values.partyCode || "-"})`} />
          <ReportValue label="PCV Date" value={formatDate(page.values.documentDate)} />
          <ReportValue
            label="Responsibility Center"
            value={`${page.values.responsibilityCenter || "-"} (${page.values.responsibilityCenterCode || "-"})`}
          />
          <ReportValue label="Default Account" value={`${page.values.accountTitle || "-"} (${page.values.accountCode || "-"})`} />
          <ReportValue label="VATable" value={page.values.vatable === "True" ? "Yes" : "No"} />
          <ReportValue label="Gross Amount" value={formatCurrency(amount)} />
          <ReportValue label="VAT Amount" value={formatCurrency(vatAmount)} />
          <ReportValue label="Net Amount" value={formatCurrency(netAmount)} />
          <ReportValue label="Currency" value={page.values.currency || "PHP"} />
          <ReportValue label="Status" value={page.values.status} />
        </dl>
        <p className="mt-8 text-sm text-darknavy/60">Remarks: {page.values.remarks || "-"}</p>
      </article>
    </ReportPreviewDrawer>
  );
}

function ReportValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-darknavy/45">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
