"use client";

import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useDefaultAccountStore } from "@/app/src/hooks/modules/financial-maintenance/default-account/useDefaultAccount";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { fetchDefaultAccountExpenseParentOptions } from "@/app/src/services/modules/financial-maintenance/default-account/DefaultAccountApi";
import { DefaultAccountQueryKeys } from "@/app/src/services/modules/financial-maintenance/default-account/DefaultAccountQueryKeys";
import { ApiClientError } from "@/app/src/services/shared/api/ApiClient";
import type {
  DefaultAccountFormErrors,
  DefaultAccountFormPageOptions,
  DefaultAccountFormValues,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { validateDefaultAccountForm } from "@/app/src/validations/modules/financial-maintenance/default-account/DefaultAccountValidation";

const EmptyDefaultAccountFormValues: DefaultAccountFormValues = {
  type: "EXPENSE",
  defaultAccountName: "",
  description: "",
  status: "Active",
  expenseParentCoaId: "",
};

export function useDefaultAccountFormPage({
  existingDefaultAccount,
  isOpen = true,
  mode,
  onSaved,
}: DefaultAccountFormPageOptions) {
  const { addDefaultAccount, isMutating, updateDefaultAccount } = useDefaultAccountStore(undefined, {
    refetchOnMount: false,
  });
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const companyId = authProfileQuery.data?.activeCompanyId ?? null;
  const expenseParentOptionsQuery = useQuery({
    queryKey: DefaultAccountQueryKeys.expenseParentOptions(companyId),
    queryFn: fetchDefaultAccountExpenseParentOptions,
    enabled: Boolean(companyId),
    retry: false,
  });
  const initialValues: DefaultAccountFormValues = existingDefaultAccount
    ? {
        type: existingDefaultAccount.type,
        defaultAccountName: existingDefaultAccount.defaultAccountName,
        description: existingDefaultAccount.description,
        status: existingDefaultAccount.status,
        expenseParentCoaId: existingDefaultAccount.expenseParentCoaId ?? "",
      }
    : EmptyDefaultAccountFormValues;
  const initialValuesRef = useRef<DefaultAccountFormValues>(initialValues);
  const [values, setValues] = useState<DefaultAccountFormValues>(initialValues);
  const [errors, setErrors] = useState<DefaultAccountFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const isReadonly = mode === "view";

  const draft = useModuleDraft({
    enabled: isOpen && !isReadonly,
    initialValues,
    key: createModuleDraftKey({
      mode,
      moduleId: "financial-maintenance:default-account",
      recordId: existingDefaultAccount?.id,
    }),
    setValues,
    values,
  });

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: value,
      ...(name === "type" && value !== "EXPENSE" ? { expenseParentCoaId: "" } : {}),
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function handleExpenseParentChange(value: string | string[]) {
    setValues((current) => ({
      ...current,
      expenseParentCoaId: Array.isArray(value) ? (value[0] ?? "") : value,
    }));
    setErrors((current) => ({ ...current, expenseParentCoaId: undefined }));
  }

  function handleStatusChange(status: DefaultAccountFormValues["status"]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, status }));
    setErrors((current) => ({ ...current, status: undefined }));
  }

  function validate() {
    const nextErrors = validateDefaultAccountForm(values);

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateBeforeSubmit() {
    return validate();
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
      `financial-maintenance:default-account:submit:${mode}:${existingDefaultAccount?.id ?? values.defaultAccountName ?? "new"}`,
    );

    if (!releaseSubmitLock) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    if (!validate()) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return;
    }

    try {
      if (mode === "edit" && existingDefaultAccount) {
        await updateDefaultAccount({ ...existingDefaultAccount, ...values });
      } else {
        await addDefaultAccount(values);
      }
      draft.clearDraft();
      onSaved();
    } catch (error) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();

      if (error instanceof ApiClientError && error.message.toLowerCase().includes("default account name")) {
        setErrors((current) => ({
          ...current,
          defaultAccountName: error.message,
        }));
        return;
      }

      setErrors((current) => ({
        ...current,
        defaultAccountName: error instanceof Error ? error.message : "Could not save default account.",
      }));
    }
  }

  return {
    clearDraft: draft.clearDraft,
    discardDraft: draft.discardDraft,
    saveDraft: draft.saveDraft,
    errors,
    expenseParentOptions: expenseParentOptionsQuery.data ?? [],
    handleInputChange,
    handleStatusChange,
    handleExpenseParentChange,
    handleSubmit,
    isLoadingExpenseParentOptions: expenseParentOptionsQuery.isLoading,
    isReadonly,
    isSubmitting: isSubmitting || isMutating,
    refreshExpenseParentOptions: expenseParentOptionsQuery.refetch,
    validateBeforeSubmit,
    values,
  };
}
