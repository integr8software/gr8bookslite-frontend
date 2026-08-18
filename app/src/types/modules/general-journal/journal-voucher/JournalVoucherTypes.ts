import type { JournalVoucherLineColumnIds } from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";

export type JournalVoucherStatus = "Draft" | "For Approval" | "Disapproved" | "Posted" | "Cancelled";

export type JournalVoucherLine = {
  id: string;
  lineNumber: number;
  accountCode: string;
  accountTitle: string;
  particulars: string;
  partyCode: string;
  partyName: string;
  responsibilityCenter: string;
  refNo: string;
  vatType: string;
  atcCode: string;
  debit: number;
  credit: number;
};

export type JournalVoucherRecord = {
  branchUnitId?: number;
  id: string;
  transactionNo: string;
  documentDate: string;
  remarks: string;
  currencyType: string;
  currencyRate: number;
  status: JournalVoucherStatus;
  lines: JournalVoucherLine[];
  totalCredit?: number;
  totalDebit?: number;
  createdAt: string;
  updatedAt: string;
};

export type JournalVoucherFormValues = Omit<JournalVoucherRecord, "id" | "createdAt" | "updatedAt">;

export type JournalVoucherLineField = keyof JournalVoucherLine;

export type JournalVoucherFormErrors = Partial<Record<keyof JournalVoucherFormValues | "balance", string>> & {
  lineErrors?: Record<string, Partial<Record<keyof JournalVoucherLine, string>>>;
};

export type JournalVoucherActionMode = "add" | "edit" | "view";

export type JournalVoucherLineColumnId = (typeof JournalVoucherLineColumnIds)[number];

export type JournalVoucherLookupAccount = {
  accountCode: string;
  accountNature: string;
  accountTitle: string;
  accountType: string;
  id: string;
  status: string;
};