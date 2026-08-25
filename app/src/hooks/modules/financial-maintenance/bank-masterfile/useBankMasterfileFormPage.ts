"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  BankMasterfileInitialFormValues,
  createBankMasterfileFormValues,
  updateBankMasterfileFromForm,
} from "@/app/src/data/modules/financial-maintenance/bank-masterfile/BankMasterfileData";
import { useBankMasterfileStore } from "@/app/src/hooks/modules/financial-maintenance/bank-masterfile/useBankMasterfile";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import type {
  BankMasterfileFormErrors,
  BankMasterfileFormPageOptions,
  BankMasterfileFormValues,
} from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";
import { validateBankMasterfileForm } from "@/app/src/validations/modules/financial-maintenance/bank-masterfile/BankMasterfileValidation";

export function useBankMasterfileFormPage(options: BankMasterfileFormPageOptions = {}) {
  const { addBank, isNextAccountCodeLoading, nextAccountCode, refreshNextAccountCode, updateBank } = useBankMasterfileStore(
    undefined,
    { refetchOnMount: false },
  );
  const mode = options.mode ?? "add";
  const existingBank = options.existingBank;
  const isReadonly = mode === "view";
  const initialValues = existingBank ? createBankMasterfileFormValues(existingBank) : BankMasterfileInitialFormValues;
  const initialValuesRef = useRef<BankMasterfileFormValues>(initialValues);
  const [values, setValues] = useState<BankMasterfileFormValues>(initialValues);
  const [errors, setErrors] = useState<BankMasterfileFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [hasTouchedStatus, setHasTouchedStatus] = useState(false);

  const draft = useModuleDraft({
    enabled: (options.isOpen ?? true) && !isReadonly,
    initialValues,
    key: createModuleDraftKey({
      mode,
      moduleId: "financial-maintenance:bank-masterfile",
      recordId: existingBank?.id,
    }),
    setValues,
    values,
  });

  function updateField(field: keyof BankMasterfileFormValues, value: BankMasterfileFormValues[keyof BankMasterfileFormValues]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      [field]: value,
      ...(shouldAutoActivateBank(field, value, current) ? { status: "Active" as const } : {}),
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const field = event.target.name as keyof BankMasterfileFormValues;
    const value = event.target.type === "checkbox" && event.target instanceof HTMLInputElement ? event.target.checked : event.target.value;

    if (field === "status") {
      setHasTouchedStatus(true);
    }
    updateField(field, value);
  }

  function shouldAutoActivateBank(
    field: keyof BankMasterfileFormValues,
    value: BankMasterfileFormValues[keyof BankMasterfileFormValues],
    current: BankMasterfileFormValues,
  ) {
    return (
      field === "accountNumber" &&
      !hasTouchedStatus &&
      mode === "edit" &&
      existingBank?.status === "Inactive" &&
      !existingBank.accountNumber.trim() &&
      current.status === "Inactive" &&
      typeof value === "string" &&
      Boolean(value.trim())
    );
  }

  function validateBeforeSubmit() {
    const nextErrors = validateBankMasterfileForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please review the highlighted fields and enter valid information.");
      return false;
    }

    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      `financial-maintenance:bank-masterfile:submit:${mode}:${existingBank?.id ?? values.accountNumber ?? "new"}`,
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

    void saveBank(releaseSubmitLock);
  }

  async function saveBank(releaseSubmitLock: () => void) {
    try {
      if (mode === "edit" && existingBank) {
        await updateBank(updateBankMasterfileFromForm(existingBank, values));
      } else if (mode === "edit") {
        toast.error("Could not find the bank account to update.");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        releaseSubmitLock();
        return;
      } else {
        await addBank(values);
        setValues(BankMasterfileInitialFormValues);
        setErrors({});
        refreshNextAccountCode();
      }

      draft.clearDraft();
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
    errors,
    handleFieldChange: updateField,
    existingBank,
    handleInputChange,
    handleSubmit,
    isNextAccountCodeLoading,
    isReadonly,
    isSubmitting,
    mode,
    nextAccountCode,
    validateBeforeSubmit,
    values,
  };
}
