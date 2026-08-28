export type CreditMemoStatus =
  | "Draft"
  | "For Approval"
  | "Posted"
  | "Disapproved"
  | "Cancelled";

export type CreditMemoAccountingEntry = {
  id: string;
  lineNumber: number;
  accountCode: string;
  accountTitle: string;
  particulars: string;
  debit: number;
  credit: number;
  vatType: string;
  atcCode: string;
  partyCode: string;
  partyName: string;
  responsibilityCenter: string;
  refNo: string;
};

export type CreditMemoRecord = {
  id: string;
  transactionNo: string;
  documentDate: string;
  partyCode: string;
  partyName: string;
  address: string;
  contactPerson: string;
  contactNo: string;
  projectCode: string;
  projectName: string;
  currency: string;
  exchangeRate: number;
  amount: number;
  referenceNo: string;
  remarks: string;
  status: CreditMemoStatus;
  accountingEntries: CreditMemoAccountingEntry[];
  createdAt: string;
  updatedAt: string;
};

export type CreditMemoFormValues = Omit<
  CreditMemoRecord,
  "id" | "createdAt" | "updatedAt"
>;

export type CreditMemoAccountingEntryField = keyof CreditMemoAccountingEntry;

export type CreditMemoFormErrors = Partial<
  Record<keyof CreditMemoFormValues | "balance", string>
> & {
  accountingEntryErrors?: Record<
    string,
    Partial<Record<keyof CreditMemoAccountingEntry, string>>
  >;
};

export type CreditMemoActionMode = "add" | "edit" | "view";

export type CreditMemoStatusFilter = "all" | CreditMemoStatus;

export type CreditMemoAccountingColumnId =
  | "accountCode"
  | "accountTitle"
  | "particulars"
  | "debit"
  | "credit"
  | "vatType"
  | "atcCode"
  | "partyCode"
  | "partyName"
  | "responsibilityCenter"
  | "refNo";

export type CreditMemoStatistics = {
  cancelledVouchers: number;
  disapprovedVouchers: number;
  draftVouchers: number;
  forApprovalVouchers: number;
  postedVouchers: number;
  totalVouchers: number;
};
