import { TransactionOverviewColumnWidths } from "@/app/src/constants/shared/module/TransactionOverviewConstants";

export const CashDisbursementOverviewColumnWidths = {
  ...TransactionOverviewColumnWidths,
  transactionNumber: 180,
  documentDate: 140,
  partyCode: 130,
  partyName: 280,
  accountCode: 150,
  accountTitle: 240,
  paymentType: 160,
  currency: 100,
  amount: 160,
  remarks: 260,
  auditUser: 160,
  auditDate: 170,
  status: 120,
} as const;

export const CashDisbursementOverviewActionColumnWidth =
  CashDisbursementOverviewColumnWidths.actions + 48;

export const CashDisbursementEmptyRange = { from: "", to: "" };

export const CashDisbursementStatusActionButtonClassName =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold shadow-sm shadow-darknavy/5 transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white";
