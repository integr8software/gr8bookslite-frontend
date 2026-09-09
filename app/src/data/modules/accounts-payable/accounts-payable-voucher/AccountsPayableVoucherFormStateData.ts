import {
  expenseLineIsComplete,
  accountingEntryIsComplete,
} from "@/app/src/validations/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherValidation";

import {
  AccountsPayableVoucherAccountingCreditSide,
  AccountsPayableVoucherAccountingDebitSide,
  AccountsPayableVoucherEwtTaxLabel,
  AccountsPayableVoucherInputVatTaxLabel,
} from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import {
  accountsPayableVoucherExpenseLineHasItem,
  accountsPayableVoucherExpenseLinesHaveItems,
  createAccountsPayableVoucherAccountingEntry,
  getAccountsPayableVoucherAccountingTotals,
  renumberAccountsPayableVoucherAccountingEntries,
  syncAccountsPayableVoucherExpenseLinesAndAmount,
  syncAccountsPayableVoucherExpenseTaxAmounts,
} from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import { findModuleChartAccount, type ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type {
  AccountsPayableVoucherAccountingEntry,
  AccountsPayableVoucherAccountingEntryField,
  AccountsPayableVoucherActionMode,
  AccountsPayableVoucherExpenseLine,
  AccountsPayableVoucherExpenseLineField,
  AccountsPayableVoucherFormValues,
  AccountsPayableVoucherLookupParty,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import type { TaxDefinitionDefaultAccountIds } from "@/app/src/types/shared/tax/TaxDefinitionTypes";
import type { Tax } from "@/app/src/types/shared/tax/TaxTypes";
import { getEwtPercentFromCode, getVatPercentFromRate, getVatRateFromCode } from "@/app/src/data/shared/tax/TaxData";

type AccountsPayableVoucherTaxAccountingContext = {
  accountOptions: ModuleChartAccount[];
  defaultAccountIds: TaxDefinitionDefaultAccountIds;
  taxCodes: Tax[];
};

type PartyPurchaseTaxDefaults = {
  ewtCode: string;
  ewtPercent: number;
  inputVatCode: string;
  inputVatPercent: number;
};

const ManualInputVatAccountingEntryIdPrefix = "apv-entry-manual-input-vat-";
const ManualEwtAccountingEntryIdPrefix = "apv-entry-manual-ewt-";
const ManualDefaultPayableAccountingEntryId = "apv-entry-manual-default-payable";
const AccountsPayableVoucherAddMode = "add" as const;
const TaxAccountingAccountFallbackIds: Partial<Record<keyof TaxDefinitionDefaultAccountIds, string>> = {
  expandedWithholdingTaxAccountId: "expanded-withholding-tax",
  inputTaxAccountId: "input-vat-tax-payable",
};

export function getActionMode(pathname: string): AccountsPayableVoucherActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return AccountsPayableVoucherAddMode;
}

export function normalizeExpenseLineUpdate(
  line: AccountsPayableVoucherExpenseLine,
  field: AccountsPayableVoucherExpenseLineField,
  value: string | number,
) {
  const nextLine = {
    ...line,
    [field]: isExpenseNumericField(field) ? Number(value || 0) : value,
  };

  if (field === "expenseAccountCode" && value !== line.expenseAccountCode) nextLine.expenseAccountId = undefined;
  if (field === "partyCode" && value !== line.partyCode) nextLine.partyId = undefined;
  return syncAccountsPayableVoucherExpenseTaxAmounts(nextLine);
}

export function normalizeAccountingEntryUpdate(
  entry: AccountsPayableVoucherAccountingEntry,
  field: AccountsPayableVoucherAccountingEntryField,
  value: string | number,
) {
  const nextEntry = {
    ...entry,
    [field]: field === "debit" || field === "credit" ? Number(value || 0) : value,
  };

  if (field === "accountCode" && value !== entry.accountCode) nextEntry.accountId = undefined;
  if (field === "debit" && Number(nextEntry.debit || 0) > 0) {
    nextEntry.credit = 0;
  }

  if (field === "credit" && Number(nextEntry.credit || 0) > 0) {
    nextEntry.debit = 0;
  }

  return nextEntry;
}

export function normalizeExchangeRate(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Number(value.toFixed(6));
}

export function createHeaderUpdatedVoucherValues<TKey extends keyof AccountsPayableVoucherFormValues>(
  current: AccountsPayableVoucherFormValues,
  field: TKey,
  value: AccountsPayableVoucherFormValues[TKey],
) {
  const nextValues = {
    ...current,
    [field]: value,
  } as AccountsPayableVoucherFormValues;

  if (field === "creditAccountCode" && value !== current.creditAccountCode) nextValues.creditAccountId = undefined;
  if (field === "partyCode" && value !== current.partyCode) nextValues.partyId = undefined;

  if (field !== "remarks") {
    if (field !== "partyCode" && field !== "partyName") {
      return nextValues;
    }

    return syncInheritedLineParties(nextValues, current.partyCode, current.partyName);
  }

  return syncInheritedExpenseLineParticulars(nextValues, current.remarks, String(value ?? ""));
}

export function syncInheritedLineParties(values: AccountsPayableVoucherFormValues, previousPartyCode: string, previousPartyName: string) {
  return {
    ...values,
    accountingEntries: values.accountingEntries.map((entry) =>
      shouldLinePartyFollowHeader(entry, previousPartyCode, previousPartyName, values)
        ? {
            ...entry,
            partyCode: values.partyCode,
            partyName: values.partyName,
          }
        : entry,
    ),
    expenseLines: values.expenseLines.map((line) =>
      shouldLinePartyFollowHeader(line, previousPartyCode, previousPartyName, values)
        ? {
            ...line,
            partyCode: values.partyCode,
            partyName: values.partyName,
          }
        : line,
    ),
  };
}

export function shouldLinePartyFollowHeader(
  row: Pick<AccountsPayableVoucherExpenseLine, "partyCode" | "partyName">,
  previousPartyCode: string,
  previousPartyName: string,
  values: Pick<AccountsPayableVoucherFormValues, "partyCode" | "partyName">,
) {
  const rowPartyCode = row.partyCode.trim();
  const rowPartyName = row.partyName.trim();
  const previousCode = previousPartyCode.trim();
  const previousName = previousPartyName.trim();
  const nextCode = values.partyCode.trim();
  const nextName = values.partyName.trim();

  return (
    (rowPartyCode === "" && rowPartyName === "") ||
    (previousCode !== "" && rowPartyCode === previousCode) ||
    (previousName !== "" && rowPartyName === previousName) ||
    (nextCode !== "" && rowPartyCode === nextCode) ||
    (nextName !== "" && rowPartyName === nextName)
  );
}

export function syncInheritedExpenseLineParticulars(
  values: AccountsPayableVoucherFormValues,
  previousRemarks: string,
  nextRemarks: string,
) {
  return {
    ...values,
    expenseLines: values.expenseLines.map((line) =>
      shouldExpenseLineParticularsFollowRemarks(line, previousRemarks) ? { ...line, particulars: nextRemarks } : line,
    ),
  };
}

export function shouldExpenseLineParticularsFollowRemarks(line: AccountsPayableVoucherExpenseLine, previousRemarks: string) {
  const particulars = line.particulars.trim();
  const inheritedParticulars = previousRemarks.trim();

  return particulars === "" || (inheritedParticulars !== "" && particulars === inheritedParticulars);
}

export function shouldSyncGeneratedAccountingForHeaderField(field: keyof AccountsPayableVoucherFormValues) {
  return (
    field === "creditAccountCode" ||
    field === "creditAccountTitle" ||
    field === "partyCode" ||
    field === "partyName" ||
    field === "referenceNo" ||
    field === "remarks"
  );
}

export function syncAccountsPayableVoucherWithGeneratedAccountingEntries(
  values: AccountsPayableVoucherFormValues,
  taxAccountingContext: AccountsPayableVoucherTaxAccountingContext,
): AccountsPayableVoucherFormValues {
  const syncedValues = syncAccountsPayableVoucherExpenseLinesAndAmount(values);

  if (!accountsPayableVoucherExpenseLinesHaveItems(syncedValues.expenseLines)) {
    return syncManualAccountingTaxEntries(syncedValues, taxAccountingContext);
  }

  return {
    ...syncedValues,
    accountingEntries: createAccountsPayableVoucherGeneratedAccountingEntries(syncedValues, taxAccountingContext),
  };
}

export function syncManualAccountingTaxEntries(
  values: AccountsPayableVoucherFormValues,
  taxAccountingContext: AccountsPayableVoucherTaxAccountingContext,
): AccountsPayableVoucherFormValues {
  const existingInputVatEntriesBySourceId = createManualGeneratedTaxEntryMap(
    values.accountingEntries,
    ManualInputVatAccountingEntryIdPrefix,
  );
  const existingEwtEntriesBySourceId = createManualGeneratedTaxEntryMap(values.accountingEntries, ManualEwtAccountingEntryIdPrefix);
  const manualSourceEntries = values.accountingEntries.filter(
    (entry) => !isManualGeneratedAccountingEntry(entry) && !isManualDefaultPayableAccountingEntry(entry, values),
  );
  const nextEntries: AccountsPayableVoucherAccountingEntry[] = [];

  for (const entry of manualSourceEntries) {
    const shouldGenerateTaxRows = !shouldSkipManualTaxSourceEntry(entry);
    const inputVatEntry = shouldGenerateTaxRows
      ? (existingInputVatEntriesBySourceId.get(entry.id) ?? createManualInputVatAccountingEntry(entry, taxAccountingContext))
      : null;
    const ewtEntry = shouldGenerateTaxRows
      ? (existingEwtEntriesBySourceId.get(entry.id) ?? createManualEwtAccountingEntry(entry, taxAccountingContext))
      : null;
    const adjustedEntry =
      inputVatEntry && !existingInputVatEntriesBySourceId.has(entry.id)
        ? deductManualAccountingDebitAmount(entry, getManualAccountingEntryAmount(inputVatEntry))
        : entry;

    nextEntries.push(adjustedEntry);

    if (inputVatEntry) {
      nextEntries.push(inputVatEntry);
    }

    if (ewtEntry) {
      nextEntries.push(ewtEntry);
    }
  }

  const payableEntry = createManualDefaultPayableAccountingEntry(values, nextEntries);

  if (payableEntry) {
    nextEntries.push(payableEntry);
  }

  return {
    ...values,
    accountingEntries: renumberAccountsPayableVoucherAccountingEntries(
      nextEntries.length > 0 ? nextEntries : [createAccountsPayableVoucherAccountingEntry(1)],
    ),
  };
}

export function createManualInputVatAccountingEntry(
  sourceEntry: AccountsPayableVoucherAccountingEntry,
  taxAccountingContext: AccountsPayableVoucherTaxAccountingContext,
) {
  if (!hasNonZeroAccountingAmount(sourceEntry.debit)) {
    return null;
  }

  const vatPercent = getManualAccountingVatPercent(sourceEntry.vatType, taxAccountingContext);

  if (vatPercent <= 0) {
    return null;
  }

  const inputVatAccount = getTaxAccountingAccount("inputTaxAccountId", taxAccountingContext);
  const vatAmount = getManualAccountingTaxAmount(sourceEntry, vatPercent);
  const vatEntryAmounts = getSignedAccountingEntryAmounts(vatAmount, AccountsPayableVoucherAccountingDebitSide);

  return createAccountsPayableVoucherAccountingEntry(sourceEntry.lineNumber + 1, {
    ...createManualAccountingTaxCommonFields(sourceEntry),
    id: `${ManualInputVatAccountingEntryIdPrefix}${sourceEntry.id}`,
    accountId: inputVatAccount.accountId,
    accountCode: inputVatAccount.accountCode,
    accountTitle: inputVatAccount.accountTitle,
    atcCode: "",
    credit: vatEntryAmounts.credit,
    debit: vatEntryAmounts.debit,
    particulars: createManualAccountingTaxParticulars(sourceEntry),
    vatType: AccountsPayableVoucherInputVatTaxLabel,
  });
}

export function createManualEwtAccountingEntry(
  sourceEntry: AccountsPayableVoucherAccountingEntry,
  taxAccountingContext: AccountsPayableVoucherTaxAccountingContext,
) {
  if (!hasNonZeroAccountingAmount(sourceEntry.debit)) {
    return null;
  }

  const ewtPercent = getManualAccountingEwtPercent(sourceEntry.atcCode, taxAccountingContext);

  if (ewtPercent <= 0) {
    return null;
  }

  const ewtAccount = getTaxAccountingAccount("expandedWithholdingTaxAccountId", taxAccountingContext);
  const ewtAmount = getManualAccountingTaxAmount(sourceEntry, ewtPercent);
  const ewtEntryAmounts = getSignedAccountingEntryAmounts(ewtAmount, AccountsPayableVoucherAccountingCreditSide);

  return createAccountsPayableVoucherAccountingEntry(sourceEntry.lineNumber + 1, {
    ...createManualAccountingTaxCommonFields(sourceEntry),
    id: `${ManualEwtAccountingEntryIdPrefix}${sourceEntry.id}`,
    accountId: ewtAccount.accountId,
    accountCode: ewtAccount.accountCode,
    accountTitle: ewtAccount.accountTitle,
    atcCode: sourceEntry.atcCode,
    credit: ewtEntryAmounts.credit,
    debit: ewtEntryAmounts.debit,
    particulars: createManualAccountingTaxParticulars(sourceEntry),
    vatType: AccountsPayableVoucherEwtTaxLabel,
  });
}

export function createManualDefaultPayableAccountingEntry(
  values: AccountsPayableVoucherFormValues,
  entries: AccountsPayableVoucherAccountingEntry[],
) {
  if (!hasDefaultPayableAccount(values) || !entries.some(accountingEntryHasData)) {
    return null;
  }

  const totals = getAccountsPayableVoucherAccountingTotals(entries);
  const payableAmount = roundAccountingAmount(totals.totalDebit - totals.totalCredit);

  if (!hasNonZeroAccountingAmount(payableAmount)) {
    return null;
  }

  const payableEntryAmounts = getSignedAccountingEntryAmounts(payableAmount, AccountsPayableVoucherAccountingCreditSide);
  const referenceEntry =
    entries.find((entry) => hasNonZeroAccountingAmount(entry.debit) || hasNonZeroAccountingAmount(entry.credit)) ??
    entries.find(accountingEntryHasData);

  return createAccountsPayableVoucherAccountingEntry(entries.length + 1, {
    id: ManualDefaultPayableAccountingEntryId,
    accountId: values.creditAccountId,
    accountCode: values.creditAccountCode,
    accountTitle: values.creditAccountTitle,
    credit: payableEntryAmounts.credit,
    debit: payableEntryAmounts.debit,
    particulars: referenceEntry?.particulars || "Record supplier payable",
    partyCode: values.partyCode || referenceEntry?.partyCode || "",
    partyName: values.partyName || referenceEntry?.partyName || "",
    refNo: referenceEntry?.refNo || values.referenceNo,
    responsibilityCenter: referenceEntry?.responsibilityCenter || "",
    vatType: "",
    atcCode: "",
  });
}

export function createAccountsPayableVoucherGeneratedAccountingEntries(
  values: AccountsPayableVoucherFormValues,
  taxAccountingContext: AccountsPayableVoucherTaxAccountingContext,
) {
  const lines = values.expenseLines.filter(shouldGenerateExpenseAccountingEntry);
  const inputVatAccount = getTaxAccountingAccount("inputTaxAccountId", taxAccountingContext);
  const ewtAccount = getTaxAccountingAccount("expandedWithholdingTaxAccountId", taxAccountingContext);
  const debitEntries: AccountsPayableVoucherAccountingEntry[] = [];
  const ewtEntries: AccountsPayableVoucherAccountingEntry[] = [];

  lines.forEach((line) => {
    const commonFields = createGeneratedAccountingCommonFields(values, line);
    const netAmount = roundAccountingAmount(line.netAmount);
    const vatAmount = roundAccountingAmount(line.vatAmount);
    const ewtAmount = roundAccountingAmount(line.ewtAmount);
    const netEntryAmounts = getSignedAccountingEntryAmounts(netAmount, AccountsPayableVoucherAccountingDebitSide);

    debitEntries.push(
      createAccountsPayableVoucherAccountingEntry(debitEntries.length + 1, {
        ...commonFields,
        id: `apv-entry-expense-${line.id}`,
        accountId: line.expenseAccountId,
        accountCode: line.expenseAccountCode,
        accountTitle: line.expenseType,
        atcCode: "",
        credit: netEntryAmounts.credit,
        debit: netEntryAmounts.debit,
        vatType: getExpenseVatType(line, taxAccountingContext),
      }),
    );

    if (line.vat.trim() && hasNonZeroAccountingAmount(vatAmount)) {
      const vatEntryAmounts = getSignedAccountingEntryAmounts(vatAmount, AccountsPayableVoucherAccountingDebitSide);

      debitEntries.push(
        createAccountsPayableVoucherAccountingEntry(debitEntries.length + 1, {
          ...commonFields,
          id: `apv-entry-input-vat-${line.id}`,
          accountId: inputVatAccount.accountId,
          accountCode: inputVatAccount.accountCode,
          accountTitle: inputVatAccount.accountTitle,
          atcCode: "",
          credit: vatEntryAmounts.credit,
          debit: vatEntryAmounts.debit,
          particulars: createGeneratedTaxParticulars(values, line),
          vatType: AccountsPayableVoucherInputVatTaxLabel,
        }),
      );
    }

    if (line.ewt.trim() && hasNonZeroAccountingAmount(ewtAmount)) {
      const ewtEntryAmounts = getSignedAccountingEntryAmounts(ewtAmount, AccountsPayableVoucherAccountingCreditSide);

      ewtEntries.push(
        createAccountsPayableVoucherAccountingEntry(ewtEntries.length + 1, {
          ...commonFields,
          id: `apv-entry-ewt-${line.id}`,
          accountId: ewtAccount.accountId,
          accountCode: ewtAccount.accountCode,
          accountTitle: ewtAccount.accountTitle,
          atcCode: line.ewt,
          credit: ewtEntryAmounts.credit,
          debit: ewtEntryAmounts.debit,
          particulars: createGeneratedTaxParticulars(values, line),
          vatType: AccountsPayableVoucherEwtTaxLabel,
        }),
      );
    }
  });

  const totalAmountDue = roundAccountingAmount(lines.reduce((sum, line) => sum + Number(line.totalAmountDue || 0), 0));
  const hasCreditAccount = values.creditAccountCode.trim() !== "" || values.creditAccountTitle.trim() !== "";
  const shouldCreateCreditEntry = hasNonZeroAccountingAmount(totalAmountDue) || (hasCreditAccount && debitEntries.length > 0);

  if (!shouldCreateCreditEntry && debitEntries.length === 0 && ewtEntries.length === 0) {
    return createBlankGeneratedAccountingEntries();
  }

  const referenceEntry = debitEntries.find((entry) => entry.debit > 0 || entry.credit > 0) ?? debitEntries[0];
  const payableEntryAmounts = getSignedAccountingEntryAmounts(totalAmountDue, AccountsPayableVoucherAccountingCreditSide);
  const payableEntry = shouldCreateCreditEntry
    ? createAccountsPayableVoucherAccountingEntry(debitEntries.length + 1, {
        id: "apv-entry-default-payable",
        accountId: values.creditAccountId,
        accountCode: values.creditAccountCode,
        accountTitle: values.creditAccountTitle,
        credit: payableEntryAmounts.credit,
        debit: payableEntryAmounts.debit,
        particulars: referenceEntry?.particulars || "Record supplier payable",
        partyCode: values.partyCode || referenceEntry?.partyCode || "",
        partyName: values.partyName || referenceEntry?.partyName || "",
        refNo: referenceEntry?.refNo || values.referenceNo,
        responsibilityCenter: referenceEntry?.responsibilityCenter || "",
        vatType: "",
      })
    : null;

  return renumberAccountsPayableVoucherAccountingEntries([...debitEntries, ...ewtEntries, ...(payableEntry ? [payableEntry] : [])]);
}

export function createGeneratedAccountingCommonFields(values: AccountsPayableVoucherFormValues, line: AccountsPayableVoucherExpenseLine) {
  return {
    particulars: getGeneratedLineParticulars(values, line),
    partyCode: line.partyCode || values.partyCode,
    partyName: line.partyName || values.partyName,
    refNo: line.referenceNo || values.referenceNo,
    responsibilityCenter: line.responsibilityCenter,
  };
}

export function createGeneratedTaxParticulars(values: AccountsPayableVoucherFormValues, line: AccountsPayableVoucherExpenseLine) {
  return getGeneratedLineParticulars(values, line) || line.expenseType.trim();
}

export function getGeneratedLineParticulars(values: AccountsPayableVoucherFormValues, line: AccountsPayableVoucherExpenseLine) {
  return line.particulars.trim() || values.remarks.trim();
}

export function getExpenseVatType(line: AccountsPayableVoucherExpenseLine, context: AccountsPayableVoucherTaxAccountingContext) {
  const vatCode = line.vat.trim();

  if (!vatCode) {
    return "";
  }

  const taxCode = context.taxCodes.find(
    (row) => row.transactionType === "Purchases" && row.taxType === "INPUT VAT" && row.taxCode === vatCode,
  );

  return taxCode?.taxDescription.trim() || vatCode;
}

export function getTaxAccountingAccount(field: keyof TaxDefinitionDefaultAccountIds, context: AccountsPayableVoucherTaxAccountingContext) {
  const accountId = context.defaultAccountIds[field];
  const fallbackAccountId = TaxAccountingAccountFallbackIds[field];
  const configuredAccount = accountId
    ? (findModuleChartAccount(accountId, context.accountOptions) ?? findModuleChartAccount(accountId))
    : undefined;
  const fallbackAccount = fallbackAccountId
    ? (findModuleChartAccount(fallbackAccountId, context.accountOptions) ?? findModuleChartAccount(fallbackAccountId))
    : undefined;
  const account = configuredAccount ?? fallbackAccount;

  return {
    accountId: account?.id,
    accountCode: account?.accountNumber ?? "",
    accountTitle: account?.accountName ?? "",
  };
}

export function createBlankGeneratedAccountingEntries() {
  return [createAccountsPayableVoucherAccountingEntry(1), createAccountsPayableVoucherAccountingEntry(2)];
}

export function shouldGenerateExpenseAccountingEntry(line: AccountsPayableVoucherExpenseLine) {
  return accountsPayableVoucherExpenseLineHasItem(line);
}

export function roundAccountingAmount(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
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

export function createManualGeneratedTaxEntryMap(entries: AccountsPayableVoucherAccountingEntry[], idPrefix: string) {
  const entriesBySourceId = new Map<string, AccountsPayableVoucherAccountingEntry>();

  for (const entry of entries) {
    if (entry.id.startsWith(idPrefix)) {
      entriesBySourceId.set(entry.id.slice(idPrefix.length), entry);
    }
  }

  return entriesBySourceId;
}

export function deductManualAccountingDebitAmount(entry: AccountsPayableVoucherAccountingEntry, deduction: number) {
  if (!hasNonZeroAccountingAmount(entry.debit) || deduction <= 0) {
    return entry;
  }

  return {
    ...entry,
    debit: roundAccountingAmount(Math.max(Number(entry.debit || 0) - deduction, 0)),
  };
}

export function isManualDefaultPayableAccountingEntry(
  entry: AccountsPayableVoucherAccountingEntry,
  values: AccountsPayableVoucherFormValues,
) {
  const creditAccountCode = values.creditAccountCode.trim();
  const creditAccountTitle = values.creditAccountTitle.trim();

  if (!hasDefaultPayableAccount(values) || hasNonZeroAccountingAmount(entry.debit)) {
    return false;
  }

  return (
    (creditAccountCode !== "" && entry.accountCode.trim() === creditAccountCode) ||
    (creditAccountTitle !== "" && entry.accountTitle.trim() === creditAccountTitle)
  );
}

export function removeManualGeneratedTaxEntriesForSource(entries: AccountsPayableVoucherAccountingEntry[], sourceEntryId: string) {
  return entries.filter(
    (entry) =>
      entry.id !== `${ManualInputVatAccountingEntryIdPrefix}${sourceEntryId}` &&
      entry.id !== `${ManualEwtAccountingEntryIdPrefix}${sourceEntryId}`,
  );
}

export function hasDefaultPayableAccount(values: AccountsPayableVoucherFormValues) {
  return values.creditAccountCode.trim() !== "" || values.creditAccountTitle.trim() !== "";
}

export function shouldRefreshManualGeneratedTaxEntries(field: AccountsPayableVoucherAccountingEntryField) {
  return field === "atcCode" || field === "credit" || field === "debit" || field === "vatType";
}

export function createManualAccountingTaxCommonFields(sourceEntry: AccountsPayableVoucherAccountingEntry) {
  return {
    partyCode: sourceEntry.partyCode,
    partyName: sourceEntry.partyName,
    refNo: sourceEntry.refNo,
    responsibilityCenter: sourceEntry.responsibilityCenter,
  };
}

export function createManualAccountingTaxParticulars(sourceEntry: AccountsPayableVoucherAccountingEntry) {
  return sourceEntry.particulars.trim() || sourceEntry.accountTitle.trim();
}

export function getManualAccountingVatPercent(vatType: string, context: AccountsPayableVoucherTaxAccountingContext) {
  const vatValue = vatType.trim();

  if (!vatValue) {
    return 0;
  }

  const taxCode = context.taxCodes.find(
    (row) => row.transactionType === "Purchases" && row.taxType === "INPUT VAT" && row.taxCode === vatValue,
  );

  return taxCode ? Number(taxCode.taxRate || 0) : getExplicitVatPercent(vatValue);
}

export function getManualAccountingEwtPercent(atcCode: string, context: AccountsPayableVoucherTaxAccountingContext) {
  const atcValue = atcCode.trim();

  if (!atcValue) {
    return 0;
  }

  const taxCode = context.taxCodes.find(
    (row) => row.transactionType === "Purchases" && row.taxType === AccountsPayableVoucherEwtTaxLabel && row.taxCode === atcValue,
  );

  return taxCode ? Number(taxCode.taxRate || 0) : getExplicitEwtPercent(atcValue);
}

export function getManualAccountingTaxAmount(sourceEntry: AccountsPayableVoucherAccountingEntry, taxPercent: number) {
  return roundAccountingAmount((getManualAccountingEntryAmount(sourceEntry) * taxPercent) / 100);
}

export function getManualAccountingEntryAmount(entry: AccountsPayableVoucherAccountingEntry | null | undefined) {
  if (!entry) {
    return 0;
  }

  return Math.abs(Number(entry.debit || 0) || Number(entry.credit || 0));
}

export function getExplicitVatPercent(value: string) {
  return getExplicitCodePercent(value, "VAT") ?? getPercentSignAmount(value);
}

export function getExplicitEwtPercent(value: string) {
  return getExplicitCodePercent(value, AccountsPayableVoucherEwtTaxLabel) ?? getPercentSignAmount(value);
}

export function getExplicitCodePercent(value: string, codePrefix: "EWT" | "VAT") {
  const codeMatch = value.match(new RegExp(`^${codePrefix}-(\\d+(?:\\.\\d+)?)$`, "i"));

  return codeMatch ? Number.parseFloat(codeMatch[1]) : null;
}

export function getPercentSignAmount(value: string) {
  const percentMatch = value.match(/(\d+(?:\.\d+)?)\s*%/);

  return percentMatch ? Number.parseFloat(percentMatch[1]) : 0;
}

export function isManualGeneratedAccountingEntry(entry: AccountsPayableVoucherAccountingEntry) {
  return (
    entry.id.startsWith(ManualInputVatAccountingEntryIdPrefix) ||
    entry.id.startsWith(ManualEwtAccountingEntryIdPrefix) ||
    entry.id === ManualDefaultPayableAccountingEntryId
  );
}

export function shouldSkipManualTaxSourceEntry(entry: AccountsPayableVoucherAccountingEntry) {
  return (
    entry.id.startsWith("apv-entry-expense-") ||
    entry.id.startsWith("apv-entry-input-vat-") ||
    entry.id.startsWith("apv-entry-ewt-") ||
    entry.id === "apv-entry-default-payable" ||
    entry.id === ManualDefaultPayableAccountingEntryId
  );
}

export function hasNonZeroAmount(value: number) {
  return Math.abs(Number(value || 0)) > 0;
}

export function createInheritedLineDefaults(values: AccountsPayableVoucherFormValues, rows: Array<{ responsibilityCenter: string }> = []) {
  return {
    particulars: values.remarks,
    partyCode: values.partyCode,
    partyName: values.partyName,
    responsibilityCenter: getLastResponsibilityCenter(rows),
  };
}

export function createInheritedExpenseLineDefaults(
  values: AccountsPayableVoucherFormValues,
  rows: Array<{ responsibilityCenter: string }>,
  partyTaxDefaults: PartyPurchaseTaxDefaults,
) {
  return {
    ...createInheritedLineDefaults(values, rows),
    ewt: partyTaxDefaults.ewtCode,
    ewtPercent: partyTaxDefaults.ewtPercent,
    vat: partyTaxDefaults.inputVatCode,
    vatPercent: partyTaxDefaults.inputVatPercent,
  };
}

export function createInheritedAccountingEntryDefaults(
  values: AccountsPayableVoucherFormValues,
  rows: Array<{ responsibilityCenter: string }>,
  partyTaxDefaults: PartyPurchaseTaxDefaults,
) {
  return {
    ...createInheritedLineDefaults(values, rows),
    atcCode: partyTaxDefaults.ewtCode,
    vatType: partyTaxDefaults.inputVatCode,
  };
}

export function getLastResponsibilityCenter(rows: Array<{ responsibilityCenter: string }>) {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const responsibilityCenter = rows[index]?.responsibilityCenter.trim();

    if (responsibilityCenter) {
      return responsibilityCenter;
    }
  }

  return "";
}

export function getHeaderPartyPurchaseTaxDefaults(
  values: AccountsPayableVoucherFormValues,
  partyRecords: AccountsPayableVoucherLookupParty[],
  taxCodes: Tax[],
): PartyPurchaseTaxDefaults {
  const party = findHeaderPartyRecord(values, partyRecords);

  if (!party) {
    return {
      ewtCode: "",
      ewtPercent: 0,
      inputVatCode: "",
      inputVatPercent: 0,
    };
  }

  const inputVatCode = getTaxCodeBySourceKey(taxCodes, party.defaultPurchaseInputVatTaxSourceKey, "INPUT VAT");
  const ewtCode = getTaxCodeBySourceKey(taxCodes, party.defaultPurchaseEwtTaxSourceKey, AccountsPayableVoucherEwtTaxLabel);
  const inputVatRate = getVatRateFromCode(inputVatCode, taxCodes);

  return {
    ewtCode,
    ewtPercent: getEwtPercentFromCode(ewtCode, taxCodes),
    inputVatCode,
    inputVatPercent: getVatPercentFromRate(inputVatRate),
  };
}

export function findHeaderPartyRecord(values: AccountsPayableVoucherFormValues, partyRecords: AccountsPayableVoucherLookupParty[]) {
  const partyCode = values.partyCode.trim();
  const partyName = values.partyName.trim().toLowerCase();

  return (
    partyRecords.find((party) => partyCode && party.partyCodeNo === partyCode) ??
    partyRecords.find((party) => partyName && party.name.trim().toLowerCase() === partyName)
  );
}

export function getTaxCodeBySourceKey(taxCodes: Tax[], sourceKey: string, taxType: "EWT" | "INPUT VAT") {
  if (!sourceKey) {
    return "";
  }

  return (
    taxCodes.find((taxCode) => taxCode.sourceKey === sourceKey && taxCode.transactionType === "Purchases" && taxCode.taxType === taxType)
      ?.taxCode ?? ""
  );
}

export function shouldClearExpenseLine(line: AccountsPayableVoucherExpenseLine, action: Exclude<ModuleDataEntryClearAction, "all">) {
  if (action === "with-data") {
    return expenseLineHasData(line);
  }

  if (action === "incomplete") {
    return expenseLineHasData(line) && !expenseLineIsComplete(line);
  }

  return !expenseLineHasData(line);
}

export function shouldClearAccountingEntry(
  entry: AccountsPayableVoucherAccountingEntry,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return accountingEntryHasData(entry);
  }

  if (action === "incomplete") {
    return accountingEntryHasData(entry) && !accountingEntryIsComplete(entry);
  }

  return !accountingEntryHasData(entry);
}

export function expenseLineHasData(line: AccountsPayableVoucherExpenseLine) {
  return (
    line.expenseAccountCode.trim() !== "" ||
    line.expenseType.trim() !== "" ||
    line.particulars.trim() !== "" ||
    line.partyCode.trim() !== "" ||
    line.partyName.trim() !== "" ||
    line.referenceNo.trim() !== "" ||
    line.responsibilityCenter.trim() !== "" ||
    line.vat.trim() !== "" ||
    line.ewt.trim() !== "" ||
    hasNonZeroAmount(line.amount) ||
    hasNonZeroAmount(line.netAmount) ||
    hasNonZeroAmount(line.totalAmountDue) ||
    hasNonZeroAmount(line.vatAmount) ||
    hasNonZeroAmount(line.ewtAmount)
  );
}

export function accountingEntryHasData(entry: AccountsPayableVoucherAccountingEntry) {
  return (
    entry.accountCode.trim() !== "" ||
    entry.accountTitle.trim() !== "" ||
    entry.particulars.trim() !== "" ||
    entry.partyCode.trim() !== "" ||
    entry.partyName.trim() !== "" ||
    entry.responsibilityCenter.trim() !== "" ||
    entry.refNo.trim() !== "" ||
    entry.vatType.trim() !== "" ||
    entry.atcCode.trim() !== "" ||
    Number(entry.debit || 0) > 0 ||
    Number(entry.credit || 0) > 0
  );
}

export function accountingEntryHasTransactionData(entry: AccountsPayableVoucherAccountingEntry) {
  return (
    entry.accountCode.trim() !== "" ||
    entry.accountTitle.trim() !== "" ||
    entry.particulars.trim() !== "" ||
    entry.responsibilityCenter.trim() !== "" ||
    entry.refNo.trim() !== "" ||
    entry.vatType.trim() !== "" ||
    entry.atcCode.trim() !== "" ||
    Number(entry.debit || 0) > 0 ||
    Number(entry.credit || 0) > 0
  );
}

export function isExpenseNumericField(field: AccountsPayableVoucherExpenseLineField) {
  return (
    field === "amount" ||
    field === "netAmount" ||
    field === "vatPercent" ||
    field === "vatAmount" ||
    field === "ewtPercent" ||
    field === "ewtAmount" ||
    field === "totalAmountDue"
  );
}
