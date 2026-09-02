"use client";

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DiscountMaintenanceHref } from "@/app/src/constants/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceConstants";
import {
  DiscountMaintenanceInitialFormValues,
  createDiscountFromForm,
  createDiscountMaintenanceFormValues,
  getDiscountAccountCode,
  getDiscountAccountGroupPath,
  getDiscountAccountTitle,
  updateDiscountFromForm,
} from "@/app/src/data/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceData";
import { useDiscountMaintenanceStore } from "@/app/src/hooks/modules/financial-maintenance/discount-maintenance/useDiscountMaintenance";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import type {
  DiscountMaintenanceActionMode,
  DiscountMaintenanceFormErrors,
  DiscountMaintenanceFormPageOptions,
  DiscountMaintenanceFormValues,
} from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";
import { validateDiscountMaintenanceForm } from "@/app/src/validations/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceValidation";

export function useDiscountMaintenanceFormPage(options: DiscountMaintenanceFormPageOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const { addDiscount, discounts, isMutating, updateDiscount } = useDiscountMaintenanceStore(undefined, {
    refetchOnMount: false,
  });
  const mode = options.mode ?? getActionMode(pathname);
  const existingDiscount = options.existingDiscount ?? discounts.find((discount) => discount.id === params.recordId);
  const isReadonly = mode === "view";
  const initialValues = existingDiscount ? createDiscountMaintenanceFormValues(existingDiscount) : DiscountMaintenanceInitialFormValues;
  const initialValuesRef = useRef<DiscountMaintenanceFormValues>(initialValues);
  const [values, setValues] = useState<DiscountMaintenanceFormValues>(initialValues);
  const [errors, setErrors] = useState<DiscountMaintenanceFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const draft = useModuleDraft({
    enabled: (options.isOpen ?? true) && !isReadonly,
    initialValues,
    key: createModuleDraftKey({
      mode,
      moduleId: "financial-maintenance:discount-maintenance",
      recordId: params.recordId ?? existingDiscount?.id,
    }),
    setValues,
    values,
  });

  const generatedAccount = useMemo(
    () => ({
      accountCode: getDiscountAccountCode(values.type, values.name),
      accountGroupPath: getDiscountAccountGroupPath(values.type),
      accountTitle: getDiscountAccountTitle(values.type, values.name),
    }),
    [values.name, values.type],
  );

  function updateField(
    field: keyof DiscountMaintenanceFormValues,
    value: DiscountMaintenanceFormValues[keyof DiscountMaintenanceFormValues],
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    updateField(event.target.name as keyof DiscountMaintenanceFormValues, event.target.value);
  }

  function validateBeforeSubmit() {
    const nextErrors = validateDiscountMaintenanceForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please fix the highlighted discount fields.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isReadonly || isSubmittingRef.current) {
      return;
    }

    const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return;
    }

    const releaseSubmitLock = acquireModuleActionLock(
      `financial-maintenance:discount-maintenance:submit:${mode}:${existingDiscount?.id ?? values.name ?? "new"}`,
    );

    if (!releaseSubmitLock) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    if (!validateBeforeSubmit()) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return;
    }

    try {
      if (mode === "edit" && existingDiscount) {
        await updateDiscount(updateDiscountFromForm(existingDiscount, values));
      } else if (mode === "edit") {
        toast.error("Could not find the discount to update.");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        releaseSubmitLock();
        return;
      } else {
        await addDiscount(createDiscountFromForm(values));
        setValues(DiscountMaintenanceInitialFormValues);
        setErrors({});
      }

      draft.clearDraft();
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      options.onSaved?.();
      if (!options.onSaved) router.push(DiscountMaintenanceHref);
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
    errors,
    existingDiscount,
    generatedAccount,
    handleInputChange,
    handleStatusChange: (status: DiscountMaintenanceFormValues["status"]) => updateField("status", status),
    handleSubmit,
    isMutating: isSubmitting || isMutating,
    isReadonly,
    mode,
    needsRecord: mode === "edit" || mode === "view",
    validateBeforeSubmit,
    values,
  };
}

function getActionMode(pathname: string): DiscountMaintenanceActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
