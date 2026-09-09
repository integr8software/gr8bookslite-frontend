import type { RequestForPaymentActionPageState } from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

export function RequestForPaymentReportPreview({
  isOpen,
  onClose,
  onGeneratePdf,
  page,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf: () => void;
  page: RequestForPaymentActionPageState;
}) {
  return (
    <ReportPreviewDrawer
      isOpen={isOpen}
      eyebrow="Cash disbursement"
      title="Request for Payment Preview"
      description="Review the payment request details and line items before printing."
      onClose={onClose}
      onGeneratePdf={onGeneratePdf}
    >
      <article className="mx-auto min-w-[70rem] max-w-6xl bg-white p-12 text-darknavy shadow-sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-darknavy/55">Gr8Books</p>
          <h1 className="mt-2 text-2xl font-bold">Request for Payment</h1>
          <p className="mt-1 text-sm text-darknavy/60">{page.values.transactionNo}</p>
        </div>

        <dl className="mt-10 grid grid-cols-3 gap-4 border-y border-darknavy/10 py-5">
          <div>
            <dt className="text-xs font-semibold uppercase text-darknavy/45">Payee</dt>
            <dd className="mt-1 font-semibold">{page.values.partyName || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-darknavy/45">Document Date</dt>
            <dd className="mt-1 font-semibold">{formatDate(page.values.documentDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-darknavy/45">Total Amount</dt>
            <dd className="mt-1 font-semibold">{formatCurrency(page.totals.totalAmount)}</dd>
          </div>
        </dl>

        <div className="mt-8 overflow-hidden rounded-md border border-darknavy/10">
          <table className="w-full text-sm">
            <thead className="bg-offwhite">
              <tr>
                <th className="px-3 py-2 text-center">#</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Ref Type</th>
                <th className="px-3 py-2 text-left">Ref Number</th>
                <th className="px-3 py-2 text-left">Particulars</th>
                <th className="px-3 py-2 text-left">Responsibility Center</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {page.values.items.map((item, index) => (
                <tr key={item.id} className="border-t border-darknavy/10">
                  <td className="px-3 py-2 text-center text-darknavy/60">{index + 1}</td>
                  <td className="px-3 py-2">{formatDate(item.date)}</td>
                  <td className="px-3 py-2">{item.refType}</td>
                  <td className="px-3 py-2">{item.refNumber || "-"}</td>
                  <td className="px-3 py-2">{item.particulars || "-"}</td>
                  <td className="px-3 py-2">
                    {item.responsibilityCenterName || item.responsibilityCenterCode || "-"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCurrency(Number(item.amount.replace(/,/g, "")) || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex items-start justify-between">
          <p className="text-sm text-darknavy/60">Remarks: {page.values.remarks || "None"}</p>
          <div className="text-right">
            <span className="text-sm font-medium text-darknavy/60">Grand Total: </span>
            <span className="text-lg font-bold text-darknavy">{formatCurrency(page.totals.totalAmount)}</span>
          </div>
        </div>
      </article>
    </ReportPreviewDrawer>
  );
}
