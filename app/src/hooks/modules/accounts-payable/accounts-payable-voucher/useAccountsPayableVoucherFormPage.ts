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
import { useAccountsPayableVoucherStore } from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucher";
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
import { validateAccountsPayableVoucherForm } from "@/app/src/validations/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherValidation";

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
  const expenseTotals = useMemo(
    () => getAccountsPayableVoucherExpenseTotals(values.expenseLines),
    [values.expenseLines],
  );
  const accountingTotals = useMemo(
    () => getAccountsPayableVoucherAccountingTotals(values.accountingEntries),
    [values.accountingEntries],
  );

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
      const nextValues = {
        ...current,
        [field]: value,
      } as AccountsPayableVoucherFormValues;

      return shouldSyncGeneratedAccountingForHeaderField(field)
        ? syncAccountsPayableVoucherWithGeneratedAccountingEntries(nextValues)
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
      }),
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
      }),
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
      });
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
      });
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
      });
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
      });
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
      });
    });
    setErrors((current) => ({ ...current, expenseLines: undefined }));
  }

  function updateAccountingEntry(
    entryId: string,
    field: AccountsPayableVoucherAccountingEntryField,
    value: string | number,
  ) {
    if (isReadonly) {
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
    if (isReadonly) {
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
    if (isReadonly) {
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
    if (isReadonly) {
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
    if (isReadonly) {
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
    if (isReadonly || fromEntryId === toEntryId) {
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
    if (isReadonly) {
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
      syncAccountsPayableVoucherWithGeneratedAccountingEntries(values);
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
    insertAccountingEntry,
    insertExpenseLine,
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
    values,
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

function shouldSyncGeneratedAccountingForHeaderField(
  field: keyof AccountsPayableVoucherFormValues,
) {
  return (
    field === "creditAccountCode" ||
    field === "creditAccountTitle" ||
    field === "partyCode" ||
    field === "partyName" ||
    field === "referenceNo"
  );
}

function syncAccountsPayableVoucherWithGeneratedAccountingEntries(
  values: AccountsPayableVoucherFormValues,
): AccountsPayableVoucherFormValues {
  const syncedValues = syncAccountsPayableVoucherExpenseLinesAndAmount(values);

  return {
    ...syncedValues,
    accountingEntries:
      createAccountsPayableVoucherGeneratedAccountingEntries(syncedValues),
  };
}

function createAccountsPayableVoucherGeneratedAccountingEntries(
  values: AccountsPayableVoucherFormValues,
) {
  const debitEntries = values.expenseLines
    .filter(shouldGenerateExpenseAccountingEntry)
    .map((line, index) =>
      createAccountsPayableVoucherAccountingEntry(index + 1, {
        id: `apv-entry-expense-${line.id}`,
        accountCode: line.expenseAccountCode,
        accountTitle: line.expenseType,
        atcCode: line.ewt,
        debit: roundAccountingAmount(line.totalAmountDue),
        credit: 0,
        particulars: line.particulars,
        partyCode: line.partyCode || values.partyCode,
        partyName: line.partyName || values.partyName,
        refNo: line.referenceNo || values.referenceNo,
        responsibilityCenter: line.responsibilityCenter,
      }),
    );
  const totalDebit = roundAccountingAmount(
    debitEntries.reduce((sum, entry) => sum + Number(entry.debit || 0), 0),
  );
  const hasCreditAccount =
    values.creditAccountCode.trim() !== "" ||
    values.creditAccountTitle.trim() !== "";
  const shouldCreateCreditEntry = hasCreditAccount || totalDebit > 0;

  if (!shouldCreateCreditEntry) {
    return createBlankGeneratedAccountingEntries();
  }

  const referenceEntry = debitEntries.find((entry) => entry.debit > 0) ??
    debitEntries[0];
  const creditEntry = createAccountsPayableVoucherAccountingEntry(
    debitEntries.length + 1,
    {
      id: "apv-entry-default-credit",
      accountCode: values.creditAccountCode,
      accountTitle: values.creditAccountTitle,
      credit: totalDebit,
      debit: 0,
      particulars: referenceEntry?.particulars || "Record supplier payable",
      partyCode: values.partyCode || referenceEntry?.partyCode || "",
      partyName: values.partyName || referenceEntry?.partyName || "",
      refNo: referenceEntry?.refNo || values.referenceNo,
      responsibilityCenter: referenceEntry?.responsibilityCenter || "",
      vatType: "",
    },
  );

  return renumberAccountsPayableVoucherAccountingEntries([
    ...debitEntries,
    creditEntry,
  ]);
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
  return (
    line.expenseAccountCode.trim() !== "" ||
    line.expenseType.trim() !== "" ||
    line.particulars.trim() !== "" ||
    line.partyCode.trim() !== "" ||
    line.partyName.trim() !== "" ||
    line.referenceNo.trim() !== "" ||
    line.responsibilityCenter.trim() !== "" ||
    Number(line.totalAmountDue || 0) > 0
  );
}

function roundAccountingAmount(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

function createInheritedLineDefaults(
  values: AccountsPayableVoucherFormValues,
) {
  return {
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
    Number(line.amount || 0) > 0 ||
    Number(line.netAmount || 0) > 0 ||
    Number(line.totalAmountDue || 0) > 0 ||
    Number(line.vatAmount || 0) > 0 ||
    Number(line.ewtAmount || 0) > 0
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
    Number(line.amount || 0) > 0
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
