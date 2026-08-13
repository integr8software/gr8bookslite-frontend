export type GoodsReceiptActionMode = "add" | "edit" | "view";

export type GoodsReceiptStatus =
  "Cancelled" | "Disapproved" | "Draft" | "For Approval" | "Posted";

export type GoodsReceiptAccountingColumnId =
  | "accountCode"
  | "accountTitle"
  | "atcCode"
  | "credit"
  | "debit"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "refNo"
  | "responsibilityCenter"
  | "vatType";

export type GoodsReceiptEntryTab = "accounting" | "goods";

export type GoodsReceiptRecord = {
  id: string;
  documentDate: string;
  formValues?: GoodsReceiptFormValues;
  referenceNo: string;
  status: GoodsReceiptStatus;
  totalAmount: number;
  transactionNo: string;
  transactionType: string;
  vceName: string;
};

export type GoodsReceiptCopyRecord = {
  amount: string;
  documentDate: string;
  id: string;
  itemCategory: string;
  itemCode: string;
  itemName: string;
  partyCode: string;
  partyName: string;
  receivedQuantity: string;
  remarks: string;
  source: string;
  sourceNo: string;
  uom: string;
  warehouse: string;
};

export type GoodsReceiptLineEntry = {
  id: string;
  itemCode: string;
  barcode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  lotNo: string;
  stockQuantity: string;
  receivedQuantity: string;
  unitCost: string;
  amount: string;
  referenceNo: string;
  responsibilityCenter: string;
};

export type GoodsReceiptAccountingEntry = {
  id: string;
  accountCode: string;
  accountTitle: string;
  debit: number;
  credit: number;
  partyCode: string;
  partyName: string;
  particulars: string;
  vatType: string;
  atcCode: string;
  responsibilityCenter: string;
  refNo: string;
};

export type GoodsReceiptFormValues = {
  transactionType: string;
  sourceWarehouse: string;
  receivingWarehouse: string;
  vceCode: string;
  vceName: string;
  currency: string;
  exchangeRate: string;
  remarks: string;
  transactionNo: string;
  documentDate: string;
  status: string;
  icNo: string;
  giNo: string;
  siRef: string;
  projectRef: string;
  projectName: string;
  accountingEntries: GoodsReceiptAccountingEntry[];
  lineEntries: GoodsReceiptLineEntry[];
};

export type GoodsReceiptTotals = {
  receivedQuantity: number;
  amount: number;
};
