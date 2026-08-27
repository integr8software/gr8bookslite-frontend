import type { RevolvingFundActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

export function RevolvingFundReportPreview({
  isOpen,
  onClose,
  onGeneratePdf,
  page,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf: () => void;
  page: RevolvingFundActionPageState;
}) {
  return (
    <ReportPreviewDrawer
      isOpen={isOpen}
      eyebrow="Cash disbursement"
      title="Revolving Fund Preview"
      description="Review the fund details and entries before printing."
      onClose={onClose}
      onGeneratePdf={onGeneratePdf}
    >
      <article className="mx-auto min-w-[82rem] max-w-7xl bg-white p-12 text-darknavy shadow-sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-darknavy/55">Gr8Books</p>
          <h1 className="mt-2 text-2xl font-bold">Revolving Fund</h1>
          <p className="mt-1 text-sm text-darknavy/60">{page.values.transactionNo}</p>
        </div>
        <dl className="mt-10 grid grid-cols-3 gap-4 border-y border-darknavy/10 py-5">
          <div>
            <dt className="text-xs font-semibold uppercase text-darknavy/45">Party</dt>
            <dd className="mt-1 font-semibold">{page.values.partyName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-darknavy/45">Document Date</dt>
            <dd className="mt-1 font-semibold">{formatDate(page.values.documentDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-darknavy/45">Total Amount</dt>
            <dd className="mt-1 font-semibold">{formatCurrency(page.totals.grossAmount)}</dd>
          </div>
        </dl>
        <div className="mt-8 overflow-hidden rounded-md border border-darknavy/10">
          <table className="w-full text-sm">
            <thead className="bg-offwhite">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Supplier Name</th>
                <th className="px-3 py-2 text-right">Gross Amount</th>
                <th className="px-3 py-2 text-left">VAT Type</th>
                <th className="px-3 py-2 text-right">VAT Rate</th>
                <th className="px-3 py-2 text-right">VAT Amount</th>
                <th className="px-3 py-2 text-left">EWT Code</th>
                <th className="px-3 py-2 text-right">EWT Rate</th>
                <th className="px-3 py-2 text-right">EWT Amount</th>
                <th className="px-3 py-2 text-right">Net Amount</th>
                <th className="px-3 py-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {page.values.items.map((item) => (
                <tr key={item.id} className="border-t border-darknavy/10">
                  <td className="px-3 py-2">{formatDate(item.date)}</td>
                  <td className="px-3 py-2">{item.supplierName}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(Number(item.grossAmount.replace(/,/g, "")) || 0)}</td>
                  <td className="px-3 py-2">{item.vatType}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{item.vatPercent}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(Number(item.vatAmount.replace(/,/g, "")) || 0)}</td>
                  <td className="px-3 py-2">{item.ewtCode}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{item.ewtPercent}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(Number(item.ewtAmount.replace(/,/g, "")) || 0)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(Number(item.netAmount.replace(/,/g, "")) || 0)}</td>
                  <td className="px-3 py-2">{item.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-8 text-sm text-darknavy/60">Remarks: {page.values.remarks}</p>
      </article>
    </ReportPreviewDrawer>
  );
}
