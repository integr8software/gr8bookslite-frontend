"use client";

import {
  formatCashAdvanceCurrency,
  formatCashAdvanceDate,
} from "@/app/src/data/modules/cash-disbursement/cash-advance/CashAdvanceData";
import type { CashAdvanceFormValues } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type CashAdvanceReportPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf: () => void;
  values: CashAdvanceFormValues;
};

export function CashAdvanceReportPreview({
  isOpen,
  onClose,
  onGeneratePdf,
  values,
}: CashAdvanceReportPreviewProps) {
  return (
    <ReportPreviewDrawer
      isOpen={isOpen}
      eyebrow="Cash disbursement"
      title="Cash Advance PDF Preview"
      description="Review the printable cash advance document."
      onClose={onClose}
      onGeneratePdf={onGeneratePdf}
      printLabel="Open PDF"
    >
      <CashAdvanceReportDocument values={values} />
    </ReportPreviewDrawer>
  );
}

function CashAdvanceReportDocument({ values }: { values: CashAdvanceFormValues }) {
  const amount = Number(values.amount || 0);
  const accountTitle = getCashAdvanceAccountTitle(values.accountCode);
  const purpose = [accountTitle, values.remarks].filter(Boolean).join(" - ");

  return (
    <div className="mx-auto min-w-[56rem] max-w-[56rem] bg-white p-6 text-[13px] leading-normal text-black shadow-sm">
      <div className="border-2 border-black">
        <div className="grid min-h-36 grid-cols-[10rem_1fr_10rem] items-start px-7 py-4">
          <div className="grid h-24 w-28 place-items-center text-4xl font-black tracking-tighter text-skyblue">
            integr8
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">Your Company Name Here</p>
            <p className="mt-2">VAT REG TIN : 000-000-000</p>
            <p className="mt-2">ABC, 123, Sample, Malamig, CITY OF MANDALUYONG, NCR, SECOND DISTRICT</p>
            <p className="mt-5">Telephone No: 0967-237-4514</p>
          </div>
          <div />
        </div>

        <div className="grid grid-cols-[1fr_21rem] items-end border-b-2 border-black px-3 pb-1">
          <h2 className="text-3xl font-black uppercase tracking-tight">Cash Advance Request Form</h2>
          <p className="pb-0.5 font-bold">
            Cash Advance Date:{" "}
            <span className="font-normal">{formatCompactDate(values.documentDate)}</span>
          </p>
        </div>

        <RequestLine label="Name Requesting Cash Advance" value={values.partyName} />
        <RequestLine label="Cost Center" value={values.costCenter} />
        <RequestLine label="Amount of Cash Advance" value={formatCashAdvanceCurrency(amount)} />
        <RequestLine label="Amount in Words" value={amountToWords(amount)} />
        <RequestLine label="Project Name" value={values.referenceFields.projectRef} minHeightClassName="min-h-16" />
        <RequestLine label="Purpose of Cash Advance" value={purpose} minHeightClassName="min-h-14" />

        <div className="grid min-h-16 grid-cols-[1fr_1fr_10.75rem] border-t-2 border-black">
          <div className="border-r-2 border-black px-2 py-1">Prepared by:</div>
          <div className="border-r-2 border-black px-2 py-1">Approved by:</div>
          <div className="px-2 py-1">
            <p className="font-bold">CA NO.:</p>
            <p className="text-right text-3xl font-black">{values.transNo || "-"}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t-2 border-black pt-2">RECEIVED BY:</div>
      <div className="mt-3 border-t-2 border-black" />
    </div>
  );
}

function RequestLine({
  label,
  minHeightClassName = "min-h-7",
  value,
}: {
  label: string;
  minHeightClassName?: string;
  value?: string;
}) {
  return (
    <div className={`border-b-2 border-black px-2 py-1 ${minHeightClassName}`}>
      <span className="font-bold uppercase">{label}: </span>
      <span>{value || "\u00a0"}</span>
    </div>
  );
}

function formatCompactDate(value: string) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");

  return year && month && day ? `${month}/${day}/${year}` : formatCashAdvanceDate(value);
}

function getCashAdvanceAccountTitle(accountCode: string) {
  const accountTitles: Record<string, string> = {
    "1130-CA": "Cash Advance",
    "1130-EA": "Employee Advance",
    "1135-OA": "Officer Advance",
  };

  return accountTitles[accountCode] ?? accountCode;
}

function amountToWords(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  const wholeAmount = Math.floor(value);

  return `${integerToWords(wholeAmount)} Only`;
}

function integerToWords(value: number): string {
  const ones = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (value < 20) return ones[value];
  if (value < 100) {
    return `${tens[Math.floor(value / 10)]}${value % 10 ? ` ${ones[value % 10]}` : ""}`;
  }
  if (value < 1000) {
    return `${ones[Math.floor(value / 100)]} Hundred${value % 100 ? ` ${integerToWords(value % 100)}` : ""}`;
  }
  if (value < 1000000) {
    return `${integerToWords(Math.floor(value / 1000))} Thousand${value % 1000 ? ` ${integerToWords(value % 1000)}` : ""}`;
  }

  return `${integerToWords(Math.floor(value / 1000000))} Million${value % 1000000 ? ` ${integerToWords(value % 1000000)}` : ""}`;
}
