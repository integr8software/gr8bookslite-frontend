import type {
  FundDetailsEntryColumnId,
  PettyCashVoucherAccountingColumnId,
  PettyCashVoucherEntryView,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherDataEntryTypes";

export const PettyCashVoucherFundDetailsEntryView: PettyCashVoucherEntryView = "items";
export const PettyCashVoucherAccountingEntryView: PettyCashVoucherEntryView = "accounting";

export const DefaultFundDetailsEntryColumnOrder: FundDetailsEntryColumnId[] = [
  "disbursementType",
  "particulars",
  "amount",
  "supplierName",
  "supplierCode",
  "vatType",
  "vatPercent",
  "netAmount",
  "vatAmount",
  "date",
  "ewtCode",
  "ewtPercent",
  "ewtAmount",
  "disburseAmount",
  "responsibilityCenterCode",
  "responsibilityCenterName",
  "orNo",
  "tinNo",
  "grossAmount",
];

export const DefaultVisibleFundDetailsEntryColumnOrder: FundDetailsEntryColumnId[] = [
  "disbursementType",
  "particulars",
  "amount",
  "supplierName",
];

export const ProtectedFundDetailsEntryColumnIds = new Set<FundDetailsEntryColumnId>([
  "disbursementType",
  "particulars",
  "amount",
  "supplierName",
]);

export const FundDetailsEntryColumnLabels: Record<FundDetailsEntryColumnId, string> = {
  disbursementType: "Disbursement Type",
  particulars: "Particulars",
  amount: "Gross Amount",
  supplierName: "Supplier Name",
  supplierCode: "Supplier Code",
  vatType: "VAT Type",
  vatPercent: "VAT %",
  netAmount: "Net of VAT",
  vatAmount: "VAT Amount",
  date: "Date",
  ewtCode: "ATC",
  ewtPercent: "ATC %",
  ewtAmount: "EWT",
  disburseAmount: "Total Disbursed",
  responsibilityCenterCode: "Responsibility Center Code",
  responsibilityCenterName: "Responsibility Center",
  orNo: "Reference No.",
  tinNo: "TIN No.",
  grossAmount: "Gross Amount",
};

export const DefaultFundDetailsEntryColumnWidths: Record<FundDetailsEntryColumnId, number> = {
  disbursementType: 220,
  particulars: 240,
  amount: 170,
  supplierName: 230,
  supplierCode: 190,
  vatType: 175,
  vatPercent: 120,
  netAmount: 160,
  vatAmount: 160,
  date: 140,
  ewtCode: 175,
  ewtPercent: 120,
  ewtAmount: 160,
  disburseAmount: 165,
  responsibilityCenterCode: 220,
  responsibilityCenterName: 240,
  orNo: 190,
  tinNo: 150,
  grossAmount: 185,
};

export const DefaultPettyCashVoucherAccountingEntryColumnOrder: PettyCashVoucherAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
];

export const DefaultVisiblePettyCashVoucherAccountingEntryColumnOrder: PettyCashVoucherAccountingColumnId[] = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "particulars",
];

export const ProtectedPettyCashVoucherAccountingColumnIds = new Set<PettyCashVoucherAccountingColumnId>([
  "accountTitle",
  "debit",
  "credit",
  "particulars",
]);

export const PettyCashVoucherAccountingColumnLabels: Record<PettyCashVoucherAccountingColumnId, string> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  debit: "Debit",
  credit: "Credit",
  partyCode: "Supplier Code",
  partyName: "Supplier Name",
  particulars: "Particulars",
};

export const DefaultPettyCashVoucherAccountingEntryColumnWidths: Record<PettyCashVoucherAccountingColumnId, number> = {
  accountCode: 175,
  accountTitle: 240,
  debit: 150,
  credit: 150,
  partyCode: 190,
  partyName: 230,
  particulars: 260,
};

export const PettyCashVoucherDetailTablePreferencesStorageKey = "gr8books:petty-cash-voucher:detail-table-preferences";
export const PettyCashVoucherAccountingTablePreferencesStorageKey = "gr8books:petty-cash-voucher:accounting-table-preferences";
