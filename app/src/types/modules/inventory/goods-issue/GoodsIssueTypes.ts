import type { AccountingEntry } from "@/app/src/types/shared/accounting/AccountingEntryTypes";

export type GoodsIssueActionMode = "add" | "edit" | "view";

export type GoodsIssueStatus = "Cancelled" | "Disapproved" | "Draft" | "For Approval" | "Posted";

export type GoodsIssueRecord = {
  id: string;
  documentDate: string;
  formValues?: GoodsIssueFormValues;
  referenceNo: string;
  status: GoodsIssueStatus;
  totalAmount: number;
  transactionNo: string;
  transactionType: string;
  vceName: string;
};

export type GoodsIssueLineEntry = {
  id: string;
  itemCode: string;
  barcode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  mfgDate: string;
  expirationDate: string;
  lotNo: string;
  serialNo: string;
  stockQuantity: string;
  issueQuantity: string;
  remainingQuantity: string;
  unitCost: string;
  amount: string;
  referenceNo: string;
  responsibilityCenter: string;
  color: string;
  brand: string;
  size: string;
  model: string;
};

export type GoodsIssueAccountingEntry = AccountingEntry;

export type GoodsIssueEntryTab = "goods" | "accounting";

export type GoodsIssueMaterialRequestCopyRecord = {
  id: string;
  documentDate: string;
  itemCode: string;
  itemCategory: string;
  mrNo: string;
  partyCode: string;
  partyName: string;
  remarks: string;
  requestedQuantity: string;
  source: string;
  sourceNo: string;
  uom: string;
  warehouse: string;
};

export type GoodsIssueFormValues = {
  transactionType: string;
  sourceWarehouse: string;
  vceCode: string;
  vceName: string;
  currency: string;
  exchangeRate: string;
  remarks: string;
  transactionNo: string;
  documentDate: string;
  status: string;
  mrNo: string;
  rrNo: string;
  icNo: string;
  joNo: string;
  projectRef: string;
  projectName: string;
  accountingEntries: GoodsIssueAccountingEntry[];
  lineEntries: GoodsIssueLineEntry[];
};

export type GoodsIssueTotals = {
  issueQuantity: number;
  amount: number;
};
