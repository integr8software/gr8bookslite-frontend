"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { AdvancesToSuppliersStatuses } from "@/app/src/constants/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersConstants";
import {
  calculateAdvancePayment,
  calculateAdvancePaymentPercentage,
  createAdvancesToSuppliersFormValues,
  createAdvancesToSuppliersRecord,
  formatAdvancesToSuppliersAmount,
} from "@/app/src/data/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersData";
import {
  getPurchaseOrderParty,
  getPurchaseOrderTotals,
  loadPurchaseOrders,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import {
  createNextAdvancesToSuppliersNumber,
  getAdvancesToSuppliersRecords,
  saveAdvancesToSuppliersRecords,
  upsertAdvancesToSuppliersRecord,
} from "@/app/src/services/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersService";
import type {
  AdvancesToSuppliersActionMode,
  AdvancesToSuppliersActionTab,
  AdvancesToSuppliersFormErrors,
  AdvancesToSuppliersFormValues,
  AdvancesToSuppliersStatus,
} from "@/app/src/types/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersTypes";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import { validateAdvancesToSuppliersForm } from "@/app/src/validations/modules/cash-disbursement/advances-to-suppliers/AdvancesToSuppliersValidation";

export function useAdvancesToSuppliersActionPage(options: { mode: AdvancesToSuppliersActionMode; onSaved?: () => void }) {
  const transactionCurrency = useTransactionCurrency();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const initialRecord = mode === "add" ? undefined : getAdvancesToSuppliersRecords().find((item) => item.id === params.recordId);
  const [record, setRecord] = useState(initialRecord);
  const [values, setValues] = useState<AdvancesToSuppliersFormValues>(() =>
    createAdvancesToSuppliersFormValues(initialRecord, createNextAdvancesToSuppliersNumber(), transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<AdvancesToSuppliersFormErrors>({});
  const [activeTab, setActiveTab] = useState<AdvancesToSuppliersActionTab>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isReadonly = mode === "view";
  const [initialValues] = useState(values);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
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
  const purchaseOrderCopyRecords = useMemo<AppCopyFromRecord[]>(
    () =>
      loadPurchaseOrders()
        .filter((order) => order.status !== AdvancesToSuppliersStatuses.cancelled)
        .map((order) => {
          const party = getPurchaseOrderParty(order);

          return {
            amount: String(getPurchaseOrderTotals(order).netAmount),
            documentDate: order.documentDate,
            id: order.id,
            partyName: party.partyName,
            remarks: order.remarks || order.prNo,
            source: "Purchase Order",
            sourceNo: order.transNo,
          };
        }),
    [],
  );

  useEffect(() => {
    if (mode !== "add" || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) return;
    setValues((current) => ({
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

    const order = loadPurchaseOrders().find((item) => recordIds.includes(item.id));

    if (!order) {
      toast.error("No purchase order was selected.");
      return;
    }

    const totalPoAmount = formatAdvancesToSuppliersAmount(getPurchaseOrderTotals(order).netAmount);
    const party = getPurchaseOrderParty(order);
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
        partyCode: party.partyCode || current.partyCode,
        partyName: party.partyName || current.partyName,
        projectCode: order.projectCode || current.projectCode,
        projectName: order.projectName || current.projectName,
        currency: order.currency || current.currency,
        exchangeRate: formatLoadedExchangeRate(order.exchangeRate || 1),
        poReference: order.transNo,
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

  function save(status: AdvancesToSuppliersStatus) {
    if (isReadonly || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return false;
    }
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:advances-to-suppliers:save:${mode}:${params.recordId ?? values.transactionNo}`,
    );
    if (!releaseSubmitLock) return false;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextErrors = status === AdvancesToSuppliersStatuses.draft ? {} : validateAdvancesToSuppliersForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted Advances to Suppliers fields.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
    try {
      const nextRecord = createAdvancesToSuppliersRecord(values, status, mode === "edit" ? record : undefined);
      saveAdvancesToSuppliersRecords(upsertAdvancesToSuppliersRecord(nextRecord));
      setRecord(nextRecord);
      setValues(createAdvancesToSuppliersFormValues(nextRecord));
      draft.clearDraft();
      toast.success(
        status === AdvancesToSuppliersStatuses.draft
          ? "Advances to Suppliers Saved as Draft."
          : "Advances to Suppliers Submitted for Approval.",
      );
      options.onSaved?.();
      return true;
    } catch {
      toast.error("Could not save Advances to Suppliers. Please try again.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
  }

  function updateStatus(status: AdvancesToSuppliersStatus) {
    if (!record) return false;
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:advances-to-suppliers:status:${record.id}:${status}`);
    if (!releaseActionLock) return false;
    try {
      const nextRecord = createAdvancesToSuppliersRecord(values, status, record);
      saveAdvancesToSuppliersRecords(upsertAdvancesToSuppliersRecord(nextRecord));
      setRecord(nextRecord);
      setValues(createAdvancesToSuppliersFormValues(nextRecord));
      toast.success(`Advances to Suppliers Marked as ${status}.`);
      return true;
    } catch {
      toast.error("Could not update Advances to Suppliers. Please try again.");
      releaseActionLock();
      return false;
    }
  }

  function validate(status: AdvancesToSuppliersStatus = AdvancesToSuppliersStatuses.forApproval): boolean {
    if (isReadonly || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return false;
    }
    const nextErrors = status === AdvancesToSuppliersStatuses.draft ? {} : validateAdvancesToSuppliersForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted Advances to Suppliers fields.");
      return false;
    }
    return true;
  }

  return {
    discardDraft: draft.discardDraft,
    hasDiscardableChanges: isDirty,
    saveDraft: draft.saveDraft,
    activeTab,
    currencyOptions: transactionCurrency.currencyOptions,
    errors,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isPreviewOpen,
    isSubmitting,
    isReadonly,
    isRecordMissing: mode !== "add" && !initialRecord,
    mode,
    purchaseOrderCopyRecords,
    record,
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

