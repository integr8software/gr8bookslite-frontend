export type BankReconciliationStatus =
  | "Open"
  | "Draft"
  | "For Approval"
  | "Posted"
  | "Disapproved"
  | "Cancelled";

export type BankReconciliationStatusFilter = "all" | BankReconciliationStatus;

export type BankReconciliationActionMode = "add" | "edit" | "view";

export type BankReconciliationTabKey =
  | "deposit-in-transit"
  | "outstanding-checks"
  | "cleared";

export type BankReconciliationItemType = "deposit" | "check";

export type BankReconciliationCheckingItem = {
  id: string;
  appDate: string;
  vceName: string;
  refType: string;
  transNo: string;
  checkNo?: string;
  remarks: string;
  amount: number;
  transacted: string;
  itemType: BankReconciliationItemType;
  isCleared: boolean;
  isAutoMatched?: boolean;
};

export type BankReconciliationRecord = {
  id: string;
  brNo: string;
  status: BankReconciliationStatus;

  // Section 2: Select Bank
  bankId: string;
  bankName: string;
  accountCode: string;
  accountTitle: string;
  currency: string;

  // Section 3: Statement & Balances
  bookBalance: number;
  bankBalance: number;
  endingDate: string;
  outstandingCheck: number;
  depositInTransit: number;
  adjustedBookBalance: number;
  adjustedBankBalance: number;
  variance: number;

  // Section 4: Upload Bank Statement
  bankTemplate: string;
  statementFileName?: string;

  // Section 5: Reconcile Checking Items
  checkingItems: BankReconciliationCheckingItem[];

  remarks?: string;
  createdAt: string;
  updatedAt: string;
};

export type BankReconciliationFormValues = Omit<
  BankReconciliationRecord,
  "id" | "createdAt" | "updatedAt"
>;

export type BankReconciliationFormErrors = Partial<
  Record<keyof BankReconciliationFormValues, string>
>;

export type BankReconciliationStatistics = {
  totalReconciliations: number;
  openCount: number;
  forApprovalCount: number;
  postedCount: number;
  disapprovedCount: number;
  cancelledCount: number;
};
