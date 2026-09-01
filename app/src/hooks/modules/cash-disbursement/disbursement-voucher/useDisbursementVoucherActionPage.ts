"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createDisbursementVoucherPaymentTypeRecords,
  createBlankDisbursementLineEntry,
  createTaxDetails,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { clearAccountingGridSession } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingGridSessionData";
import {
  canUpdateDisbursementVoucherStatus,
  createInitialDisbursementVoucherFormValues,
  createManualDisbursementTransactionId,
  createVoucherActionReturnLink,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherActionData";
import {
  createAutomaticAccountingEntries,
  hasNonZeroAccountingAmount,
  isGeneratedAccountingEntry,
  normalizeDisbursementLineEntryFields,
  shouldSyncDisbursementEntryParty,
  syncDisbursementLineEntryTaxDetails,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingEntryData";
import {
  DisbursementVoucherLink,
  DisbursementVoucherStatuses,
  canEditDisbursementVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { DisbursementVoucherLineEntriesField } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
import {
  validateDisbursementVoucherDetails,
  validateDisbursementVoucherEntries,
} from "@/app/src/validations/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherValidation";
import { useBankMasterfileStore } from "@/app/src/hooks/modules/financial-maintenance/bank-masterfile/useBankMasterfile";
import { useDefaultAccountStore } from "@/app/src/hooks/modules/financial-maintenance/default-account/useDefaultAccount";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentType";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import type {
  DisbursementLineEntry,
  DisbursementVoucherActionMode,
  DisbursementVoucherActionTab,
  DisbursementVoucherBankAccount,
  DisbursementVoucherFormErrors,
  DisbursementVoucherFormValues,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import { useDisbursementVoucherStore } from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { DisbursementVoucherQueryKeys } from "@/app/src/services/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherQueryKeys";
import {
  createDisbursementVoucherApi,
  fetchDisbursementVoucherById,
  fetchDisbursementVoucherAccountOptions,
  fetchDisbursementVoucherExpenseAccountOptions,
  fetchDisbursementVoucherPartyOptions,
  fetchDisbursementVoucherResponsibilityCenters,
  fetchNextDisbursementVoucherTransactionNo,
  updateDisbursementVoucherApi,
  updateDisbursementVoucherStatusApi,
} from "@/app/src/services/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherApi";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import {
  clearDisbursementEntryRows,
  createDisbursementEntryRows,
  duplicateDisbursementEntryRow,
  insertDisbursementEntryRow,
  moveDisbursementEntryRow,
  removeDisbursementEntryRow,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherEntryRowData";

export function useDisbursementVoucherActionPage(mode: DisbursementVoucherActionMode) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const transactions = useDisbursementVoucherStore((state) => state.transactions);
  const vouchers = useDisbursementVoucherStore((state) => state.vouchers);
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const routeTransactionId = mode === "add" ? (searchParams.get("transactionId") ?? "") : (params.recordId ?? "");
  const routeTransaction = transactions.find((transaction) => transaction.id === routeTransactionId);
  const listVoucher = vouchers.find((voucher) => voucher.id === routeTransactionId || voucher.transactionId === routeTransactionId);
  const recordQuery = useQuery({
    queryKey: DisbursementVoucherQueryKeys.record(routeTransactionId, activeCompanyId, activeBranchId),
    queryFn: () => fetchDisbursementVoucherById(routeTransactionId),
    enabled: Boolean(routeTransactionId && mode !== "add"),
  });
  const partyOptionsQuery = useQuery({
    queryKey: DisbursementVoucherQueryKeys.parties(activeCompanyId),
    queryFn: fetchDisbursementVoucherPartyOptions,
    enabled: activeCompanyId !== null,
  });
  const accountOptionsQuery = useQuery({
    queryKey: DisbursementVoucherQueryKeys.accounts(activeCompanyId),
    queryFn: fetchDisbursementVoucherAccountOptions,
    enabled: activeCompanyId !== null,
  });
  const responsibilityCenterOptionsQuery = useQuery({
    queryKey: DisbursementVoucherQueryKeys.responsibilityCenters(activeCompanyId),
    queryFn: fetchDisbursementVoucherResponsibilityCenters,
    enabled: activeCompanyId !== null,
  });
  const expenseAccountOptionsQuery = useQuery({
    queryKey: DisbursementVoucherQueryKeys.expenseTypes(activeCompanyId),
    queryFn: fetchDisbursementVoucherExpenseAccountOptions,
    enabled: activeCompanyId !== null,
  });
  const routeVoucher = recordQuery.data ?? listVoucher;
  const returnLink = createVoucherActionReturnLink(searchParams.get("from"), routeTransactionId);
  const transactionCurrency = useTransactionCurrency();
  const [values, setValues] = useState<DisbursementVoucherFormValues>(() =>
    createInitialDisbursementVoucherFormValues({
      mode,
      transaction: routeTransaction,
      voucher: routeVoucher,
    }),
  );
  const [errors, setErrors] = useState<DisbursementVoucherFormErrors>({});
  const [pendingSubmitValues, setPendingSubmitValues] = useState<DisbursementVoucherFormValues | null>(null);
  const [activeTab, setActiveTab] = useState<DisbursementVoucherActionTab>("details");
  const [isBankMasterfileDrawerOpen, setIsBankMasterfileDrawerOpen] = useState(false);
  const [isDefaultAccountDrawerOpen, setIsDefaultAccountDrawerOpen] = useState(false);
  const [isPartyNameDrawerOpen, setIsPartyNameDrawerOpen] = useState(false);
  const [isPaymentTypeDrawerOpen, setIsPaymentTypeDrawerOpen] = useState(false);
  const [isProjectNameDrawerOpen, setIsProjectNameDrawerOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [pendingResponsibilityCenterEntryId, setPendingResponsibilityCenterEntryId] = useState<string | null>(null);
  const blankRemarksEntryIdsRef = useRef(new Set<string>());
  const generatedRemarksOverridesRef = useRef<Record<string, string>>({});
  const hasEditedCurrencyRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const submitLockReleaseRef = useRef<null | (() => void)>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bankMasterfileStore = useBankMasterfileStore();
  const defaultAccountStore = useDefaultAccountStore();
  const paymentTypeStore = usePaymentTypeStore();
  const paymentTypeRecords = useMemo(
    () => createDisbursementVoucherPaymentTypeRecords(paymentTypeStore.paymentTypes),
    [paymentTypeStore.paymentTypes],
  );
  const partyStore = usePartyManagementStore();
  const responsibilityCenterStore = useResponsibilityCenterStore();
  const bankAccounts = useMemo(
    () =>
      bankMasterfileStore.banks
        .filter((bank) => bank.status === "Active")
        .map((bank) => ({
          id: bank.id,
          accountCode: bank.accountCode,
          accountTitle: bank.accountTitle,
          bankName: bank.bankName,
          branch: bank.branch,
          accountName: bank.accountName,
          accountNo: bank.accountNumber,
        })),
    [bankMasterfileStore.banks],
  );
  const defaultAccounts = expenseAccountOptionsQuery.data ?? [];
  const selectedTransaction = transactions.find((transaction) => transaction.id === values.transactionId);
  const existingVoucher = routeVoucher ?? vouchers.find((voucher) => voucher.transactionId === values.transactionId);
  const currentStatus = existingVoucher?.status ?? selectedTransaction?.status ?? values.status;
  const isReadonly = mode === "view" || (mode === "edit" && !canEditDisbursementVoucherStatus(currentStatus));
  const totalDebit = useMemo(() => values.lineEntries.reduce((sum, entry) => sum + entry.debit, 0), [values.lineEntries]);
  const totalCredit = useMemo(() => values.lineEntries.reduce((sum, entry) => sum + entry.credit, 0), [values.lineEntries]);
  const selectedBankAccount = bankAccounts.find((account) => account.accountCode === values.paymentDetails.bankAccountCode) ?? null;
  const selectedPaymentTypeRecord = paymentTypeRecords.find((record) => record.paymentType === values.paymentMethod) ?? null;
  const routePaymentMethod = existingVoucher?.paymentMethod ?? selectedTransaction?.paymentMethod ?? "";
  const isCashVoucherRoute = (mode !== "add" || Boolean(routeTransactionId)) && routePaymentMethod === "Cash";
  const isRecordMissing = (mode !== "add" && !recordQuery.isLoading && !existingVoucher) || isCashVoucherRoute;
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty = mode === "add" ? hasModuleDraftChanges(values, initialValues, ["voucherNo"]) : rawIsDirty;
  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:disbursement-voucher", recordId: params.recordId }),
    setValues,
    values,
  });
  const refreshNextTransactionNo = useCallback(async () => {
    try {
      const nextTransactionNo = await fetchNextDisbursementVoucherTransactionNo(activeBranchId ?? undefined);
      if (!nextTransactionNo) return;

      setValues((current) => ({ ...current, voucherNo: nextTransactionNo, transactionId: nextTransactionNo }));
      setInitialValues((current) => ({ ...current, voucherNo: nextTransactionNo, transactionId: nextTransactionNo }));
    } catch {
      // Keep the current add form while transaction-number setup is unavailable.
    }
  }, [activeBranchId]);

  useEffect(() => {
    if (!existingVoucher || mode === "add") return;

    const nextValues = createInitialDisbursementVoucherFormValues({
      mode,
      transaction: routeTransaction,
      voucher: existingVoucher,
    });

    queueMicrotask(() => {
      setValues(nextValues);
      setInitialValues(nextValues);
    });
  }, [existingVoucher, mode, routeTransaction]);

  useEffect(() => {
    if (mode !== "add") return;

    queueMicrotask(() => {
      void refreshNextTransactionNo();
    });
  }, [mode, refreshNextTransactionNo]);

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
    setInitialValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      fxRate: "1.00",
    }));
  }, [mode, transactionCurrency.baseCurrencyCode, transactionCurrency.isBaseCurrencyResolved]);

  function updateField<TKey extends keyof DisbursementVoucherFormValues>(field: TKey, value: DisbursementVoucherFormValues[TKey]) {
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
          !blankRemarksEntryIdsRef.current.has(entry.id) && shouldEntryRemarksFollowHeader(entry, current.remarks)
            ? { ...entry, particulars: nextRemarks, remarks: nextRemarks }
            : entry,
        );
      const bankAccount = bankAccounts.find((account) => account.accountCode === current.paymentDetails.bankAccountCode) ?? null;

      return {
        ...nextValues,
        lineEntries: createAutomaticAccountingEntries(editableEntries, {
          bankAccount,
          blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
          generatedRemarksOverrides: generatedRemarksOverridesRef.current,
          paymentMethod: current.paymentMethod,
        }),
      };
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updatePaymentDetails(nextDetails: Partial<DisbursementVoucherFormValues["paymentDetails"]>) {
    updateField("paymentDetails", {
      ...values.paymentDetails,
      ...nextDetails,
    });
    setErrors((current) => {
      const nextErrors = { ...current };

      for (const field of Object.keys(nextDetails) as Array<keyof typeof nextDetails>) {
        if (field in nextErrors) {
          delete nextErrors[field as keyof typeof nextErrors];
        }
      }

      return nextErrors;
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

  function createAutomaticEntriesForPayment(
    entries: DisbursementLineEntry[],
    overrides: {
      bankAccount?: DisbursementVoucherBankAccount | null;
      paymentMethod?: string;
    } = {},
  ) {
    const nextPaymentMethod = overrides.paymentMethod ?? values.paymentMethod;
    const bankAccount = overrides.bankAccount !== undefined ? overrides.bankAccount : selectedBankAccount;

    return createAutomaticAccountingEntries(entries, {
      bankAccount,
      blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
      generatedRemarksOverrides: generatedRemarksOverridesRef.current,
      paymentMethod: nextPaymentMethod,
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
          shouldSyncDisbursementEntryParty(entry, previousPartyCode, previousPartyName)
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

  function syncEntriesForPaymentType(paymentMethod: string) {
    updateField(
      DisbursementVoucherLineEntriesField,
      createAutomaticEntriesForPayment(values.lineEntries, {
        bankAccount: selectedBankAccount,
        paymentMethod,
      }),
    );
  }

  function handlePaymentTypeChange(paymentMethod: string) {
    updateField("paymentMethod", paymentMethod);
    updatePaymentDetails({
      checkStatus: "",
      isMultiCheckNumber: false,
      payee: values.partyName,
      paymentReferenceNo: "",
      transferAccountName: "",
      transferAccountNo: "",
      transferTo: "",
      transferToBank: "",
    });
    syncEntriesForPaymentType(paymentMethod);
  }

  function handleBankAccountChange(accountCode: string) {
    const bankAccount = bankAccounts.find((account) => account.accountCode === accountCode) ?? null;

    if (!bankAccount) {
      updatePaymentDetails({
        bankAccountCode: "",
        bankAccountName: "",
        bankAccountNo: "",
        bankAccountTitle: "",
        bankBranch: "",
        bankName: "",
      });
      updateField(
        DisbursementVoucherLineEntriesField,
        createAutomaticEntriesForPayment(values.lineEntries, {
          bankAccount: null,
        }),
      );
      return;
    }

    updatePaymentDetails({
      bankAccountCode: bankAccount.accountCode,
      bankAccountName: bankAccount.accountName,
      bankAccountNo: bankAccount.accountNo,
      bankAccountTitle: bankAccount.accountTitle,
      bankBranch: bankAccount.branch,
      bankName: bankAccount.bankName,
    });
    updateField(
      DisbursementVoucherLineEntriesField,
      createAutomaticEntriesForPayment(values.lineEntries, {
        bankAccount,
      }),
    );
  }

  function createBlankEntry(): DisbursementLineEntry {
    const refId = values.voucherReferenceNo || selectedTransaction?.transactionNo || values.transactionId;
    const responsibilityCenter = values.costCenter || selectedTransaction?.costCenter || "";

    return createBlankDisbursementLineEntry({
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

  function replaceEntriesWithAutomaticRows(nextEntries: DisbursementLineEntry[]) {
    updateField(
      DisbursementVoucherLineEntriesField,
      createAutomaticEntriesForPayment(nextEntries.length > 0 ? nextEntries : [createBlankEntry()]),
    );
  }

  function handleAddEntries(count = 1) {
    updateField(DisbursementVoucherLineEntriesField, [...values.lineEntries, ...createDisbursementEntryRows(count, createBlankEntry)]);
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleRemoveEntry(entryId: string) {
    blankRemarksEntryIdsRef.current.delete(entryId);
    delete generatedRemarksOverridesRef.current[entryId];
    replaceEntriesWithAutomaticRows(removeDisbursementEntryRow(values.lineEntries, entryId));
  }

  function handleUpdateEntry(entryId: string, field: keyof DisbursementLineEntry, value: string | number) {
    handleUpdateEntryFields(entryId, { [field]: value });
  }

  function handleUpdateEntryFields(entryId: string, updates: Partial<DisbursementLineEntry>) {
    const sourceEntry = values.lineEntries.find((entry) => entry.id === entryId);
    const isEditableExpenseEntry = sourceEntry !== undefined && !isGeneratedAccountingEntry(sourceEntry);
    const hasRemarksUpdate =
      Object.prototype.hasOwnProperty.call(updates, "particulars") || Object.prototype.hasOwnProperty.call(updates, "remarks");
    const updatedRemarksValue = updates.particulars !== undefined ? updates.particulars : updates.remarks;

    if (isEditableExpenseEntry && hasRemarksUpdate) {
      if (String(updatedRemarksValue ?? "") === "") {
        blankRemarksEntryIdsRef.current.add(entryId);
      } else {
        blankRemarksEntryIdsRef.current.delete(entryId);
      }
    }

    if (sourceEntry && isGeneratedAccountingEntry(sourceEntry) && hasRemarksUpdate) {
      generatedRemarksOverridesRef.current[entryId] = String(updatedRemarksValue ?? "");
    }

    const nextEntries = values.lineEntries.map((entry) => {
      if (entry.id !== entryId) {
        return entry;
      }

      const nextEntry = normalizeDisbursementLineEntryFields({
        ...entry,
        ...updates,
      });

      if (Number(nextEntry.debit || 0) > 0) {
        nextEntry.credit = 0;
      }

      if (Number(nextEntry.credit || 0) > 0) {
        nextEntry.debit = 0;
      }

      return hasRemarksUpdate ? nextEntry : syncDisbursementLineEntryTaxDetails(nextEntry);
    });

    if (isEditableExpenseEntry) {
      handleReplaceLineEntries(createAutomaticEntriesForPayment(nextEntries));
    } else {
      updateField(DisbursementVoucherLineEntriesField, nextEntries);
    }
    setErrors((current) => ({
      ...current,
      entryDraft: undefined,
      lineEntries: undefined,
    }));
  }

  function handleInsertEntry(entryId: string, position: "above" | "below") {
    updateField(DisbursementVoucherLineEntriesField, insertDisbursementEntryRow(values.lineEntries, entryId, position, createBlankEntry));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleDuplicateEntry(entryId: string) {
    updateField(
      DisbursementVoucherLineEntriesField,
      duplicateDisbursementEntryRow(values.lineEntries, entryId, () => `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    );
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleMoveEntry(fromEntryId: string, toEntryId: string) {
    updateField(DisbursementVoucherLineEntriesField, moveDisbursementEntryRow(values.lineEntries, fromEntryId, toEntryId));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleClearEntries(action: ModuleDataEntryClearAction) {
    replaceEntriesWithAutomaticRows(clearDisbursementEntryRows(values.lineEntries, action));
    setErrors((current) => ({ ...current, lineEntries: undefined }));
  }

  function handleReplaceLineEntries(nextEntries: DisbursementLineEntry[]) {
    const amount = nextEntries
      .filter((entry) => !isGeneratedAccountingEntry(entry))
      .reduce((sum, entry) => sum + Number(entry.taxDetails.amount || 0), 0);

    updateField(DisbursementVoucherLineEntriesField, nextEntries);
    updateField("amount", hasNonZeroAccountingAmount(amount) ? amount.toFixed(2) : "");
    updateField("taxDetails", syncTaxDetailsAmount(values.taxDetails, amount, values.taxRate));
  }

  function requestDisbursementVoucherSubmit(status: DisbursementVoucherStatus) {
    if (isReadonly || isSubmittingRef.current) return;
    if (mode === "edit" && !isDirty && status === currentStatus) {
      toast.error("No changes to save.");
      return;
    }
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:disbursement-voucher:submit:${mode}:${params.recordId ?? values.transactionId}`,
    );
    if (!releaseSubmitLock) return;
    submitLockReleaseRef.current = releaseSubmitLock;

    const valuesForSubmit = {
      ...values,
      status,
      transactionId: values.transactionId.trim() || createManualDisbursementTransactionId(),
    };
    const shouldValidate = status !== DisbursementVoucherStatuses.draft;
    const detailsErrors = shouldValidate ? validateDisbursementVoucherDetails(valuesForSubmit, selectedPaymentTypeRecord) : {};
    const entryErrors = shouldValidate ? validateDisbursementVoucherEntries(valuesForSubmit) : {};
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

  async function confirmDisbursementVoucherSubmit() {
    if (!pendingSubmitValues || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const payload = {
        branchUnitId: activeBranchId ?? undefined,
        voucherNo: pendingSubmitValues.voucherNo,
        voucherDate: pendingSubmitValues.voucherDate,
        paymentDueDate: pendingSubmitValues.paymentDueDate,
        partyCode: pendingSubmitValues.partyCode,
        partyName: pendingSubmitValues.partyName,
        paymentMethod: pendingSubmitValues.paymentMethod || undefined,
        disbursementType: pendingSubmitValues.disbursementType || undefined,
        paymentDetails: pendingSubmitValues.paymentDetails,
        attachments: pendingSubmitValues.attachments,
        referenceModule: pendingSubmitValues.referenceModule,
        voucherReferenceNo: pendingSubmitValues.voucherReferenceNo,
        invoiceReferenceNo: pendingSubmitValues.invoiceReferenceNo,
        costCenter: pendingSubmitValues.costCenter,
        projectCode: pendingSubmitValues.costCenter,
        projectName: pendingSubmitValues.projectName,
        preparedBy: pendingSubmitValues.preparedBy,
        currency: pendingSubmitValues.currency,
        fxRate: pendingSubmitValues.fxRate,
        amount: pendingSubmitValues.amount,
        remarks: pendingSubmitValues.remarks,
        status: pendingSubmitValues.status,
        details: pendingSubmitValues.lineEntries,
      };

      if (mode === "edit" && existingVoucher) {
        await updateDisbursementVoucherApi(existingVoucher.id, payload);
        toast.success("Disbursement Voucher updated successfully.");
      } else {
        await createDisbursementVoucherApi(payload);
        toast.success("Disbursement Voucher created successfully.");
      }
      void queryClient.invalidateQueries({ queryKey: DisbursementVoucherQueryKeys.all(activeCompanyId, activeBranchId) });
      draft.clearDraft();
      setPendingSubmitValues(null);
      submitLockReleaseRef.current?.();
      submitLockReleaseRef.current = null;
      router.push(returnLink);
    } catch {
      toast.error("Could not save the Disbursement Voucher. Please try again.");
      setPendingSubmitValues(null);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      submitLockReleaseRef.current?.();
      submitLockReleaseRef.current = null;
    }
  }

  function cancelDisbursementVoucherSubmit() {
    setPendingSubmitValues(null);
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    submitLockReleaseRef.current?.();
    submitLockReleaseRef.current = null;
  }

  function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    requestDisbursementVoucherSubmit(DisbursementVoucherStatuses.forApproval);
  }

  async function handleUpdateStatus(status: DisbursementVoucherStatus) {
    if (!canUpdateDisbursementVoucherStatus(currentStatus, status)) {
      return;
    }
    const actionRecordId = existingVoucher?.id ?? selectedTransaction?.id;
    if (!actionRecordId) return;
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:disbursement-voucher:status:${actionRecordId}:${status}`);
    if (!releaseActionLock) return;

    try {
      await updateDisbursementVoucherStatusApi(actionRecordId, status);
      setValues((currentValues) => ({ ...currentValues, status }));
      void queryClient.invalidateQueries({ queryKey: DisbursementVoucherQueryKeys.all(activeCompanyId, activeBranchId) });
      void queryClient.invalidateQueries({
        queryKey: DisbursementVoucherQueryKeys.record(actionRecordId, activeCompanyId, activeBranchId),
      });
      toast.success(`Disbursement Voucher status updated to ${status}.`);
      releaseActionLock();
    } catch {
      toast.error("Could not update the Disbursement Voucher. Please try again.");
      releaseActionLock();
    }
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createInitialDisbursementVoucherFormValues({
      mode: "add",
      transaction: routeTransaction,
      voucher: routeVoucher,
    });

    try {
      const nextTransactionNo = await fetchNextDisbursementVoucherTransactionNo(activeBranchId ?? undefined);
      if (nextTransactionNo) {
        nextValues.voucherNo = nextTransactionNo;
        nextValues.transactionId = nextTransactionNo;
      }
    } catch {
      // Keep the add form available while transaction-number setup is unavailable.
    }

    setValues(nextValues);
    setInitialValues(nextValues);
  }

  function discardDraft() {
    draft.clearDraft();

    if (mode === "add") {
      void resetAddValuesWithNextTransactionNo();
      return;
    }

    draft.discardDraft();
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
    discardDraft,
    hasDiscardableChanges: isDirty,
    saveDraft: draft.saveDraft,
    activeTab,
    bankAccounts,
    chartAccountOptions: accountOptionsQuery.data ?? [],
    currentStatus,
    currencyOptions: transactionCurrency.currencyOptions,
    defaultAccounts,
    defaultAccountStore,
    errors,
    existingVoucher,
    isBankMasterfileDrawerOpen,
    isDefaultAccountDrawerOpen,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isPartyNameDrawerOpen,
    isPaymentTypeDrawerOpen,
    isProjectNameDrawerOpen,
    isReadonly,
    isRecordMissing,
    isReportPreviewOpen,
    isSubmitting,
    isResponsibilityCenterDrawerOpen,
    mode,
    partyOptions: partyOptionsQuery.data ?? [],
    partyStore,
    paymentTypeStore,
    paymentTypeRecords,
    projectOptions: responsibilityCenterOptionsQuery.data?.projects ?? [],
    responsibilityCenterOptions: responsibilityCenterOptionsQuery.data?.costCenters ?? [],
    responsibilityCenterStore,
    returnLink: isRecordMissing ? DisbursementVoucherLink : returnLink,
    selectedBankAccount,
    selectedPaymentTypeRecord,
    selectedTransaction,
    totalCredit,
    totalDebit,
    values,
    bankMasterfileStore,
    handleAddEntries,
    handleBankAccountChange,
    handleClearEntries,
    handleCreateParty,
    handleCreateProject,
    handleCreateResponsibilityCenter,
    handleCurrencyChange,
    handleDuplicateEntry,
    handleInsertEntry,
    handleMoveEntry,
    handleOpenResponsibilityCenterDrawer,
    handlePaymentTypeChange,
    handlePartyChange,
    handleRemoveEntry,
    handleReplaceLineEntries,
    handleSubmit,
    handleUpdateEntry,
    handleUpdateEntryFields,
    handleUpdateStatus,
    setActiveTab,
    setIsBankMasterfileDrawerOpen,
    setIsDefaultAccountDrawerOpen,
    setIsPartyNameDrawerOpen,
    setIsPaymentTypeDrawerOpen,
    setIsProjectNameDrawerOpen,
    setIsReportPreviewOpen,
    handleCloseResponsibilityCenterDrawer,
    cancelDisbursementVoucherSubmit,
    confirmDisbursementVoucherSubmit,
    pendingSubmitStatus: pendingSubmitValues?.status ?? null,
    requestDisbursementVoucherSubmit,
    updateField,
    updatePaymentDetails,
  };
}

function shouldEntryRemarksFollowHeader(entry: DisbursementLineEntry, previousHeaderRemarks: string) {
  const normalizedEntryRemarks = (entry.particulars || entry.remarks || "").trim();
  const normalizedHeaderRemarks = previousHeaderRemarks.trim();
  const normalizedCreatedRemarks = entry.accountName.trim();

  return (
    normalizedEntryRemarks === "" ||
    normalizedEntryRemarks === normalizedCreatedRemarks ||
    (normalizedHeaderRemarks !== "" && normalizedEntryRemarks === normalizedHeaderRemarks)
  );
}
