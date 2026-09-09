"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  AdvancesToSuppliersActionModes,
  AdvancesToSuppliersStatuses,
} from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import {
  calculateAdvancePayment,
  calculateAdvancePaymentPercentage,
  createAdvancesToSuppliersFormValues,
  formatAdvancesToSuppliersAmount,
} from "@/app/src/data/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import { useAdvancesToSuppliersDetailsLookups } from "@/app/src/hooks/modules/cash-disbursement/advances-to-suppliers/useAdvancesToSuppliersDetailsLookups";
import {
  createAdvancesToSuppliersApi,
  fetchAdvancesToSuppliersById,
  fetchNextAdvancesToSuppliersNumber,
  submitAdvancesToSuppliersApprovalApi,
  updateAdvancesToSuppliersApi,
  updateAdvancesToSuppliersStatusApi,
} from "@/app/src/services/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersApi";
import { fetchPurchaseOrderCopyFromCandidates } from "@/app/src/services/modules/purchasing/purchase-order/PurchaseOrderApi";
import { PurchaseOrderQueryKeys } from "@/app/src/services/modules/purchasing/purchase-order/PurchaseOrderQueryKeys";
import {
  buildCashDisbursementCopyRecordSet,
  findPaymentVoucherCopyCandidates,
  PaymentVoucherCopyPrefixes,
} from "@/app/src/data/modules/cash-disbursement/shared/PaymentVoucherCopyFromData";
import { formatCopyReference, normalizeReference } from "@/app/src/utils/reference.util";
import type {
  AdvancesToSuppliersActionMode,
  AdvancesToSuppliersActionTab,
  AdvancesToSuppliersFormErrors,
  AdvancesToSuppliersFormValues,
  AdvancesToSuppliersRecord,
  AdvancesToSuppliersStatus,
} from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import { validateAdvancesToSuppliersForm } from "@/app/src/validations/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersValidation";

export function useAdvancesToSuppliersActionPage(options: { mode: AdvancesToSuppliersActionMode; onSaved?: () => void }) {
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const recordId = params.recordId;
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const [record, setRecord] = useState<AdvancesToSuppliersRecord | null>(null);
  const [values, setValues] = useState<AdvancesToSuppliersFormValues>(() =>
    createAdvancesToSuppliersFormValues(undefined, "", transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<AdvancesToSuppliersFormErrors>({});
  const [activeTab, setActiveTab] = useState<AdvancesToSuppliersActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(mode !== AdvancesToSuppliersActionModes.Add && Boolean(recordId));
  const { accountOptions, isLookupLoading, partyOptions, projectOptions, responsibilityCenterOptions } =
    useAdvancesToSuppliersDetailsLookups(values);
  const isReadonly = mode === AdvancesToSuppliersActionModes.View;
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty =
    mode === AdvancesToSuppliersActionModes.Add ? hasModuleDraftChanges(values, initialValues, ["transactionNo"]) : rawIsDirty;
  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({
      mode,
      moduleId: "cash-disbursement:advances-to-suppliers",
      recordId: params.recordId,
    }),
    setValues,
    values,
  });

  async function refreshNextTransactionNo() {
    try {
      const transactionNo = await fetchNextAdvancesToSuppliersNumber();

      if (transactionNo) {
        setValues((current) => ({ ...current, transactionNo }));
        setInitialValues((current) => ({ ...current, transactionNo }));
      }
    } catch {
      // Keep the current add form if the number endpoint is temporarily unavailable.
    }
  }

  useEffect(() => {
    if (mode !== AdvancesToSuppliersActionModes.Add) return;

    queueMicrotask(() => void refreshNextTransactionNo());
  }, [mode]);

  useEffect(() => {
    if (mode === AdvancesToSuppliersActionModes.Add || !recordId) return;

    let isMounted = true;
    queueMicrotask(() => {
      if (!isMounted) return;

      setIsLoading(true);
      fetchAdvancesToSuppliersById(recordId)
        .then((nextRecord) => {
          if (!isMounted) return;
          const nextValues = createAdvancesToSuppliersFormValues(nextRecord, "", transactionCurrency.baseCurrencyCode);
          setRecord(nextRecord);
          setValues(nextValues);
          setInitialValues(nextValues);
        })
        .catch(() => {
          if (isMounted) setRecord(null);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [mode, recordId, transactionCurrency.baseCurrencyCode]);
  const purchaseOrderCopyCandidatesQuery = useQuery({
    queryKey: PurchaseOrderQueryKeys.copyFromCandidates("advances-to-suppliers", activeCompanyId, activeBranchId, values.partyCode),
    queryFn: () =>
      fetchPurchaseOrderCopyFromCandidates({
        branchUnitId: activeBranchId,
        partyCode: values.partyCode,
      }),
    enabled: mode === AdvancesToSuppliersActionModes.Add && activeCompanyId != null,
  });
  const purchaseOrderCopyCandidates = useMemo(() => purchaseOrderCopyCandidatesQuery.data ?? [], [purchaseOrderCopyCandidatesQuery.data]);
  const purchaseOrderCopyRecords = useMemo(
    () =>
      buildCashDisbursementCopyRecordSet({
        candidates: purchaseOrderCopyCandidates.map((order) => ({
          ...order,
          availableGrossAmount: order.availableAmount,
        })),
        copiedReferences: new Set(),
        getRemarks: (order) => order.remarks ?? "",
        isAlreadyAdded: (order) => {
          const reference = formatCopyReference(PaymentVoucherCopyPrefixes.PurchaseOrder, order.transactionNo);
          return normalizeReference(values.poReference) === normalizeReference(reference);
        },
        prefix: PaymentVoucherCopyPrefixes.PurchaseOrder,
        source: "Purchase Order",
      }),
    [purchaseOrderCopyCandidates, values.poReference],
  );

  useEffect(() => {
    if (mode !== AdvancesToSuppliersActionModes.Add || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) return;
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

  function updateField<TKey extends keyof AdvancesToSuppliersFormValues>(field: TKey, value: AdvancesToSuppliersFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => {
      const next = { ...current, [field]: value };
      if (field === "advancePaymentType") {
        if (value === "Percentage") {
          next.advancePaymentAmount = formatAdvancesToSuppliersAmount(
            calculateAdvancePayment(next.totalPoAmount, next.advancePaymentPercentage),
          );
        } else {
          next.advancePaymentPercentage = formatAdvancesToSuppliersAmount(
            calculateAdvancePaymentPercentage(next.totalPoAmount, next.advancePaymentAmount),
          );
        }
      } else if (field === "totalPoAmount") {
        if (next.advancePaymentType === "Percentage") {
          next.advancePaymentAmount = formatAdvancesToSuppliersAmount(
            calculateAdvancePayment(next.totalPoAmount, next.advancePaymentPercentage),
          );
        } else {
          next.advancePaymentPercentage = formatAdvancesToSuppliersAmount(
            calculateAdvancePaymentPercentage(next.totalPoAmount, next.advancePaymentAmount),
          );
        }
      } else if (field === "advancePaymentPercentage") {
        next.advancePaymentAmount = formatAdvancesToSuppliersAmount(
          calculateAdvancePayment(next.totalPoAmount, next.advancePaymentPercentage),
        );
      } else if (field === "advancePaymentAmount") {
        next.advancePaymentPercentage = formatAdvancesToSuppliersAmount(
          calculateAdvancePaymentPercentage(next.totalPoAmount, next.advancePaymentAmount),
        );
      }
      return next;
    });
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === "totalPoAmount" ||
      field === "advancePaymentPercentage" ||
      field === "advancePaymentAmount" ||
      field === "advancePaymentType"
        ? { advancePaymentAmount: undefined, advancePaymentPercentage: undefined }
        : {}),
    }));
  }

  async function updateCurrency(currencyCode: string) {
    hasEditedCurrencyRef.current = true;
    updateField("currency", currencyCode);
    try {
      const exchangeRate = await transactionCurrency.loadExchangeRate(currencyCode);
      if (exchangeRate != null) updateField("exchangeRate", formatLoadedExchangeRate(exchangeRate));
    } catch {
      setErrors((current) => ({ ...current, exchangeRate: "Could not load the exchange rate." }));
      toast.error("Could not load the exchange rate for the selected currency.");
    }
  }

  function copyFromPurchaseOrder(recordIds: string[]) {
    if (isReadonly) return;

    const order = findPaymentVoucherCopyCandidates(
      purchaseOrderCopyCandidates,
      PaymentVoucherCopyPrefixes.PurchaseOrder,
      recordIds,
    )[0];

    if (!order) {
      toast.error("No purchase order was selected.");
      return;
    }

    const reference = formatCopyReference(PaymentVoucherCopyPrefixes.PurchaseOrder, order.transactionNo);
    if (normalizeReference(values.poReference) === normalizeReference(reference)) {
      toast.error("This Purchase Order is already selected.");
      return;
    }

    const totalPoAmount = formatAdvancesToSuppliersAmount(order.amount);
    hasEditedCurrencyRef.current = true;
    setValues((current) => {
      const isPercentage = current.advancePaymentType === "Percentage";
      const advancePaymentAmount = isPercentage
        ? formatAdvancesToSuppliersAmount(calculateAdvancePayment(totalPoAmount, current.advancePaymentPercentage))
        : current.advancePaymentAmount;
      const advancePaymentPercentage = isPercentage
        ? current.advancePaymentPercentage
        : formatAdvancesToSuppliersAmount(calculateAdvancePaymentPercentage(totalPoAmount, current.advancePaymentAmount));

      return {
        ...current,
        partyId: order.partyId ?? current.partyId,
        partyCode: order.partyCode || current.partyCode,
        partyName: order.partyName || current.partyName,
        projectCode: order.projectCode || current.projectCode,
        projectName: order.projectName || current.projectName,
        currency: order.currency || current.currency,
        exchangeRate: formatLoadedExchangeRate(order.exchangeRate || 1),
        poReference: reference,
        totalPoAmount,
        advancePaymentAmount,
        advancePaymentPercentage,
        remarks: order.remarks || current.remarks,
      };
    });
    setErrors((current) => ({
      ...current,
      partyCode: undefined,
      partyName: undefined,
      projectCode: undefined,
      projectName: undefined,
      currency: undefined,
      exchangeRate: undefined,
      poReference: undefined,
      totalPoAmount: undefined,
      advancePaymentAmount: undefined,
      advancePaymentPercentage: undefined,
    }));
    toast.success("Purchase Order Details Copied.");
  }

  async function save(status: AdvancesToSuppliersStatus) {
    if (isReadonly || isSubmittingRef.current) return false;
    if (mode === AdvancesToSuppliersActionModes.Edit && !isDirty && status === record?.status) {
      toast.error("No changes to save.");
      return false;
    }
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:advances-to-suppliers:save:${mode}:${params.recordId ?? values.transactionNo}`,
    );
    if (!releaseSubmitLock) return false;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextErrors = status === AdvancesToSuppliersStatuses.Draft ? {} : validateAdvancesToSuppliersForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please Fill Up the Required Fields!");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
    try {
      const savedRecord =
        mode === AdvancesToSuppliersActionModes.Edit && record?.id
          ? await updateAdvancesToSuppliersApi(record.id, { ...values, status })
          : await createAdvancesToSuppliersApi({ ...values, status });
      const nextRecord =
        status === AdvancesToSuppliersStatuses.ForApproval && savedRecord.id
          ? await submitAdvancesToSuppliersApprovalApi(savedRecord.id)
          : savedRecord;
      const nextValues = createAdvancesToSuppliersFormValues(nextRecord, "", transactionCurrency.baseCurrencyCode);
      setRecord(nextRecord);
      setValues(nextValues);
      setInitialValues(nextValues);
      draft.clearDraft();
      toast.success(
        status === AdvancesToSuppliersStatuses.Draft
          ? "Advances to Suppliers Saved as Draft."
          : "Advances to Suppliers Submitted for Approval.",
      );
      options.onSaved?.();
      return true;
    } catch {
      toast.error("Could not save Advances to Suppliers. Please try again.");
      return false;
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
    }
  }

  async function updateStatus(status: AdvancesToSuppliersStatus) {
    if (!record) return false;
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:advances-to-suppliers:status:${record.id}:${status}`);
    if (!releaseActionLock) return false;
    try {
      const nextRecord =
        status === AdvancesToSuppliersStatuses.ForApproval
          ? await submitAdvancesToSuppliersApprovalApi(record.id)
          : await updateAdvancesToSuppliersStatusApi(record.id, status);
      const nextValues = createAdvancesToSuppliersFormValues(nextRecord, "", transactionCurrency.baseCurrencyCode);
      setRecord(nextRecord);
      setValues(nextValues);
      setInitialValues(nextValues);
      toast.success(`Advances to Suppliers Marked as ${status}.`);
      return true;
    } catch {
      toast.error("Could not update Advances to Suppliers. Please try again.");
      return false;
    } finally {
      releaseActionLock();
    }
  }

  function validate(status: AdvancesToSuppliersStatus = AdvancesToSuppliersStatuses.ForApproval): boolean {
    if (isReadonly || isSubmittingRef.current) return false;
    if (mode === AdvancesToSuppliersActionModes.Edit && !isDirty && status === record?.status) {
      toast.error("No changes to save.");
      return false;
    }
    const nextErrors = status === AdvancesToSuppliersStatuses.Draft ? {} : validateAdvancesToSuppliersForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please Fill Up the Required Fields!");
      return false;
    }
    return true;
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createAdvancesToSuppliersFormValues(undefined, "", transactionCurrency.baseCurrencyCode);

    try {
      const transactionNo = await fetchNextAdvancesToSuppliersNumber();

      if (transactionNo) {
        nextValues.transactionNo = transactionNo;
      }
    } catch {
      // Keep the blank add form if the number endpoint is temporarily unavailable.
    }

    setValues(nextValues);
    setInitialValues(nextValues);
  }

  function discardDraft() {
    draft.clearDraft();

    if (mode === AdvancesToSuppliersActionModes.Add) {
      void resetAddValuesWithNextTransactionNo();
      return;
    }

    draft.discardDraft();
  }

  return {
    discardDraft,
    hasDiscardableChanges: isDirty,
    saveDraft: draft.saveDraft,
    activeTab,
    accountOptions,
    currencyOptions: transactionCurrency.currencyOptions,
    errors,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isLoading,
    isLookupLoading,
    isPreviewOpen,
    isSubmitting,
    isReadonly,
    isRecordMissing: mode !== AdvancesToSuppliersActionModes.Add && !isLoading && !record,
    mode,
    partyOptions,
    projectOptions,
    purchaseOrderCopyRecords,
    record,
    responsibilityCenterOptions,
    save,
    setActiveTab,
    setIsPreviewOpen,
    updateCurrency,
    copyFromPurchaseOrder,
    updateField,
    updateStatus,
    validate,
    values,
  };
}
