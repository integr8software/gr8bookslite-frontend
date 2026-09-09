"use client";

import { PettyCashReplenishmentActionModes } from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  applyPettyCashFundToReplenishmentForm,
  calculatePettyCashReplenishmentItemTaxFields,
  calculatePettyCashReplenishmentTotals,
  createBlankPettyCashReplenishmentEntry,
  createPettyCashReplenishmentFormValues,
  formatPettyCashReplenishmentAmount,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentData";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import type {
  PettyCashReplenishmentActionMode,
  PettyCashReplenishmentActionTab,
  PettyCashReplenishmentEntry,
  PettyCashReplenishmentFormErrors,
  PettyCashReplenishmentFormValues,
  PettyCashReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import { validatePettyCashReplenishmentForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentValidation";
import {
  createPettyCashReplenishmentApi,
  fetchNextPettyCashReplenishmentNo,
  fetchPettyCashReplenishmentById,
  updatePettyCashReplenishmentApi,
  updatePettyCashReplenishmentStatusApi,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentApi";
import { PettyCashReplenishmentQueryKeys } from "@/app/src/services/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentQueryKeys";
import { fetchPettyCashVoucherCopyFromCandidates } from "@/app/src/services/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherApi";
import { fetchPettyCashFundCopyFromCandidates } from "@/app/src/services/modules/cash-disbursement/petty-cash-fund/PettyCashFundApi";
import { PettyCashVoucherQueryKeys } from "@/app/src/services/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherQueryKeys";
import { PettyCashFundQueryKeys } from "@/app/src/services/modules/cash-disbursement/petty-cash-fund/PettyCashFundQueryKeys";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  buildCashDisbursementCopyRecordSet,
  findPaymentVoucherCopyCandidates,
  PaymentVoucherCopyPrefixes,
  scalePaymentVoucherCopyAmount,
} from "@/app/src/data/modules/cash-disbursement/shared/PaymentVoucherCopyFromData";

export function usePettyCashReplenishmentActionPage(options: { mode: PettyCashReplenishmentActionMode; onSaved?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const { mode } = options;
  const isReadonly = mode === PettyCashReplenishmentActionModes.View;

  const recordQuery = useQuery({
    queryKey: PettyCashReplenishmentQueryKeys.record(params.recordId),
    queryFn: () => fetchPettyCashReplenishmentById(params.recordId!),
    enabled: Boolean(params.recordId) && mode !== PettyCashReplenishmentActionModes.Add,
  });

  const record = recordQuery.data;

  const [values, setValues] = useState<PettyCashReplenishmentFormValues>(() =>
    createPettyCashReplenishmentFormValues(record, "", transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<PettyCashReplenishmentFormErrors>({});
  const [activeTab, setActiveTab] = useState<PettyCashReplenishmentActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty =
    mode === PettyCashReplenishmentActionModes.Add ? hasModuleDraftChanges(values, initialValues, ["transactionNo"]) : rawIsDirty;

  async function refreshNextTransactionNo() {
    try {
      const nextNo = await fetchNextPettyCashReplenishmentNo();

      if (nextNo) {
        setValues((current) => ({ ...current, transactionNo: nextNo }));
        setInitialValues((current) => ({ ...current, transactionNo: nextNo }));
      }
    } catch {
      // Keep the current add form if the number endpoint is temporarily unavailable.
    }
  }

  useEffect(() => {
    if (record) {
      const formVals = createPettyCashReplenishmentFormValues(record, record.transactionNo, record.currency || "PHP");
      queueMicrotask(() => {
        setValues(formVals);
        setInitialValues(formVals);
      });
    }
  }, [record]);

  useEffect(() => {
    if (mode === PettyCashReplenishmentActionModes.Add) {
      queueMicrotask(() => void refreshNextTransactionNo());
    }
  }, [mode]);

  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:petty-cash-replenishment", recordId: params.recordId }),
    setValues,
    values,
  });

  const totals = useMemo(() => calculatePettyCashReplenishmentTotals(values.entries), [values.entries]);
  const selectedPartyCode = values.partyCode.trim();
  const pettyCashVoucherCandidatesQuery = useQuery({
    queryKey: [
      ...PettyCashVoucherQueryKeys.all,
      "copy-from",
      "petty-cash-replenishment",
      activeCompanyId,
      activeBranchId,
      selectedPartyCode,
    ],
    queryFn: () =>
      fetchPettyCashVoucherCopyFromCandidates({
        branchUnitId: activeBranchId,
        partyCode: selectedPartyCode,
      }),
    enabled: activeCompanyId !== null && mode === PettyCashReplenishmentActionModes.Add,
  });
  const pettyCashFundCandidatesQuery = useQuery({
    queryKey: [...PettyCashFundQueryKeys.all, "copy-from", "petty-cash-replenishment", activeCompanyId, activeBranchId, selectedPartyCode],
    queryFn: () =>
      fetchPettyCashFundCopyFromCandidates({
        branchUnitId: activeBranchId,
        partyCode: selectedPartyCode,
      }),
    enabled: activeCompanyId !== null && mode === PettyCashReplenishmentActionModes.Add,
  });
  const pettyCashVoucherCandidates = useMemo(() => pettyCashVoucherCandidatesQuery.data ?? [], [pettyCashVoucherCandidatesQuery.data]);
  const pettyCashFundCandidates = useMemo(() => pettyCashFundCandidatesQuery.data ?? [], [pettyCashFundCandidatesQuery.data]);
  const copiedPettyCashReferences = useMemo(
    () => new Set(values.entries.map((entry) => entry.pettyCashNo.trim()).filter(Boolean)),
    [values.entries],
  );
  const copyFromRecords = useMemo(
    () => [
      ...buildCashDisbursementCopyRecordSet({
        candidates: pettyCashVoucherCandidates,
        copiedReferences: copiedPettyCashReferences,
        prefix: PaymentVoucherCopyPrefixes.PettyCashVoucher,
        source: "Petty Cash Voucher",
      }),
      ...buildCashDisbursementCopyRecordSet({
        candidates: pettyCashFundCandidates,
        copiedReferences: copiedPettyCashReferences,
        prefix: PaymentVoucherCopyPrefixes.PettyCashFund,
        source: "Petty Cash Fund",
      }),
    ],
    [copiedPettyCashReferences, pettyCashFundCandidates, pettyCashVoucherCandidates],
  );

  useEffect(() => {
    if (mode !== PettyCashReplenishmentActionModes.Add || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current)
      return;
    setValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      exchangeRate: "1.00",
    }));
    setInitialValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      exchangeRate: "1.00",
    }));
  }, [mode, transactionCurrency.baseCurrencyCode, transactionCurrency.isBaseCurrencyResolved]);

  function updateField<TKey extends keyof PettyCashReplenishmentFormValues>(field: TKey, value: PettyCashReplenishmentFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function calculateEntry(entry: PettyCashReplenishmentEntry): PettyCashReplenishmentEntry {
    const taxFields = calculatePettyCashReplenishmentItemTaxFields(entry.amount, entry.vatType, entry.ewtCode);
    return { ...entry, ...taxFields };
  }

  function updateEntry(rowId: string, updates: Partial<PettyCashReplenishmentEntry>) {
    if (isReadonly) return;
    updateField(
      "entries",
      values.entries.map((entry) => (entry.id === rowId ? calculateEntry({ ...entry, ...updates }) : entry)),
    );
  }

  function updateEntries(entries: PettyCashReplenishmentEntry[]) {
    updateField("entries", entries);
  }

  async function updateCurrency(currencyCode: string) {
    hasEditedCurrencyRef.current = true;
    updateField("currency", currencyCode);
    setErrors((current) => ({ ...current, currency: undefined, exchangeRate: undefined }));

    try {
      const exchangeRate = await transactionCurrency.loadExchangeRate(currencyCode);
      if (exchangeRate != null) {
        updateField("exchangeRate", formatLoadedExchangeRate(exchangeRate));
      }
    } catch {
      toast.error("Could not load exchange rate.");
    }
  }

  function addEntry() {
    if (isReadonly) return;
    updateField("entries", [...values.entries, createBlankPettyCashReplenishmentEntry()]);
  }

  function addEntries(count: number) {
    updateEntries([...values.entries, ...Array.from({ length: count }, createBlankPettyCashReplenishmentEntry)]);
  }

  function duplicateEntry(rowId: string) {
    const target = values.entries.find((e) => e.id === rowId);
    if (target) {
      updateEntries([...values.entries, { ...target, id: `entry-${Date.now()}` }]);
    }
  }

  function insertEntry(rowId: string, position: "above" | "below" = "below") {
    const index = values.entries.findIndex((e) => e.id === rowId);
    if (index === -1) return;
    const next = [...values.entries];
    next.splice(position === "above" ? index : index + 1, 0, createBlankPettyCashReplenishmentEntry());
    updateEntries(next);
  }

  function moveEntry(fromRowId: string, toRowId: string) {
    const fromIndex = values.entries.findIndex((e) => e.id === fromRowId);
    const toIndex = values.entries.findIndex((e) => e.id === toRowId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    const next = [...values.entries];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    updateEntries(next);
  }

  function removeEntry(rowId: string) {
    if (isReadonly) return;
    if (values.entries.length <= 1) {
      updateField("entries", [createBlankPettyCashReplenishmentEntry()]);
      return;
    }
    updateField(
      "entries",
      values.entries.filter((entry) => entry.id !== rowId),
    );
  }

  const saveMutation = useMutation({
    mutationFn: async (submitValues: PettyCashReplenishmentFormValues) => {
      if (mode === PettyCashReplenishmentActionModes.Add) {
        return await createPettyCashReplenishmentApi(submitValues);
      }
      return await updatePettyCashReplenishmentApi(params.recordId!, submitValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PettyCashReplenishmentQueryKeys.all });
      draft.clearDraft();
      toast.success(`Petty Cash Replenishment ${mode === PettyCashReplenishmentActionModes.Add ? "created" : "updated"} successfully.`);
      if (options.onSaved) {
        options.onSaved();
      } else {
        router.push("/cash-disbursement/petty-cash-replenishment");
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save Petty Cash Replenishment.";
      toast.error(msg);
    },
  });

  async function submit(status?: PettyCashReplenishmentStatus) {
    const nextValues = status ? { ...values, status } : values;
    const nextErrors = nextValues.status === "Draft" ? {} : validatePettyCashReplenishmentForm(nextValues);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please Fill Up the Required Fields!");
      return false;
    }

    try {
      await saveMutation.mutateAsync(nextValues);
      return true;
    } catch {
      return false;
    }
  }

  const updateStatusMutation = useMutation({
    mutationFn: async (status: PettyCashReplenishmentStatus) => {
      return await updatePettyCashReplenishmentStatusApi(params.recordId!, status);
    },
    onSuccess: (updatedRecord, status) => {
      queryClient.invalidateQueries({ queryKey: PettyCashReplenishmentQueryKeys.all });
      queryClient.setQueryData(PettyCashReplenishmentQueryKeys.record(params.recordId), updatedRecord);
      setValues((current) => ({ ...current, status }));
      setInitialValues((current) => ({ ...current, status }));
      toast.success(`Petty Cash Replenishment status updated to ${status}.`);
    },
    onError: () => {
      toast.error("Failed to update Petty Cash Replenishment status.");
    },
  });

  async function handleUpdateStatus(status: PettyCashReplenishmentStatus): Promise<boolean> {
    if (!params.recordId) return false;
    try {
      await updateStatusMutation.mutateAsync(status);
      return true;
    } catch {
      return false;
    }
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createPettyCashReplenishmentFormValues(undefined, "", transactionCurrency.baseCurrencyCode);

    try {
      const nextNo = await fetchNextPettyCashReplenishmentNo();

      if (nextNo) {
        nextValues.transactionNo = nextNo;
      }
    } catch {
      // Keep the blank add form if the number endpoint is temporarily unavailable.
    }

    setValues(nextValues);
    setInitialValues(nextValues);
  }

  function discardDraft() {
    draft.clearDraft();

    if (mode === PettyCashReplenishmentActionModes.Add) {
      void resetAddValuesWithNextTransactionNo();
      return;
    }

    draft.discardDraft();
  }

  function copyFromPettyCash(recordIds: string[]) {
    if (isReadonly || recordIds.length === 0) {
      return;
    }

    const selectedVouchers = findPaymentVoucherCopyCandidates(
      pettyCashVoucherCandidates,
      PaymentVoucherCopyPrefixes.PettyCashVoucher,
      recordIds,
    );
    const selectedFunds = findPaymentVoucherCopyCandidates(pettyCashFundCandidates, PaymentVoucherCopyPrefixes.PettyCashFund, recordIds);
    const selectedSources = [...selectedVouchers, ...selectedFunds];
    if (selectedSources.length === 0) {
      toast.error("No valid Petty Cash records selected.");
      return;
    }

    const duplicateVoucher = selectedVouchers.some(
      (record) => copiedPettyCashReferences.has(`PCV:${record.transactionNo}`) || copiedPettyCashReferences.has(record.transactionNo),
    );
    const duplicateFund = selectedFunds.some(
      (record) => copiedPettyCashReferences.has(`PCF:${record.transactionNo}`) || copiedPettyCashReferences.has(record.transactionNo),
    );
    if (duplicateVoucher || duplicateFund) {
      toast.error("The selected Petty Cash record has already been added.");
      return;
    }

    const firstParty = selectedSources[0].partyCode?.trim() || selectedSources[0].partyName?.trim();
    if (selectedSources.some((record) => (record.partyCode?.trim() || record.partyName?.trim()) !== firstParty)) {
      toast.error(`All selected Petty Cash records must belong to the same Party ("${selectedSources[0].partyName}").`);
      return;
    }

    const firstCurrency = (selectedSources[0].currency || "PHP").trim().toUpperCase();
    if (selectedSources.some((record) => (record.currency || "PHP").trim().toUpperCase() !== firstCurrency)) {
      toast.error(`All selected Petty Cash records must have the same Currency ("${firstCurrency}").`);
      return;
    }

    const voucherEntries = selectedVouchers.map((record) =>
      createCopiedPettyCashReplenishmentEntry({
        amount: String(record.availableGrossAmount || record.amount || 0),
        disburseAmount: String(record.availableAmount || record.disburseAmount || 0),
        ewtAmount: "0",
        ewtCode: "",
        ewtPercent: "0",
        netAmount: String(record.availableAmount || record.disburseAmount || record.amount || 0),
        particulars: record.remarks || `Replenishment for ${record.transactionNo}`,
        pettyCashDate: record.documentDate,
        pettyCashNo: `PCV:${record.transactionNo}`,
        responsibilityCenterCode: record.responsibilityCenterCode || "",
        responsibilityCenterName: record.responsibilityCenter || "",
        supplierCode: record.partyCode || "",
        supplierName: record.partyName || "",
        vatAmount: "0",
        vatPercent: "0",
        vatType: "",
      }),
    );
    const fundEntries = selectedFunds.flatMap((record) => {
      return record.details.map((detail) => {
        const grossAmount = Number(detail.grossAmount || 0);
        const availableGrossAmount = Number(detail.availableGrossAmount ?? detail.grossAmount ?? 0);
        const ratio = grossAmount > 0 ? availableGrossAmount / grossAmount : 1;

        return createCopiedPettyCashReplenishmentEntry({
          amount: String(availableGrossAmount),
          disburseAmount: String(detail.availableAmount ?? scalePaymentVoucherCopyAmount(detail.disburseAmount, ratio)),
          ewtAmount: String(scalePaymentVoucherCopyAmount(detail.ewtAmount, ratio)),
          ewtCode: detail.ewtCode || "",
          ewtPercent: String(detail.ewtPercent || 0),
          netAmount: String(scalePaymentVoucherCopyAmount(detail.netAmount, ratio)),
          particulars: detail.particulars || detail.remarks || record.remarks || `Replenishment for ${record.transactionNo}`,
          pettyCashDate: detail.date || record.documentDate,
          pettyCashNo: `PCF:${record.transactionNo}`,
          responsibilityCenterCode: detail.responsibilityCenterCode || record.responsibilityCenterCode || "",
          responsibilityCenterName: detail.responsibilityCenter || record.responsibilityCenter || "",
          supplierCode: detail.supplierCode || record.partyCode || "",
          supplierName: detail.supplierName || record.partyName || "",
          vatAmount: String(scalePaymentVoucherCopyAmount(detail.vatAmount, ratio)),
          vatPercent: String(detail.vatPercent || 0),
          vatType: detail.vatType || "",
        });
      });
    });
    const copiedEntries = [...voucherEntries, ...fundEntries];
    const firstSource = selectedSources[0];

    setValues((current) => {
      const existingEntries = current.entries.filter((entry) => isPettyCashReplenishmentEntryPopulated(entry));
      return {
        ...current,
        accountCode: current.accountCode || firstSource.accountCode || "",
        accountTitle: current.accountTitle || firstSource.accountTitle || "",
        currency: firstSource.currency || current.currency || "PHP",
        entries: existingEntries.length > 0 ? [...existingEntries, ...copiedEntries] : copiedEntries,
        exchangeRate: String(firstSource.exchangeRate || current.exchangeRate || "1.00"),
        partyCode: current.partyCode || firstSource.partyCode || "",
        partyName: current.partyName || firstSource.partyName || "",
        projectCode: current.projectCode || firstSource.projectCode || "",
        projectName: current.projectName || firstSource.projectName || "",
        remarks:
          current.remarks ||
          selectedSources
            .map((record) => record.remarks)
            .filter(Boolean)
            .join("; "),
        responsibilityCenter: current.responsibilityCenter || firstSource.responsibilityCenter || "",
        responsibilityCenterCode: current.responsibilityCenterCode || firstSource.responsibilityCenterCode || "",
      };
    });
    setErrors((current) => ({ ...current, entries: undefined, partyCode: undefined, partyName: undefined }));
    toast.success(`Copied ${selectedSources.length} Petty Cash record${selectedSources.length > 1 ? "s" : ""}.`);
  }

  return {
    activeTab,
    duplicateEntry,
    insertEntry,
    moveEntry,
    addEntries,
    addEntry,
    applyFundRecord: (fund: Parameters<typeof applyPettyCashFundToReplenishmentForm>[1]) => {
      const nextValues = applyPettyCashFundToReplenishmentForm(values, fund);
      setValues(nextValues);
    },
    closePreview: () => setIsPreviewOpen(false),
    copyFromRecords,
    pettyCashFundCopyFromRecords: copyFromRecords,
    copyFromPettyCashFund: copyFromPettyCash,
    currencyOptions: transactionCurrency.currencyOptions,
    discardDraft,
    draft,
    errors,
    handleUpdateStatus,
    hasDiscardableChanges: isDirty,
    isDirty,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isLoading: recordQuery.isLoading,
    isPreviewOpen,
    isReadonly,
    isRecordMissing: mode !== PettyCashReplenishmentActionModes.Add && !recordQuery.isLoading && !record,
    isSubmitting: saveMutation.isPending || updateStatusMutation.isPending,
    mode,
    openPreview: () => setIsPreviewOpen(true),
    record,
    removeEntry,
    save: submit,
    saveDraft: draft.saveDraft,
    setActiveTab,
    setIsPreviewOpen,
    submit,
    totals: {
      ...totals,
      formattedAmount: formatPettyCashReplenishmentAmount(totals.totalAmount),
      formattedNetAmount: formatPettyCashReplenishmentAmount(totals.netAmount),
      formattedVatAmount: formatPettyCashReplenishmentAmount(totals.vatAmount),
      formattedEwtAmount: formatPettyCashReplenishmentAmount(totals.ewtAmount),
      formattedDisburseAmount: formatPettyCashReplenishmentAmount(totals.disburseAmount),
    },
    updateCurrency,
    updateEntries,
    updateEntry,
    updateField,
    updateStatus: handleUpdateStatus,
    validate: (status?: PettyCashReplenishmentStatus) => {
      const nextValues = status ? { ...values, status } : values;
      const errs = nextValues.status === "Draft" ? {} : validatePettyCashReplenishmentForm(nextValues);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    values,
  };
}

function isPettyCashReplenishmentEntryPopulated(entry: PettyCashReplenishmentEntry) {
  return Boolean(
    entry.pettyCashNo.trim() ||
    entry.supplierCode.trim() ||
    entry.supplierName.trim() ||
    entry.particulars.trim() ||
    entry.amount.trim() ||
    entry.disburseAmount.trim(),
  );
}

function createCopiedPettyCashReplenishmentEntry(overrides: Partial<PettyCashReplenishmentEntry>) {
  return {
    ...createBlankPettyCashReplenishmentEntry(),
    ...overrides,
  };
}
