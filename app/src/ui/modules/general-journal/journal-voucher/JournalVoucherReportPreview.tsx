"use client";

import type { ReactNode } from "react";
import {
  formatJournalVoucherReportAccount,
  formatJournalVoucherReportAmount,
  formatJournalVoucherReportDate,
  formatJournalVoucherReportExchangeRate,
  getJournalVoucherEntryParticulars,
  getJournalVoucherEntryPartyLabel,
  getJournalVoucherReportTotals,
} from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherReportData";
import type { JournalVoucherFormValues } from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type JournalVoucherReportPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf: () => void;
  values: JournalVoucherFormValues;
};

export function JournalVoucherReportPreview({ isOpen, onClose, onGeneratePdf, values }: JournalVoucherReportPreviewProps) {
  return (
    <ReportPreviewDrawer
      className="journal-voucher-report-preview-drawer"
      description="Review the printable journal voucher layout."
      eyebrow="General journal"
      isOpen={isOpen}
      maxWidthClassName="max-w-7xl"
      onClose={onClose}
      onGeneratePdf={onGeneratePdf}
      title="Journal Voucher Preview"
    >
      <div className="-m-6 overflow-x-auto p-6">
        <div className="journal-voucher-print-root">
          <JournalVoucherReportDocument values={values} />
        </div>
      </div>
      <style jsx global>{`
        @media print {
          @page {
            size: letter landscape;
            margin: 0.35in;
          }

          body * {
            visibility: hidden !important;
          }

          .journal-voucher-print-root,
          .journal-voucher-print-root * {
            visibility: visible !important;
          }

          .journal-voucher-print-root {
            background: #fff !important;
            left: 0 !important;
            margin: 0 !important;
            position: fixed !important;
            top: 0 !important;
            width: 100% !important;
          }

          .journal-voucher-report-page {
            box-shadow: none !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            min-width: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </ReportPreviewDrawer>
  );
}

function JournalVoucherReportDocument({ values }: { values: JournalVoucherFormValues }) {
  const totals = getJournalVoucherReportTotals(values);

  return (
    <div className="journal-voucher-report-page mx-auto min-w-[72rem] max-w-[72rem] bg-[#fff] text-[10px] leading-tight text-[#000] shadow-sm print:min-w-0 print:max-w-none print:shadow-none">
      <div className="border-2 border-black">
        <div className="grid min-h-[7.75rem] grid-cols-[11rem_1fr_11rem] px-3 py-4">
          <div className="flex items-start justify-center pt-1">
            <span className="text-[10px] font-bold text-[#1a6290]">Logo</span>
          </div>
          <div className="px-2 text-center font-bold">
            <p className="text-base">Your Company Name Here</p>
            <p className="mt-2 text-[11px]">VAT REG TIN : 000-000-000-000</p>
            <p className="mt-2 text-[11px]">Abc, 123, Sample, Malamig, City Of Mandaluyong, Ncr, Second District</p>
            <p className="mt-2 text-[11px]">Telephone No: 0967-237-4514</p>
          </div>
          <div />
        </div>

        <div className="grid grid-cols-[1fr_20.25rem] border-t-2 border-black">
          <div className="px-3 py-2">
            <h2 className="text-3xl font-black leading-none tracking-tight">JOURNAL VOUCHER</h2>
          </div>
          <MetaCell label="Document Date:" value={formatJournalVoucherReportDate(values.documentDate)} />
        </div>

        <div className="grid grid-cols-[1fr_20.25rem] border-t-2 border-black">
          <LabeledLine label="JV No.:" value={values.transactionNo || "-"} />
          <MetaCell label="Status:" value={values.status || "-"} />
        </div>
        <div className="grid grid-cols-[1fr_20.25rem] border-t-2 border-black">
          <LabeledLine label="Currency:" value={values.currencyType || "-"} />
          <MetaCell label="Exchange Rate:" value={formatJournalVoucherReportExchangeRate(values.currencyRate)} />
        </div>
        <div className="border-t-2 border-black px-2 py-2">
          <span className="font-bold">REMARKS:</span> <span>{values.remarks || "-"}</span>
        </div>

        <ReportSectionTitle>Accounting Entries</ReportSectionTitle>
        <table className="w-full table-fixed border-collapse text-[9px]">
          <colgroup>
            <col className="w-[17%]" />
            <col className="w-[12%]" />
            <col className="w-[18%]" />
            <col className="w-[10%]" />
            <col className="w-[9%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr>
              <ReportTableHeader>Account</ReportTableHeader>
              <ReportTableHeader>Party</ReportTableHeader>
              <ReportTableHeader>Particulars</ReportTableHeader>
              <ReportTableHeader>Cost Center</ReportTableHeader>
              <ReportTableHeader>Ref No.</ReportTableHeader>
              <ReportTableHeader>VAT</ReportTableHeader>
              <ReportTableHeader>EWT</ReportTableHeader>
              <ReportTableHeader>Debit</ReportTableHeader>
              <ReportTableHeader>Credit</ReportTableHeader>
            </tr>
          </thead>
          <tbody>
            {values.lines.map((line) => (
              <tr key={line.id} className="align-top">
                <ReportTableCell>{formatJournalVoucherReportAccount(line.accountCode, line.accountTitle)}</ReportTableCell>
                <ReportTableCell>{getJournalVoucherEntryPartyLabel(line)}</ReportTableCell>
                <ReportTableCell>{getJournalVoucherEntryParticulars(line, values)}</ReportTableCell>
                <ReportTableCell>{line.responsibilityCenter || "-"}</ReportTableCell>
                <ReportTableCell>{line.refNo || "-"}</ReportTableCell>
                <ReportTableCell>{line.vatType || "-"}</ReportTableCell>
                <ReportTableCell>{line.atcCode || "-"}</ReportTableCell>
                <ReportTableCell align="right">{line.debit ? formatJournalVoucherReportAmount(line.debit) : ""}</ReportTableCell>
                <ReportTableCell align="right">{line.credit ? formatJournalVoucherReportAmount(line.credit) : ""}</ReportTableCell>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td className="border-2 border-l-0 border-black px-2 py-1 text-right" colSpan={7}>
                Total:
              </td>
              <td className="border-2 border-black px-2 py-1 text-right">{formatJournalVoucherReportAmount(totals.totalDebit)}</td>
              <td className="border-2 border-r-0 border-black px-2 py-1 text-right">
                {formatJournalVoucherReportAmount(totals.totalCredit)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="grid grid-cols-[25%_25%_25%_25%] border-t-2 border-black">
          <SignatureBox label="Prepared by:" name="-" />
          <SignatureBox label="Verified by:" name="-" />
          <SignatureBox label="Approved by:" name="-" />
          <div className="border-l-2 border-black px-3 py-2">
            <p className="font-bold">JV NO.:</p>
            <p className="mt-3 text-right text-2xl font-black leading-none">{values.transactionNo || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabeledLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-1">
      <span className="font-bold">{label}</span> <span>{value || "-"}</span>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-black px-2 py-1">
      <span className="font-bold">{label}</span> <span>{value || "-"}</span>
    </div>
  );
}

function ReportSectionTitle({ children }: { children: ReactNode }) {
  return <div className="border-t-2 border-black bg-[#f5f5f5] px-2 py-1 text-[10px] font-bold uppercase">{children}</div>;
}

function ReportTableHeader({ children }: { children: ReactNode }) {
  return <th className="border-2 border-black px-2 py-1 text-center font-bold first:border-l-0 last:border-r-0">{children}</th>;
}

function ReportTableCell({ align = "left", children }: { align?: "left" | "right"; children: ReactNode }) {
  return (
    <td
      className={`h-10 border-x-2 border-black px-1 py-1 align-top first:border-l-0 last:border-r-0 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

function SignatureBox({ label, name }: { label: string; name: string }) {
  return (
    <div className="border-l-2 border-black px-2 py-2 first:border-l-0">
      <p>{label}</p>
      <p className="mt-5 text-center">{name || "-"}</p>
    </div>
  );
}
