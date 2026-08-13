"use client";

import type { ReactNode } from "react";
import {
  formatAccountsPayableVoucherAmountInWords,
  formatAccountsPayableVoucherReportAccount,
  formatAccountsPayableVoucherReportAmount,
  formatAccountsPayableVoucherReportDate,
  getAccountsPayableVoucherEntryPartyLabel,
  getAccountsPayableVoucherReportTotals,
} from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherReportData";
import type { AccountsPayableVoucherFormValues } from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type AccountsPayableVoucherReportPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf: () => void;
  values: AccountsPayableVoucherFormValues;
};

export function AccountsPayableVoucherReportPreview({
  isOpen,
  onClose,
  onGeneratePdf,
  values,
}: AccountsPayableVoucherReportPreviewProps) {
  return (
    <ReportPreviewDrawer
      className="accounts-payable-voucher-report-preview-drawer"
      description="Review the printable accounts payable voucher layout."
      eyebrow="Accounts payable"
      isOpen={isOpen}
      onClose={onClose}
      onGeneratePdf={onGeneratePdf}
      title="Accounts Payable Voucher Preview"
    >
      <div className="-m-6 overflow-x-auto p-6">
        <div className="accounts-payable-voucher-print-root">
          <AccountsPayableVoucherReportDocument values={values} />
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

          .accounts-payable-voucher-print-root,
          .accounts-payable-voucher-print-root * {
            visibility: visible !important;
          }

          .accounts-payable-voucher-print-root {
            background: #fff !important;
            left: 0 !important;
            margin: 0 !important;
            position: fixed !important;
            top: 0 !important;
            width: 100% !important;
          }

          .accounts-payable-voucher-report-page {
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

function AccountsPayableVoucherReportDocument({
  values,
}: {
  values: AccountsPayableVoucherFormValues;
}) {
  const totals = getAccountsPayableVoucherReportTotals(values);
  const amountInWords = formatAccountsPayableVoucherAmountInWords(
    totals.voucherAmount,
    values.currency,
  );

  return (
    <div className="accounts-payable-voucher-report-page mx-auto min-w-[62rem] max-w-[62rem] bg-[#fff] text-[10px] leading-tight text-[#000] shadow-sm print:min-w-0 print:max-w-none print:shadow-none">
      <div className="border-2 border-black">
        <div className="grid min-h-[7.75rem] grid-cols-[11rem_1fr_11rem] px-3 py-4">
          <div className="flex items-start justify-center pt-1">
            <span className="text-[10px] font-bold text-[#1a6290]">Logo</span>
          </div>
          <div className="px-2 text-center font-bold">
            <p className="text-base">Your Company Name Here</p>
            <p className="mt-2 text-[11px]">VAT REG TIN : 000-000-000-000</p>
            <p className="mt-2 text-[11px]">
              Abc, 123, Sample, Malamig, City Of Mandaluyong, Ncr, Second District
            </p>
            <p className="mt-2 text-[11px]">Telephone No: 0967-237-4514</p>
          </div>
          <div />
        </div>

        <div className="grid grid-cols-[1fr_20.25rem] border-t-2 border-black">
          <div className="px-3 py-2">
            <h2 className="text-3xl font-black leading-none tracking-tight">
              ACCOUNTS PAYABLE VOUCHER
            </h2>
          </div>
          <MetaCell
            label="Document Date:"
            value={formatAccountsPayableVoucherReportDate(values.documentDate)}
          />
        </div>

        <div className="grid grid-cols-[1fr_20.25rem] border-t-2 border-black">
          <LabeledLine label="PAY TO:" value={values.partyName || "-"} />
          <MetaCell label="APV No.:" value={values.transactionNo || "-"} />
        </div>
        <div className="grid grid-cols-[1fr_20.25rem] border-t-2 border-black">
          <LabeledLine label="AMOUNT:" value={amountInWords} />
          <MetaCell label="Ref No:" value={values.referenceNo || "-"} />
        </div>
        <div className="grid grid-cols-[1fr_20.25rem] border-t-2 border-black">
          <LabeledLine label="PAYABLE TYPE:" value={values.payableType || "-"} />
          <MetaCell
            label="Due Date:"
            value={formatAccountsPayableVoucherReportDate(values.dueDate)}
          />
        </div>
        <div className="border-t-2 border-black px-2 py-2">
          <span className="font-bold">FOR:</span>{" "}
          <span>{values.remarks || values.terms || "-"}</span>
        </div>

        <ReportSectionTitle>Expense Details</ReportSectionTitle>
        <table className="w-full table-fixed border-collapse text-[9px]">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
            <col className="w-[9%]" />
            <col className="w-[8%]" />
            <col className="w-[9%]" />
          </colgroup>
          <thead>
            <tr>
              <ReportTableHeader>Expense Account</ReportTableHeader>
              <ReportTableHeader>Party</ReportTableHeader>
              <ReportTableHeader>Particulars</ReportTableHeader>
              <ReportTableHeader>Cost Center</ReportTableHeader>
              <ReportTableHeader>Gross</ReportTableHeader>
              <ReportTableHeader>EWT</ReportTableHeader>
              <ReportTableHeader>Total Payable</ReportTableHeader>
            </tr>
          </thead>
          <tbody>
            {values.expenseLines.map((line) => (
              <tr key={line.id} className="align-top">
                <ReportTableCell>
                  {formatAccountsPayableVoucherReportAccount(
                    line.expenseAccountCode,
                    line.expenseType,
                  )}
                </ReportTableCell>
                <ReportTableCell>
                  {line.partyName || line.partyCode || values.partyName || "-"}
                </ReportTableCell>
                <ReportTableCell>{line.particulars || "-"}</ReportTableCell>
                <ReportTableCell>
                  {line.responsibilityCenter || "-"}
                </ReportTableCell>
                <ReportTableCell align="right">
                  {formatAccountsPayableVoucherReportAmount(line.amount)}
                </ReportTableCell>
                <ReportTableCell align="right">
                  {line.ewtAmount
                    ? formatAccountsPayableVoucherReportAmount(line.ewtAmount)
                    : ""}
                </ReportTableCell>
                <ReportTableCell align="right">
                  {formatAccountsPayableVoucherReportAmount(line.totalAmountDue)}
                </ReportTableCell>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td
                className="border-2 border-l-0 border-black px-2 py-1 text-right"
                colSpan={4}
              >
                Total:
              </td>
              <td className="border-2 border-black px-2 py-1 text-right">
                {formatAccountsPayableVoucherReportAmount(totals.grossAmount)}
              </td>
              <td className="border-2 border-black px-2 py-1 text-right">
                {formatAccountsPayableVoucherReportAmount(totals.ewtAmount)}
              </td>
              <td className="border-2 border-r-0 border-black px-2 py-1 text-right">
                {formatAccountsPayableVoucherReportAmount(totals.totalAmountDue)}
              </td>
            </tr>
          </tfoot>
        </table>

        <ReportSectionTitle>Accounting Entries</ReportSectionTitle>
        <table className="w-full table-fixed border-collapse text-[9px]">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[18%]" />
            <col className="w-[22%]" />
            <col className="w-[14%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
          </colgroup>
          <thead>
            <tr>
              <ReportTableHeader>Account</ReportTableHeader>
              <ReportTableHeader>Party</ReportTableHeader>
              <ReportTableHeader>Particulars</ReportTableHeader>
              <ReportTableHeader>Cost Center</ReportTableHeader>
              <ReportTableHeader>Debit</ReportTableHeader>
              <ReportTableHeader>Credit</ReportTableHeader>
            </tr>
          </thead>
          <tbody>
            {values.accountingEntries.map((entry) => (
              <tr key={entry.id} className="align-top">
                <ReportTableCell>
                  {formatAccountsPayableVoucherReportAccount(
                    entry.accountCode,
                    entry.accountTitle,
                  )}
                </ReportTableCell>
                <ReportTableCell>
                  {getAccountsPayableVoucherEntryPartyLabel(entry, values)}
                </ReportTableCell>
                <ReportTableCell>{entry.particulars || "-"}</ReportTableCell>
                <ReportTableCell>
                  {entry.responsibilityCenter || "-"}
                </ReportTableCell>
                <ReportTableCell align="right">
                  {entry.debit
                    ? formatAccountsPayableVoucherReportAmount(entry.debit)
                    : ""}
                </ReportTableCell>
                <ReportTableCell align="right">
                  {entry.credit
                    ? formatAccountsPayableVoucherReportAmount(entry.credit)
                    : ""}
                </ReportTableCell>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td
                className="border-2 border-l-0 border-black px-2 py-1 text-right"
                colSpan={4}
              >
                Total:
              </td>
              <td className="border-2 border-black px-2 py-1 text-right">
                {formatAccountsPayableVoucherReportAmount(totals.totalDebit)}
              </td>
              <td className="border-2 border-r-0 border-black px-2 py-1 text-right">
                {formatAccountsPayableVoucherReportAmount(totals.totalCredit)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="grid grid-cols-[25%_25%_25%_25%] border-t-2 border-black">
          <SignatureBox label="Prepared by:" name="-" />
          <SignatureBox label="Verified by:" name="-" />
          <SignatureBox label="Approved by:" name="-" />
          <div className="border-l-2 border-black px-3 py-2">
            <p className="font-bold">APV NO.:</p>
            <p className="mt-3 text-right text-2xl font-black leading-none">
              {values.transactionNo || "-"}
            </p>
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
  return (
    <div className="border-t-2 border-black bg-[#f5f5f5] px-2 py-1 text-[10px] font-bold uppercase">
      {children}
    </div>
  );
}

function ReportTableHeader({ children }: { children: ReactNode }) {
  return (
    <th className="border-2 border-black px-2 py-1 text-center font-bold first:border-l-0 last:border-r-0">
      {children}
    </th>
  );
}

function ReportTableCell({
  align = "left",
  children,
}: {
  align?: "left" | "right";
  children: ReactNode;
}) {
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
