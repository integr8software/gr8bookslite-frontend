"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  PettyCashVoucherRecords,
  calculatePettyCashVoucherVatFields,
  createPettyCashVoucherFormValues,
  createPettyCashVoucherInitialFormValues,
  createPettyCashVoucherRecord,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type {
  PettyCashVoucherActionPageOptions,
  PettyCashVoucherFormErrors,
  PettyCashVoucherFormValues,
  PettyCashVoucherActionTab,
  PettyCashVoucherRecord,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { validatePettyCashVoucherForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherValidation";
import {
  PettyCashVoucherQueryKeys,
  PettyCashVoucherStatuses,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { formatLoadedExchangeRate, useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";

export function usePettyCashVoucherActionPage(options: PettyCashVoucherActionPageOptions) {
  const transactionCurrency = useTransactionCurrency();
  const queryClient = useQueryClient();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const existingVoucher = options.existingVoucher ?? PettyCashVoucherRecords.find((record) => record.id === params.recordId);
  const isReadonly = mode === "view";
  const [values, setValues] = useState<PettyCashVoucherFormValues>(() =>
    existingVoucher
      ? createPettyCashVoucherFormValues(existingVoucher)
      : createPettyCashVoucherInitialFormValues(transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<PettyCashVoucherFormErrors>({});
  const [activeTab, setActiveTab] = useState<PettyCashVoucherActionTab>("details");
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues] = useState(values);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({
      mode,
      moduleId: "cash-disbursement:petty-cash-voucher",
      recordId: params.recordId,
    }),
    setValues,
    values,
  });
  const partyStore = usePartyManagementStore();
  const responsibilityCenterStore = useResponsibilityCenterStore();

  useEffect(() => {
    if (mode !== "add" || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) {
      return;
    }

    setValues((current) => ({
      ...current,
      currency: transactionCurrency.baseCurrencyCode,
      exchangeRate: "1.00",
    }));
  }, [mode, transactionCurrency.baseCurrencyCode, transactionCurrency.isBaseCurrencyResolved]);

  function updateField<TKey extends keyof PettyCashVoucherFormValues>(field: TKey, value: PettyCashVoucherFormValues[TKey]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateAmount(value: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      amount: value,
      ...calculatePettyCashVoucherVatFields(value, current.vatable),
    }));
    setErrors((current) => ({
      ...current,
      amount: undefined,
      netAmount: undefined,
      vatAmount: undefined,
    }));
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
      setErrors((current) => ({ ...current, exchangeRate: "Could not load the exchange rate." }));
      toast.error("Could not load the exchange rate for the selected currency.");
    }
  }

  function updateVATable(value: PettyCashVoucherFormValues["vatable"]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      vatable: value,
      ...calculatePettyCashVoucherVatFields(current.amount, value),
    }));
    setErrors((current) => ({
      ...current,
      netAmount: undefined,
      vatable: undefined,
      vatAmount: undefined,
    }));
  }

  function handleSubmit() {
    if (isReadonly || isSubmittingRef.current) return false;
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return false;
    }
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:petty-cash-voucher:submit:${mode}:${params.recordId ?? values.transactionNo}`,
    );
    if (!releaseSubmitLock) return false;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const nextErrors = validatePettyCashVoucherForm(values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted voucher fields.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }

    try {
      persistVoucher(PettyCashVoucherStatuses.forApproval);
      draft.clearDraft();
      toast.success(
        mode === "edit" ? "Petty Cash Voucher Updated and Submitted for Approval." : "Petty Cash Voucher Created and Submitted for Approval.",
      );
      options.onSaved?.();
      return true;
    } catch {
      toast.error("Could not save the petty cash voucher. Please try again.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
  }

  function handleSaveAsDraft() {
    if (isReadonly || isSubmittingRef.current) return false;
    const releaseSubmitLock = acquireModuleActionLock(
      `cash-disbursement:petty-cash-voucher:save-draft:${mode}:${params.recordId ?? values.transactionNo}`,
    );
    if (!releaseSubmitLock) return false;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      persistVoucher(PettyCashVoucherStatuses.draft);
      setErrors({});
      draft.clearDraft();
      toast.success("Petty Cash Voucher Saved as Draft.");
      options.onSaved?.();
      return true;
    } catch {
      toast.error("Could not save the petty cash voucher draft. Please try again.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return false;
    }
  }

  function handleUpdateStatus(status: PettyCashVoucherStatus) {
    if (!existingVoucher) {
      return false;
    }
    const releaseActionLock = acquireModuleActionLock(`cash-disbursement:petty-cash-voucher:status:${existingVoucher.id}:${status}`);
    if (!releaseActionLock) return false;
    try {
      persistVoucher(status);
      toast.success(`Petty Cash Voucher Marked as ${status}.`);
      return true;
    } catch {
      toast.error("Could not update the petty cash voucher. Please try again.");
      releaseActionLock();
      return false;
    }
  }

  function handleCopyFrom(recordIds: string[]) {
    if (isReadonly) {
      return;
    }

    const sourceRecord = PettyCashVoucherRecords.find((record) => recordIds.includes(record.id));

    if (!sourceRecord) {
      toast.error("Select a petty cash voucher to copy.");
      return;
    }

    const copiedValues = createPettyCashVoucherFormValues(sourceRecord);

    setValues((current) => ({
      ...copiedValues,
      attachments: current.attachments,
      documentDate: current.documentDate,
      status: current.status,
      transactionNo: current.transactionNo,
    }));
    setErrors({});
    toast.success(`Copied Details from ${sourceRecord.voucherNo}.`);
  }

  function persistVoucher(status: PettyCashVoucherStatus) {
    const nextRecord = createPettyCashVoucherRecord(values, status, existingVoucher);

    queryClient.setQueryData<PettyCashVoucherRecord[]>(PettyCashVoucherQueryKeys.vouchers(), (current = PettyCashVoucherRecords) => {
      const hasExistingRecord = current.some((record) => record.id === nextRecord.id);

      return hasExistingRecord ? current.map((record) => (record.id === nextRecord.id ? nextRecord : record)) : [nextRecord, ...current];
    });
    setValues((current) => ({ ...current, status }));

    return nextRecord;
  }

  function openPartyDrawer() {
    if (!isReadonly) {
      setIsPartyDrawerOpen(true);
    }
  }

  function closePartyDrawer() {
    setIsPartyDrawerOpen(false);
  }

  function openResponsibilityCenterDrawer() {
    if (!isReadonly) {
      setIsResponsibilityCenterDrawerOpen(true);
    }
  }

  function closeResponsibilityCenterDrawer() {
    setIsResponsibilityCenterDrawerOpen(false);
  }

  function handleCreateParty(record: PartyInformationRecord) {
    updateField("partyCode", record.partyCodeNo);
    updateField("partyName", getPartyDisplayName(record));
    closePartyDrawer();
  }

  function handleSaveResponsibilityCenter(center: ResponsibilityCenter) {
    updateField("responsibilityCenterCode", center.code);
    updateField("responsibilityCenter", center.name);
    closeResponsibilityCenterDrawer();
  }

  return {
    discardDraft: draft.discardDraft,
    hasDiscardableChanges: isDirty,
    saveDraft: draft.saveDraft,
    activeTab,
    closePartyDrawer,
    closeResponsibilityCenterDrawer,
    currencyOptions: transactionCurrency.currencyOptions,
    errors,
    existingVoucher,
    handleCreateParty,
    handleCopyFrom,
    handleSaveAsDraft,
    handleSaveResponsibilityCenter,
    handleSubmit,
    handleUpdateStatus,
    isPartyDrawerOpen,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isReportPreviewOpen,
    isSubmitting,
    isReadonly,
    isResponsibilityCenterDrawerOpen,
    mode,
    needsRecord: mode === "edit" || mode === "view",
    openPartyDrawer,
    openReportPreview: () => setIsReportPreviewOpen(true),
    closeReportPreview: () => setIsReportPreviewOpen(false),
    openResponsibilityCenterDrawer,
    partyStore,
    responsibilityCenterStore,
    setActiveTab,
    updateAmount,
    updateCurrency,
    updateField,
    updateVATable,
    values,
  };
}

