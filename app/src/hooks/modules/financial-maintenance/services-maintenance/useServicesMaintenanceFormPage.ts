"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  ServicesMaintenanceInitialFormValues,
  createServicesMaintenanceFormValues,
  updateServicesMaintenanceFromForm,
} from "@/app/src/data/modules/financial-maintenance/services-maintenance/ServicesMaintenanceData";
import { useServicesMaintenanceStore } from "@/app/src/hooks/modules/financial-maintenance/services-maintenance/useServicesMaintenance";
import type {
  ServicesMaintenance,
  ServicesMaintenanceAccountSetupMode,
  ServicesMaintenanceActionMode,
  ServicesMaintenanceFormErrors,
  ServicesMaintenanceFormValues,
  ServicesMaintenanceStatus,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import { validateServicesMaintenanceForm } from "@/app/src/validations/modules/financial-maintenance/services-maintenance/ServicesMaintenanceValidation";

type ServicesMaintenanceFormPageOptions = {
  existingService?: ServicesMaintenance;
  mode?: ServicesMaintenanceActionMode;
  onSaved?: () => void;
};

export function useServicesMaintenanceFormPage(options: ServicesMaintenanceFormPageOptions = {}) {
  const {
    addService,
    accountOptions,
    isAccountOptionsLoading,
    isNextAccountCodeLoading,
    nextAccountCode,
    refreshSetup,
    services,
    updateService,
  } = useServicesMaintenanceStore();
  const mode = options.mode ?? "add";
  const existingService = options.existingService;
  const isReadonly = mode === "view";
  const [values, setValues] = useState<ServicesMaintenanceFormValues>(() =>
    existingService ? createServicesMaintenanceFormValues(existingService) : ServicesMaintenanceInitialFormValues,
  );
  const [errors, setErrors] = useState<ServicesMaintenanceFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Key extends keyof ServicesMaintenanceFormValues>(field: Key, value: ServicesMaintenanceFormValues[Key]) {
    if (isReadonly) return;

    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "accountSetupMode" && value === "Auto" ? { revenueCoaId: "" } : {}),
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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

    if (!validateBeforeSubmit()) return;
    void saveService();
  }

  async function saveService() {
    setIsSubmitting(true);

    try {
      if (mode === "edit" && existingService) {
        await updateService(updateServicesMaintenanceFromForm(existingService, values));
      } else if (mode === "edit") {
        toast.error("Could not find the service to update.");
        return;
      } else {
        await addService(values);
        setValues(ServicesMaintenanceInitialFormValues);
        setErrors({});
        refreshSetup();
      }

      options.onSaved?.();
    } catch {
      return;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    accountOptions,
    errors,
    existingService,
    handleFieldChange: updateField,
    handleInputChange,
    handleSubmit,
    isAccountOptionsLoading,
    isNextAccountCodeLoading,
    isReadonly,
    isSubmitting,
    mode,
    nextAccountCode,
    refreshSetup,
    setAccountSetupMode: (value: ServicesMaintenanceAccountSetupMode) => updateField("accountSetupMode", value),
    setRevenueAccount: (value: string) => updateField("revenueCoaId", value),
    setStatus: (value: ServicesMaintenanceStatus) => updateField("status", value),
    validateBeforeSubmit,
    values,
  };
}
