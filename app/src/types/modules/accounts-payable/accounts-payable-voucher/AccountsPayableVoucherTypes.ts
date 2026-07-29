export type AccountsPayableVoucherStatus =
  | "Draft"
  | "Approved"
  | "Disapproved"
  | "Closed"
  | "Cancelled";

export type AccountsPayableVoucherPayableType =
  | "Trade Payable"
  | "Non-Trade Payable"
  | "Employee Payable"
  | "Tax Payable"
  | "Accrued Payable";

export type AccountsPayableVoucherExpenseLine = {
  id: string;
  lineNumber: number;
  expenseAccountCode: string;
  expenseType: string;
  amount: number;
  netAmount: number;
  vat: string;
  vatPercent: number;
  vatAmount: number;
  ewt: string;
  ewtPercent: number;
  ewtAmount: number;
  totalAmountDue: number;
  partyCode: string;
  partyName: string;
  particulars: string;
  responsibilityCenter: string;
  referenceNo: string;
};

export type AccountsPayableVoucherAccountingEntry = {
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

export type AccountsPayableVoucherRecord = {
  id: string;
  transactionNo: string;
  documentDate: string;
  partyCode: string;
  partyName: string;
  address: string;
  contactPerson: string;
  contactNo: string;
  projectName: string;
  currency: string;
  exchangeRate: number;
  amount: number;
  termId: string;
  terms: string;
  dueDate: string;
  referenceNo: string;
  creditAccountCode: string;
  creditAccountTitle: string;
  payableType: AccountsPayableVoucherPayableType;
  remarks: string;
  status: AccountsPayableVoucherStatus;
  expenseLines: AccountsPayableVoucherExpenseLine[];
  accountingEntries: AccountsPayableVoucherAccountingEntry[];
  createdAt: string;
  updatedAt: string;
};

export type AccountsPayableVoucherFormValues = Omit<
  AccountsPayableVoucherRecord,
  "id" | "createdAt" | "updatedAt"
>;

export type AccountsPayableVoucherExpenseLineField =
  keyof AccountsPayableVoucherExpenseLine;

export type AccountsPayableVoucherAccountingEntryField =
  keyof AccountsPayableVoucherAccountingEntry;

export type AccountsPayableVoucherFormErrors = Partial<
  Record<keyof AccountsPayableVoucherFormValues | "balance", string>
> & {
  expenseLineErrors?: Record<
    string,
    Partial<Record<keyof AccountsPayableVoucherExpenseLine, string>>
  >;
  accountingEntryErrors?: Record<
    string,
    Partial<Record<keyof AccountsPayableVoucherAccountingEntry, string>>
  >;
};

export type AccountsPayableVoucherActionMode = "add" | "edit" | "view";
