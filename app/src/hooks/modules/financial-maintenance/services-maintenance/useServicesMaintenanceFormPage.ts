"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import {
  ServicesMaintenanceInitialFormValues,
  createServicesMaintenanceFormValues,
  updateServicesMaintenanceFromForm,
} from "@/app/src/data/modules/financial-maintenance/services-maintenance/ServicesMaintenanceData";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useServicesMaintenanceStore } from "@/app/src/hooks/modules/financial-maintenance/services-maintenance/useServicesMaintenance";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { FetchNextChartAccountCode } from "@/app/src/services/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsApi";
import { fetchDefaultAccountExpenseParentOptions } from "@/app/src/services/modules/financial-maintenance/default-account/DefaultAccountApi";
import { DefaultAccountQueryKeys } from "@/app/src/services/modules/financial-maintenance/default-account/DefaultAccountQueryKeys";
import type {
  ServicesMaintenanceAccountSetupMode,
  ServicesMaintenanceFormErrors,
  ServicesMaintenanceFormPageOptions,
  ServicesMaintenanceFormValues,
  ServicesMaintenanceStatus,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import { validateServicesMaintenanceForm } from "@/app/src/validations/modules/financial-maintenance/services-maintenance/ServicesMaintenanceValidation";

export function useServicesMaintenanceFormPage(options: ServicesMaintenanceFormPageOptions = {}) {
  const {
    addService,
    accountOptions,
    isAccountOptionsLoading,
    isNextAccountCodeLoading,
    nextAccountCode,
    permissions,
    refreshSetup,
    services,
    updateService,
  } = useServicesMaintenanceStore(undefined, { refetchOnMount: false });
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const companyId = authProfileQuery.data?.activeCompanyId ?? null;
  const expenseParentOptionsQuery = useQuery({
    queryKey: DefaultAccountQueryKeys.expenseParentOptions(companyId),
    queryFn: fetchDefaultAccountExpenseParentOptions,
    enabled: Boolean(companyId),
    retry: false,
  });
  const mode = options.mode ?? "add";
  const existingService = options.existingService;
  const isReadonly = mode === "view";
  const initialValues = existingService ? createServicesMaintenanceFormValues(existingService) : ServicesMaintenanceInitialFormValues;
  const initialValuesRef = useRef<ServicesMaintenanceFormValues>(initialValues);
  const [values, setValues] = useState<ServicesMaintenanceFormValues>(initialValues);
  const [errors, setErrors] = useState<ServicesMaintenanceFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const draft = useModuleDraft({
    enabled: (options.isOpen ?? true) && !isReadonly,
    initialValues,
    key: createModuleDraftKey({
      mode,
      moduleId: "financial-maintenance:services-maintenance",
      recordId: existingService?.id,
    }),
    setValues,
    values,
  });

  const isPurchaseAuto = values.serviceType === "Purchase of Service" && values.accountSetupMode === "Auto";
  const expenseNextAccountCodeQuery = useQuery({
    queryKey: ["chart-of-accounts", "next-code", companyId, values.expenseParentCoaId, "SPECIFIC"],
    queryFn: () =>
      FetchNextChartAccountCode({
        accountLevel: "SPECIFIC",
        parentAccountId: values.expenseParentCoaId,
      }),
    enabled: Boolean(companyId && isPurchaseAuto && values.expenseParentCoaId),
    retry: false,
  });

  function updateField<Key extends keyof ServicesMaintenanceFormValues>(field: Key, value: ServicesMaintenanceFormValues[Key]) {
    if (isReadonly) return;

    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "accountSetupMode" && value === "Auto" ? { revenueCoaId: "" } : {}),
      ...(field === "accountSetupMode" && value === "Existing" ? { expenseParentCoaId: "" } : {}),
      ...(field === "serviceType" && value !== "Purchase of Service" ? { expenseParentCoaId: "" } : {}),
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleExpenseParentChange(value: string | string[]) {
    const parentId = Array.isArray(value) ? (value[0] ?? "") : value;
    updateField("expenseParentCoaId", parentId);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const field = event.target.name as keyof ServicesMaintenanceFormValues;

    updateField(field, event.target.value as never);
  }

  function validateBeforeSubmit() {
    const nextErrors = validateServicesMaintenanceForm(values, {
      excludedServiceId: existingService?.id,
      services,
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please review the highlighted fields and enter valid information.");
      return false;
    }

    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isReadonly || isSubmittingRef.current) return;

    const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return;
    }

    const releaseSubmitLock = acquireModuleActionLock(
      `financial-maintenance:services-maintenance:submit:${mode}:${existingService?.id ?? values.serviceName ?? "new"}`,
    );

    if (!releaseSubmitLock) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    if (!validateBeforeSubmit()) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return;
    }

    void saveService(releaseSubmitLock);
  }

  async function saveService(releaseSubmitLock: () => void) {
    try {
      if (mode === "edit" && existingService) {
        await updateService(updateServicesMaintenanceFromForm(existingService, values));
      } else if (mode === "edit") {
        toast.error("Could not find the service to update.");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        releaseSubmitLock();
        return;
      } else {
        await addService(values);
        setValues(ServicesMaintenanceInitialFormValues);
        setErrors({});
        refreshSetup();
      }

      draft.clearDraft();
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      options.onSaved?.();
    } catch {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
    }
  }

  return {
    clearDraft: draft.clearDraft,
    discardDraft: draft.discardDraft,
    saveDraft: draft.saveDraft,
    accountOptions,
    errors,
    existingService,
    expenseNextAccountCode: expenseNextAccountCodeQuery.data,
    expenseParentOptions: expenseParentOptionsQuery.data ?? [],
    handleExpenseParentChange,
    handleFieldChange: updateField,
    handleInputChange,
    handleSubmit,
    isAccountOptionsLoading,
    isExpenseNextAccountCodeLoading: expenseNextAccountCodeQuery.isFetching,
    isLoadingExpenseParentOptions: expenseParentOptionsQuery.isLoading,
    isNextAccountCodeLoading,
    isReadonly,
    isSubmitting,
    mode,
    nextAccountCode,
    permissions,
    refreshExpenseParentOptions: expenseParentOptionsQuery.refetch,
    refreshSetup,
    setAccountSetupMode: (value: ServicesMaintenanceAccountSetupMode) => updateField("accountSetupMode", value),
    setRevenueAccount: (value: string) => updateField("revenueCoaId", value),
    setStatus: (value: ServicesMaintenanceStatus) => updateField("status", value),
    validateBeforeSubmit,
    values,
  };
}
