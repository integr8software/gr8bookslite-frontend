"use client";

import {
  AccountsPayableVoucherBaseCurrencyCode,
  AccountsPayableVoucherHref,
  AccountsPayableVoucherPurchaseTransactionType,
  canEditAccountsPayableVoucherStatus,
} from "@/app/src/constants/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherConstants";
import {
  accountsPayableVoucherExpenseLinesHaveItems,
  calculateAccountsPayableVoucherDueDate,
  createAccountsPayableVoucherAccountingEntry,
  createAccountsPayableVoucherExpenseLine,
  createAccountsPayableVoucherFormValues,
  getAccountsPayableVoucherAccountingTotals,
  getAccountsPayableVoucherExpenseTotals,
  renumberAccountsPayableVoucherAccountingEntries,
  renumberAccountsPayableVoucherExpenseLines,
  updateAccountsPayableVoucherFromForm,
} from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherData";
import { createAccountsPayableVoucherPurchaseOrderLines } from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherPurchaseOrderData";
import { getPurchaseOrderTotals } from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import { findModuleChartAccount, type ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import {
  createCurrencyCatalogFromReferencesAndRates,
  resolveFetchedExchangeRate,
} from "@/app/src/data/shared/currency/CurrencyOptionsData";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import {
  useAccountsPayableVoucherExpenseTypeOptions,
  useAccountsPayableVoucherNumberSuggestion,
  useAccountsPayableVoucherPartyOptions,
  useAccountsPayableVoucherPayableAccountOptions,
  useAccountsPayableVoucherRecord,
  useAccountsPayableVoucherStore,
  useAccountsPayableVoucherTermOptions,
} from "@/app/src/hooks/modules/accounts-payable/accounts-payable-voucher/useAccountsPayableVoucher";
import { usePurchaseOrderStore } from "@/app/src/hooks/modules/purchasing/purchase-order/usePurchaseOrder";
import { useMultiCurrencySetupRates } from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetupRates";
import { useOnboardingReferenceData } from "@/app/src/hooks/onboarding/useOnboardingReferenceData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useTaxDefinitionOptions } from "@/app/src/hooks/shared/tax/useTaxDefinitionOptions";
import { useTaxes } from "@/app/src/hooks/shared/tax/useTaxOptions";
import { FetchMultiCurrencyRates } from "@/app/src/services/modules/system-administration/multi-currency-setup/MultiCurrencySetupService";
import type {
  AccountsPayableVoucherAccountingEntryField,
  AccountsPayableVoucherExpenseLineField,
  AccountsPayableVoucherFormErrors,
  AccountsPayableVoucherFormValues,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import type { TaxDefinitionDefaultAccountIds } from "@/app/src/types/shared/tax/TaxDefinitionTypes";
import type { Tax } from "@/app/src/types/shared/tax/TaxTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { validateAccountsPayableVoucherForm } from "@/app/src/validations/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherValidation";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";

const PurchaseTaxCodeQuery = {
  transactionType: AccountsPayableVoucherPurchaseTransactionType,
} as const;

const AccountsPayableVoucherAddMode = "add" as const;
const AccountsPayableVoucherEditMode = "edit" as const;
const AccountsPayableVoucherViewMode = "view" as const;

import {
  accountingEntryHasTransactionData,
  createHeaderUpdatedVoucherValues,
  createInheritedAccountingEntryDefaults,
  createInheritedExpenseLineDefaults,
  getActionMode,
  getHeaderPartyPurchaseTaxDefaults,
  normalizeAccountingEntryUpdate,
  normalizeExchangeRate,
  normalizeExpenseLineUpdate,
  removeManualGeneratedTaxEntriesForSource,
  shouldClearAccountingEntry,
  shouldClearExpenseLine,
  shouldRefreshManualGeneratedTaxEntries,
  shouldSyncGeneratedAccountingForHeaderField,
  syncAccountsPayableVoucherWithGeneratedAccountingEntries,
} from "@/app/src/data/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherFormStateData";

export function useAccountsPayableVoucherFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const recordId = params.recordId;
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const { addRecord, isMutating, records, updateRecord, updateStatus } = useAccountsPayableVoucherStore();
  const { orders: purchaseOrders } = usePurchaseOrderStore();
  const partyOptionsQuery = useAccountsPayableVoucherPartyOptions();
  const termOptionsQuery = useAccountsPayableVoucherTermOptions();
  const expenseTypeOptionsQuery = useAccountsPayableVoucherExpenseTypeOptions();
  const payableAccountOptionsQuery = useAccountsPayableVoucherPayableAccountOptions();
  const taxDefinitionOptions = useTaxDefinitionOptions({
    transactionScope: "PURCHASE",
  });
  const taxCodesQuery = useTaxes(PurchaseTaxCodeQuery);
  const partyRecords = useMemo(() => partyOptionsQuery.data ?? [], [partyOptionsQuery.data]);
  const termRecords = useMemo(() => termOptionsQuery.data ?? [], [termOptionsQuery.data]);
  const purchaseOrderCopyRecords = useMemo<AppCopyFromRecord[]>(
    () =>
      purchaseOrders
        .filter((order) => order.status !== "Cancelled")
        .map((order) => ({
          amount: String(getPurchaseOrderTotals(order).netAmount),
          documentDate: order.documentDate,
          id: order.id,
          partyName: order.vceName,
          remarks: order.remarks || order.prNo,
          source: "Purchase Order",
          sourceNo: order.transNo,
        })),
    [purchaseOrders],
  );
  const taxAccountingContext = useMemo(
    () => ({
      accountOptions: taxDefinitionOptions.accountOptions,
      defaultAccountIds: taxDefinitionOptions.defaultAccountIds,
      taxCodes: taxCodesQuery.data ?? [],
    }),
    [taxCodesQuery.data, taxDefinitionOptions.accountOptions, taxDefinitionOptions.defaultAccountIds],
  );
  const mode = getActionMode(pathname);
  const activeCompanyId = authProfileQuery.data?.activeCompanyId ?? null;
  const baseCurrencyCode =
    authProfileQuery.data?.companies
      ?.find((company) => company.companyId === activeCompanyId)
      ?.baseCurrencyCode?.trim()
      .toUpperCase() ?? AccountsPayableVoucherBaseCurrencyCode;
  const recordQuery = useAccountsPayableVoucherRecord(recordId);
  const numberSuggestionQuery = useAccountsPayableVoucherNumberSuggestion(mode === AccountsPayableVoucherAddMode);
  const existingRecord = recordQuery.data ?? records.find((record) => record.id === recordId);
  const referenceData = useOnboardingReferenceData();
  const ratesQuery = useMultiCurrencySetupRates(baseCurrencyCode);
  const currencyOptions = useMemo(
    () =>
      createCurrencyCatalogFromReferencesAndRates(referenceData.currencies, ratesQuery.data ?? [], baseCurrencyCode).map((currency) => ({
        label: currency.isDefault ? `${currency.name} | Default` : `${currency.code} - ${currency.name}`,
        name: currency.code,
        value: currency.code,
      })),
    [baseCurrencyCode, ratesQuery.data, referenceData.currencies],
  );
  const isReadonly =
    mode === AccountsPayableVoucherViewMode ||
    (mode === AccountsPayableVoucherEditMode && (!existingRecord || !canEditAccountsPayableVoucherStatus(existingRecord.status)));
  const [values, setValues] = useState<AccountsPayableVoucherFormValues>(() =>
    createAccountsPayableVoucherFormValues(existingRecord, baseCurrencyCode),
  );
  const [errors, setErrors] = useState<AccountsPayableVoucherFormErrors>({});
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [pendingSaveValues, setPendingSaveValues] = useState<AccountsPayableVoucherFormValues | null>(null);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(false);
  const hasAppliedNumberSuggestionRef = useRef(false);
  const hasEditedTransactionNoRef = useRef(false);
  const hasEditedCurrencyRef = useRef(false);
  const hasAppliedBaseCurrencyRef = useRef(false);
  const hasHydratedExistingRecordRef = useRef(false);
  const exchangeRateRequestIdRef = useRef(0);

  useEffect(() => {
    hasHydratedExistingRecordRef.current = false;
  }, [recordId]);

  useEffect(() => {
    if (mode === AccountsPayableVoucherAddMode || !existingRecord || hasHydratedExistingRecordRef.current) {
      return;
    }

    setValues(createAccountsPayableVoucherFormValues(existingRecord));
    setErrors({});
    hasHydratedExistingRecordRef.current = true;
  }, [existingRecord, mode]);

  useEffect(() => {
    hasAppliedNumberSuggestionRef.current = false;
    hasEditedTransactionNoRef.current = false;
    hasEditedCurrencyRef.current = false;
    hasAppliedBaseCurrencyRef.current = false;
  }, [mode]);

  useEffect(() => {
    if (
      mode !== AccountsPayableVoucherAddMode ||
      activeCompanyId == null ||
      !authProfileQuery.data ||
      hasAppliedBaseCurrencyRef.current ||
      hasEditedCurrencyRef.current
    ) {
      return;
    }

    setValues((current) => ({
      ...current,
      currency: baseCurrencyCode,
      exchangeRate: 1,
    }));
    hasAppliedBaseCurrencyRef.current = true;
  }, [activeCompanyId, authProfileQuery.data, baseCurrencyCode, mode]);

  useEffect(() => {
    if (
      mode !== AccountsPayableVoucherAddMode ||
      !numberSuggestionQuery.data ||
      hasAppliedNumberSuggestionRef.current ||
      hasEditedTransactionNoRef.current
    ) {
      return;
    }

    setValues((current) => ({
      ...current,
      transactionNo: numberSuggestionQuery.data.transactionNo,
    }));
    hasAppliedNumberSuggestionRef.current = true;
  }, [mode, numberSuggestionQuery.data]);

  const displayValues = useMemo(
    () => syncAccountsPayableVoucherWithGeneratedAccountingEntries(values, taxAccountingContext),
    [taxAccountingContext, values],
  );
  const expenseTotals = useMemo(() => getAccountsPayableVoucherExpenseTotals(displayValues.expenseLines), [displayValues.expenseLines]);
  const accountingTotals = useMemo(
    () => getAccountsPayableVoucherAccountingTotals(displayValues.accountingEntries),
    [displayValues.accountingEntries],
  );
  const hasExpenseDetailItems = useMemo(
    () => accountsPayableVoucherExpenseLinesHaveItems(displayValues.expenseLines),
    [displayValues.expenseLines],
  );
  const hasAccountingEntryItems = useMemo(
    () => values.accountingEntries.some(accountingEntryHasTransactionData),
    [values.accountingEntries],
  );
  const isExpenseDetailsReadonly = isReadonly || (!hasExpenseDetailItems && hasAccountingEntryItems);
  const isAccountingEntriesReadonly = isReadonly || hasExpenseDetailItems;

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    if (isReadonly) {
      return;
    }

    const field = event.target.name as keyof AccountsPayableVoucherFormValues;
    const fieldValue = event.target.value;

    if (field === "transactionNo") {
      hasEditedTransactionNoRef.current = true;
    }

    if (field === "currency") {
      hasEditedCurrencyRef.current = true;
      void updateCurrencyFromExchangeRates(fieldValue);
      return;
    }

    const value = field === "exchangeRate" || field === "amount" ? Number(fieldValue || 0) : fieldValue;

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
      const nextValues = createHeaderUpdatedVoucherValues(current, field, value);

      return shouldSyncGeneratedAccountingForHeaderField(field)
        ? syncAccountsPayableVoucherWithGeneratedAccountingEntries(nextValues, taxAccountingContext)
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
      exchangeRate: currencyCode === baseCurrencyCode ? 1 : current.exchangeRate,
    }));
    setErrors((current) => ({
      ...current,
      currency: undefined,
      exchangeRate: undefined,
    }));

    if (currencyCode === baseCurrencyCode) {
      setIsExchangeRateLoading(false);
      return;
    }

    setIsExchangeRateLoading(true);

    try {
      const rates = ratesQuery.data ?? (await FetchMultiCurrencyRates(baseCurrencyCode));
      const exchangeRate = resolveFetchedExchangeRate(rates, baseCurrencyCode, currencyCode);

      if (exchangeRateRequestIdRef.current !== requestId) {
        return;
      }

      if (exchangeRate == null) {
        throw new Error(`No ${currencyCode} exchange rate returned.`);
      }

      setValues((current) => ({
        ...current,
        exchangeRate: normalizeExchangeRate(exchangeRate),
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

  async function copyFromPurchaseOrder(recordIds: string[]) {
    if (isReadonly) {
      return;
    }

    const order = purchaseOrders.find((record) => recordIds.includes(record.id));

    if (!order) {
      toast.error("No purchase order was selected.");
      return;
    }

    let expenseAccounts;
    let payableOptions;
    try {
      const [expenseResult, payableResult] = await Promise.all([
        expenseTypeOptionsQuery.data ?? expenseTypeOptionsQuery.refetch({ throwOnError: true }).then((result) => result.data),
        payableAccountOptionsQuery.data ?? payableAccountOptionsQuery.refetch({ throwOnError: true }).then((result) => result.data),
      ]);
      expenseAccounts = expenseResult ?? [];
      payableOptions = payableResult;
    } catch {
      toast.error("Could not load payable accounts. Try copying the purchase order again.");
      return;
    }
    const party = partyRecords.find((record) => record.id === order.partyId || record.partyCodeNo === order.vceCode);
    const term =
      termRecords.find((record) => record.id === order.termId) ??
      termRecords.find((record) => record.name.trim().toLowerCase() === order.termsOfPayment.trim().toLowerCase()) ??
      termRecords.find((record) => record.id === party?.termId);
    const payableAccounts = [
      ...(payableOptions?.accountOptions.defaultPayableAccount ?? []),
      ...(payableOptions?.accountOptions.employeePayableAccount ?? []),
    ];
    const payableAccount = party?.defaultPayableAccount ? findModuleChartAccount(party.defaultPayableAccount, payableAccounts) : undefined;
    const copiedExpenseLines = createAccountsPayableVoucherPurchaseOrderLines(order, expenseAccounts);

    hasEditedCurrencyRef.current = true;
    setValues((current) => {
      const nextValues: AccountsPayableVoucherFormValues = {
        ...current,
        address: order.address || party?.address?.addressLine1 || current.address,
        contactNo: order.contactNo || party?.contactNo || current.contactNo,
        contactPerson: party?.contactPerson || current.contactPerson,
        creditAccountCode: payableAccount?.accountNumber || current.creditAccountCode,
        creditAccountId: payableAccount?.id || current.creditAccountId,
        creditAccountTitle: payableAccount?.accountName || current.creditAccountTitle,
        currency: order.currency || current.currency,
        exchangeRate: order.exchangeRate || current.exchangeRate,
        expenseLines: copiedExpenseLines.length > 0 ? copiedExpenseLines : current.expenseLines,
        partyCode: order.vceCode || current.partyCode,
        partyId: party?.id || order.partyId,
        partyName: order.vceName || current.partyName,
        projectCode: order.projectCode || current.projectCode,
        projectName: order.projectName || current.projectName,
        referenceNo: order.transNo,
        remarks: order.remarks || current.remarks,
        termId: term?.id || order.termId || party?.termId || "",
        dueDate: calculateAccountsPayableVoucherDueDate(
          current.documentDate,
          term
            ? {
                datemode: term.dateMode === "MONTH" ? "Month" : term.dateMode === "YEAR" ? "Year" : "Day",
                period: String(term.period),
              }
            : null,
        ),
        terms: term?.name || order.termsOfPayment || party?.termName || current.terms,
      };

      return syncAccountsPayableVoucherWithGeneratedAccountingEntries(nextValues, taxAccountingContext);
    });
    setErrors({});
    if (copiedExpenseLines.some((line) => !line.expenseAccountCode)) {
      toast("Purchase order copied. Select a payable type for rows without a matching account.");
    } else {
      toast.success("Purchase order details copied to the APV.");
    }
  }

  function updateExpenseLine(lineId: string, field: AccountsPayableVoucherExpenseLineField, value: string | number) {
    if (isExpenseDetailsReadonly) {
      return;
    }

    setValues((current) =>
      syncAccountsPayableVoucherWithGeneratedAccountingEntries(
        {
          ...current,
          expenseLines: current.expenseLines.map((line) => (line.id === lineId ? normalizeExpenseLineUpdate(line, field, value) : line)),
        },
        taxAccountingContext,
      ),
    );
    clearExpenseLineError(lineId, field);
  }

  function addExpenseLines(count = 1) {
    if (isExpenseDetailsReadonly) {
      return;
    }

    setValues((current) => {
      const partyTaxDefaults = getHeaderPartyPurchaseTaxDefaults(current, partyRecords, taxAccountingContext.taxCodes);

      return syncAccountsPayableVoucherWithGeneratedAccountingEntries(
        {
          ...current,
          expenseLines: [
            ...current.expenseLines,
            ...Array.from({ length: count }, (_, index) =>
              createAccountsPayableVoucherExpenseLine(
                current.expenseLines.length + index + 1,
                createInheritedExpenseLineDefaults(current, current.expenseLines, partyTaxDefaults),
              ),
            ),
          ],
        },
        taxAccountingContext,
      );
    });
    setErrors((current) => ({ ...current, expenseLines: undefined }));
  }

  function removeExpenseLine(lineId: string) {
    if (isExpenseDetailsReadonly) {
      return;
    }

    setValues((current) => {
      const nextLines = current.expenseLines.filter((line) => line.id !== lineId);

      return syncAccountsPayableVoucherWithGeneratedAccountingEntries(
        {
          ...current,
          expenseLines: renumberAccountsPayableVoucherExpenseLines(
            nextLines.length > 0 ? nextLines : [createAccountsPayableVoucherExpenseLine(1, { particulars: current.remarks })],
          ),
        },
        taxAccountingContext,
      );
    });
    setErrors((current) => ({ ...current, expenseLines: undefined }));
  }

  function insertExpenseLine(lineId: string, position: "above" | "below") {
    if (isExpenseDetailsReadonly) {
      return;
    }

    setValues((current) => {
      const rowIndex = current.expenseLines.findIndex((line) => line.id === lineId);
      const partyTaxDefaults = getHeaderPartyPurchaseTaxDefaults(current, partyRecords, taxAccountingContext.taxCodes);
      const insertIndex = rowIndex === -1 ? current.expenseLines.length : rowIndex + (position === "below" ? 1 : 0);
      const nextLines = [...current.expenseLines];

      nextLines.splice(
        insertIndex,
        0,
        createAccountsPayableVoucherExpenseLine(
          insertIndex + 1,
          createInheritedExpenseLineDefaults(current, current.expenseLines, partyTaxDefaults),
        ),
      );

      return syncAccountsPayableVoucherWithGeneratedAccountingEntries(
        {
          ...current,
          expenseLines: renumberAccountsPayableVoucherExpenseLines(nextLines),
        },
        taxAccountingContext,
      );
    });
    setErrors((current) => ({ ...current, expenseLines: undefined }));
  }

  function duplicateExpenseLine(lineId: string) {
    if (isExpenseDetailsReadonly) {
      return;
    }

    setValues((current) => {
      const rowIndex = current.expenseLines.findIndex((line) => line.id === lineId);
      const sourceLine = current.expenseLines[rowIndex];

      if (!sourceLine) {
        return current;
      }

      const nextLines = [...current.expenseLines];

      nextLines.splice(rowIndex + 1, 0, {
        ...sourceLine,
        id: `apv-expense-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      });

      return syncAccountsPayableVoucherWithGeneratedAccountingEntries(
        {
          ...current,
          expenseLines: renumberAccountsPayableVoucherExpenseLines(nextLines),
        },
        taxAccountingContext,
      );
    });
    setErrors((current) => ({ ...current, expenseLines: undefined }));
  }

  function moveExpenseLine(fromLineId: string, toLineId: string) {
    if (isExpenseDetailsReadonly || fromLineId === toLineId) {
      return;
    }

    setValues((current) => {
      const fromIndex = current.expenseLines.findIndex((line) => line.id === fromLineId);
      const toIndex = current.expenseLines.findIndex((line) => line.id === toLineId);

      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      const nextLines = [...current.expenseLines];
      const [movedLine] = nextLines.splice(fromIndex, 1);

      nextLines.splice(toIndex, 0, movedLine);

      return syncAccountsPayableVoucherWithGeneratedAccountingEntries(
        {
          ...current,
          expenseLines: renumberAccountsPayableVoucherExpenseLines(nextLines),
        },
        taxAccountingContext,
      );
    });
  }

  function clearExpenseLines(action: ModuleDataEntryClearAction) {
    if (isExpenseDetailsReadonly) {
      return;
    }

    setValues((current) => {
      const nextLines = action === "all" ? [] : current.expenseLines.filter((line) => !shouldClearExpenseLine(line, action));

      return syncAccountsPayableVoucherWithGeneratedAccountingEntries(
        {
          ...current,
          expenseLines: renumberAccountsPayableVoucherExpenseLines(
            nextLines.length > 0 ? nextLines : [createAccountsPayableVoucherExpenseLine(1, { particulars: current.remarks })],
          ),
        },
        taxAccountingContext,
      );
    });
    setErrors((current) => ({ ...current, expenseLines: undefined }));
  }

  function updateAccountingEntry(entryId: string, field: AccountsPayableVoucherAccountingEntryField, value: string | number) {
    if (isAccountingEntriesReadonly) {
      return;
    }

    setValues((current) => {
      const nextEntries = current.accountingEntries.map((entry) =>
        entry.id === entryId ? normalizeAccountingEntryUpdate(entry, field, value) : entry,
      );

      return {
        ...current,
        accountingEntries: shouldRefreshManualGeneratedTaxEntries(field)
          ? removeManualGeneratedTaxEntriesForSource(nextEntries, entryId)
          : nextEntries,
      };
    });
    clearAccountingEntryError(entryId, field);
  }

  function addAccountingEntries(count = 1) {
    if (isAccountingEntriesReadonly) {
      return;
    }

    setValues((current) => {
      const partyTaxDefaults = getHeaderPartyPurchaseTaxDefaults(current, partyRecords, taxAccountingContext.taxCodes);

      return {
        ...current,
        accountingEntries: [
          ...current.accountingEntries,
          ...Array.from({ length: count }, (_, index) =>
            createAccountsPayableVoucherAccountingEntry(
              current.accountingEntries.length + index + 1,
              createInheritedAccountingEntryDefaults(current, current.accountingEntries, partyTaxDefaults),
            ),
          ),
        ],
      };
    });
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
      const nextEntries = current.accountingEntries.filter((entry) => entry.id !== entryId);

      return {
        ...current,
        accountingEntries: renumberAccountsPayableVoucherAccountingEntries(
          nextEntries.length > 0 ? nextEntries : [createAccountsPayableVoucherAccountingEntry(1)],
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
      const rowIndex = current.accountingEntries.findIndex((entry) => entry.id === entryId);
      const partyTaxDefaults = getHeaderPartyPurchaseTaxDefaults(current, partyRecords, taxAccountingContext.taxCodes);
      const insertIndex = rowIndex === -1 ? current.accountingEntries.length : rowIndex + (position === "below" ? 1 : 0);
      const nextEntries = [...current.accountingEntries];

      nextEntries.splice(
        insertIndex,
        0,
        createAccountsPayableVoucherAccountingEntry(
          insertIndex + 1,
          createInheritedAccountingEntryDefaults(current, current.accountingEntries, partyTaxDefaults),
        ),
      );

      return {
        ...current,
        accountingEntries: renumberAccountsPayableVoucherAccountingEntries(nextEntries),
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
      const rowIndex = current.accountingEntries.findIndex((entry) => entry.id === entryId);
      const sourceEntry = current.accountingEntries[rowIndex];

      if (!sourceEntry) {
        return current;
      }

      const nextEntries = [...current.accountingEntries];

      nextEntries.splice(rowIndex + 1, 0, {
        ...sourceEntry,
        id: `apv-entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      });

      return {
        ...current,
        accountingEntries: renumberAccountsPayableVoucherAccountingEntries(nextEntries),
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
      const fromIndex = current.accountingEntries.findIndex((entry) => entry.id === fromEntryId);
      const toIndex = current.accountingEntries.findIndex((entry) => entry.id === toEntryId);

      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      const nextEntries = [...current.accountingEntries];
      const [movedEntry] = nextEntries.splice(fromIndex, 1);

      nextEntries.splice(toIndex, 0, movedEntry);

      return {
        ...current,
        accountingEntries: renumberAccountsPayableVoucherAccountingEntries(nextEntries),
      };
    });
  }

  function clearAccountingEntries(action: ModuleDataEntryClearAction) {
    if (isAccountingEntriesReadonly) {
      return;
    }

    setValues((current) => {
      const nextEntries = action === "all" ? [] : current.accountingEntries.filter((entry) => !shouldClearAccountingEntry(entry, action));

      return {
        ...current,
        accountingEntries: renumberAccountsPayableVoucherAccountingEntries(
          nextEntries.length > 0 ? nextEntries : [createAccountsPayableVoucherAccountingEntry(1)],
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

    const submitValues = syncAccountsPayableVoucherWithGeneratedAccountingEntries(values, taxAccountingContext);
    const nextErrors = validateAccountsPayableVoucherForm(submitValues);

    if (Object.keys(nextErrors).length > 0) {
      setValues(submitValues);
      setErrors(nextErrors);
      toast.error("Please fix the highlighted accounts payable voucher fields before saving.");
      return;
    }

    setValues(submitValues);
    setPendingSaveValues(submitValues);
  }

  async function handleConfirmSaveVoucher() {
    if (!pendingSaveValues) {
      return;
    }

    try {
      if (mode === AccountsPayableVoucherEditMode && existingRecord) {
        await updateRecord(updateAccountsPayableVoucherFromForm(existingRecord, pendingSaveValues));
      } else if (mode === AccountsPayableVoucherEditMode) {
        toast.error("Could not find the accounts payable voucher to update.");
        return;
      } else {
        await addRecord(pendingSaveValues);
      }
    } catch {
      return;
    }

    setPendingSaveValues(null);
    router.push(AccountsPayableVoucherHref);
  }

  function handleCancelSaveVoucher() {
    setPendingSaveValues(null);
  }

  async function handleConfirmCancelVoucher() {
    if (!existingRecord) {
      toast.error("Could not find the accounts payable voucher to cancel.");
      return;
    }

    try {
      await updateStatus(existingRecord.id, "Cancelled");
    } catch {
      return;
    }

    setIsCancelDialogOpen(false);
    router.push(AccountsPayableVoucherHref);
  }

  function clearExpenseLineError(lineId: string, field: AccountsPayableVoucherExpenseLineField) {
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

  function clearAccountingEntryError(entryId: string, field: AccountsPayableVoucherAccountingEntryField) {
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
    copyFromPurchaseOrder,
    duplicateAccountingEntry,
    duplicateExpenseLine,
    errors,
    existingRecord,
    expenseTotal: expenseTotals.totalAmountDue,
    expenseTotals,
    handleCancelSaveVoucher,
    handleConfirmSaveVoucher,
    handleConfirmCancelVoucher,
    handleInputChange,
    handleSubmit,
    hasAccountingEntryItems,
    hasExpenseDetailItems,
    insertAccountingEntry,
    insertExpenseLine,
    isAccountingEntriesReadonly,
    isCancelDialogOpen,
    isExchangeRateLoading,
    isExpenseDetailsReadonly,
    isMutating,
    isRecordLoading: recordQuery.isLoading,
    isReadonly,
    isSaveDialogOpen: pendingSaveValues !== null,
    mode,
    moveAccountingEntry,
    moveExpenseLine,
    needsRecord: mode === AccountsPayableVoucherEditMode || mode === AccountsPayableVoucherViewMode,
    purchaseOrderCopyRecords,
    removeAccountingEntry,
    removeExpenseLine,
    setIsCancelDialogOpen,
    updateAccountingEntry,
    updateCurrency,
    updateExpenseLine,
    updateHeaderField,
    baseCurrencyCode,
    currencyOptions,
    values: displayValues,
  };
}
