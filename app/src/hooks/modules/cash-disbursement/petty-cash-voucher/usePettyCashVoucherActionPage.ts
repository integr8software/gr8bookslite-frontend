"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  PettyCashVoucherActionModes,
  PettyCashVoucherVATableOptions,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import {
  calculatePettyCashVoucherTaxFields,
  createPettyCashVoucherFormValues,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import { getPartyDefaultEwtCode, getPartyDefaultVatCode, type PartyTaxDefaults } from "@/app/src/data/shared/tax/PartyTaxDefaultsData";
import {
  fetchPettyCashVoucherById,
  createPettyCashVoucherApi,
  updatePettyCashVoucherApi,
  updatePettyCashVoucherStatusApi,
  fetchNextPettyCashVoucherNo,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherApi";
import { PettyCashVoucherQueryKeys } from "@/app/src/services/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherQueryKeys";
import type {
  PettyCashVoucherActionTab,
  PettyCashVoucherActionMode,
  PettyCashVoucherFormErrors,
  PettyCashVoucherFormValues,
  PettyCashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { validatePettyCashVoucherForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherValidation";
import { useTransactionCurrency } from "@/app/src/hooks/shared/currency/useTransactionCurrency";
import { useAlphanumericTaxCodes } from "@/app/src/hooks/shared/tax/useAlphanumericTaxCodeOptions";
import { useTaxDefaultAccountOptionGroups } from "@/app/src/hooks/shared/tax/useTaxOptions";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { hasModuleDraftChanges } from "@/app/src/hooks/shared/module/useModuleDraftChanges";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { createEwtOptionsFromDefaultAccounts, createVatOptionsFromDefaultAccounts } from "@/app/src/data/shared/tax/TaxData";

export function usePettyCashVoucherActionPage(options: { mode: PettyCashVoucherActionMode; onSaved?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const transactionCurrency = useTransactionCurrency();
  const taxCodesQuery = useAlphanumericTaxCodes();
  const taxDefaultAccountOptionsQuery = useTaxDefaultAccountOptionGroups();
  const partyStore = usePartyManagementStore();
  const responsibilityCenterStore = useResponsibilityCenterStore();
  const params = useParams<{ recordId?: string }>();
  const { mode } = options;
  const isReadonly = mode === PettyCashVoucherActionModes.View;

  const voucherQuery = useQuery({
    queryKey: [...PettyCashVoucherQueryKeys.vouchers(), params.recordId],
    queryFn: () => fetchPettyCashVoucherById(params.recordId!),
    enabled: Boolean(params.recordId) && mode !== PettyCashVoucherActionModes.Add,
  });

  const record = voucherQuery.data;
  const taxCodes = useMemo(() => taxCodesQuery.data ?? [], [taxCodesQuery.data]);
  const vatOptions = useMemo(
    () =>
      createVatOptionsFromDefaultAccounts(
        taxDefaultAccountOptionsQuery.data?.find((group) => group.classification === "input-purchases")?.options ?? [],
      ),
    [taxDefaultAccountOptionsQuery.data],
  );
  const ewtOptions = useMemo(
    () =>
      createEwtOptionsFromDefaultAccounts(
        taxDefaultAccountOptionsQuery.data?.find((group) => group.classification === "purchase-ewt")?.options ?? [],
      ),
    [taxDefaultAccountOptionsQuery.data],
  );
  const vatableOptions = useMemo(() => PettyCashVoucherVATableOptions.map((value) => ({ name: value, value })), []);

  const [values, setValues] = useState<PettyCashVoucherFormValues>(() =>
    createPettyCashVoucherFormValues(record, "", transactionCurrency.baseCurrencyCode),
  );
  const [errors, setErrors] = useState<PettyCashVoucherFormErrors>({});
  const [activeTab, setActiveTab] = useState<PettyCashVoucherActionTab>("details");
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const hasEditedCurrencyRef = useRef(false);
  const [initialValues, setInitialValues] = useState(values);
  const rawIsDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const isDirty = mode === PettyCashVoucherActionModes.Add ? hasModuleDraftChanges(values, initialValues, ["transactionNo"]) : rawIsDirty;

  async function refreshNextTransactionNo() {
    try {
      const nextNo = await fetchNextPettyCashVoucherNo();

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
      const formVals = createPettyCashVoucherFormValues(record, record.voucherNo, record.currency || "PHP", taxCodes);
      queueMicrotask(() => {
        setValues(formVals);
        setInitialValues(formVals);
      });
    }
  }, [record, taxCodes]);

  useEffect(() => {
    if (mode === PettyCashVoucherActionModes.Add) {
      queueMicrotask(() => void refreshNextTransactionNo());
    }
  }, [mode]);

  const draft = useModuleDraft({
    enabled: !isReadonly,
    initialValues,
    isDirty,
    key: createModuleDraftKey({ mode, moduleId: "cash-disbursement:petty-cash-voucher", recordId: params.recordId }),
    setValues,
    values,
  });

  useEffect(() => {
    if (mode !== PettyCashVoucherActionModes.Add || !transactionCurrency.isBaseCurrencyResolved || hasEditedCurrencyRef.current) return;
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

  function updateField<TKey extends keyof PettyCashVoucherFormValues>(field: TKey, value: PettyCashVoucherFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => {
      const next = { ...current, [field]: value };
      if (["amount", "vatType", "vatRate", "vatable", "ewtCode", "ewtRate"].includes(field)) {
        return {
          ...next,
          ...calculatePettyCashVoucherTaxFields(next.amount, next.vatType, next.ewtCode),
        };
      }
      return next;
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handlePartyChange(partyCode: string, partyName: string, partyDefaults?: PartyTaxDefaults) {
    if (isReadonly) return;

    const selectedParty =
      partyDefaults ??
      partyStore.records.find(
        (party) => party.partyCodeNo === partyCode || getPartyDisplayName(party).trim().toLowerCase() === partyName.trim().toLowerCase(),
      );
    const vatType = getPartyDefaultVatCode(selectedParty, taxCodes);
    const ewtCode = getPartyDefaultEwtCode(selectedParty, taxCodes);

    setValues((current) => {
      const next = {
        ...current,
        ewtCode,
        partyCode,
        partyName,
        vatType,
        vatable: vatType ? "True" : "False",
      } satisfies PettyCashVoucherFormValues;

      return {
        ...next,
        ...calculatePettyCashVoucherTaxFields(next.amount, next.vatType, next.ewtCode, taxCodes),
      };
    });
    setErrors((current) => ({
      ...current,
      ewtCode: undefined,
      partyCode: undefined,
      partyName: undefined,
      vatType: undefined,
      vatable: undefined,
    }));
  }

  async function updateCurrency(currencyCode: string) {
    hasEditedCurrencyRef.current = true;
    updateField("currency", currencyCode);
    setErrors((current) => ({ ...current, currency: undefined, exchangeRate: undefined }));

    try {
      const exchangeRate = await transactionCurrency.loadExchangeRate(currencyCode);
      if (exchangeRate != null) {
        updateField("exchangeRate", String(exchangeRate));
      }
    } catch {
      toast.error("Could not load exchange rate.");
    }
  }

  const saveMutation = useMutation({
    mutationFn: async (submitValues: PettyCashVoucherFormValues) => {
      if (mode === PettyCashVoucherActionModes.Add) {
        return await createPettyCashVoucherApi(submitValues);
      }
      return await updatePettyCashVoucherApi(params.recordId!, submitValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PettyCashVoucherQueryKeys.vouchers() });
      draft.clearDraft();
      toast.success(`Petty Cash Voucher ${mode === PettyCashVoucherActionModes.Add ? "created" : "updated"} successfully.`);
      if (options.onSaved) {
        options.onSaved();
      } else {
        router.push("/cash-disbursement/petty-cash-voucher");
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save Petty Cash Voucher.";
      toast.error(msg);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: PettyCashVoucherStatus) => {
      return await updatePettyCashVoucherStatusApi(params.recordId!, status);
    },
    onSuccess: (updatedRecord, status) => {
      queryClient.invalidateQueries({ queryKey: PettyCashVoucherQueryKeys.vouchers() });
      queryClient.setQueryData([...PettyCashVoucherQueryKeys.vouchers(), params.recordId], updatedRecord);
      setValues((cur) => ({ ...cur, status }));
      toast.success(`Petty Cash Voucher marked as ${status}.`);
    },
    onError: () => {
      toast.error("Could not update status.");
    },
  });

  async function submit(status?: PettyCashVoucherStatus) {
    const nextValues = status ? { ...values, status } : values;
    const nextErrors = validatePettyCashVoucherForm(nextValues);
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

  async function handleUpdateStatus(status: PettyCashVoucherStatus) {
    try {
      await updateStatusMutation.mutateAsync(status);
      return true;
    } catch {
      return false;
    }
  }

  function handleCreateParty(party: PartyInformationRecord) {
    const displayName = getPartyDisplayName(party);
    handlePartyChange(party.partyCodeNo, displayName);
    setIsPartyDrawerOpen(false);
  }

  function handleSaveResponsibilityCenter(center: ResponsibilityCenter) {
    updateField("responsibilityCenterCode", center.code);
    updateField("responsibilityCenter", center.name);
    setIsResponsibilityCenterDrawerOpen(false);
  }

  async function resetAddValuesWithNextTransactionNo() {
    const nextValues = createPettyCashVoucherFormValues(undefined, "", transactionCurrency.baseCurrencyCode);

    try {
      const nextNo = await fetchNextPettyCashVoucherNo();

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

    if (mode === PettyCashVoucherActionModes.Add) {
      void resetAddValuesWithNextTransactionNo();
      return;
    }

    draft.discardDraft();
  }

  return {
    activeTab,
    handleSubmit: () => submit("For Approval"),
    handleSaveAsDraft: () => submit("Draft"),
    closePartyDrawer: () => setIsPartyDrawerOpen(false),
    closePreview: () => setIsReportPreviewOpen(false),
    closeReportPreview: () => setIsReportPreviewOpen(false),
    closeResponsibilityCenterDrawer: () => setIsResponsibilityCenterDrawerOpen(false),
    currencyOptions: transactionCurrency.currencyOptions,
    discardDraft,
    draft,
    errors,
    ewtOptions,
    existingVoucher: record,
    handleCreateParty,
    handlePartyChange,
    handleSaveResponsibilityCenter,
    handleUpdateStatus,
    hasDiscardableChanges: isDirty,
    isDirty,
    isExchangeRateLoading: transactionCurrency.isExchangeRateLoading,
    isLoading: voucherQuery.isLoading,
    isPartyDrawerOpen,
    isPreviewOpen: isReportPreviewOpen,
    isReadonly,
    isRecordMissing: mode !== PettyCashVoucherActionModes.Add && !voucherQuery.isLoading && !record,
    isReportPreviewOpen,
    isResponsibilityCenterDrawerOpen,
    isSubmitting: saveMutation.isPending || updateStatusMutation.isPending,
    mode,
    needsRecord: mode !== PettyCashVoucherActionModes.Add,
    openPartyDrawer: () => setIsPartyDrawerOpen(true),
    openPreview: () => setIsReportPreviewOpen(true),
    openReportPreview: () => setIsReportPreviewOpen(true),
    openResponsibilityCenterDrawer: () => setIsResponsibilityCenterDrawerOpen(true),
    partyStore,
    record,
    responsibilityCenterStore,
    save: submit,
    saveDraft: draft.saveDraft,
    setActiveTab,
    setIsPreviewOpen: setIsReportPreviewOpen,
    submit,
    updateCurrency,
    updateField,
    updateStatus: handleUpdateStatus,
    validate: (status?: PettyCashVoucherStatus) => {
      const nextValues = status ? { ...values, status } : values;
      const errs = validatePettyCashVoucherForm(nextValues);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    vatOptions,
    vatTypeOptions: vatOptions,
    vatableOptions,
    values,
  };
}
