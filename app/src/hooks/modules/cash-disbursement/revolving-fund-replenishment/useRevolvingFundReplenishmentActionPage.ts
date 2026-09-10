"use client";

import { RevolvingFundReplenishmentActionModes } from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  calculateRevolvingFundReplenishmentTotals,
  createBlankRevolvingFundReplenishmentEntry,
  createRevolvingFundReplenishmentFormValues,
  formatRevolvingFundReplenishmentAmount,
} from "@/app/src/data/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import type {
  RevolvingFundReplenishmentActionMode,
  RevolvingFundReplenishmentActionTab,
  RevolvingFundReplenishmentEntry,
  RevolvingFundReplenishmentFormErrors,
  RevolvingFundReplenishmentFormValues,
  RevolvingFundReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";
import { validateRevolvingFundReplenishmentForm } from "@/app/src/validations/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentValidation";
import {
  createRevolvingFundReplenishmentApi,
  fetchNextRevolvingFundReplenishmentNo,
  fetchRevolvingFundReplenishmentById,
  updateRevolvingFundReplenishmentApi,
  updateRevolvingFundReplenishmentStatusApi,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentApi";
import { RevolvingFundReplenishmentQueryKeys } from "@/app/src/services/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentQueryKeys";
import { fetchRevolvingFundCopyFromCandidates } from "@/app/src/services/modules/cash-disbursement/revolving-fund/RevolvingFundApi";
import { RevolvingFundQueryKeys } from "@/app/src/services/modules/cash-disbursement/revolving-fund/RevolvingFundQueryKeys";
import {
  buildCashDisbursementCopyRecordSet,
  findPaymentVoucherCopyCandidates,
  PaymentVoucherCopyPrefixes,
  scalePaymentVoucherCopyAmount,
  validatePaymentVoucherCopySelection,
} from "@/app/src/data/modules/cash-disbursement/shared/PaymentVoucherCopyFromData";

export function useRevolvingFundReplenishmentActionPage(options: { mode: RevolvingFundReplenishmentActionMode; onSaved?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const { mode } = options;
  const isReadonly = mode === RevolvingFundReplenishmentActionModes.View;

  const recordQuery = useQuery({
    queryKey: RevolvingFundReplenishmentQueryKeys.record(params.recordId),
    queryFn: () => fetchRevolvingFundReplenishmentById(params.recordId!),
    enabled: Boolean(params.recordId) && mode !== RevolvingFundReplenishmentActionModes.Add,
  });

  const record = recordQuery.data;

  const [values, setValues] = useState<RevolvingFundReplenishmentFormValues>(() =>
    createRevolvingFundReplenishmentFormValues(record, "", transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<RevolvingFundReplenishmentFormErrors>({});
  const [activeTab, setActiveTab] = useState<RevolvingFundReplenishmentActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty =
    mode === RevolvingFundReplenishmentActionModes.Add ? hasModuleDraftChanges(values, initialValues, ["transactionNo"]) : rawIsDirty;

  async function refreshNextTransactionNo() {
    try {
      const nextNo = await fetchNextRevolvingFundReplenishmentNo();

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
      const formVals = createRevolvingFundReplenishmentFormValues(record, record.transactionNo, record.currency || "PHP");
      queueMicrotask(() => {
        setValues(formVals);
        setInitialValues(formVals);
      });
    }
  }, [record]);

  useEffect(() => {
    if (mode === RevolvingFundReplenishmentActionModes.Add) {
      queueMicrotask(() => void refreshNextTransactionNo());
    }
  }, [mode]);

  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:revolving-fund-replenishment", recordId: params.recordId }),
    setValues,
    values,
  });

  const totals = useMemo(() => calculateRevolvingFundReplenishmentTotals(values.entries), [values.entries]);
  const selectedPartyCode = values.partyCode.trim();
  const revolvingFundCandidatesQuery = useQuery({
    queryKey: [
      ...RevolvingFundQueryKeys.all,
      "copy-from",
      "revolving-fund-replenishment",
      activeCompanyId,
      activeBranchId,
      selectedPartyCode,
    ],
    queryFn: () =>
      fetchRevolvingFundCopyFromCandidates({
        branchUnitId: activeBranchId,
        partyCode: selectedPartyCode,
      }),
    enabled: activeCompanyId !== null && mode === RevolvingFundReplenishmentActionModes.Add,
  });
  const revolvingFundCandidates = useMemo(() => revolvingFundCandidatesQuery.data ?? [], [revolvingFundCandidatesQuery.data]);
  const copiedRevolvingFundReferences = useMemo(
    () => new Set(values.entries.map((entry) => entry.revolvingFundNo.trim()).filter(Boolean)),
    [values.entries],
  );
  const copyFromRecords = useMemo(
    () =>
      buildCashDisbursementCopyRecordSet({
        candidates: revolvingFundCandidates,
        copiedReferences: copiedRevolvingFundReferences,
        prefix: PaymentVoucherCopyPrefixes.RevolvingFund,
        source: "Revolving Fund",
      }),
    [copiedRevolvingFundReferences, revolvingFundCandidates],
  );

  useEffect(() => {
    if (mode !== RevolvingFundReplenishmentActionModes.Add || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current)
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

  function updateField<TKey extends keyof RevolvingFundReplenishmentFormValues>(
    field: TKey,
    value: RevolvingFundReplenishmentFormValues[TKey],
  ) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateEntry(rowId: string, updates: Partial<RevolvingFundReplenishmentEntry>) {
    if (isReadonly) return;
    updateField(
      "entries",
      values.entries.map((entry) => (entry.id === rowId ? { ...entry, ...updates } : entry)),
    );
  }

  function updateEntries(entries: RevolvingFundReplenishmentEntry[]) {
    updateField("entries", entries);
  }

  function duplicateEntry(rowId: string) {
    const target = values.entries.find((i) => i.id === rowId);
    if (target) {
      updateEntries([...values.entries, { ...target, id: `entry-${Date.now()}` }]);
    }
  }

  function insertEntry(rowId: string, position: "above" | "below" = "below") {
    const index = values.entries.findIndex((i) => i.id === rowId);
    const targetIndex = index === -1 ? values.entries.length : position === "above" ? index : index + 1;
    const next = [...values.entries];
    next.splice(targetIndex, 0, createBlankRevolvingFundReplenishmentEntry());
    updateEntries(next);
  }

  function moveEntry(fromRowId: string, toRowId: string) {
    const fromIndex = values.entries.findIndex((i) => i.id === fromRowId);
    const toIndex = values.entries.findIndex((i) => i.id === toRowId);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = [...values.entries];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    updateEntries(next);
  }

  function addEntry() {
    if (isReadonly) return;
    updateField("entries", [...values.entries, createBlankRevolvingFundReplenishmentEntry()]);
  }

  function addEntries(count: number) {
    updateEntries([...values.entries, ...Array.from({ length: count }, createBlankRevolvingFundReplenishmentEntry)]);
  }

  function removeEntry(rowId: string) {
    if (isReadonly) return;
    if (values.entries.length === 1) {
      toast.error("At least one voucher entry is required.");
      return;
    }
    updateField(
      "entries",
      values.entries.filter((entry) => entry.id !== rowId),
    );
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

  const saveMutation = useMutation({
    mutationFn: async (submitValues: RevolvingFundReplenishmentFormValues) => {
      if (mode === RevolvingFundReplenishmentActionModes.Add) {
        return await createRevolvingFundReplenishmentApi(submitValues);
      }
      return await updateRevolvingFundReplenishmentApi(params.recordId!, submitValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RevolvingFundReplenishmentQueryKeys.all });
      draft.clearDraft();
      toast.success(
        `Revolving Fund Replenishment ${mode === RevolvingFundReplenishmentActionModes.Add ? "created" : "updated"} successfully.`,
      );
      if (options.onSaved) {
        options.onSaved();
      } else {
        router.push("/cash-disbursement/revolving-fund-replenishment");
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save Revolving Fund Replenishment.";
      toast.error(msg);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: RevolvingFundReplenishmentStatus) => {
      return await updateRevolvingFundReplenishmentStatusApi(params.recordId!, status);
    },
    onSuccess: (updatedRecord, status) => {
      queryClient.invalidateQueries({ queryKey: RevolvingFundReplenishmentQueryKeys.all });
      queryClient.setQueryData(RevolvingFundReplenishmentQueryKeys.record(params.recordId), updatedRecord);
      setValues((cur) => ({ ...cur, status }));
      toast.success(`Revolving Fund Replenishment marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update status.");
    },
  });

  async function submit(status?: RevolvingFundReplenishmentStatus) {
    const nextValues = status ? { ...values, status } : values;
    const nextErrors = nextValues.status === "Draft" ? {} : validateRevolvingFundReplenishmentForm(nextValues);
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

  async function handleUpdateStatus(status: RevolvingFundReplenishmentStatus) {
    try {
      await updateStatusMutation.mutateAsync(status);
      return true;
    } catch {
      return false;
    }
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createRevolvingFundReplenishmentFormValues(undefined, "", transactionCurrency.baseCurrencyCode);

    try {
      const nextNo = await fetchNextRevolvingFundReplenishmentNo();

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

    if (mode === RevolvingFundReplenishmentActionModes.Add) {
      void resetAddValuesWithNextTransactionNo();
      return;
    }

    draft.discardDraft();
  }

  function copyFromRevolvingFund(recordIds: string[]) {
    if (isReadonly || recordIds.length === 0) {
      return;
    }

    const selectedFunds = findPaymentVoucherCopyCandidates(revolvingFundCandidates, PaymentVoucherCopyPrefixes.RevolvingFund, recordIds);
    if (selectedFunds.length === 0) {
      toast.error("No valid Revolving Fund records selected.");
      return;
    }

    const selectionError = validatePaymentVoucherCopySelection({
      copiedReferences: copiedRevolvingFundReferences,
      duplicateMessage: "The selected Revolving Fund record has already been added.",
      mixedCurrencyMessage: (currency) => `All selected Revolving Fund records must have the same Currency ("${currency}").`,
      mixedPartyMessage: (partyName) => `All selected Revolving Fund records must belong to the same Party ("${partyName}").`,
      prefix: PaymentVoucherCopyPrefixes.RevolvingFund,
      records: selectedFunds,
    });
    if (selectionError) {
      toast.error(selectionError);
      return;
    }

    const copiedEntries = selectedFunds.flatMap((record) => {
      return record.details.map((detail) => {
        const grossAmount = Number(detail.grossAmount || 0);
        const availableGrossAmount = Number(detail.availableGrossAmount ?? detail.grossAmount ?? 0);
        const ratio = grossAmount > 0 ? availableGrossAmount / grossAmount : 1;

        return createCopiedRevolvingFundReplenishmentEntry({
          amount: String(availableGrossAmount),
          disburseAmount: String(detail.availableAmount ?? scalePaymentVoucherCopyAmount(detail.disburseAmount, ratio)),
          ewtAmount: String(scalePaymentVoucherCopyAmount(detail.ewtAmount, ratio)),
          ewtCode: detail.ewtCode || "",
          ewtPercent: String(detail.ewtPercent || 0),
          netAmount: String(scalePaymentVoucherCopyAmount(detail.netAmount, ratio)),
          particulars: detail.particulars || detail.remarks || record.remarks || `Replenishment for ${record.transactionNo}`,
          remarks: detail.remarks || "",
          responsibilityCenterCode: detail.responsibilityCenterCode || record.responsibilityCenterCode || "",
          responsibilityCenterName: detail.responsibilityCenter || record.responsibilityCenter || "",
          revolvingFundDate: detail.date || record.documentDate,
          revolvingFundNo: `RF:${record.transactionNo}`,
          supplierCode: detail.supplierCode || record.partyCode || "",
          supplierName: detail.supplierName || record.partyName || "",
          vatAmount: String(scalePaymentVoucherCopyAmount(detail.vatAmount, ratio)),
          vatPercent: String(detail.vatPercent || 0),
          vatType: detail.vatType || "",
        });
      });
    });
    const firstSource = selectedFunds[0];

    setValues((current) => {
      const existingEntries = current.entries.filter((entry) => isRevolvingFundReplenishmentEntryPopulated(entry));
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
          selectedFunds
            .map((record) => record.remarks)
            .filter(Boolean)
            .join("; "),
        responsibilityCenter: current.responsibilityCenter || firstSource.responsibilityCenter || "",
        responsibilityCenterCode: current.responsibilityCenterCode || firstSource.responsibilityCenterCode || "",
      };
    });
    setErrors((current) => ({ ...current, entries: undefined, partyCode: undefined, partyName: undefined }));
    toast.success(`Copied ${selectedFunds.length} Revolving Fund record${selectedFunds.length > 1 ? "s" : ""}.`);
  }

  return {
    activeTab,
    duplicateEntry,
    insertEntry,
    moveEntry,
    addEntries,
    addEntry,
    applyFundRecord: () => {},
    closePreview: () => setIsPreviewOpen(false),
    copyFromRecords,
    copyFromRevolvingFund,
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
    isRecordMissing: mode !== RevolvingFundReplenishmentActionModes.Add && !recordQuery.isLoading && !record,
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
      formattedAmount: formatRevolvingFundReplenishmentAmount(totals.totalAmount),
      formattedNetAmount: formatRevolvingFundReplenishmentAmount(totals.netAmount),
      formattedVatAmount: formatRevolvingFundReplenishmentAmount(totals.vatAmount),
      formattedEwtAmount: formatRevolvingFundReplenishmentAmount(totals.ewtAmount),
      formattedDisburseAmount: formatRevolvingFundReplenishmentAmount(totals.disburseAmount),
    },
    updateCurrency,
    updateEntries,
    updateEntry,
    updateField,
    updateStatus: handleUpdateStatus,
    validate: (status?: RevolvingFundReplenishmentStatus) => {
      const nextValues = status ? { ...values, status } : values;
      const errs = nextValues.status === "Draft" ? {} : validateRevolvingFundReplenishmentForm(nextValues);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    values,
  };
}

function isRevolvingFundReplenishmentEntryPopulated(entry: RevolvingFundReplenishmentEntry) {
  return Boolean(
    entry.revolvingFundNo.trim() ||
    entry.supplierCode.trim() ||
    entry.supplierName.trim() ||
    entry.particulars.trim() ||
    entry.amount.trim() ||
    entry.disburseAmount.trim(),
  );
}

function createCopiedRevolvingFundReplenishmentEntry(overrides: Partial<RevolvingFundReplenishmentEntry>) {
  return {
    ...createBlankRevolvingFundReplenishmentEntry(),
    ...overrides,
  };
}
