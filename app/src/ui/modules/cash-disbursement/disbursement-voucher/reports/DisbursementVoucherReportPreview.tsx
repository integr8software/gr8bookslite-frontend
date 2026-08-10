"use client";

import { formatCurrency } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type {
  DisbursementVoucherFormValues,
  DisbursementVoucherReportPreviewProps,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";
import type { ReactNode } from "react";

export function DisbursementVoucherReportPreview({ isOpen, onClose, onGeneratePdf, values }: DisbursementVoucherReportPreviewProps) {
  return (
    <ReportPreviewDrawer
      className="disbursement-voucher-report-preview-drawer"
      isOpen={isOpen}
      eyebrow="Cash disbursement"
      title="Disbursement Voucher Preview"
      description="Review the printable disbursement voucher layout."
      onClose={onClose}
      onGeneratePdf={onGeneratePdf}
    >
      <div className="-m-6 overflow-x-auto p-6">
        <div className="disbursement-voucher-print-root">
          <DisbursementVoucherReportDocument values={values} />
        </div>
      </div>
      <style jsx global>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 0.35in;
          }

          body * {
            visibility: hidden !important;
          }

          .disbursement-voucher-print-root,
          .disbursement-voucher-print-root * {
            visibility: visible !important;
          }

          .disbursement-voucher-print-root {
            background: #fff !important;
            left: 0 !important;
            margin: 0 !important;
            position: fixed !important;
            top: 0 !important;
            width: 100% !important;
          }

          .disbursement-voucher-report-page {
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

function DisbursementVoucherReportDocument({ values }: { values: DisbursementVoucherFormValues }) {
  const totalDebit = values.lineEntries.reduce((total, entry) => total + entry.debit, 0);
  const totalCredit = values.lineEntries.reduce((total, entry) => total + entry.credit, 0);
  const voucherAmount = Math.max(parseMoneyAmount(values.amount), totalDebit, totalCredit);
  const checkOrReferenceNo = values.paymentDetails.checkNo || values.paymentDetails.paymentReferenceNo || values.invoiceReferenceNo || "-";

  return (
    <div className="disbursement-voucher-report-page mx-auto min-w-[58rem] max-w-[58rem] bg-[#fff] text-[11px] leading-tight text-[#000] shadow-sm print:min-w-0 print:max-w-none print:shadow-none">
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
            <h2 className="text-3xl font-black leading-none tracking-tight">DISBURSEMENT VOUCHER</h2>
          </div>
          <MetaCell label="Check Voucher Date:" value={formatShortDateLabel(values.voucherDate)} />
        </div>

        <div className="grid grid-cols-[1fr_20.25rem] border-t-2 border-black">
          <LabeledLine label="PAY TO:" value={values.partyName} />
          <MetaCell label="Check/DM No.:" value={checkOrReferenceNo} />
        </div>
        <div className="grid grid-cols-[1fr_20.25rem] border-t-2 border-black">
          <LabeledLine label="PESOS:" value={formatPesosInWords(voucherAmount)} />
          <MetaCell label="Ref No:" value={values.voucherReferenceNo || "-"} />
        </div>
        <div className="border-t-2 border-black px-2 py-2">
          <span className="font-bold">FOR:</span> <span>{values.remarks || values.disbursementType || "-"}</span>
        </div>
        <div className="h-24 border-t-2 border-black" />

        <table className="w-full table-fixed border-collapse text-[10px]">
          <colgroup>
            <col className="w-[25.5%]" />
            <col className="w-[19.5%]" />
            <col className="w-[16%]" />
            <col className="w-[14.5%]" />
            <col className="w-[12.5%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead>
            <tr>
              <ReportTableHeader>Account</ReportTableHeader>
              <ReportTableHeader>Payee</ReportTableHeader>
              <ReportTableHeader>Particulars</ReportTableHeader>
              <ReportTableHeader>Cost Center</ReportTableHeader>
              <ReportTableHeader>Debit</ReportTableHeader>
              <ReportTableHeader>Credit</ReportTableHeader>
            </tr>
          </thead>
          <tbody>
            {values.lineEntries.map((entry) => (
              <tr key={entry.id} className="align-top">
                <ReportTableCell>{formatAccountLabel(entry.accountCode, entry.accountName)}</ReportTableCell>
                <ReportTableCell>{entry.partyName || entry.partyCode || values.partyName || "-"}</ReportTableCell>
                <ReportTableCell>{entry.particulars || "-"}</ReportTableCell>
                <ReportTableCell>{entry.responsibilityCenter || values.costCenter || "-"}</ReportTableCell>
                <ReportTableCell align="right">{entry.debit ? formatCurrency(entry.debit) : ""}</ReportTableCell>
                <ReportTableCell align="right">{entry.credit ? formatCurrency(entry.credit) : ""}</ReportTableCell>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td className="border-2 border-l-0 border-black px-2 py-1 text-right" colSpan={4}>
                Total:
              </td>
              <td className="border-2 border-black px-2 py-1 text-right">{formatCurrency(totalDebit)}</td>
              <td className="border-2 border-r-0 border-black px-2 py-1 text-right">{formatCurrency(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="grid grid-cols-[25.5%_28.7%_26.5%_19.3%] border-t-0 border-black">
          <SignatureBox label="Prepared by:" name={values.preparedBy} />
          <SignatureBox label="Verified by:" name="-" />
          <SignatureBox label="Approved by:" name="-" />
          <div className="border-l-2 border-black px-3 py-2">
            <p className="font-bold">DV NO.:</p>
            <p className="mt-3 text-right text-2xl font-black leading-none">{values.voucherNo || "-"}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t-2 border-black pt-2">
        <p>PAYMENT RECEIVED BY:</p>
        <div className="mt-3 border-t border-black" />
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

function ReportTableHeader({ children }: { children: ReactNode }) {
  return <th className="border-2 border-black px-2 py-1 text-center font-bold first:border-l-0 last:border-r-0">{children}</th>;
}

function ReportTableCell({ align = "left", children }: { align?: "left" | "right"; children: ReactNode }) {
  return (
    <td
      className={`h-14 border-x-2 border-black px-1 py-1 align-top first:border-l-0 last:border-r-0 ${
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

function formatAccountLabel(accountCode: string, accountName: string) {
  if (accountCode && accountName) {
    return `${accountCode} - ${accountName}`;
  }

  return accountCode || accountName || "-";
}

function parseMoneyAmount(value: string) {
  const amount = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));

  return Number.isFinite(amount) ? amount : 0;
}

function formatShortDateLabel(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatPesosInWords(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "-";
  }

  const roundedAmount = Math.round(amount * 100) / 100;
  const wholePesos = Math.floor(roundedAmount);
  const centavos = Math.round((roundedAmount - wholePesos) * 100);
  const pesoWords = toTitleCase(numberToWords(wholePesos));

  if (centavos > 0) {
    return `${pesoWords} Pesos And ${centavos}/100 Only`;
  }

  return `${pesoWords} Pesos Only`;
}

function numberToWords(value: number): string {
  if (value === 0) {
    return "zero";
  }

  const units = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const scales = ["", "thousand", "million", "billion"];
  const chunks: string[] = [];
  let remaining = Math.floor(value);
  let scaleIndex = 0;

  while (remaining > 0) {
    const chunk = remaining % 1000;

    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk, units, tens);
      const scale = scales[scaleIndex];

      chunks.unshift(scale ? `${chunkWords} ${scale}` : chunkWords);
    }

    remaining = Math.floor(remaining / 1000);
    scaleIndex += 1;
  }

  return chunks.join(" ");
}

function convertHundreds(value: number, units: string[], tens: string[]) {
  const words: string[] = [];
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;

  if (hundreds > 0) {
    words.push(`${units[hundreds]} hundred`);
  }

  if (remainder > 0) {
    if (remainder < 20) {
      words.push(units[remainder]);
    } else {
      const ten = Math.floor(remainder / 10);
      const unit = remainder % 10;

      words.push(unit ? `${tens[ten]} ${units[unit]}` : tens[ten]);
    }
  }

  return words.join(" ");
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}
