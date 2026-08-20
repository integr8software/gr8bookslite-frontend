import type { AdvancesToSuppliersActionPageState } from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

export function AdvancesToSuppliersReportPreview({
  isOpen,
  onClose,
  onGeneratePdf,
  page,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf: () => void;
  page: AdvancesToSuppliersActionPageState;
}) {
  const amount = Number(page.values.advancePaymentAmount.replace(/,/g, "")) || 0;
  const totalPoAmount = Number(page.values.totalPoAmount.replace(/,/g, "")) || 0;
  return (
    <ReportPreviewDrawer
      isOpen={isOpen}
      eyebrow="Cash disbursement"
      title="Advances to Suppliers Preview"
      description="Review the supplier advance details before printing."
      onClose={onClose}
      onGeneratePdf={onGeneratePdf}
    >
      <article className="mx-auto min-w-[48rem] max-w-4xl bg-white p-12 text-darknavy shadow-sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-darknavy/55">Gr8Books</p>
          <h1 className="mt-2 text-2xl font-bold">Advances to Suppliers</h1>
          <p className="mt-1 text-sm text-darknavy/60">{page.values.transactionNo}</p>
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-y border-darknavy/10 py-6 text-sm">
          <ReportValue label="Party" value={`${page.values.partyName} (${page.values.partyCode})`} />
          <ReportValue label="ATS Date" value={formatDate(page.values.documentDate)} />
          <ReportValue label="PO Reference" value={page.values.poReference} />
          <ReportValue label="Default Account" value={`${page.values.accountTitle} (${page.values.accountCode})`} />
          <ReportValue label="Total PO Amount" value={formatCurrency(totalPoAmount)} />
          <ReportValue label="Advance Payment Type" value={page.values.advancePaymentType || "Percentage"} />
          <ReportValue label="Advance Payment (%)" value={`${page.values.advancePaymentPercentage || "0.00"}%`} />
          <ReportValue label="Amount of Advance Payment" value={formatCurrency(amount)} />
          <ReportValue label="Status" value={page.values.status} />
        </dl>
        <p className="mt-8 text-sm text-darknavy/60">Remarks: {page.values.remarks}</p>
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
