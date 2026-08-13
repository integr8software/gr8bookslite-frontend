import { Printer, X } from "lucide-react";
import type { PettyCashFundActionPageState } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFund";
import { formatCurrency } from "@/app/src/utils/currency.util";
import { formatDate } from "@/app/src/utils/date.util";

export function PettyCashFundReportPreview({
  isOpen,
  onClose,
  page,
}: {
  isOpen: boolean;
  onClose: () => void;
  page: PettyCashFundActionPageState;
}) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-140 overflow-y-auto bg-slate-950/35 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Petty cash fund preview"
    >
      <div className="mx-auto min-h-[42rem] max-w-5xl rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-darknavy/10 p-4 print:hidden">
          <h2 className="font-semibold text-darknavy">Petty Cash Fund Preview</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-skyblue px-3 text-sm font-semibold text-white"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-darknavy/10"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <article className="p-8 text-darknavy sm:p-12">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-darknavy/55">Gr8Books</p>
            <h1 className="mt-2 text-2xl font-bold">Petty Cash Fund</h1>
            <p className="mt-1 text-sm text-darknavy/60">{page.values.transactionNo}</p>
          </div>
          <dl className="mt-10 grid gap-4 border-y border-darknavy/10 py-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase text-darknavy/45">Custodian</dt>
              <dd className="mt-1 font-semibold">{page.values.partyName || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-darknavy/45">Document Date</dt>
              <dd className="mt-1 font-semibold">{formatDate(page.values.documentDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-darknavy/45">Fund Amount</dt>
              <dd className="mt-1 font-semibold">{formatCurrency(page.totals.grossAmount)}</dd>
            </div>
          </dl>
          <div className="mt-8 overflow-hidden rounded-md border border-darknavy/10">
            <table className="w-full text-sm">
              <thead className="bg-offwhite">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Payee</th>
                  <th className="px-3 py-2 text-left">Particulars</th>
                  <th className="px-3 py-2 text-right">Gross Amount</th>
                </tr>
              </thead>
              <tbody>
                {page.values.items.map((item) => (
                  <tr key={item.id} className="border-t border-darknavy/10">
                    <td className="px-3 py-2">{formatDate(item.date)}</td>
                    <td className="px-3 py-2">{item.payeeName || "—"}</td>
                    <td className="px-3 py-2">{item.particulars || "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(Number(item.grossAmount.replace(/,/g, "")) || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-8 text-sm text-darknavy/60">Remarks: {page.values.remarks || "None"}</p>
        </article>
      </div>
    </div>
  );
}
