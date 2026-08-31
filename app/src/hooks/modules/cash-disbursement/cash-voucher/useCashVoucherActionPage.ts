"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createBlankCashVoucherLineEntry,
  createTaxDetails,
  syncTaxDetailsAmount,
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
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
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
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import type {
  CashVoucherLineEntry,
  CashVoucherActionMode,
  CashVoucherActionTab,
  CashVoucherFormErrors,
  CashVoucherFormValues,
  CashVoucherStatus,
  CashVoucherRecord,
  CashVoucherPartyDropdownOption,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { ChartAccount } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { getEwtPercentFromCode, getVatPercentFromRate, getVatRateFromCode } from "@/app/src/data/shared/tax/TaxData";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import {
  clearCashVoucherEntryRows,
  createCashVoucherEntryRows,
  duplicateCashVoucherEntryRow,
  insertCashVoucherEntryRow,
  moveCashVoucherEntryRow,
  removeCashVoucherEntryRow,
} from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherEntryRowData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { CashVoucherQueryKeys } from "@/app/src/services/modules/cash-disbursement/cash-voucher/CashVoucherQueryKeys";
import { FetchChartAccountsTree } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsApi";
import { ChartsOfAccountsQueryKeys } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsQueryKeys";
import {
  createCashVoucherApi,
  fetchCashVoucherById,
  fetchNextCashVoucherTransactionNo,
  updateCashVoucherApi,
  updateCashVoucherStatusApi,
} from "@/app/src/services/modules/cash-disbursement/cash-voucher/CashVoucherApi";

export function useCashVoucherActionPage(mode: CashVoucherActionMode) {
  const router = useRouter();
  const params = useParams<{ recordId?: string }>();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const recordId = params.recordId ?? "";
  const returnLink = createVoucherActionReturnLink(searchParams.get("from"), recordId);
  const transactionCurrency = useTransactionCurrency();

  const [values, setValues] = useState<CashVoucherFormValues>(() =>
    createInitialCashVoucherFormValues({
      mode,
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
  const blankRemarksEntryIdsRef = useRef(new Set<string>());
  const generatedRemarksOverridesRef = useRef<Record<string, string>>({});
  const hasEditedCurrencyRef = useRef(false);
  const hydratedPartyTaxDefaultsRecordIdRef = useRef("");
  const isSubmittingRef = useRef(false);
  const submitLockReleaseRef = useRef<null | (() => void)>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultAccountStore = useDefaultAccountStore();
  const partyStore = usePartyManagementStore();
  const responsibilityCenterStore = useResponsibilityCenterStore();
  const defaultAccounts = defaultAccountStore.defaultAccounts;
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const chartAccountsQuery = useQuery({
    queryKey: ChartsOfAccountsQueryKeys.tree(activeCompanyId),
    queryFn: FetchChartAccountsTree,
    enabled: activeCompanyId !== null,
    staleTime: 60_000,
  });
  const cashOnHandAccount = useMemo(() => findCashOnHandAccount(chartAccountsQuery.data ?? []), [chartAccountsQuery.data]);
  const partyOptions = useMemo<CashVoucherPartyDropdownOption[]>(() => {
    const optionsByCode = new Map<string, CashVoucherPartyDropdownOption>();

    partyStore.records.forEach((record) => {
      if (record.status !== "Active") {
        return;
      }

      const partyCode = record.partyCodeNo.trim();
      const partyName = getPartyDisplayName(record).trim() || partyCode;

      if (!partyCode || optionsByCode.has(partyCode)) {
        return;
      }

      optionsByCode.set(partyCode, {
        description: record.partyTypes.join(", "),
        defaultPurchaseInputVatTaxSourceKey: record.defaultPurchaseInputVatTaxSourceKey,
        defaultPurchaseEwtTaxSourceKey: record.defaultPurchaseEwtTaxSourceKey,
        defaultSalesOutputVatTaxSourceKey: record.defaultSalesOutputVatTaxSourceKey,
        defaultSalesCwtTaxSourceKey: record.defaultSalesCwtTaxSourceKey,
        label: partyCode,
        name: partyName,
        selectedDetails: partyCode,
        value: partyCode,
      });
    });

    return Array.from(optionsByCode.values()).sort((first, second) => first.name.localeCompare(second.name));
  }, [partyStore.records]);
  const responsibilityCenterOptions = useMemo<AppAdvancedDropdownOption[]>(() => {
    return responsibilityCenterStore.centers
      .filter((center) => center.status === "Active")
      .map((center) => ({
        description: center.typeName || center.category || "",
        label: center.code,
        name: center.name,
        selectedDetails: center.code,
        value: center.name,
      }))
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [responsibilityCenterStore.centers]);
  const copyFromRecords = useMemo(() => [], []);

  // Query single record if edit or view mode
  const recordQuery = useQuery({
    queryKey: CashVoucherQueryKeys.record(recordId, activeCompanyId, activeBranchId),
    queryFn: () => fetchCashVoucherById(recordId),
    enabled: Boolean(recordId && mode !== "add"),
  });

  const existingVoucher: CashVoucherRecord | undefined = recordQuery.data;

  // Auto-populate values when existing record is loaded
  useEffect(() => {
    if (!existingVoucher || mode === "add") return;

    const rawDetails: Array<Record<string, unknown>> = (
      existingVoucher.lineEntries && existingVoucher.lineEntries.length > 0
        ? existingVoucher.lineEntries
        : (existingVoucher as unknown as { details?: Array<Record<string, unknown>> }).details || []
    ) as Array<Record<string, unknown>>;

    const mappedEntries: CashVoucherLineEntry[] = rawDetails.map((d, index) => {
      const grossAmount = getHydratedCashVoucherGrossAmount(d);
      const vatPercent = getCashVoucherDetailNumber(d, "vatPercent");
      const ewtPercent = getCashVoucherDetailNumber(d, "ewtPercent");
      const taxDetails = syncTaxDetailsAmount(
        {
          ...createTaxDetails(grossAmount, "0%"),
          vatType: (d.vatType as string) || "",
          vatCode: getCashVoucherDetailString(d, "vatCode"),
          vatPercent,
          ewtCode: getCashVoucherDetailString(d, "ewtCode"),
          ewtPercent,
          refId: (d.refId as string) || existingVoucher.voucherNo,
          responsibilityCenter: (d.responsibilityCenter as string) || existingVoucher.costCenter || "",
        },
        grossAmount,
        "0%",
      );

      return {
        id: d.id ? String(d.id) : `entry-${index + 1}`,
        accountCode: (d.accountCode as string) || "",
        accountName: (d.accountTitle as string) || (d.accountName as string) || "",
        particulars: (d.particulars as string) || (d.remarks as string) || "",
        remarks: (d.remarks as string) || "",
        debit: Number(d.debit || 0),
        credit: Number(d.credit || 0),
        taxRate: vatPercent > 0 ? `${vatPercent}%` : "0%",
        taxDetails,
        partyCode: (d.partyCode as string) || existingVoucher.partyCode,
        partyName: (d.partyName as string) || existingVoucher.partyName,
        responsibilityCenter: (d.responsibilityCenter as string) || existingVoucher.costCenter || "",
        refId: (d.refId as string) || existingVoucher.voucherNo,
        checkDate: (d.checkDate as string) || "",
        checkNo: (d.checkNo as string) || "",
        checkStatus: (d.checkStatus as string) || "",
        status: "Balanced",
      };
    });
    const voucherGrossAmount =
      mappedEntries
        .filter((entry) => !isGeneratedAccountingEntry(entry))
        .reduce((sum, entry) => sum + Number(entry.taxDetails.grossAmount || 0), 0) || existingVoucher.amount || 0;

    queueMicrotask(() => {
      const nextValues = {
        transactionId: existingVoucher.id,
        voucherNo: existingVoucher.voucherNo,
        voucherDate: existingVoucher.voucherDate,
        paymentDueDate: existingVoucher.paymentDueDate || existingVoucher.voucherDate,
        paymentMethod: (existingVoucher.paymentMethod as "Cash") || "Cash",
        disbursementType: existingVoucher.disbursementType || "Vendor Payment",
        currency: existingVoucher.currency || "PHP",
        fxRate: String(existingVoucher.fxRate ?? "1.00"),
        costCenter: existingVoucher.projectCode || existingVoucher.costCenter || "",
        projectCode: existingVoucher.projectCode || existingVoucher.costCenter || "",
        projectName: existingVoucher.projectName || "",
        partyCode: existingVoucher.partyCode || "",
        partyName: existingVoucher.partyName || "",
        amount: String(voucherGrossAmount),
        taxRate: "0%",
        taxDetails: createTaxDetails(voucherGrossAmount, "0%"),
        remarks: existingVoucher.remarks || "",
        referenceModule: existingVoucher.referenceModule || "",
        voucherReferenceNo: existingVoucher.voucherReferenceNo || "",
        invoiceReferenceNo: existingVoucher.invoiceReferenceNo || "",
        paymentDetails: {
          bankAccountCode: "",
          bankAccountName: "",
          bankAccountNo: "",
          bankAccountTitle: "",
          bankBranch: "",
          bankName: "",
          checkDate: "",
          checkNo: "",
          paymentReferenceNo: "",
        },
        preparedBy: existingVoucher.preparedBy || "",
        status: existingVoucher.status || "Draft",
        lineEntries: mappedEntries.length > 0 ? mappedEntries : createInitialCashVoucherFormValues({ mode }).lineEntries,
        attachments: existingVoucher.attachments || [],
      };
      setValues(nextValues);
      setInitialValues(nextValues);
    });
  }, [existingVoucher, mode]);

  useEffect(() => {
    if (!existingVoucher || mode === "add" || partyOptions.length === 0 || taxCodes.length === 0) {
      return;
    }

    const recordKey = String(existingVoucher.id);
    if (hydratedPartyTaxDefaultsRecordIdRef.current === recordKey) {
      return;
    }

    function applyDefaults(current: CashVoucherFormValues) {
      if (String(current.transactionId) !== recordKey) {
        return current;
      }

      const hydrated = applyMissingPartyTaxDefaultsToEntries(current.lineEntries, partyOptions, taxCodes);
      if (!hydrated.changed) {
        return current;
      }

      return {
        ...current,
        lineEntries: createAutomaticAccountingEntries(hydrated.entries, {
          bankAccount: null,
          blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
          cashAccount: cashOnHandAccount,
          generatedRemarksOverrides: generatedRemarksOverridesRef.current,
          isCashPayment: true,
          paymentMethod: "Cash",
        }),
      };
    }

    queueMicrotask(() => {
      setValues(applyDefaults);
      setInitialValues(applyDefaults);
      hydratedPartyTaxDefaultsRecordIdRef.current = recordKey;
    });
  }, [cashOnHandAccount, existingVoucher, mode, partyOptions, taxCodes]);

  // Load next transaction number on create mode
  useEffect(() => {
    if (mode !== "add") return;

    void refreshNextTransactionNo();
  }, [mode]);

  const currentStatus = existingVoucher?.status ?? values.status;
  const isReadonly = mode === "view" || (mode === "edit" && !canEditCashVoucherStatus(currentStatus));
  const totalDebit = useMemo(() => values.lineEntries.reduce((sum, entry) => sum + entry.debit, 0), [values.lineEntries]);
  const totalCredit = useMemo(() => values.lineEntries.reduce((sum, entry) => sum + entry.credit, 0), [values.lineEntries]);
  const isRecordMissing = mode !== "add" && !recordQuery.isLoading && !existingVoucher;
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty = mode === "add" ? hasModuleDraftChanges(values, initialValues, ["transactionId", "voucherNo"]) : rawIsDirty;
  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:cash-voucher", recordId: params.recordId }),
    restoreValues: mode === "add" ? restoreCashVoucherAddDraftValues : undefined,
    setValues,
    values,
  });

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createInitialCashVoucherFormValues({ mode: "add" });

    try {
      const nextTransNo = await fetchNextCashVoucherTransactionNo();

      if (nextTransNo) {
        nextValues.voucherNo = nextTransNo;
        nextValues.transactionId = nextTransNo;
      }
    } catch {
      // Keep the blank add form if the number endpoint is temporarily unavailable.
    }

    setValues(nextValues);
    setInitialValues(nextValues);
  }

  async function refreshNextTransactionNo() {
    try {
      const nextTransNo = await fetchNextCashVoucherTransactionNo();

      if (nextTransNo) {
        setValues((current) => ({
          ...current,
          voucherNo: nextTransNo,
          transactionId: nextTransNo,
        }));
        setInitialValues((current) => ({
          ...current,
          voucherNo: nextTransNo,
          transactionId: nextTransNo,
        }));
      }
    } catch {
      // Keep the current add form if the number endpoint is temporarily unavailable.
    }
  }

  function discardDraft() {
    draft.clearDraft();

    if (mode === "add") {
      void resetAddValuesWithNextTransactionNo();
      return;
    }

    draft.discardDraft();
  }

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
          !blankRemarksEntryIdsRef.current.has(entry.id) && shouldEntryRemarksFollowHeader(entry, current.remarks)
            ? { ...entry, particulars: nextRemarks, remarks: nextRemarks }
            : entry,
        );

      return {
        ...nextValues,
        lineEntries: createAutomaticAccountingEntries(editableEntries, {
          bankAccount: null,
          blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
          generatedRemarksOverrides: generatedRemarksOverridesRef.current,
          isCashPayment: true,
          paymentMethod: "Cash",
          cashAccount: cashOnHandAccount,
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
      blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
      generatedRemarksOverrides: generatedRemarksOverridesRef.current,
      isCashPayment: true,
      paymentMethod: "Cash",
      cashAccount: cashOnHandAccount,
    });
  }

  function handlePartyChange(partyCode: string, partyName: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const previousPartyCode = current.partyCode;
      const previousPartyName = current.partyName;
      const selectedParty = partyStore.records.find((record) => record.partyCodeNo === partyCode);
      const vatCode = findPartyTaxCode(taxCodes, selectedParty?.defaultPurchaseInputVatTaxSourceKey, "VAT");
      const ewtCode = findPartyTaxCode(taxCodes, selectedParty?.defaultPurchaseEwtTaxSourceKey, "EWT");
      const vatPercent = vatCode ? getVatPercentFromRate(getVatRateFromCode(vatCode, taxCodes)) : 0;
      const ewtPercent = ewtCode ? getEwtPercentFromCode(ewtCode, taxCodes) : 0;
      const nextEntries = current.lineEntries.map((entry) =>
        shouldSyncCashVoucherEntryParty(entry, previousPartyCode, previousPartyName)
          ? applyPartyTaxDefaults({ ...entry, partyCode, partyName }, vatCode, ewtCode, vatPercent, ewtPercent)
          : entry,
      );

      return {
        ...current,
        partyCode,
        partyName,
        paymentDetails: {
          ...current.paymentDetails,
          payee: partyName,
        },
        lineEntries: createAutomaticAccountingEntries(nextEntries, {
          bankAccount: null,
          blankRemarksEntryIds: Array.from(blankRemarksEntryIdsRef.current),
          cashAccount: cashOnHandAccount,
          generatedRemarksOverrides: generatedRemarksOverridesRef.current,
          isCashPayment: true,
          paymentMethod: "Cash",
        }),
      };
    });
    setErrors((current) => ({
      ...current,
      partyCode: undefined,
      partyName: undefined,
    }));
  }

  function createBlankEntry(): CashVoucherLineEntry {
    const refId = values.voucherReferenceNo || values.voucherNo || values.transactionId;
    const responsibilityCenter = values.costCenter || "";

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
    updateField(CashVoucherLineEntriesField, createAutomaticEntriesForPayment(nextEntries.length > 0 ? nextEntries : [createBlankEntry()]));
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
    blankRemarksEntryIdsRef.current.delete(entryId);
    delete generatedRemarksOverridesRef.current[entryId];
    replaceEntriesWithAutomaticRows(removeCashVoucherEntryRow(values.lineEntries, entryId));
  }

  function handleUpdateEntry(entryId: string, field: keyof CashVoucherLineEntry, value: string | number) {
    handleUpdateEntryFields(entryId, { [field]: value });
  }

  function handleUpdateEntryFields(entryId: string, updates: Partial<CashVoucherLineEntry>) {
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

      return hasRemarksUpdate ? nextEntry : syncCashVoucherLineEntryTaxDetails(nextEntry);
    });

    if (isEditableExpenseEntry) {
      handleReplaceLineEntries(createAutomaticEntriesForPayment(nextEntries));
    } else {
      updateField(CashVoucherLineEntriesField, nextEntries);
    }
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
      .reduce((sum, entry) => sum + Number(entry.taxDetails.grossAmount || 0), 0);

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
    setPendingSubmitValues(valuesForSubmit);
  }

  async function confirmCashVoucherSubmit() {
    if (!pendingSubmitValues || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      if (mode === "edit" && recordId) {
        await updateCashVoucherApi(recordId, {
          branchUnitId: activeBranchId ?? undefined,
          voucherDate: pendingSubmitValues.voucherDate,
          partyCode: pendingSubmitValues.partyCode,
          partyName: pendingSubmitValues.partyName,
          costCenter: pendingSubmitValues.projectCode || pendingSubmitValues.costCenter,
          projectCode: pendingSubmitValues.projectCode || pendingSubmitValues.costCenter,
          projectName: pendingSubmitValues.projectName,
          preparedBy: pendingSubmitValues.preparedBy,
          currency: pendingSubmitValues.currency,
          fxRate: pendingSubmitValues.fxRate,
          amount: pendingSubmitValues.amount,
          remarks: pendingSubmitValues.remarks,
          status: pendingSubmitValues.status,
          details: pendingSubmitValues.lineEntries,
        });
        toast.success("Cash Voucher updated successfully.");
      } else {
        await createCashVoucherApi({
          branchUnitId: activeBranchId ?? undefined,
          voucherNo: pendingSubmitValues.voucherNo,
          voucherDate: pendingSubmitValues.voucherDate,
          partyCode: pendingSubmitValues.partyCode,
          partyName: pendingSubmitValues.partyName,
          costCenter: pendingSubmitValues.projectCode || pendingSubmitValues.costCenter,
          projectCode: pendingSubmitValues.projectCode || pendingSubmitValues.costCenter,
          projectName: pendingSubmitValues.projectName,
          preparedBy: pendingSubmitValues.preparedBy,
          currency: pendingSubmitValues.currency,
          fxRate: pendingSubmitValues.fxRate,
          amount: pendingSubmitValues.amount,
          remarks: pendingSubmitValues.remarks,
          status: pendingSubmitValues.status,
          details: pendingSubmitValues.lineEntries,
        });
        toast.success("Cash Voucher created successfully.");
      }

      void queryClient.invalidateQueries({ queryKey: CashVoucherQueryKeys.all(activeCompanyId, activeBranchId) });
      draft.clearDraft();
      setPendingSubmitValues(null);
      submitLockReleaseRef.current = null;
      router.push(CashVoucherLink);
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

  async function handleUpdateStatus(status: CashVoucherStatus) {
    if (!canUpdateCashVoucherStatus(currentStatus, status)) {
      return;
    }
    const actionRecordId = recordId || values.transactionId;
    if (!actionRecordId) return;
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:cash-voucher:status:${actionRecordId}:${status}`);
    if (!releaseActionLock) return;

    try {
      await updateCashVoucherStatusApi(actionRecordId, status);
      setValues((currentValues) => ({ ...currentValues, status }));
      void queryClient.invalidateQueries({ queryKey: CashVoucherQueryKeys.all(activeCompanyId, activeBranchId) });
      void queryClient.invalidateQueries({ queryKey: CashVoucherQueryKeys.record(actionRecordId, activeCompanyId, activeBranchId) });
      toast.success(`Cash Voucher status updated to ${status}.`);
      releaseActionLock();
    } catch {
      toast.error("Could not update the Cash Voucher status. Please try again.");
      releaseActionLock();
    }
  }

  function handleCopyFrom() {
    toast.error("Copy From records are not available yet.");
  }

  function handleCreateParty(record: Parameters<typeof getPartyDisplayName>[0]) {
    const partyName = getPartyDisplayName(record);

    handlePartyChange(record.partyCodeNo, partyName);
    setIsPartyNameDrawerOpen(false);
  }

  function handleCreateProject(project: ResponsibilityCenter) {
    updateField("projectName", project.name);
    updateField("costCenter", project.code);
    updateField("projectCode", project.code);
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
    currentStatus,
    currencyOptions: transactionCurrency.currencyOptions,
    copyFromRecords,
    defaultAccounts,
    defaultAccountStore,
    errors,
    existingVoucher,
    isDefaultAccountDrawerOpen,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isLoading: recordQuery.isLoading,
    isPartyNameDrawerOpen,
    isProjectNameDrawerOpen,
    isReadonly,
    isRecordMissing,
    isReportPreviewOpen,
    isSubmitting,
    isResponsibilityCenterDrawerOpen,
    mode,
    partyStore,
    partyOptions,
    responsibilityCenterOptions,
    responsibilityCenterStore,
    returnLink: isRecordMissing ? CashVoucherLink : returnLink,
    selectedTransaction: undefined,
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

function shouldEntryRemarksFollowHeader(entry: CashVoucherLineEntry, previousHeaderRemarks: string) {
  const normalizedEntryRemarks = (entry.particulars || entry.remarks || "").trim();
  const normalizedHeaderRemarks = previousHeaderRemarks.trim();
  const normalizedCreatedRemarks = entry.accountName.trim();

  return (
    normalizedEntryRemarks === "" ||
    normalizedEntryRemarks === normalizedCreatedRemarks ||
    (normalizedHeaderRemarks !== "" && normalizedEntryRemarks === normalizedHeaderRemarks)
  );
}

function restoreCashVoucherAddDraftValues(draftValues: CashVoucherFormValues): CashVoucherFormValues {
  return {
    ...draftValues,
    status: CashVoucherStatuses.open,
  };
}

function findCashOnHandAccount(accounts: ChartAccount[]): { accountCode: string; accountName: string } | undefined {
  for (const account of accounts) {
    if (account.status === "Active" && account.isPostingAccount && account.accountName.trim().toLowerCase() === "cash on hand") {
      return {
        accountCode: account.accountNumber,
        accountName: account.accountName,
      };
    }

    const childAccount = findCashOnHandAccount(account.children ?? []);

    if (childAccount) {
      return childAccount;
    }
  }

  return undefined;
}

function applyMissingPartyTaxDefaultsToEntries(
  entries: CashVoucherLineEntry[],
  partyOptions: CashVoucherPartyDropdownOption[],
  taxCodes: AlphanumericTaxCode[],
) {
  let changed = false;

  const nextEntries = entries.map((entry) => {
    if (isGeneratedAccountingEntry(entry)) {
      return entry;
    }

    const partyCode = (entry.partyCode ?? "").trim();
    const partyName = (entry.partyName ?? "").trim();

    if (!partyCode && !partyName) {
      return entry;
    }

    const selectedParty = partyOptions.find(
      (option) =>
        option.value === partyCode ||
        option.label === partyCode ||
        option.name.trim().toLowerCase() === partyName.toLowerCase(),
    );

    if (!selectedParty) {
      return entry;
    }

    const defaultVatCode = selectedParty.vatCode || findPartyTaxCode(taxCodes, selectedParty.defaultPurchaseInputVatTaxSourceKey, "VAT");
    const defaultEwtCode = selectedParty.ewtCode || findPartyTaxCode(taxCodes, selectedParty.defaultPurchaseEwtTaxSourceKey, "EWT");
    const currentVatCode = entry.taxDetails?.vatCode || entry.vatType || "";
    const currentEwtCode = entry.taxDetails?.ewtCode || entry.ewtCode || "";
    const nextVatCode = currentVatCode || defaultVatCode;
    const nextEwtCode = currentEwtCode || defaultEwtCode;

    if (currentVatCode === nextVatCode && currentEwtCode === nextEwtCode) {
      return entry;
    }

    changed = true;

    const nextTaxRate = nextVatCode ? getVatRateFromCode(nextVatCode, taxCodes) : entry.taxRate;
    const nextVatPercent = nextVatCode ? getVatPercentFromRate(nextTaxRate) : (entry.taxDetails?.vatPercent ?? 0);
    const nextEwtPercent = nextEwtCode ? getEwtPercentFromCode(nextEwtCode, taxCodes) : (entry.taxDetails?.ewtPercent ?? 0);

    return {
      ...applyPartyTaxDefaults(
        {
          ...entry,
          partyCode: partyCode || selectedParty.label,
          partyName: partyName || selectedParty.name,
        },
        nextVatCode,
        nextEwtCode,
        nextVatPercent,
        nextEwtPercent,
      ),
      taxRate: nextTaxRate,
    };
  });

  return { changed, entries: nextEntries };
}

function getHydratedCashVoucherGrossAmount(detail: Record<string, unknown>) {
  const storedGrossAmount = getCashVoucherDetailNumber(detail, "grossAmount");
  const debitAmount = getCashVoucherDetailNumber(detail, "debit");
  const vatPercent = getCashVoucherDetailNumber(detail, "vatPercent");

  if (storedGrossAmount > 0 && debitAmount > 0 && vatPercent > 0 && Math.abs(storedGrossAmount - debitAmount) <= 0.01) {
    const netRatio = 1 - vatPercent / 100;

    if (netRatio > 0) {
      return roundHydratedCashVoucherAmount(debitAmount / netRatio);
    }
  }

  return storedGrossAmount || debitAmount;
}

function getCashVoucherDetailNumber(detail: Record<string, unknown>, key: string) {
  const taxDetails = detail.taxDetails as Record<string, unknown> | undefined;
  const value = detail[key] ?? taxDetails?.[key];
  const amount = Number(value || 0);

  return Number.isFinite(amount) ? amount : 0;
}

function getCashVoucherDetailString(detail: Record<string, unknown>, key: string) {
  const taxDetails = detail.taxDetails as Record<string, unknown> | undefined;
  const value = detail[key] ?? taxDetails?.[key];

  return typeof value === "string" ? value : "";
}

function roundHydratedCashVoucherAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function findPartyTaxCode(taxCodes: AlphanumericTaxCode[], sourceKey: string | undefined, taxType: "EWT" | "VAT") {
  if (!sourceKey) {
    return "";
  }

  const taxCode = taxCodes.find(
    (tax) =>
      tax.sourceKey === sourceKey &&
      (taxType === "VAT" ? tax.taxType === "INPUT VAT" || tax.taxType === "VAT" : tax.taxType === "EWT" || tax.taxType === "CWT"),
  );

  return taxCode ? (taxType === "EWT" ? taxCode.officialAtcCode || taxCode.taxCode : taxCode.taxCode) : "";
}

function applyPartyTaxDefaults(entry: CashVoucherLineEntry, vatCode: string, ewtCode: string, vatPercent: number, ewtPercent: number) {
  const taxDetails = syncTaxDetailsAmount(
    {
      ...entry.taxDetails,
      ewtCode,
      ewtPercent,
      vatCode,
      vatPercent,
      vatType: vatCode,
    },
    parseMoneyNumberInput(entry.taxDetails?.grossAmount ?? entry.debit ?? entry.credit),
    "0%",
  );

  return {
    ...entry,
    ewtCode,
    partyCode: entry.partyCode,
    partyName: entry.partyName,
    taxDetails,
    vatType: vatCode,
  };
}
