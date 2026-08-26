"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  CashVoucherCopyFromRecords,
  CashVoucherDefaultAccounts,
  applyCopyFromRecordsToCashVoucherForm,
  createBlankCashVoucherLineEntry,
  createCashVoucherTransactionFromForm,
  createCashVoucherFromForm,
  createCashVoucherStatusHistoryEntry,
  createTaxDetails,
  syncTaxDetailsAmount,
  updateCashVoucherFromForm,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import { clearAccountingGridSession } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingGridSessionData";
import {
  canUpdateCashVoucherStatus,
  createInitialCashVoucherFormValues,
  createManualCashVoucherTransactionId,
  createVoucherActionReturnLink,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherActionData";
import {
  createAutomaticAccountingEntries,
  hasNonZeroAccountingAmount,
  isGeneratedAccountingEntry,
  normalizeCashVoucherLineEntryFields,
  shouldSyncCashVoucherEntryParty,
  syncCashVoucherLineEntryTaxDetails,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingEntryData";
import {
  CashVoucherLink,
  CashVoucherStatuses,
  canEditCashVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import { CashVoucherLineEntriesField } from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherDataEntryConstants";
import {
  validateCashVoucherDetails,
  validateCashVoucherEntries,
} from "@/app/src/validations/modules/cash-disbursement/cash-voucher/CashVoucherValidation";
import { useDefaultAccountStore } from "@/app/src/hooks/modules/financial-maintenance/default-account/useDefaultAccount";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import type {
  CashVoucherLineEntry,
  CashVoucherActionMode,
  CashVoucherActionTab,
  CashVoucherFormErrors,
  CashVoucherFormValues,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import { useCashVoucherStore } from "@/app/src/hooks/modules/cash-disbursement/cash-voucher/useCashVoucher";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import {
  clearCashVoucherEntryRows,
  createCashVoucherEntryRows,
  duplicateCashVoucherEntryRow,
  insertCashVoucherEntryRow,
  moveCashVoucherEntryRow,
  removeCashVoucherEntryRow,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherEntryRowData";

export function useCashVoucherActionPage(mode: CashVoucherActionMode) {
  const router = useRouter();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const transactions = useCashVoucherStore((state) => state.transactions);
  const vouchers = useCashVoucherStore((state) => state.vouchers);
  const addTransaction = useCashVoucherStore((state) => state.addTransaction);
  const updateTransaction = useCashVoucherStore((state) => state.updateTransaction);
  const addVoucher = useCashVoucherStore((state) => state.addVoucher);
  const updateVoucher = useCashVoucherStore((state) => state.updateVoucher);
  const routeTransactionId = mode === "add" ? (searchParams.get("transactionId") ?? "") : (params.recordId ?? "");
  const routeTransaction = transactions.find((transaction) => transaction.id === routeTransactionId);
  const routeVoucher = vouchers.find((voucher) => voucher.transactionId === routeTransactionId);
  const returnLink = createVoucherActionReturnLink(searchParams.get("from"), routeTransactionId);
  const transactionCurrency = useTransactionCurrency();
  const [values, setValues] = useState<CashVoucherFormValues>(() =>
    createInitialCashVoucherFormValues({
      mode,
      transaction: routeTransaction,
      voucher: routeVoucher,
    }),
  );
  const [errors, setErrors] = useState<CashVoucherFormErrors>({});
  const [pendingSubmitValues, setPendingSubmitValues] = useState<CashVoucherFormValues | null>(null);
  const [activeTab, setActiveTab] = useState<CashVoucherActionTab>("details");
  const [isDefaultAccountDrawerOpen, setIsDefaultAccountDrawerOpen] = useState(false);
  const [isPartyNameDrawerOpen, setIsPartyNameDrawerOpen] = useState(false);
  const [isProjectNameDrawerOpen, setIsProjectNameDrawerOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [pendingResponsibilityCenterEntryId, setPendingResponsibilityCenterEntryId] = useState<string | null>(null);
  const hasEditedCurrencyRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const submitLockReleaseRef = useRef<null | (() => void)>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultAccountStore = useDefaultAccountStore();
  const partyStore = usePartyManagementStore();
  const responsibilityCenterStore = useResponsibilityCenterStore();
  const defaultAccounts = CashVoucherDefaultAccounts;
  const selectedTransaction = transactions.find((transaction) => transaction.id === values.transactionId);
  const existingVoucher = vouchers.find((voucher) => voucher.transactionId === values.transactionId);
  const currentStatus = existingVoucher?.status ?? selectedTransaction?.status ?? values.status;
  const isReadonly = mode === "view" || (mode === "edit" && !canEditCashVoucherStatus(currentStatus));
  const totalDebit = useMemo(() => values.lineEntries.reduce((sum, entry) => sum + entry.debit, 0), [values.lineEntries]);
  const totalCredit = useMemo(() => values.lineEntries.reduce((sum, entry) => sum + entry.credit, 0), [values.lineEntries]);
  const isRecordMissing = (!selectedTransaction && mode !== "add") || (mode === "edit" && !existingVoucher);
  const [initialValues] = useState(values);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:cash-voucher", recordId: params.recordId }),
    setValues,
    values,
  });

  useEffect(() => {
    clearAccountingGridSession();
  }, []);

  useEffect(() => {
    if (mode !== "add" || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) {
      return;
    }

    setValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      fxRate: "1.00",
    }));
  }, [mode, transactionCurrency.baseCurrencyCode, transactionCurrency.isBaseCurrencyResolved]);

  function updateField<TKey extends keyof CashVoucherFormValues>(field: TKey, value: CashVoucherFormValues[TKey]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const nextValues = { ...current, [field]: value };

      if (field !== "remarks") {
        return nextValues;
      }

      const nextRemarks = String(value ?? "");
      const editableEntries = current.lineEntries
        .filter((entry) => !isGeneratedAccountingEntry(entry))
        .map((entry) =>
          shouldEntryRemarksFollowHeader(entry.remarks, current.remarks)
            ? { ...entry, remarks: nextRemarks }
            : entry,
        );

      return {
        ...nextValues,
        lineEntries: createAutomaticAccountingEntries(editableEntries, {
          bankAccount: null,
          isCashPayment: true,
          paymentMethod: "Cash",
        }),
      };
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updatePaymentDetails(nextDetails: Partial<CashVoucherFormValues["paymentDetails"]>) {
    updateField("paymentDetails", {
      ...values.paymentDetails,
      ...nextDetails,
    });
  }

  async function handleCurrencyChange(currencyCode: string) {
    if (isReadonly) {
      return;
    }

    hasEditedCurrencyRef.current = true;
    updateField("currency", currencyCode);
    setErrors((current) => ({ ...current, currency: undefined, fxRate: undefined }));

    try {
      const exchangeRate = await transactionCurrency.loadExchangeRate(currencyCode);

      if (exchangeRate != null) {
        updateField("fxRate", formatLoadedExchangeRate(exchangeRate));
      }
    } catch {
      setErrors((current) => ({ ...current, fxRate: "Could not load the exchange rate." }));
      toast.error("Could not load the exchange rate for the selected currency.");
    }
  }

  function createAutomaticEntriesForPayment(entries: CashVoucherLineEntry[]) {
    return createAutomaticAccountingEntries(entries, {
      bankAccount: null,
      isCashPayment: true,
      paymentMethod: "Cash",
    });
  }

  function handlePartyChange(partyCode: string, partyName: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const previousPartyCode = current.partyCode;
      const previousPartyName = current.partyName;

      return {
        ...current,
        partyCode,
        partyName,
        paymentDetails: {
          ...current.paymentDetails,
          payee: partyName,
        },
        lineEntries: current.lineEntries.map((entry) =>
          shouldSyncCashVoucherEntryParty(entry, previousPartyCode, previousPartyName)
            ? {
                ...entry,
                partyCode,
                partyName,
              }
            : entry,
        ),
      };
    });
    setErrors((current) => ({
      ...current,
      partyCode: undefined,
      partyName: undefined,
    }));
  }

  function createBlankEntry(): CashVoucherLineEntry {
    const refId = values.voucherReferenceNo || selectedTransaction?.transactionNo || values.transactionId;
    const responsibilityCenter = values.costCenter || selectedTransaction?.costCenter || "";

    return createBlankCashVoucherLineEntry({
      partyCode: values.partyCode,
      partyName: values.partyName,
      refId,
      remarks: values.remarks,
      responsibilityCenter,
      taxDetails: {
        ...createTaxDetails(0, "0%"),
        refId,
        responsibilityCenter,
      },
    });
  }

  function replaceEntriesWithAutomaticRows(nextEntries: CashVoucherLineEntry[]) {
    updateField(
      CashVoucherLineEntriesField,
      createAutomaticEntriesForPayment(nextEntries.length > 0 ? nextEntries : [createBlankEntry()]),
    );
  }

  function handleAddEntries(count = 1) {
    updateField(CashVoucherLineEntriesField, [...values.lineEntries, ...createCashVoucherEntryRows(count, createBlankEntry)]);
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleRemoveEntry(entryId: string) {
    replaceEntriesWithAutomaticRows(removeCashVoucherEntryRow(values.lineEntries, entryId));
  }

  function handleUpdateEntry(entryId: string, field: keyof CashVoucherLineEntry, value: string | number) {
    handleUpdateEntryFields(entryId, { [field]: value });
  }

  function handleUpdateEntryFields(entryId: string, updates: Partial<CashVoucherLineEntry>) {
    const sourceEntry = values.lineEntries.find((entry) => entry.id === entryId);
    const shouldRefreshGeneratedRemarks =
      sourceEntry !== undefined &&
      !isGeneratedAccountingEntry(sourceEntry) &&
      Object.prototype.hasOwnProperty.call(updates, "remarks");
    const nextEntries = values.lineEntries.map((entry) => {
      if (entry.id !== entryId) {
        return entry;
      }

      const nextEntry = normalizeCashVoucherLineEntryFields({
        ...entry,
        ...updates,
      });

      if (Number(nextEntry.debit || 0) > 0) {
        nextEntry.credit = 0;
      }

      if (Number(nextEntry.credit || 0) > 0) {
        nextEntry.debit = 0;
      }

      return shouldRefreshGeneratedRemarks ? nextEntry : syncCashVoucherLineEntryTaxDetails(nextEntry);
    });

    updateField(
      CashVoucherLineEntriesField,
      shouldRefreshGeneratedRemarks
        ? createAutomaticEntriesForPayment(nextEntries.filter((entry) => !isGeneratedAccountingEntry(entry)))
        : nextEntries,
    );
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleInsertEntry(entryId: string, position: "above" | "below") {
    updateField(CashVoucherLineEntriesField, insertCashVoucherEntryRow(values.lineEntries, entryId, position, createBlankEntry));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleDuplicateEntry(entryId: string) {
    updateField(
      CashVoucherLineEntriesField,
      duplicateCashVoucherEntryRow(values.lineEntries, entryId, () => `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    );
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleMoveEntry(fromEntryId: string, toEntryId: string) {
    updateField(CashVoucherLineEntriesField, moveCashVoucherEntryRow(values.lineEntries, fromEntryId, toEntryId));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleClearEntries(action: ModuleDataEntryClearAction) {
    replaceEntriesWithAutomaticRows(clearCashVoucherEntryRows(values.lineEntries, action));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleReplaceLineEntries(nextEntries: CashVoucherLineEntry[]) {
    const amount = nextEntries
      .filter((entry) => !isGeneratedAccountingEntry(entry))
      .reduce((sum, entry) => sum + Number(entry.taxDetails.amount || 0), 0);

    updateField(CashVoucherLineEntriesField, nextEntries);
    updateField("amount", hasNonZeroAccountingAmount(amount) ? amount.toFixed(2) : "");
    updateField("taxDetails", syncTaxDetailsAmount(values.taxDetails, amount, values.taxRate));
  }

  function requestCashVoucherSubmit(status: CashVoucherStatus) {
    if (isReadonly || isSubmittingRef.current) return;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return;
    }
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:cash-voucher:submit:${mode}:${params.recordId ?? values.transactionId}`,
    );
    if (!releaseSubmitLock) return;
    submitLockReleaseRef.current = releaseSubmitLock;

    const valuesForSubmit = {
      ...values,
      status,
      transactionId: values.transactionId.trim() || createManualCashVoucherTransactionId(),
    };
    const shouldValidate = status !== CashVoucherStatuses.draft;
    const detailsErrors = shouldValidate ? validateCashVoucherDetails(valuesForSubmit) : {};
    const entryErrors = shouldValidate ? validateCashVoucherEntries(valuesForSubmit) : {};
    const nextErrors = { ...detailsErrors, ...entryErrors };

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please Fill Up the Required Fields!");
      submitLockReleaseRef.current = null;
      releaseSubmitLock();
      return;
    }

    setErrors({});
    setValues(valuesForSubmit);
    setPendingSubmitValues(valuesForSubmit);
  }

  function confirmCashVoucherSubmit() {
    if (!pendingSubmitValues || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      if (mode === "edit" && existingVoucher) {
        updateVoucher(updateCashVoucherFromForm(existingVoucher, pendingSubmitValues));
      } else {
        if (!selectedTransaction) {
          addTransaction(createCashVoucherTransactionFromForm(pendingSubmitValues));
        }
        addVoucher(createCashVoucherFromForm(pendingSubmitValues));
      }
      draft.clearDraft();
      setPendingSubmitValues(null);
      submitLockReleaseRef.current = null;
      router.push(returnLink);
    } catch {
      toast.error("Could not save the Cash Voucher. Please try again.");
      setPendingSubmitValues(null);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      submitLockReleaseRef.current?.();
      submitLockReleaseRef.current = null;
    }
  }

  function cancelCashVoucherSubmit() {
    setPendingSubmitValues(null);
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    submitLockReleaseRef.current?.();
    submitLockReleaseRef.current = null;
  }

  function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    requestCashVoucherSubmit(CashVoucherStatuses.forApproval);
  }

  function handleUpdateStatus(status: CashVoucherStatus) {
    if (!canUpdateCashVoucherStatus(currentStatus, status)) {
      return;
    }
    const actionRecordId = existingVoucher?.id ?? selectedTransaction?.id;
    if (!actionRecordId) return;
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:cash-voucher:status:${actionRecordId}:${status}`);
    if (!releaseActionLock) return;

    try {
      const updatedAt = new Date().toISOString();
      setValues((currentValues) => ({ ...currentValues, status }));
      if (existingVoucher) {
        updateVoucher({
          ...existingVoucher,
          status,
          updatedBy: "Current User",
          updatedAt,
          history: [...(existingVoucher.history ?? []), createCashVoucherStatusHistoryEntry(status, existingVoucher.voucherNo)],
        });
        return;
      }
      updateTransaction({ ...selectedTransaction!, status, updatedBy: "Current User", updatedAt });
    } catch {
      toast.error("Could not update the Cash Voucher. Please try again.");
      releaseActionLock();
    }
  }

  function handleCopyFrom(recordIds: string[]) {
    const selectedRecords = recordIds
      .map((recordId) => CashVoucherCopyFromRecords.find((candidate) => candidate.id === recordId))
      .filter((record): record is (typeof CashVoucherCopyFromRecords)[number] => Boolean(record));

    if (selectedRecords.length === 0) {
      return;
    }

    setValues((currentValues) => applyCopyFromRecordsToCashVoucherForm(currentValues, selectedRecords));
    setErrors({});
  }

  function handleCreateParty(record: Parameters<typeof getPartyDisplayName>[0]) {
    const partyName = getPartyDisplayName(record);

    handlePartyChange(record.partyCodeNo, partyName);
    setIsPartyNameDrawerOpen(false);
  }

  function handleCreateProject(project: ResponsibilityCenter) {
    updateField("projectName", project.name);
    updateField("costCenter", project.code);
    setIsProjectNameDrawerOpen(false);
  }

  function handleOpenResponsibilityCenterDrawer(entryId: string) {
    if (isReadonly) {
      return;
    }

    setPendingResponsibilityCenterEntryId(entryId);
    setIsResponsibilityCenterDrawerOpen(true);
  }

  function handleCloseResponsibilityCenterDrawer() {
    setPendingResponsibilityCenterEntryId(null);
    setIsResponsibilityCenterDrawerOpen(false);
  }

  function handleCreateResponsibilityCenter(center: ResponsibilityCenter) {
    if (pendingResponsibilityCenterEntryId) {
      handleUpdateEntry(pendingResponsibilityCenterEntryId, "responsibilityCenter", center.name);
    }

    handleCloseResponsibilityCenterDrawer();
  }

  return {
    discardDraft: draft.discardDraft,
    hasDiscardableChanges: isDirty,
    saveDraft: draft.saveDraft,
    activeTab,
    currentStatus,
    currencyOptions: transactionCurrency.currencyOptions,
    defaultAccounts,
    defaultAccountStore,
    errors,
    existingVoucher,
    isDefaultAccountDrawerOpen,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isPartyNameDrawerOpen,
    isProjectNameDrawerOpen,
    isReadonly,
    isRecordMissing,
    isReportPreviewOpen,
    isSubmitting,
    isResponsibilityCenterDrawerOpen,
    mode,
    partyStore,
    responsibilityCenterStore,
    returnLink: isRecordMissing ? CashVoucherLink : returnLink,
    selectedTransaction,
    totalCredit,
    totalDebit,
    values,
    handleAddEntries,
    handleClearEntries,
    handleCopyFrom,
    handleCreateParty,
    handleCreateProject,
    handleCreateResponsibilityCenter,
    handleCurrencyChange,
    handleDuplicateEntry,
    handleInsertEntry,
    handleMoveEntry,
    handleOpenResponsibilityCenterDrawer,
    handlePartyChange,
    handleRemoveEntry,
    handleReplaceLineEntries,
    handleSubmit,
    handleUpdateEntry,
    handleUpdateEntryFields,
    handleUpdateStatus,
    setActiveTab,
    setIsDefaultAccountDrawerOpen,
    setIsPartyNameDrawerOpen,
    setIsProjectNameDrawerOpen,
    setIsReportPreviewOpen,
    handleCloseResponsibilityCenterDrawer,
    cancelCashVoucherSubmit,
    confirmCashVoucherSubmit,
    pendingSubmitStatus: pendingSubmitValues?.status ?? null,
    requestCashVoucherSubmit,
    updateField,
    updatePaymentDetails,
  };
}

function shouldEntryRemarksFollowHeader(entryRemarks: string, previousHeaderRemarks: string) {
  const normalizedEntryRemarks = entryRemarks.trim();
  const normalizedHeaderRemarks = previousHeaderRemarks.trim();

  return normalizedEntryRemarks === "" || (normalizedHeaderRemarks !== "" && normalizedEntryRemarks === normalizedHeaderRemarks);
}



