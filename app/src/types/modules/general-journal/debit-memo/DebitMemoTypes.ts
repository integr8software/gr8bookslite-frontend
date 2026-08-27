export type DebitMemoStatus =
  | "Draft"
  | "For Approval"
  | "Posted"
  | "Disapproved"
  | "Cancelled";

export type DebitMemoAccountingEntry = {
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

export type DebitMemoRecord = {
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
  status: DebitMemoStatus;
  accountingEntries: DebitMemoAccountingEntry[];
  createdAt: string;
  updatedAt: string;
};

export type DebitMemoFormValues = Omit<
  DebitMemoRecord,
  "id" | "createdAt" | "updatedAt"
>;

export type DebitMemoAccountingEntryField = keyof DebitMemoAccountingEntry;

export type DebitMemoFormErrors = Partial<
  Record<keyof DebitMemoFormValues | "balance", string>
> & {
  accountingEntryErrors?: Record<
    string,
    Partial<Record<keyof DebitMemoAccountingEntry, string>>
  >;
};

export type DebitMemoActionMode = "add" | "edit" | "view";

export type DebitMemoStatusFilter = "all" | DebitMemoStatus;

export type DebitMemoAccountingColumnId =
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

export type DebitMemoStatistics = {
  cancelledVouchers: number;
  disapprovedVouchers: number;
  draftVouchers: number;
  forApprovalVouchers: number;
  postedVouchers: number;
  totalVouchers: number;
};
