import type {
  BankReconciliationCheckingItem,
  BankReconciliationFormValues,
  BankReconciliationRecord,
  BankReconciliationStatistics,
} from "@/app/src/types/modules/cash-receipt/bank-reconciliation/BankReconciliationTypes";

export function formatBankReconciliationAmount(value: number): string {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function createDefaultBankReconciliationFormValues(
  existingRecord?: BankReconciliationRecord | null,
): BankReconciliationFormValues {
  if (existingRecord) {
    return {
      brNo: existingRecord.brNo,
      status: existingRecord.status,
      bankId: existingRecord.bankId,
      bankName: existingRecord.bankName,
      accountCode: existingRecord.accountCode,
      accountTitle: existingRecord.accountTitle,
      currency: existingRecord.currency,
      bookBalance: existingRecord.bookBalance,
      bankBalance: existingRecord.bankBalance,
      endingDate: existingRecord.endingDate,
      outstandingCheck: existingRecord.outstandingCheck,
      depositInTransit: existingRecord.depositInTransit,
      adjustedBookBalance: existingRecord.adjustedBookBalance,
      adjustedBankBalance: existingRecord.adjustedBankBalance,
      variance: existingRecord.variance,
      bankTemplate: existingRecord.bankTemplate,
      statementFileName: existingRecord.statementFileName,
      checkingItems: existingRecord.checkingItems,
      remarks: existingRecord.remarks,
    };
  }

  const today = new Date().toISOString().split("T")[0];

  return {
    brNo: "000001",
    status: "Open",
    bankId: "",
    bankName: "",
    accountCode: "",
    accountTitle: "",
    currency: "PHP",
    bookBalance: 0,
    bankBalance: 0,
    endingDate: today,
    outstandingCheck: 0,
    depositInTransit: 0,
    adjustedBookBalance: 0,
    adjustedBankBalance: 0,
    variance: 0,
    bankTemplate: "",
    statementFileName: "",
    checkingItems: createSampleCheckingItems(),
    remarks: "",
  };
}

export function calculateBankReconciliationTotals(
  bookBalance: number,
  bankBalance: number,
  checkingItems: BankReconciliationCheckingItem[],
) {
  // Outstanding Checks: Uncleared checks (Tab 2)
  const outstandingCheck = checkingItems
    .filter((item) => item.itemType === "check" && !item.isCleared)
    .reduce((sum, item) => sum + item.amount, 0);

  // Deposit in Transit: Uncleared deposits (Tab 1)
  const depositInTransit = checkingItems
    .filter((item) => item.itemType === "deposit" && !item.isCleared)
    .reduce((sum, item) => sum + item.amount, 0);

  // Adjusted Bank Balance = Bank Balance - Outstanding Check + Deposit in Transit
  const adjustedBankBalance = bankBalance - outstandingCheck + depositInTransit;

  // Adjusted Book Balance = Book Balance (can include adjustments if any)
  const adjustedBookBalance = bookBalance;

  // Variance = Adjusted Bank Balance - Adjusted Book Balance
  const variance = adjustedBankBalance - adjustedBookBalance;

  return {
    adjustedBankBalance,
    adjustedBookBalance,
    depositInTransit,
    outstandingCheck,
    variance,
  };
}

export function computeBankReconciliationStatistics(
  records: BankReconciliationRecord[],
): BankReconciliationStatistics {
  return records.reduce(
    (acc, record) => {
      acc.totalReconciliations += 1;
      if (record.status === "Open" || record.status === "Draft") acc.openCount += 1;
      if (record.status === "For Approval") acc.forApprovalCount += 1;
      if (record.status === "Posted") acc.postedCount += 1;
      if (record.status === "Disapproved") acc.disapprovedCount += 1;
      if (record.status === "Cancelled") acc.cancelledCount += 1;
      return acc;
    },
    {
      totalReconciliations: 0,
      openCount: 0,
      forApprovalCount: 0,
      postedCount: 0,
      disapprovedCount: 0,
      cancelledCount: 0,
    },
  );
}

export function createSampleCheckingItems(): BankReconciliationCheckingItem[] {
  return [
    {
      id: "chk-1",
      appDate: "2026-08-05",
      vceName: "Mega Global Trading Corp.",
      refType: "CR",
      transNo: "CR-2026-00101",
      remarks: "Collection for Invoice SI-1002",
      amount: 45000,
      transacted: "Yes",
      itemType: "deposit",
      isCleared: false,
    },
    {
      id: "chk-2",
      appDate: "2026-08-10",
      vceName: "Pacific Prime Sales Inc.",
      refType: "OR",
      transNo: "OR-2026-00445",
      remarks: "Cash sale counter collection",
      amount: 28500,
      transacted: "Yes",
      itemType: "deposit",
      isCleared: false,
    },
    {
      id: "chk-3",
      appDate: "2026-08-14",
      vceName: "Horizon Ventures Group",
      refType: "CR",
      transNo: "CR-2026-00105",
      remarks: "Direct bank deposit payment",
      amount: 15200,
      transacted: "Yes",
      itemType: "deposit",
      isCleared: false,
    },
    {
      id: "chk-4",
      appDate: "2026-08-02",
      vceName: "Apex Office Supplies",
      refType: "CV",
      transNo: "CV-2026-00210",
      checkNo: "00054210",
      remarks: "Payment for office supplies",
      amount: 12400,
      transacted: "Yes",
      itemType: "check",
      isCleared: false,
    },
    {
      id: "chk-5",
      appDate: "2026-08-08",
      vceName: "Delta Logistics Corp.",
      refType: "APV",
      transNo: "APV-2026-00115",
      checkNo: "00054211",
      remarks: "Freight and delivery charges",
      amount: 34000,
      transacted: "Yes",
      itemType: "check",
      isCleared: false,
    },
    {
      id: "chk-6",
      appDate: "2026-08-12",
      vceName: "Summit Technologies Inc.",
      refType: "CV",
      transNo: "CV-2026-00214",
      checkNo: "00054212",
      remarks: "IT software subscription",
      amount: 18900,
      transacted: "Yes",
      itemType: "check",
      isCleared: false,
    },
  ];
}

export function createInitialBankReconciliationRecords(): BankReconciliationRecord[] {
  return [
    {
      id: "br-rec-1",
      brNo: "000001",
      status: "Open",
      bankId: "bank-1",
      bankName: "BDO",
      accountCode: "11101300",
      accountTitle: "Cash In Bank - BDO 00-115000-2717",
      currency: "PHP",
      bookBalance: 125000,
      bankBalance: 143600,
      endingDate: "2026-08-18",
      outstandingCheck: 65300,
      depositInTransit: 88700,
      adjustedBookBalance: 125000,
      adjustedBankBalance: 167000,
      variance: 42000,
      bankTemplate: "BDO",
      statementFileName: "BDO_Statement_Aug2026.xlsx",
      checkingItems: createSampleCheckingItems(),
      remarks: "Monthly bank reconciliation for BDO Operating Account.",
      createdAt: "2026-08-18T08:00:00.000Z",
      updatedAt: "2026-08-18T08:30:00.000Z",
    },
  ];
}
