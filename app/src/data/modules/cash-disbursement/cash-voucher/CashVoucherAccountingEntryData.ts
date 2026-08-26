import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { getModuleChartAccounts } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import {
  AccountingPartyFallbackValuePrefix,
  CashOnHandAccountCode,
  CashOnHandAccountName,
  DefaultCashVoucherEntryColumnOrder,
  DefaultExpenseEntryColumnOrder,
  ExpandedWithholdingTaxAccountCode,
  ExpandedWithholdingTaxAccountName,
  InputVatAccountCode,
  InputVatAccountName,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  createBlankCashVoucherLineEntry,
  createTaxDetails,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import type {
  CashVoucherEntryColumnId,
  ExpenseEntryColumnId,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import type {
  CashVoucherLineEntry,
  CashVoucherBankAccount,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { DefaultAccount } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export function createAccountingChartAccountOptions(entries: CashVoucherLineEntry[]): ModuleChartAccount[] {
  const chartAccounts = getModuleChartAccounts();
  const accountKeys = new Set(chartAccounts.flatMap((account) => [account.accountName.toLowerCase(), account.accountNumber]));
  const customAccounts: ModuleChartAccount[] = [];

  entries.forEach((entry) => {
    const accountName = entry.accountName.trim();
    const accountKey = accountName.toLowerCase();

    if (!accountName || accountKeys.has(accountKey)) {
      return;
    }

    accountKeys.add(accountKey);
    customAccounts.push({
      accountCategory: "Other",
      accountName,
      accountNumber: entry.accountCode,
      accountType: "Expenses",
      description: entry.accountCode,
      id: `entry-account-${entry.id}`,
      normalBalance: parseMoneyNumberInput(entry.credit) > 0 ? "Credit" : "Debit",
      statementGroup: "Income Statement",
      statementSection: "Accounting Entry",
      status: "Active",
    });
  });

  return [...chartAccounts, ...customAccounts];
}

export function createDefaultAccountExpenseOptions(defaultAccounts: DefaultAccount[]): ModuleChartAccount[] {
  return defaultAccounts
    .filter((account) => account.status === "Active" && account.type === "EXPENSE")
    .flatMap((account) =>
      account.generatedAccounts
        .filter((generatedAccount) => generatedAccount.role === "EXPENSE" && generatedAccount.status === "ACTIVE")
        .map<ModuleChartAccount>((generatedAccount) => ({
          accountCategory: generatedAccount.accountNature ?? generatedAccount.role,
          accountName: generatedAccount.accountTitle,
          accountNumber: generatedAccount.accountCode,
          accountType: generatedAccount.accountType ?? "Expenses",
          description: account.defaultAccountName,
          id: generatedAccount.chartAccountId,
          normalBalance: "Debit",
          statementGroup: "Income Statement",
          statementSection: generatedAccount.accountNature ?? "Default Account Expense",
          status: "Active",
        })),
    );
}

export function normalizeCashVoucherLineEntryFields(entry: CashVoucherLineEntry): CashVoucherLineEntry {
  const taxDetails = entry.taxDetails ?? createTaxDetails(0, "0%");

  return {
    ...entry,
    atcCode: entry.atcCode ?? taxDetails.atcCode ?? "",
    partyCode: entry.partyCode ?? "",
    partyName: entry.partyName ?? "",
    refId: entry.refId ?? taxDetails.refId ?? "",
    responsibilityCenter: entry.responsibilityCenter ?? taxDetails.responsibilityCenter ?? "",
    taxDetails,
    vatType: entry.vatType ?? taxDetails.vatType ?? "",
  };
}

export function syncCashVoucherLineEntryTaxDetails(entry: CashVoucherLineEntry): CashVoucherLineEntry {
  const amount = parseMoneyNumberInput(entry.debit) || parseMoneyNumberInput(entry.credit);
  const taxDetails = syncTaxDetailsAmount(
    {
      ...entry.taxDetails,
      atcCode: entry.atcCode ?? entry.taxDetails.atcCode,
      refId: entry.refId ?? entry.taxDetails.refId,
      responsibilityCenter: entry.responsibilityCenter ?? entry.taxDetails.responsibilityCenter,
      vatType: entry.vatType ?? entry.taxDetails.vatType,
    },
    amount,
    String(entry.taxRate || "0%"),
  );

  return {
    ...entry,
    atcCode: taxDetails.atcCode,
    refId: taxDetails.refId,
    responsibilityCenter: taxDetails.responsibilityCenter,
    taxDetails,
    vatType: taxDetails.vatType,
  };
}

export function getAccountingPartyFallbackValue(partyName: string) {
  const normalizedPartyName = partyName.trim().toLowerCase();

  return normalizedPartyName ? `${AccountingPartyFallbackValuePrefix}${normalizedPartyName}` : "";
}

export function isCashVoucherEntryColumnId(columnId: string): columnId is CashVoucherEntryColumnId {
  return DefaultCashVoucherEntryColumnOrder.includes(columnId as CashVoucherEntryColumnId);
}

export function isExpenseEntryColumnId(columnId: string): columnId is ExpenseEntryColumnId {
  return DefaultExpenseEntryColumnOrder.includes(columnId as ExpenseEntryColumnId);
}

export function isCashOnHandEntry(entry: CashVoucherLineEntry) {
  return entry.accountCode === CashOnHandAccountCode || entry.accountName.trim().toLowerCase() === CashOnHandAccountName.toLowerCase();
}

export function isPaymentCreditEntry(entry: CashVoucherLineEntry) {
  return (
    isCashOnHandEntry(entry) ||
    entry.id.startsWith("auto-credit-") ||
    entry.id.startsWith("payment-credit-") ||
    entry.id.startsWith("cash-in-hand-")
  );
}

export function isGeneratedVatEntry(entry: CashVoucherLineEntry) {
  return entry.id.startsWith("auto-input-vat-") || entry.accountName.trim().toLowerCase() === "input vat";
}

export function isGeneratedEwtEntry(entry: CashVoucherLineEntry) {
  return entry.id.startsWith("auto-ewt-") || entry.accountName.trim().toLowerCase() === "expanded withholding tax";
}

export function isGeneratedAccountingEntry(entry: CashVoucherLineEntry) {
  return isPaymentCreditEntry(entry) || isGeneratedVatEntry(entry) || isGeneratedEwtEntry(entry);
}

export function shouldSyncCashVoucherEntryParty(entry: CashVoucherLineEntry, previousPartyCode: string, previousPartyName: string) {
  const entryPartyCode = (entry.partyCode ?? "").trim();
  const entryPartyName = (entry.partyName ?? "").trim();

  return (!entryPartyCode && !entryPartyName) || entryPartyCode === previousPartyCode || entryPartyName === previousPartyName;
}

export function applyVoucherPartyToEntryUpdates(
  entry: CashVoucherLineEntry | undefined,
  updates: Partial<CashVoucherLineEntry>,
  partyCode: string,
  partyName: string,
) {
  const hasAccountUpdate =
    Object.prototype.hasOwnProperty.call(updates, "accountCode") || Object.prototype.hasOwnProperty.call(updates, "accountName");

  if (!hasAccountUpdate || (entry?.partyCode ?? "").trim() || (entry?.partyName ?? "").trim()) {
    return updates;
  }

  return {
    ...updates,
    partyCode,
    partyName,
  };
}

export function createAutomaticAccountingEntries(
  entries: CashVoucherLineEntry[],
  options: {
    bankAccount?: CashVoucherBankAccount | null;
    isCashPayment: boolean;
    paymentMethod: string;
  },
) {
  const editableExpenseEntries = entries
    .filter((entry) => !isGeneratedAccountingEntry(entry))
    .map((entry) => {
      const normalizedEntry = normalizeCashVoucherLineEntryFields({
        ...entry,
        credit: 0,
      });
      const netEntryAmounts = getSignedAccountingEntryAmounts(normalizedEntry.taxDetails.netAmount, "debit");

      return {
        ...normalizedEntry,
        debit: netEntryAmounts.debit,
        credit: netEntryAmounts.credit,
        status: "Balanced" as const,
      };
    });
  const expenseEntriesWithAmount = editableExpenseEntries.filter(
    (entry) =>
      hasNonZeroAccountingAmount(entry.taxDetails.grossAmount) ||
      hasNonZeroAccountingAmount(entry.debit) ||
      hasNonZeroAccountingAmount(entry.credit),
  );

  if (expenseEntriesWithAmount.length === 0) {
    return editableExpenseEntries;
  }

  const referenceEntry = expenseEntriesWithAmount[0] ?? editableExpenseEntries[0];
  const totalVatAmount = expenseEntriesWithAmount.reduce((sum, entry) => sum + Number(entry.taxDetails.vatAmount || 0), 0);
  const totalEwtAmount = expenseEntriesWithAmount.reduce((sum, entry) => sum + Number(entry.taxDetails.ewtAmount || 0), 0);
  const totalCashVoucherAmount = expenseEntriesWithAmount.reduce((sum, entry) => sum + Number(entry.taxDetails.amount || 0), 0);
  const commonFields = {
    partyCode: referenceEntry?.partyCode ?? "",
    partyName: referenceEntry?.partyName ?? "",
    refId: referenceEntry?.refId ?? "",
    responsibilityCenter: referenceEntry?.responsibilityCenter ?? "",
  };
  const generatedEntries: CashVoucherLineEntry[] = [];

  if (hasNonZeroAccountingAmount(totalVatAmount)) {
    const vatEntryAmounts = getSignedAccountingEntryAmounts(totalVatAmount, "debit");

    generatedEntries.push({
      ...createBlankCashVoucherLineEntry(),
      ...commonFields,
      accountCode: InputVatAccountCode,
      accountName: InputVatAccountName,
      debit: vatEntryAmounts.debit,
      credit: vatEntryAmounts.credit,
      id: "auto-input-vat-current",
      remarks: referenceEntry?.remarks.trim() || "Input VAT",
      taxDetails: {
        ...createTaxDetails(totalVatAmount, "0%"),
        ...commonFields,
      },
      taxRate: "0%",
      vatType: "Input VAT",
      status: "Balanced",
    });
  }

  if (hasNonZeroAccountingAmount(totalEwtAmount)) {
    const ewtEntryAmounts = getSignedAccountingEntryAmounts(totalEwtAmount, "credit");

    generatedEntries.push({
      ...createBlankCashVoucherLineEntry(),
      ...commonFields,
      accountCode: ExpandedWithholdingTaxAccountCode,
      accountName: ExpandedWithholdingTaxAccountName,
      atcCode: referenceEntry?.taxDetails.ewtCode ?? "",
      debit: ewtEntryAmounts.debit,
      credit: ewtEntryAmounts.credit,
      id: "auto-ewt-current",
      remarks: referenceEntry?.remarks.trim() || "Expanded Withholding Tax",
      taxDetails: {
        ...createTaxDetails(totalEwtAmount, "0%"),
        ...commonFields,
        atcCode: referenceEntry?.taxDetails.ewtCode ?? "",
      },
      taxRate: "0%",
      vatType: "EWT",
      status: "Balanced",
    });
  }

  if (hasNonZeroAccountingAmount(totalCashVoucherAmount) && (options.isCashPayment || options.bankAccount)) {
    const creditAccount = options.isCashPayment
      ? {
          accountCode: CashOnHandAccountCode,
          accountName: CashOnHandAccountName,
        }
      : {
          accountCode: options.bankAccount?.accountCode ?? "",
          accountName: options.bankAccount?.accountTitle ?? "",
        };
    const paymentEntryAmounts = getSignedAccountingEntryAmounts(totalCashVoucherAmount, "credit");

    generatedEntries.push({
      ...createBlankCashVoucherLineEntry(),
      ...commonFields,
      accountCode: creditAccount.accountCode,
      accountName: creditAccount.accountName,
      debit: paymentEntryAmounts.debit,
      credit: paymentEntryAmounts.credit,
      id: "auto-credit-current",
      remarks: referenceEntry?.remarks.trim() || `Settlement via ${options.paymentMethod || "payment"}`,
      taxDetails: {
        ...createTaxDetails(totalCashVoucherAmount, "0%"),
        ...commonFields,
      },
      taxRate: "0%",
      vatType: "",
      status: "Balanced",
    });
  }

  return [...editableExpenseEntries, ...generatedEntries];
}

export function getSignedAccountingEntryAmounts(value: number, positiveSide: "credit" | "debit") {
  const roundedValue = roundAccountingAmount(value);
  const amount = Math.abs(roundedValue);
  const isDebitSide = roundedValue >= 0 ? positiveSide === "debit" : positiveSide === "credit";

  return {
    credit: isDebitSide ? 0 : amount,
    debit: isDebitSide ? amount : 0,
  };
}

export function hasNonZeroAccountingAmount(value: number) {
  return Math.abs(roundAccountingAmount(value)) > 0;
}

export function roundAccountingAmount(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

export function getExpenseEntryColumnTotal(
  entries: CashVoucherLineEntry[],
  columnId: "amount" | "ewtAmount" | "netAmount" | "totalAmountDue" | "vatAmount",
) {
  return entries.reduce((sum, entry) => {
    switch (columnId) {
      case "amount":
        return sum + Number(entry.taxDetails.grossAmount || 0);
      case "ewtAmount":
        return sum + Number(entry.taxDetails.ewtAmount || 0);
      case "netAmount":
        return sum + Number(entry.taxDetails.netAmount || 0);
      case "totalAmountDue":
        return sum + Number(entry.taxDetails.amount || 0);
      case "vatAmount":
        return sum + Number(entry.taxDetails.vatAmount || 0);
      default:
        return sum;
    }
  }, 0);
}

export function getCashVoucherEntryExportCell(entry: CashVoucherLineEntry, columnId: CashVoucherEntryColumnId) {
  switch (columnId) {
    case "accountCode":
      return entry.accountCode ?? "";
    case "accountName":
      return entry.accountName ?? "";
    case "atcCode":
      return entry.atcCode ?? "";
    case "checkNo":
      return entry.checkNo ?? "";
    case "checkStatus":
      return entry.checkStatus ?? "";
    case "checkDate":
      return entry.checkDate ?? "";
    case "remarks":
      return entry.remarks ?? "";
    case "partyCode":
      return entry.partyCode ?? "";
    case "partyName":
      return entry.partyName ?? "";
    case "refId":
      return entry.refId ?? "";
    case "responsibilityCenter":
      return entry.responsibilityCenter ?? "";
    case "vatType":
      return entry.vatType ?? "";
    case "debit":
      return String(entry.debit || "");
    case "credit":
      return String(entry.credit || "");
    default:
      return "";
  }
}

export function moveEntryColumn<TColumnId extends string>(currentOrder: TColumnId[], fromColumnId: TColumnId, toColumnId: TColumnId) {
  const fromIndex = currentOrder.indexOf(fromColumnId);
  const toIndex = currentOrder.indexOf(toColumnId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return currentOrder;
  }

  const nextOrder = [...currentOrder];
  const [movedColumn] = nextOrder.splice(fromIndex, 1);

  nextOrder.splice(toIndex, 0, movedColumn);
  return nextOrder;
}

export function updateVisibleEntryColumns<TColumnId extends string>(
  currentVisibleIds: TColumnId[],
  columnOrder: TColumnId[],
  columnId: TColumnId,
  isVisible: boolean,
) {
  if (isVisible) {
    const nextVisibleIds = new Set([...currentVisibleIds, columnId]);

    return columnOrder.filter((currentColumnId) => nextVisibleIds.has(currentColumnId));
  }

  if (currentVisibleIds.length <= 1) {
    return currentVisibleIds;
  }

  return currentVisibleIds.filter((currentColumnId) => currentColumnId !== columnId);
}

export function shouldClearEntry(entry: CashVoucherLineEntry, action: Exclude<ModuleDataEntryClearAction, "all">) {
  if (action === "with-data") {
    return disbursementEntryHasData(entry);
  }

  if (action === "incomplete") {
    return disbursementEntryHasData(entry) && !disbursementEntryIsComplete(entry);
  }

  return !disbursementEntryHasData(entry);
}

export function disbursementEntryHasData(entry: CashVoucherLineEntry) {
  return (
    entry.accountCode.trim() !== "" ||
    entry.accountName.trim() !== "" ||
    (entry.checkDate ?? "").trim() !== "" ||
    (entry.checkNo ?? "").trim() !== "" ||
    (entry.checkStatus ?? "").trim() !== "" ||
    (entry.partyCode ?? "").trim() !== "" ||
    (entry.partyName ?? "").trim() !== "" ||
    (entry.responsibilityCenter ?? "").trim() !== "" ||
    (entry.refId ?? "").trim() !== "" ||
    (entry.vatType ?? "").trim() !== "" ||
    (entry.atcCode ?? "").trim() !== "" ||
    entry.remarks.trim() !== "" ||
    parseMoneyNumberInput(entry.debit) > 0 ||
    parseMoneyNumberInput(entry.credit) > 0 ||
    entry.taxRate !== "0%"
  );
}

export function disbursementEntryIsComplete(entry: CashVoucherLineEntry) {
  return (
    entry.accountCode.trim() !== "" &&
    entry.accountName.trim() !== "" &&
    (parseMoneyNumberInput(entry.debit) > 0 || parseMoneyNumberInput(entry.credit) > 0) &&
    !(parseMoneyNumberInput(entry.debit) > 0 && parseMoneyNumberInput(entry.credit) > 0)
  );
}

export function estimateCashVoucherEntryTextWidth(value: string, padding: number) {
  return Math.min(600, Math.max(50, value.trim().length * 7.5 + padding));
}

export function calculateCashVoucherEntryColumnFitWidth({
  columnId,
  columnLabels,
  entries,
}: {
  columnId: CashVoucherEntryColumnId;
  columnLabels: Record<CashVoucherEntryColumnId, string>;
  entries: CashVoucherLineEntry[];
}) {
  const headerWidth = estimateCashVoucherEntryTextWidth(columnLabels[columnId], 76);
  const contentWidth = entries.reduce(
    (currentWidth, entry) =>
      Math.max(currentWidth, estimateCashVoucherEntryTextWidth(String(getCashVoucherEntryExportCell(entry, columnId) ?? ""), 24)),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

