"use client";

import { useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  PaymentTypeInitialFormValues,
  createPaymentTypeFormValues,
  createPaymentTypeFromForm,
  updatePaymentTypeFromForm,
} from "@/app/src/data/modules/financial-maintenance/payment-type/PaymentTypeData";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentType";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import type {
  PaymentTypeFormErrors,
  PaymentTypeFormPageOptions,
  PaymentTypeFormValues,
  PaymentTypeRecord,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import { validatePaymentTypeForm } from "@/app/src/validations/modules/financial-maintenance/payment-type/PaymentTypeValidation";

export function usePaymentTypeFormPage({ existingPaymentType, isOpen = true, mode, onSaved }: PaymentTypeFormPageOptions) {
  const { addPaymentType, isMutating, paymentTypes, updatePaymentType } = usePaymentTypeStore(undefined, {
    refetchOnMount: false,
  });
  const isReadonly = mode === "view";
  const initialValues: PaymentTypeFormValues = existingPaymentType
    ? createPaymentTypeFormValues(existingPaymentType)
    : {
        ...PaymentTypeInitialFormValues,
        sortOrder: String(getNextPaymentTypeSortOrder(paymentTypes)),
      };
  const initialValuesRef = useRef<PaymentTypeFormValues>(initialValues);
  const [values, setValues] = useState<PaymentTypeFormValues>(initialValues);
  const [errors, setErrors] = useState<PaymentTypeFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const draft = useModuleDraft({
    enabled: isOpen && !isReadonly,
    initialValues,
    key: createModuleDraftKey({
      mode,
      moduleId: "financial-maintenance:payment-type",
      recordId: existingPaymentType?.id,
    }),
    setValues,
    values,
  });

  function handleInputChange<TKey extends keyof PaymentTypeFormValues>(field: TKey, value: PaymentTypeFormValues[TKey]) {
    if (isReadonly || isSubmitting) {
      return;
    }

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateBeforeSubmit() {
    const nextErrors = validatePaymentTypeForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isReadonly) {
      onSaved();
      return;
    }

    if (isSubmittingRef.current) {
      return;
    }

    const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
    if (mode === "edit" && !isDirty) {
      toast.error("No changes to save.");
      return;
    }

    const releaseSubmitLock = acquireModuleActionLock(
      `financial-maintenance:payment-type:submit:${mode}:${existingPaymentType?.id ?? values.paymentType ?? "new"}`,
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
      if (mode === "edit" && existingPaymentType) {
        await updatePaymentType(updatePaymentTypeFromForm(existingPaymentType, values));
      } else {
        await addPaymentType(createPaymentTypeFromForm(values));
        setValues({
          ...PaymentTypeInitialFormValues,
          sortOrder: String(getNextPaymentTypeSortOrder(paymentTypes)),
        });
        setErrors({});
      }

      draft.clearDraft();
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      onSaved();
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
    handleInputChange,
    handleSubmit,
    isMutating: isSubmitting || isMutating,
    isReadonly,
    isSubmitting: isSubmitting || isMutating,
    validateBeforeSubmit,
    values,
  };
}

function getNextPaymentTypeSortOrder(paymentTypes: PaymentTypeRecord[]) {
  return Math.max(0, ...paymentTypes.map((paymentType) => paymentType.sortOrder)) + 10;
}

export const usePaymentTypeActionPage = usePaymentTypeFormPage;
