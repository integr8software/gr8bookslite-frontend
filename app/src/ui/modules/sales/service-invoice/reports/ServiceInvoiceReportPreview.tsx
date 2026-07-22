"use client";

import { formatServiceInvoiceAmount } from "@/app/src/data/modules/sales/service-invoice/ServiceInvoiceData";
import type { ServiceInvoiceFormValues } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type ServiceInvoiceReportPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf: () => void;
  values: ServiceInvoiceFormValues;
};

export function ServiceInvoiceReportPreview({
  isOpen,
  onClose,
  onGeneratePdf,
  values,
}: ServiceInvoiceReportPreviewProps) {
  return (
    <ReportPreviewDrawer
      className="service-invoice-report-preview-drawer"
      isOpen={isOpen}
      eyebrow="Sales"
      title="Service Invoice Preview"
      description="Review the printable service invoice layout."
      onClose={onClose}
      onGeneratePdf={onGeneratePdf}
    >
      <ServiceInvoiceReportDocument values={values} />
    </ReportPreviewDrawer>
  );
}

function ServiceInvoiceReportDocument({ values }: { values: ServiceInvoiceFormValues }) {
  const rows = createInvoiceRows(values);

  return (
    <div className="mx-auto w-full max-w-[52rem] bg-white p-3 text-[11px] text-black shadow-sm print:p-0 print:shadow-none">
      <div className="flex min-h-[68rem] flex-col border-2 border-black">
        <InvoiceLetterhead />
        <InvoiceTitleBlock
          date={values.documentDate}
          invoiceNo={values.invoiceNo || values.transactionNo}
        />
        <CustomerBlock values={values} />
        <table className="w-full flex-1 border-collapse">
          <thead>
            <tr>
              <InvoiceCell className="w-[78%] text-center font-bold">Description</InvoiceCell>
              <InvoiceCell className="text-center font-bold">Amount</InvoiceCell>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <InvoiceCell>{row.description}</InvoiceCell>
                <InvoiceCell className="text-right">{row.amount}</InvoiceCell>
              </tr>
            ))}
            <tr>
              <InvoiceCell className="h-full min-h-[27rem] border-b-0 align-top" />
              <InvoiceCell className="border-b-0 align-top" />
            </tr>
          </tbody>
        </table>
        <InvoiceFooter
          amount={values.grossAmount}
          vatAmount={values.vatAmount}
          ewtAmount={values.ewtAmount}
          netAmount={values.netAmount}
          preparedBy={values.salesAssociate || "Jackie/N/A"}
        />
      </div>
    </div>
  );
}

function InvoiceLetterhead() {
  return (
    <div className="grid grid-cols-[8.5rem_1fr_8.5rem] items-start px-4 pt-4">
      <div className="pt-1">
        <img
          src="/img/icons/gr8booksneo-logo-wide.png"
          alt="Company logo"
          className="h-16 w-24 object-contain"
        />
      </div>
      <div className="text-center leading-tight">
        <p className="text-sm font-bold leading-tight">Your Company Name Here</p>
        <p className="text-[10px] font-semibold leading-tight">VAT REG TIN : 000-000-000-000</p>
        <p className="text-[10px] font-semibold uppercase leading-tight">
          ABC, 123, Sample, Malamig, City of Mandaluyong, NCR, Second District
        </p>
        <p className="text-[10px] font-semibold leading-tight">Telephone No: 0967-237-4514</p>
      </div>
      <div />
    </div>
  );
}

function InvoiceTitleBlock({ date, invoiceNo }: { date: string; invoiceNo: string }) {
  return (
    <div className="mt-2 grid grid-cols-[1fr_12rem] items-end border-b-2 border-black px-3 pb-1">
      <h2 className="text-2xl font-black uppercase leading-none">Service Invoice</h2>
      <div className="text-[11px] font-bold">
        <p>Service Invoice No. : {formatInvoiceNo(invoiceNo)}</p>
        <p>Date : {formatReportDate(date)}</p>
      </div>
    </div>
  );
}

function CustomerBlock({ values }: { values: ServiceInvoiceFormValues }) {
  return (
    <div className="min-h-24 border-b-2 border-black px-2 py-1 text-[11px] font-bold">
      <InfoLine label="Customer" value={values.name} />
      <InfoLine label="Contact Person" value={values.contactPerson} />
      <InfoLine label="Terms" value={values.terms} />
      <InfoLine label="Business Style" value={values.businessStyle} />
      <InfoLine label="TIN" value="" />
      <InfoLine label="Remarks" value={values.remarks} />
    </div>
  );
}

function InvoiceFooter({
  amount,
  ewtAmount,
  netAmount,
  preparedBy,
  vatAmount,
}: {
  amount: string;
  ewtAmount: string;
  netAmount: string;
  preparedBy: string;
  vatAmount: string;
}) {
  return (
    <div className="grid grid-cols-[65%_35%] border-t-2 border-black">
      <div className="border-r-2 border-black p-2 text-[9px]">
        <p className="text-[11px] font-bold">Payment Options :</p>
        <ol className="list-decimal pl-4">
          <li>Please prepare check payable to: AKD BUSINESS OUTSOURCING SOLUTION, INC.</li>
          <li>Please deposit to RCBC Account No: 7900572608.</li>
          <li>PNB 2430 7000 3201.</li>
          <li>You may send via remittance.</li>
        </ol>
      </div>
      <table className="w-full border-collapse text-[11px] font-bold">
        <tbody>
          <TotalRow label="Amount" value={amount} />
          <TotalRow label="VAT Amount" value={vatAmount} />
          <TotalRow label="EWT Amount" value={ewtAmount} />
          <TotalRow label="Net Amount" value={netAmount} />
        </tbody>
      </table>
      <SignatureBox label="Prepared by" name={preparedBy} />
      <SignatureBox label="Received by" />
    </div>
  );
}

function SignatureBox({ label, name = "" }: { label: string; name?: string }) {
  return (
    <div className="min-h-28 border-r-2 border-t-2 border-black p-2 text-[11px] font-bold last:border-r-0">
      <p>{label} :</p>
      <div className="mx-auto mt-16 w-3/4 border-b border-black text-center font-normal">
        {name || "\u00a0"}
      </div>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="border-b border-black px-2 py-1">{label} :</td>
      <td className="border-b border-black px-2 py-1 text-right">{formatAmount(value)}</td>
    </tr>
  );
}

function InvoiceCell({ children, className = "" }: { children?: string; className?: string }) {
  return (
    <td className={`border-b border-r border-black px-2 py-1 last:border-r-0 ${className}`}>
      {children || "\u00a0"}
    </td>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      {label} : <span className="font-normal">{value || "\u00a0"}</span>
    </p>
  );
}

function createInvoiceRows(values: ServiceInvoiceFormValues) {
  const populatedRows = values.lineEntries
    .filter((entry) => entry.description || entry.particulars)
    .map((entry) => ({
      id: entry.id,
      description: entry.description || entry.particulars,
      amount: formatAmount(entry.grossAmount || entry.netAmount),
    }));

  return populatedRows.length
    ? populatedRows
    : [{ id: "blank-row", description: "", amount: values.grossAmount }];
}

function formatAmount(value: string) {
  const amount = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));

  return formatServiceInvoiceAmount(Number.isFinite(amount) ? amount : 0);
}

function formatInvoiceNo(value: string) {
  const numeric = value.replace(/\D/g, "");

  return numeric ? numeric.slice(-6).padStart(6, "0") : value || "-";
}

function formatReportDate(value: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
