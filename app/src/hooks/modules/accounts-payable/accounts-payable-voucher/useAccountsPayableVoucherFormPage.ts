"use client";

import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AccountsPayableVoucherHref } from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import {
  accountsPayableVoucherExpenseLineHasItem,
  accountsPayableVoucherExpenseLinesHaveItems,
  createAccountsPayableVoucherAccountingEntry,
  createAccountsPayableVoucherExpenseLine,
  createAccountsPayableVoucherFormValues,
  createAccountsPayableVoucherFromForm,
  getAccountsPayableVoucherAccountingTotals,
  getAccountsPayableVoucherExpenseTotals,
  renumberAccountsPayableVoucherAccountingEntries,
  renumberAccountsPayableVoucherExpenseLines,
  syncAccountsPayableVoucherExpenseLinesAndAmount,
  syncAccountsPayableVoucherExpenseTaxAmounts,
  updateAccountsPayableVoucherFromForm,
} from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import {
  findModuleChartAccount,
  getModuleChartAccounts,
  type ModuleChartAccount,
} from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { useAccountsPayableVoucherStore } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucher";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import { useTaxDefinitionOptions } from "@/app/src/hooks/shared/tax/useTaxDefinitionOptions";
import { FetchMultiCurrencyRates } from "@/app/src/services/modules/system-administration/multi-currency-setup/MultiCurrencySetupService";
import type {
  AccountsPayableVoucherAccountingEntry,
  AccountsPayableVoucherAccountingEntryField,
  AccountsPayableVoucherActionMode,
  AccountsPayableVoucherExpenseLine,
  AccountsPayableVoucherExpenseLineField,
  AccountsPayableVoucherFormErrors,
  AccountsPayableVoucherFormValues,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import type { TaxDefinitionDefaultAccountIds } from "@/app/src/types/shared/tax/TaxDefinitionTypes";
import { validateAccountsPayableVoucherForm } from "@/app/src/validations/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherValidation";

type AccountsPayableVoucherTaxAccountingContext = {
  accountOptions: ModuleChartAccount[];
  defaultAccountIds: TaxDefinitionDefaultAccountIds;
  taxCodes: AlphanumericTaxCode[];
};

export function useAccountsPayableVoucherFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const records = useAccountsPayableVoucherStore((state) => state.records);
  const addRecord = useAccountsPayableVoucherStore((state) => state.addRecord);
  const updateRecord = useAccountsPayableVoucherStore(
    (state) => state.updateRecord,
  );
  const deleteRecord = useAccountsPayableVoucherStore(
    (state) => state.deleteRecord,
  );
  const isMutating = useAccountsPayableVoucherStore(
    (state) => state.isMutating,
  );
  const taxDefinitionOptions = useTaxDefinitionOptions({
    transactionScope: "PURCHASE",
  });
  const alphanumericTaxCodesQuery = useAlphanumericTaxCodes();
  const taxAccountingContext = useMemo(
    () => ({
      accountOptions: taxDefinitionOptions.accountOptions,
      defaultAccountIds: taxDefinitionOptions.defaultAccountIds,
      taxCodes: alphanumericTaxCodesQuery.data ?? [],
    }),
    [
      alphanumericTaxCodesQuery.data,
      taxDefinitionOptions.accountOptions,
      taxDefinitionOptions.defaultAccountIds,
    ],
  );
  const mode = getActionMode(pathname);
  const existingRecord = records.find((record) => record.id === params.recordId);
  const isReadonly = mode === "view" || existingRecord?.status === "Closed";
  const [values, setValues] = useState<AccountsPayableVoucherFormValues>(() =>
    createAccountsPayableVoucherFormValues(existingRecord),
  );
  const [errors, setErrors] = useState<AccountsPayableVoucherFormErrors>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(false);
  const exchangeRateRequestIdRef = useRef(0);
  const displayValues = useMemo(
    () =>
      syncAccountsPayableVoucherWithGeneratedAccountingEntries(
        values,
        taxAccountingContext,
      ),
    [taxAccountingContext, values],
  );
  const expenseTotals = useMemo(
    () => getAccountsPayableVoucherExpenseTotals(displayValues.expenseLines),
    [displayValues.expenseLines],
  );
  const accountingTotals = useMemo(
    () =>
      getAccountsPayableVoucherAccountingTotals(displayValues.accountingEntries),
    [displayValues.accountingEntries],
  );
  const hasExpenseDetailItems = useMemo(
    () => accountsPayableVoucherExpenseLinesHaveItems(displayValues.expenseLines),
    [displayValues.expenseLines],
  );
  const isAccountingEntriesReadonly = isReadonly || hasExpenseDetailItems;

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    if (isReadonly) {
      return;
    }

    const field = event.target.name as keyof AccountsPayableVoucherFormValues;
    const fieldValue = event.target.value;

    if (field === "currency") {
      void updateCurrencyFromExchangeRates(fieldValue);
      return;
    }

    const value =
      field === "exchangeRate" || field === "amount"
        ? Number(fieldValue || 0)
        : fieldValue;

    updateHeaderField(field, value as AccountsPayableVoucherFormValues[typeof field]);
  }

  function updateHeaderField<TKey extends keyof AccountsPayableVoucherFormValues>(
    field: TKey,
    value: AccountsPayableVoucherFormValues[TKey],
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const nextValues = createHeaderUpdatedVoucherValues(
        current,
        field,
        value,
      );

      return shouldSyncGeneratedAccountingForHeaderField(field)
        ? syncAccountsPayableVoucherWithGeneratedAccountingEntries(
            nextValues,
            taxAccountingContext,
          )
        : nextValues;
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function updateCurrencyFromExchangeRates(currencyCode: string) {
    const requestId = exchangeRateRequestIdRef.current + 1;

    exchangeRateRequestIdRef.current = requestId;
    setValues((current) => ({
      ...current,
      currency: currencyCode,
      exchangeRate: currencyCode === "PHP" ? 1 : current.exchangeRate,
    }));
    setErrors((current) => ({
      ...current,
      currency: undefined,
      exchangeRate: undefined,
    }));

    if (currencyCode === "PHP") {
      setIsExchangeRateLoading(false);
      return;
    }

    setIsExchangeRateLoading(true);

    try {
      const rates = await FetchMultiCurrencyRates(currencyCode);
      const phpRate = rates.find((rate) => rate.targetCurrencyCode === "PHP");

      if (exchangeRateRequestIdRef.current !== requestId) {
        return;
      }

      if (!phpRate) {
        throw new Error("No PHP exchange rate returned.");
      }

      setValues((current) => ({
        ...current,
        exchangeRate: normalizeExchangeRate(phpRate.exchangeRate),
      }));
    } catch {
      if (exchangeRateRequestIdRef.current === requestId) {
        setErrors((current) => ({
          ...current,
          exchangeRate: "Could not load the exchange rate.",
        }));
        toast.error("Could not load the exchange rate for the selected currency.");
      }
    } finally {
      if (exchangeRateRequestIdRef.current === requestId) {
        setIsExchangeRateLoading(false);
      }
    }
  }

  function updateCurrency(currencyCode: string) {
    if (isReadonly) {
      return;
    }

    void updateCurrencyFromExchangeRates(currencyCode);
  }

  function updateExpenseLine(
    lineId: string,
    field: AccountsPayableVoucherExpenseLineField,
    value: string | number,
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) =>
      syncAccountsPayableVoucherWithGeneratedAccountingEntries({
        ...current,
        expenseLines: current.expenseLines.map((line) =>
          line.id === lineId
            ? normalizeExpenseLineUpdate(line, field, value)
            : line,
        ),
      }, taxAccountingContext),
    );
    clearExpenseLineError(lineId, field);
  }

  function addExpenseLines(count = 1) {
    if (isReadonly) {
      return;
    }

    setValues((current) =>
      syncAccountsPayableVoucherWithGeneratedAccountingEntries({
        ...current,
        expenseLines: [
          ...current.expenseLines,
          ...Array.from({ length: count }, (_, index) =>
            createAccountsPayableVoucherExpenseLine(
              current.expenseLines.length + index + 1,
              createInheritedLineDefaults(current),
            ),
          ),
        ],
      }, taxAccountingContext),
    );
    setErrors((current) => ({ ...current, expenseLines: undefined }));
  }

  function removeExpenseLine(lineId: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const nextLines = current.expenseLines.filter((line) => line.id !== lineId);

      return syncAccountsPayableVoucherWithGeneratedAccountingEntries({
        ...current,
        expenseLines: renumberAccountsPayableVoucherExpenseLines(
          nextLines.length > 0
            ? nextLines
            : [createAccountsPayableVoucherExpenseLine(1)],
        ),
      }, taxAccountingContext);
    });
    setErrors((current) => ({ ...current, expenseLines: undefined }));
  }

  function insertExpenseLine(lineId: string, position: "above" | "below") {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const rowIndex = current.expenseLines.findIndex(
        (line) => line.id === lineId,
      );
      const insertIndex =
        rowIndex === -1
          ? current.expenseLines.length
          : rowIndex + (position === "below" ? 1 : 0);
      const nextLines = [...current.expenseLines];

      nextLines.splice(
        insertIndex,
        0,
        createAccountsPayableVoucherExpenseLine(
          insertIndex + 1,
          createInheritedLineDefaults(current),
        ),
      );

      return syncAccountsPayableVoucherWithGeneratedAccountingEntries({
        ...current,
        expenseLines: renumberAccountsPayableVoucherExpenseLines(nextLines),
      }, taxAccountingContext);
    });
    setErrors((current) => ({ ...current, expenseLines: undefined }));
  }

  function duplicateExpenseLine(lineId: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const rowIndex = current.expenseLines.findIndex(
        (line) => line.id === lineId,
      );
      const sourceLine = current.expenseLines[rowIndex];

      if (!sourceLine) {
        return current;
      }

      const nextLines = [...current.expenseLines];

      nextLines.splice(rowIndex + 1, 0, {
        ...sourceLine,
        id: `apv-expense-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
      });

      return syncAccountsPayableVoucherWithGeneratedAccountingEntries({
        ...current,
        expenseLines: renumberAccountsPayableVoucherExpenseLines(nextLines),
      }, taxAccountingContext);
    });
    setErrors((current) => ({ ...current, expenseLines: undefined }));
  }

  function moveExpenseLine(fromLineId: string, toLineId: string) {
    if (isReadonly || fromLineId === toLineId) {
      return;
    }

    setValues((current) => {
      const fromIndex = current.expenseLines.findIndex(
        (line) => line.id === fromLineId,
      );
      const toIndex = current.expenseLines.findIndex(
        (line) => line.id === toLineId,
      );

      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      const nextLines = [...current.expenseLines];
      const [movedLine] = nextLines.splice(fromIndex, 1);

      nextLines.splice(toIndex, 0, movedLine);

      return syncAccountsPayableVoucherWithGeneratedAccountingEntries({
        ...current,
        expenseLines: renumberAccountsPayableVoucherExpenseLines(nextLines),
      }, taxAccountingContext);
    });
  }

  function clearExpenseLines(action: ModuleDataEntryClearAction) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const nextLines =
        action === "all"
          ? []
          : current.expenseLines.filter(
              (line) => !shouldClearExpenseLine(line, action),
            );

      return syncAccountsPayableVoucherWithGeneratedAccountingEntries({
        ...current,
        expenseLines: renumberAccountsPayableVoucherExpenseLines(
          nextLines.length > 0
            ? nextLines
            : [createAccountsPayableVoucherExpenseLine(1)],
        ),
      }, taxAccountingContext);
    });
    setErrors((current) => ({ ...current, expenseLines: undefined }));
  }

  function updateAccountingEntry(
    entryId: string,
    field: AccountsPayableVoucherAccountingEntryField,
    value: string | number,
  ) {
    if (isAccountingEntriesReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      accountingEntries: current.accountingEntries.map((entry) =>
        entry.id === entryId
          ? normalizeAccountingEntryUpdate(entry, field, value)
          : entry,
      ),
    }));
    clearAccountingEntryError(entryId, field);
  }

  function addAccountingEntries(count = 1) {
    if (isAccountingEntriesReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      accountingEntries: [
        ...current.accountingEntries,
        ...Array.from({ length: count }, (_, index) =>
          createAccountsPayableVoucherAccountingEntry(
            current.accountingEntries.length + index + 1,
            createInheritedLineDefaults(current),
          ),
        ),
      ],
    }));
    setErrors((current) => ({
      ...current,
      accountingEntries: undefined,
      balance: undefined,
    }));
  }

  function removeAccountingEntry(entryId: string) {
    if (isAccountingEntriesReadonly) {
      return;
    }

    setValues((current) => {
      const nextEntries = current.accountingEntries.filter(
        (entry) => entry.id !== entryId,
      );

      return {
        ...current,
        accountingEntries: renumberAccountsPayableVoucherAccountingEntries(
          nextEntries.length > 0
            ? nextEntries
            : [createAccountsPayableVoucherAccountingEntry(1)],
        ),
      };
    });
    setErrors((current) => ({
      ...current,
      accountingEntries: undefined,
      balance: undefined,
    }));
  }

  function insertAccountingEntry(entryId: string, position: "above" | "below") {
    if (isAccountingEntriesReadonly) {
      return;
    }

    setValues((current) => {
      const rowIndex = current.accountingEntries.findIndex(
        (entry) => entry.id === entryId,
      );
      const insertIndex =
        rowIndex === -1
          ? current.accountingEntries.length
          : rowIndex + (position === "below" ? 1 : 0);
      const nextEntries = [...current.accountingEntries];

      nextEntries.splice(
        insertIndex,
        0,
        createAccountsPayableVoucherAccountingEntry(
          insertIndex + 1,
          createInheritedLineDefaults(current),
        ),
      );

      return {
        ...current,
        accountingEntries: renumberAccountsPayableVoucherAccountingEntries(
          nextEntries,
        ),
      };
    });
    setErrors((current) => ({
      ...current,
      accountingEntries: undefined,
      balance: undefined,
    }));
  }

  function duplicateAccountingEntry(entryId: string) {
    if (isAccountingEntriesReadonly) {
      return;
    }

    setValues((current) => {
      const rowIndex = current.accountingEntries.findIndex(
        (entry) => entry.id === entryId,
      );
      const sourceEntry = current.accountingEntries[rowIndex];

      if (!sourceEntry) {
        return current;
      }

      const nextEntries = [...current.accountingEntries];

      nextEntries.splice(rowIndex + 1, 0, {
        ...sourceEntry,
        id: `apv-entry-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
      });

      return {
        ...current,
        accountingEntries: renumberAccountsPayableVoucherAccountingEntries(
          nextEntries,
        ),
      };
    });
    setErrors((current) => ({
      ...current,
      accountingEntries: undefined,
      balance: undefined,
    }));
  }

  function moveAccountingEntry(fromEntryId: string, toEntryId: string) {
    if (isAccountingEntriesReadonly || fromEntryId === toEntryId) {
      return;
    }

    setValues((current) => {
      const fromIndex = current.accountingEntries.findIndex(
        (entry) => entry.id === fromEntryId,
      );
      const toIndex = current.accountingEntries.findIndex(
        (entry) => entry.id === toEntryId,
      );

      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      const nextEntries = [...current.accountingEntries];
      const [movedEntry] = nextEntries.splice(fromIndex, 1);

      nextEntries.splice(toIndex, 0, movedEntry);

      return {
        ...current,
        accountingEntries: renumberAccountsPayableVoucherAccountingEntries(
          nextEntries,
        ),
      };
    });
  }

  function clearAccountingEntries(action: ModuleDataEntryClearAction) {
    if (isAccountingEntriesReadonly) {
      return;
    }

    setValues((current) => {
      const nextEntries =
        action === "all"
          ? []
          : current.accountingEntries.filter(
              (entry) => !shouldClearAccountingEntry(entry, action),
            );

      return {
        ...current,
        accountingEntries: renumberAccountsPayableVoucherAccountingEntries(
          nextEntries.length > 0
            ? nextEntries
            : [createAccountsPayableVoucherAccountingEntry(1)],
        ),
      };
    });
    setErrors((current) => ({
      ...current,
      accountingEntries: undefined,
      balance: undefined,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isReadonly) {
      return;
    }

    const submitValues =
      syncAccountsPayableVoucherWithGeneratedAccountingEntries(
        values,
        taxAccountingContext,
      );
    const nextErrors = validateAccountsPayableVoucherForm(submitValues);

    if (Object.keys(nextErrors).length > 0) {
      setValues(submitValues);
      setErrors(nextErrors);
      toast.error(
        "Please fix the highlighted accounts payable voucher fields before saving.",
      );
      return;
    }

    if (mode === "edit" && existingRecord) {
      updateRecord(
        updateAccountsPayableVoucherFromForm(existingRecord, submitValues),
      );
    } else if (mode === "edit") {
      toast.error("Could not find the accounts payable voucher to update.");
      return;
    } else {
      addRecord(createAccountsPayableVoucherFromForm(submitValues));
    }

    router.push(AccountsPayableVoucherHref);
  }

  function handleConfirmDelete() {
    if (!existingRecord) {
      toast.error("Could not find the accounts payable voucher to delete.");
      return;
    }

    deleteRecord(existingRecord.id);
    setIsDeleteDialogOpen(false);
    router.push(AccountsPayableVoucherHref);
  }

  function clearExpenseLineError(
    lineId: string,
    field: AccountsPayableVoucherExpenseLineField,
  ) {
    setErrors((current) => ({
      ...current,
      expenseLines: undefined,
      expenseLineErrors: {
        ...current.expenseLineErrors,
        [lineId]: {
          ...current.expenseLineErrors?.[lineId],
          [field]: undefined,
        },
      },
    }));
  }

  function clearAccountingEntryError(
    entryId: string,
    field: AccountsPayableVoucherAccountingEntryField,
  ) {
    const fieldsToClear: AccountsPayableVoucherAccountingEntryField[] =
      field === "debit" || field === "credit" ? ["debit", "credit"] : [field];

    setErrors((current) => ({
      ...current,
      accountingEntries: undefined,
      balance: undefined,
      accountingEntryErrors: {
        ...current.accountingEntryErrors,
        [entryId]: fieldsToClear.reduce(
          (entryErrors, currentField) => ({
            ...entryErrors,
            [currentField]: undefined,
          }),
          { ...current.accountingEntryErrors?.[entryId] },
        ),
      },
    }));
  }

  return {
    accountingTotals,
    addAccountingEntries,
    addExpenseLines,
    clearAccountingEntries,
    clearExpenseLines,
    duplicateAccountingEntry,
    duplicateExpenseLine,
    errors,
    existingRecord,
    expenseTotal: expenseTotals.totalAmountDue,
    expenseTotals,
    handleConfirmDelete,
    handleInputChange,
    handleSubmit,
    hasExpenseDetailItems,
    insertAccountingEntry,
    insertExpenseLine,
    isAccountingEntriesReadonly,
    isDeleteDialogOpen,
    isExchangeRateLoading,
    isMutating,
    isReadonly,
    mode,
    moveAccountingEntry,
    moveExpenseLine,
    needsRecord: mode === "edit" || mode === "view",
    removeAccountingEntry,
    removeExpenseLine,
    setIsDeleteDialogOpen,
    updateAccountingEntry,
    updateCurrency,
    updateExpenseLine,
    updateHeaderField,
    values: displayValues,
  };
}

function getActionMode(pathname: string): AccountsPayableVoucherActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

function normalizeExpenseLineUpdate(
  line: AccountsPayableVoucherExpenseLine,
  field: AccountsPayableVoucherExpenseLineField,
  value: string | number,
) {
  const nextLine = {
    ...line,
    [field]: isExpenseNumericField(field) ? Number(value || 0) : value,
  };

  return syncAccountsPayableVoucherExpenseTaxAmounts(nextLine);
}

function normalizeAccountingEntryUpdate(
  entry: AccountsPayableVoucherAccountingEntry,
  field: AccountsPayableVoucherAccountingEntryField,
  value: string | number,
) {
  const nextEntry = {
    ...entry,
    [field]: field === "debit" || field === "credit" ? Number(value || 0) : value,
  };

  if (field === "debit" && Number(nextEntry.debit || 0) > 0) {
    nextEntry.credit = 0;
  }

  if (field === "credit" && Number(nextEntry.credit || 0) > 0) {
    nextEntry.debit = 0;
  }

  return nextEntry;
}

function normalizeExchangeRate(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Number(value.toFixed(6));
}

function createHeaderUpdatedVoucherValues<
  TKey extends keyof AccountsPayableVoucherFormValues,
>(
  current: AccountsPayableVoucherFormValues,
  field: TKey,
  value: AccountsPayableVoucherFormValues[TKey],
) {
  const nextValues = {
    ...current,
    [field]: value,
  } as AccountsPayableVoucherFormValues;

  if (field !== "remarks") {
    return nextValues;
  }

  return syncInheritedExpenseLineParticulars(
    nextValues,
    current.remarks,
    String(value ?? ""),
  );
}

function syncInheritedExpenseLineParticulars(
  values: AccountsPayableVoucherFormValues,
  previousRemarks: string,
  nextRemarks: string,
) {
  return {
    ...values,
    expenseLines: values.expenseLines.map((line) =>
      shouldExpenseLineParticularsFollowRemarks(line, previousRemarks)
        ? { ...line, particulars: nextRemarks }
        : line,
    ),
  };
}

function shouldExpenseLineParticularsFollowRemarks(
  line: AccountsPayableVoucherExpenseLine,
  previousRemarks: string,
) {
  const particulars = line.particulars.trim();
  const inheritedParticulars = previousRemarks.trim();

  return (
    particulars === "" ||
    (inheritedParticulars !== "" && particulars === inheritedParticulars)
  );
}

function shouldSyncGeneratedAccountingForHeaderField(
  field: keyof AccountsPayableVoucherFormValues,
) {
  return (
    field === "creditAccountCode" ||
    field === "creditAccountTitle" ||
    field === "partyCode" ||
    field === "partyName" ||
    field === "referenceNo" ||
    field === "remarks"
  );
}

function syncAccountsPayableVoucherWithGeneratedAccountingEntries(
  values: AccountsPayableVoucherFormValues,
  taxAccountingContext: AccountsPayableVoucherTaxAccountingContext,
): AccountsPayableVoucherFormValues {
  const syncedValues = syncAccountsPayableVoucherExpenseLinesAndAmount(values);

  if (!accountsPayableVoucherExpenseLinesHaveItems(syncedValues.expenseLines)) {
    return syncedValues;
  }

  return {
    ...syncedValues,
    accountingEntries:
      createAccountsPayableVoucherGeneratedAccountingEntries(
        syncedValues,
        taxAccountingContext,
      ),
  };
}

function createAccountsPayableVoucherGeneratedAccountingEntries(
  values: AccountsPayableVoucherFormValues,
  taxAccountingContext: AccountsPayableVoucherTaxAccountingContext,
) {
  const lines = values.expenseLines.filter(shouldGenerateExpenseAccountingEntry);
  const inputVatAccount = getTaxAccountingAccount(
    "inputTaxAccountId",
    taxAccountingContext,
    {
      accountCode: "2010002011",
      accountTitle: "Input VAT",
    },
  );
  const ewtAccount = getTaxAccountingAccount(
    "expandedWithholdingTaxAccountId",
    taxAccountingContext,
    {
      accountCode: "2010002002",
      accountTitle: "Expanded Withholding Tax",
    },
  );
  const debitEntries: AccountsPayableVoucherAccountingEntry[] = [];
  const ewtEntries: AccountsPayableVoucherAccountingEntry[] = [];

  lines.forEach((line) => {
    const commonFields = createGeneratedAccountingCommonFields(values, line);
    const netAmount = roundAccountingAmount(line.netAmount);
    const vatAmount = roundAccountingAmount(line.vatAmount);
    const ewtAmount = roundAccountingAmount(line.ewtAmount);
    const netEntryAmounts = getSignedAccountingEntryAmounts(
      netAmount,
      "debit",
    );

    debitEntries.push(
      createAccountsPayableVoucherAccountingEntry(debitEntries.length + 1, {
        ...commonFields,
        id: `apv-entry-expense-${line.id}`,
        accountCode: line.expenseAccountCode,
        accountTitle: line.expenseType,
        atcCode: "",
        credit: netEntryAmounts.credit,
        debit: netEntryAmounts.debit,
        vatType: getExpenseVatType(line, taxAccountingContext),
      }),
    );

    if (line.vat.trim() && hasNonZeroAccountingAmount(vatAmount)) {
      const vatEntryAmounts = getSignedAccountingEntryAmounts(
        vatAmount,
        "debit",
      );

      debitEntries.push(
        createAccountsPayableVoucherAccountingEntry(debitEntries.length + 1, {
          ...commonFields,
          id: `apv-entry-input-vat-${line.id}`,
          accountCode: inputVatAccount.accountCode,
          accountTitle: inputVatAccount.accountTitle,
          atcCode: "",
          credit: vatEntryAmounts.credit,
          debit: vatEntryAmounts.debit,
          particulars: createGeneratedTaxParticulars("Input VAT", values, line),
          vatType: "Input VAT",
        }),
      );
    }

    if (line.ewt.trim() && hasNonZeroAccountingAmount(ewtAmount)) {
      const ewtEntryAmounts = getSignedAccountingEntryAmounts(
        ewtAmount,
        "credit",
      );

      ewtEntries.push(
        createAccountsPayableVoucherAccountingEntry(ewtEntries.length + 1, {
          ...commonFields,
          id: `apv-entry-ewt-${line.id}`,
          accountCode: ewtAccount.accountCode,
          accountTitle: ewtAccount.accountTitle,
          atcCode: line.ewt,
          credit: ewtEntryAmounts.credit,
          debit: ewtEntryAmounts.debit,
          particulars: createGeneratedTaxParticulars("EWT", values, line),
          vatType: "EWT",
        }),
      );
    }
  });

  const totalAmountDue = roundAccountingAmount(
    lines.reduce((sum, line) => sum + Number(line.totalAmountDue || 0), 0),
  );
  const hasCreditAccount =
    values.creditAccountCode.trim() !== "" ||
    values.creditAccountTitle.trim() !== "";
  const shouldCreateCreditEntry =
    hasNonZeroAccountingAmount(totalAmountDue) ||
    (hasCreditAccount && debitEntries.length > 0);

  if (!shouldCreateCreditEntry && debitEntries.length === 0 && ewtEntries.length === 0) {
    return createBlankGeneratedAccountingEntries();
  }

  const referenceEntry =
    debitEntries.find((entry) => entry.debit > 0 || entry.credit > 0) ??
    debitEntries[0];
  const payableEntryAmounts = getSignedAccountingEntryAmounts(
    totalAmountDue,
    "credit",
  );
  const payableEntry = shouldCreateCreditEntry
    ? createAccountsPayableVoucherAccountingEntry(
        debitEntries.length + 1,
        {
          id: "apv-entry-default-payable",
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
        },
      )
    : null;

  return renumberAccountsPayableVoucherAccountingEntries([
    ...debitEntries,
    ...ewtEntries,
    ...(payableEntry ? [payableEntry] : []),
  ]);
}

function createGeneratedAccountingCommonFields(
  values: AccountsPayableVoucherFormValues,
  line: AccountsPayableVoucherExpenseLine,
) {
  return {
    particulars: getGeneratedLineParticulars(values, line),
    partyCode: line.partyCode || values.partyCode,
    partyName: line.partyName || values.partyName,
    refNo: line.referenceNo || values.referenceNo,
    responsibilityCenter: line.responsibilityCenter,
  };
}

function createGeneratedTaxParticulars(
  taxLabel: "EWT" | "Input VAT",
  values: AccountsPayableVoucherFormValues,
  line: AccountsPayableVoucherExpenseLine,
) {
  return [taxLabel, getGeneratedLineParticulars(values, line) || line.expenseType]
    .filter(Boolean)
    .join(" - ");
}

function getGeneratedLineParticulars(
  values: AccountsPayableVoucherFormValues,
  line: AccountsPayableVoucherExpenseLine,
) {
  return line.particulars.trim() || values.remarks.trim();
}

function getExpenseVatType(
  line: AccountsPayableVoucherExpenseLine,
  context: AccountsPayableVoucherTaxAccountingContext,
) {
  const vatCode = line.vat.trim();

  if (!vatCode) {
    return "";
  }

  const taxCode = context.taxCodes.find(
    (row) =>
      row.transactionType === "Purchases" &&
      row.taxType === "INPUT VAT" &&
      row.taxCode === vatCode,
  );

  return taxCode?.taxDescription.trim() || vatCode;
}

function getTaxAccountingAccount(
  field: keyof TaxDefinitionDefaultAccountIds,
  context: AccountsPayableVoucherTaxAccountingContext,
  fallback: { accountCode: string; accountTitle: string },
) {
  const accountId = context.defaultAccountIds[field];
  const accountOptions =
    context.accountOptions.length > 0
      ? context.accountOptions
      : getModuleChartAccounts();
  const account = findTaxAccountingAccount(
    accountOptions,
    accountId,
    fallback.accountCode,
    fallback.accountTitle,
  );

  return {
    accountCode: account?.accountNumber ?? fallback.accountCode,
    accountTitle: account?.accountName ?? fallback.accountTitle,
  };
}

function findTaxAccountingAccount(
  accounts: ModuleChartAccount[],
  ...candidates: string[]
) {
  for (const candidate of candidates) {
    const cleanCandidate = candidate.trim();

    if (!cleanCandidate) {
      continue;
    }

    const account = findModuleChartAccount(cleanCandidate, accounts);

    if (account) {
      return account;
    }
  }

  return undefined;
}

function createBlankGeneratedAccountingEntries() {
  return [
    createAccountsPayableVoucherAccountingEntry(1),
    createAccountsPayableVoucherAccountingEntry(2),
  ];
}

function shouldGenerateExpenseAccountingEntry(
  line: AccountsPayableVoucherExpenseLine,
) {
  return accountsPayableVoucherExpenseLineHasItem(line);
}

function roundAccountingAmount(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

function getSignedAccountingEntryAmounts(
  value: number,
  positiveSide: "credit" | "debit",
) {
  const roundedValue = roundAccountingAmount(value);
  const amount = Math.abs(roundedValue);
  const isDebitSide =
    roundedValue >= 0 ? positiveSide === "debit" : positiveSide === "credit";

  return {
    credit: isDebitSide ? 0 : amount,
    debit: isDebitSide ? amount : 0,
  };
}

function hasNonZeroAccountingAmount(value: number) {
  return Math.abs(roundAccountingAmount(value)) > 0;
}

function hasNonZeroAmount(value: number) {
  return Math.abs(Number(value || 0)) > 0;
}

function createInheritedLineDefaults(
  values: AccountsPayableVoucherFormValues,
) {
  return {
    particulars: values.remarks,
    partyCode: values.partyCode,
    partyName: values.partyName,
  };
}

function shouldClearExpenseLine(
  line: AccountsPayableVoucherExpenseLine,
  action: Exclude<ModuleDataEntryClearAction, "all">,
) {
  if (action === "with-data") {
    return expenseLineHasData(line);
  }

  if (action === "incomplete") {
    return expenseLineHasData(line) && !expenseLineIsComplete(line);
  }

  return !expenseLineHasData(line);
}

function shouldClearAccountingEntry(
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

function expenseLineHasData(line: AccountsPayableVoucherExpenseLine) {
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

function accountingEntryHasData(entry: AccountsPayableVoucherAccountingEntry) {
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

function expenseLineIsComplete(line: AccountsPayableVoucherExpenseLine) {
  return (
    line.expenseAccountCode.trim() !== "" &&
    line.expenseType.trim() !== "" &&
    hasNonZeroAmount(line.amount)
  );
}

function accountingEntryIsComplete(entry: AccountsPayableVoucherAccountingEntry) {
  const hasDebit = Number(entry.debit || 0) > 0;
  const hasCredit = Number(entry.credit || 0) > 0;

  return (
    entry.accountCode.trim() !== "" &&
    entry.accountTitle.trim() !== "" &&
    (hasDebit || hasCredit) &&
    !(hasDebit && hasCredit)
  );
}

function isExpenseNumericField(
  field: AccountsPayableVoucherExpenseLineField,
) {
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
