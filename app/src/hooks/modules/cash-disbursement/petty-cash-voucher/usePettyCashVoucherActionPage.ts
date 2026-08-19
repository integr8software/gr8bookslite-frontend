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
  const hasEditedCurrencyRef = useRef(false);
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
    if (isReadonly) {
      return true;
    }

    const nextErrors = validatePettyCashVoucherForm(values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted voucher fields.");
      return false;
    }

    persistVoucher(PettyCashVoucherStatuses.forApproval);
    toast.success(
      mode === "edit" ? "Petty cash voucher updated and submitted for approval." : "Petty cash voucher created and submitted for approval.",
    );
    options.onSaved?.();
    return true;
  }

  function handleSaveAsDraft() {
    if (isReadonly) {
      return true;
    }

    persistVoucher(PettyCashVoucherStatuses.draft);
    setErrors({});
    toast.success("Petty cash voucher saved as draft.");
    options.onSaved?.();
    return true;
  }

  function handleUpdateStatus(status: PettyCashVoucherStatus) {
    if (!existingVoucher) {
      return false;
    }

    persistVoucher(status);
    toast.success(`Petty cash voucher marked as ${status}.`);
    return true;
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
    toast.success(`Copied details from ${sourceRecord.voucherNo}.`);
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
    isReadonly,
    isResponsibilityCenterDrawerOpen,
    mode,
    needsRecord: mode === "edit" || mode === "view",
    openPartyDrawer,
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

export type { PettyCashVoucherActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
