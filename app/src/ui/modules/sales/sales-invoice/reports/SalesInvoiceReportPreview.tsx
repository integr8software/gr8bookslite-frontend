"use client";

import {
  calculateSalesInvoiceTotals,
} from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceData";
import { formatSalesInvoiceCurrency } from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceFormatters";
import type { SalesInvoiceFormValues } from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type SalesInvoiceReportPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  values: SalesInvoiceFormValues;
};

export function SalesInvoiceReportPreview({
  isOpen,
  onClose,
  onPrint,
  values,
}: SalesInvoiceReportPreviewProps) {
  const totals = calculateSalesInvoiceTotals(values.lineItems);

  return (
    <ReportPreviewDrawer
      isOpen={isOpen}
      eyebrow="Sales"
      title="Sales Invoice Preview"
      description="Review the printable sales invoice layout."
      onClose={onClose}
      onGeneratePdf={onPrint}
    >
      <div className="mx-auto min-w-[58rem] max-w-[58rem] bg-white p-6 text-sm text-darknavy shadow-sm">
        <div className="flex items-start justify-between border-b border-darknavy/15 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase text-darknavy/55">Bill To</p>
            <h2 className="mt-1 text-lg font-bold">{values.vceName || values.billToName || "-"}</h2>
            <p className="mt-1 text-darknavy/70">{values.address || "-"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase text-darknavy/55">Sales Invoice</p>
            <p className="mt-1 text-xl font-bold">{values.transNo || "-"}</p>
            <p className="mt-1 text-darknavy/70">{values.documentDate || "-"}</p>
          </div>
        </div>
        <table className="mt-5 w-full border-collapse text-left text-xs">
          <thead className="bg-offwhite text-darknavy/70">
            <tr>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Price</th>
              <th className="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {values.lineItems.map((item) => (
              <tr key={item.id} className="border-b border-darknavy/10">
                <td className="px-3 py-2">{item.name || item.itemCode || "-"}</td>
                <td className="px-3 py-2 text-right">{item.quantity}</td>
                <td className="px-3 py-2 text-right">{item.price}</td>
                <td className="px-3 py-2 text-right">{item.totalSales}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto mt-5 grid w-72 gap-2 text-sm">
          <div className="flex justify-between">
            <span>Total Sales</span>
            <span>{formatSalesInvoiceCurrency(totals.grossAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT Amount</span>
            <span>{formatSalesInvoiceCurrency(totals.vatAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>{formatSalesInvoiceCurrency(totals.discount)}</span>
          </div>
          <div className="flex justify-between border-t border-darknavy/15 pt-2 font-bold">
            <span>Amount Due</span>
            <span>{formatSalesInvoiceCurrency(totals.netAmount + totals.vatAmount)}</span>
          </div>
        </div>
      </div>
    </ReportPreviewDrawer>
  );
}
