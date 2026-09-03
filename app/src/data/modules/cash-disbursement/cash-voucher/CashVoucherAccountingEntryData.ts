import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import {
  AccountingPartyFallbackValuePrefix,
  DefaultCashVoucherEntryColumnOrder,
  DefaultExpenseEntryColumnOrder,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  createBlankCashVoucherLineEntry,
  createTaxDetails,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import type {
  CashVoucherEntryColumnId,
  ExpenseEntryColumnId,
  GeneratedAccountingAccount,
  GeneratedAccountingAccountMap,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryTypes";
import type {
  CashVoucherLineEntry,
  CashVoucherBankAccount,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { DefaultAccount } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import { calculateFitColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/entryTableState.util";
import { formatAmount } from "@/app/src/utils/currency.util";

export function createAccountingChartAccountOptions(
  _entries: CashVoucherLineEntry[],
  chartAccounts: ModuleChartAccount[],
): ModuleChartAccount[] {
  void _entries;
  return chartAccounts;
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
    ewtCode: entry.ewtCode ?? taxDetails.ewtCode ?? "",
    partyCode: entry.partyCode ?? "",
    partyName: entry.partyName ?? "",
    refId: entry.refId ?? taxDetails.refId ?? "",
    responsibilityCenter: entry.responsibilityCenter ?? taxDetails.responsibilityCenter ?? "",
    taxDetails,
    vatType: entry.vatType ?? taxDetails.vatType ?? "",
  };
}

export function syncCashVoucherLineEntryTaxDetails(entry: CashVoucherLineEntry): CashVoucherLineEntry {
  const amount = parseMoneyNumberInput(entry.taxDetails?.grossAmount) || parseMoneyNumberInput(entry.debit) || parseMoneyNumberInput(entry.credit);
  const taxDetails = syncTaxDetailsAmount(
    {
      ...entry.taxDetails,
      ewtCode: entry.ewtCode ?? entry.taxDetails.ewtCode,
      refId: entry.refId ?? entry.taxDetails.refId,
      responsibilityCenter: entry.responsibilityCenter ?? entry.taxDetails.responsibilityCenter,
      vatType: entry.vatType ?? entry.taxDetails.vatType,
    },
    amount,
    String(entry.taxRate || "0%"),
  );

  return {
    ...entry,
    ewtCode: taxDetails.ewtCode,
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
  return entry.id.startsWith("auto-credit-") || entry.id.startsWith("payment-credit-") || entry.id.startsWith("cash-in-hand-");
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
    blankRemarksEntryIds?: string[];
    generatedRemarksOverrides?: Record<string, string>;
    isCashPayment: boolean;
    paymentMethod: string;
    cashAccount?: GeneratedAccountingAccount;
    inputVatAccount?: GeneratedAccountingAccount;
    inputVatAccountsByTaxCode?: GeneratedAccountingAccountMap;
    withholdingTaxAccount?: GeneratedAccountingAccount;
    withholdingTaxAccountsByCode?: GeneratedAccountingAccountMap;
  },
) {
  const blankRemarksEntryIds = new Set(options.blankRemarksEntryIds ?? []);
  const editableExpenseEntries = entries
    .filter((entry) => !isGeneratedAccountingEntry(entry))
    .map((entry) => {
      const normalizedEntry = normalizeCashVoucherLineEntryFields({
        ...entry,
        credit: 0,
      });
      const netEntryAmounts = getSignedAccountingEntryAmounts(normalizedEntry.taxDetails.netAmount, "debit");
      const hasIntentionalBlankRemarks = blankRemarksEntryIds.has(entry.id) && (normalizedEntry.particulars === "" || normalizedEntry.remarks === "");
      const entryText = hasIntentionalBlankRemarks ? "" : normalizedEntry.particulars || normalizedEntry.remarks || normalizedEntry.accountName;

      return {
        ...normalizedEntry,
        debit: netEntryAmounts.debit,
        credit: netEntryAmounts.credit,
        particulars: entryText,
        remarks: entryText,
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
  const settlementAccountName = options.isCashPayment
    ? options.cashAccount?.accountName || options.paymentMethod.trim() || "Cash"
    : options.bankAccount?.accountTitle || options.paymentMethod.trim() || "Payment";
  const generatedRemarks = createGeneratedAccountingRemarks(
    expenseEntriesWithAmount,
    settlementAccountName,
    blankRemarksEntryIds,
  );
  const commonFields = {
    partyCode: referenceEntry?.partyCode ?? "",
    partyName: referenceEntry?.partyName ?? "",
    refId: referenceEntry?.refId ?? "",
    responsibilityCenter: referenceEntry?.responsibilityCenter ?? "",
  };
  const generatedEntries: CashVoucherLineEntry[] = [];

  if (hasNonZeroAccountingAmount(totalVatAmount)) {
    const vatEntryAmounts = getSignedAccountingEntryAmounts(totalVatAmount, "debit");
    const vatText = options.generatedRemarksOverrides?.["auto-input-vat-current"] ?? generatedRemarks.inputVat;
    const vatReferenceEntry = expenseEntriesWithAmount.find((entry) => hasNonZeroAccountingAmount(entry.taxDetails.vatAmount));
    const vatCode = vatReferenceEntry?.taxDetails.vatCode || vatReferenceEntry?.vatType || "";
    const inputVatAccount = findGeneratedAccountingAccount(options.inputVatAccountsByTaxCode, vatCode) ?? options.inputVatAccount;

    generatedEntries.push({
      ...createBlankCashVoucherLineEntry(),
      ...commonFields,
      accountCode: inputVatAccount?.accountCode ?? "",
      accountName: inputVatAccount?.accountName ?? "",
      debit: vatEntryAmounts.debit,
      credit: vatEntryAmounts.credit,
      id: "auto-input-vat-current",
      particulars: vatText,
      remarks: vatText,
      taxDetails: {
        ...createTaxDetails(totalVatAmount, "0%"),
        ...commonFields,
        vatCode,
        vatPercent: vatReferenceEntry?.taxDetails.vatPercent ?? 0,
        vatType: vatCode,
      },
      taxRate: "0%",
      vatType: vatCode,
      status: "Balanced",
    });
  }

  if (hasNonZeroAccountingAmount(totalEwtAmount)) {
    const ewtEntryAmounts = getSignedAccountingEntryAmounts(totalEwtAmount, "credit");
    const ewtText = options.generatedRemarksOverrides?.["auto-ewt-current"] ?? generatedRemarks.ewt;
    const ewtCode = referenceEntry?.taxDetails.ewtCode ?? "";
    const withholdingTaxAccount =
      findGeneratedAccountingAccount(options.withholdingTaxAccountsByCode, ewtCode) ?? options.withholdingTaxAccount;

    generatedEntries.push({
      ...createBlankCashVoucherLineEntry(),
      ...commonFields,
      accountCode: withholdingTaxAccount?.accountCode ?? "",
      accountName: withholdingTaxAccount?.accountName ?? "",
      ewtCode,
      debit: ewtEntryAmounts.debit,
      credit: ewtEntryAmounts.credit,
      id: "auto-ewt-current",
      particulars: ewtText,
      remarks: ewtText,
      taxDetails: {
        ...createTaxDetails(totalEwtAmount, "0%"),
        ...commonFields,
        ewtCode,
      },
      taxRate: "0%",
      vatType: "EWT",
      status: "Balanced",
    });
  }

  if (hasNonZeroAccountingAmount(totalCashVoucherAmount) && (options.isCashPayment || options.bankAccount)) {
    const creditAccount = options.isCashPayment
      ? {
          accountCode: options.cashAccount?.accountCode ?? "",
          accountName: options.cashAccount?.accountName ?? "",
        }
      : {
          accountCode: options.bankAccount?.accountCode ?? "",
          accountName: options.bankAccount?.accountTitle ?? "",
        };
    const paymentEntryAmounts = getSignedAccountingEntryAmounts(totalCashVoucherAmount, "credit");
    const settlementText = options.generatedRemarksOverrides?.["auto-credit-current"] ?? generatedRemarks.settlement;

    generatedEntries.push({
      ...createBlankCashVoucherLineEntry(),
      ...commonFields,
      accountCode: creditAccount.accountCode,
      accountName: creditAccount.accountName,
      debit: paymentEntryAmounts.debit,
      credit: paymentEntryAmounts.credit,
      id: "auto-credit-current",
      particulars: settlementText,
      remarks: settlementText,
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

function findGeneratedAccountingAccount(
  accountByKey: GeneratedAccountingAccountMap | undefined,
  key: string | undefined,
): GeneratedAccountingAccount | undefined {
  const normalizedKey = key?.trim();
  return normalizedKey ? accountByKey?.[normalizedKey] : undefined;
}

function createGeneratedAccountingRemarks(
  entries: CashVoucherLineEntry[],
  settlementAccountName: string,
  blankRemarksEntryIds: Set<string>,
) {
  const userRemarksSummary = createUniqueRemarksSummary(
    entries.map((entry) => {
      if (blankRemarksEntryIds.has(entry.id)) {
        return "";
      }

      const remarks = (entry.particulars || entry.remarks || "").trim();
      const createdRemarks = entry.accountName.trim();

      return remarks && remarks !== createdRemarks ? remarks : "";
    }),
  );

  if (userRemarksSummary) {
    return {
      ewt: userRemarksSummary,
      inputVat: userRemarksSummary,
      settlement: userRemarksSummary,
    };
  }

  const expenseSummary = createUniqueRemarksSummary(entries.map((entry) => entry.accountName.trim()));
  return {
    ewt: expenseSummary ? `EWT - ${expenseSummary}` : "EWT",
    inputVat: expenseSummary ? `Input VAT - ${expenseSummary}` : "Input VAT",
    settlement: expenseSummary ? `${settlementAccountName} - ${expenseSummary}` : settlementAccountName,
  };
}

function createUniqueRemarksSummary(remarks: string[]) {
  return remarks.map((remark) => remark.trim()).filter((remark, index, list) => remark && list.indexOf(remark) === index).join(", ");
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
  columnId: "amount" | "ewtAmount" | "netAmount" | "vatAmount" | "disburseAmount",
) {
  return entries.reduce((sum, entry) => {
    switch (columnId) {
      case "amount":
        return sum + Number(entry.taxDetails.grossAmount || 0);
      case "ewtAmount":
        return sum + Number(entry.taxDetails.ewtAmount || 0);
      case "netAmount":
        return sum + Number(entry.taxDetails.netAmount || 0);
      case "vatAmount":
        return sum + Number(entry.taxDetails.vatAmount || 0);
      case "disburseAmount":
        return sum + Number(entry.taxDetails.amount || 0);
      default:
        return sum;
    }
  }, 0);
}

export function getCashVoucherEntryExportCell(
  entry: CashVoucherLineEntry,
  columnId: CashVoucherEntryColumnId | ExpenseEntryColumnId | string,
) {
  switch (columnId) {
    case "accountCode":
    case "disbursementCode":
      return entry.accountCode ?? "";
    case "accountName":
    case "expenseType":
      return entry.accountName ?? "";
    case "amount":
      return formatAmount(entry.taxDetails?.grossAmount ?? 0);
    case "netAmount":
      return formatAmount(entry.taxDetails?.netAmount ?? 0);
    case "vatCode":
      return entry.taxDetails?.vatCode ?? entry.vatType ?? "";
    case "vatPercent":
      return `${formatAmount(entry.taxDetails?.vatPercent ?? 0)}%`;
    case "vatAmount":
      return formatAmount(entry.taxDetails?.vatAmount ?? 0);
    case "ewtCode":
      return entry.ewtCode ?? entry.taxDetails?.ewtCode ?? "";
    case "ewtPercent":
      return `${formatAmount(entry.taxDetails?.ewtPercent ?? 0)}%`;
    case "ewtAmount":
      return formatAmount(entry.taxDetails?.ewtAmount ?? 0);
    case "disburseAmount":
      return formatAmount(entry.taxDetails?.amount ?? 0);
    case "checkNo":
      return entry.checkNo ?? "";
    case "checkStatus":
      return entry.checkStatus ?? "";
    case "checkDate":
      return entry.checkDate ?? "";
    case "particulars":
      return entry.particulars ?? entry.remarks ?? "";
    case "partyCode":
      return entry.partyCode ?? "";
    case "partyName":
      return entry.partyName ?? "";
    case "refId":
      return entry.refId ?? "";
    case "responsibilityCenter":
    case "responsibilityCenterCode":
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
    (entry.ewtCode ?? "").trim() !== "" ||
    (entry.particulars ?? entry.remarks ?? "").trim() !== "" ||
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
  return calculateFitColumnWidth(
    columnLabels[columnId],
    entries,
    columnId,
    (entry, id) => getCashVoucherEntryExportCell(entry, id as CashVoucherEntryColumnId),
  );
}

