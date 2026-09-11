"use client";

import { type ChangeEvent, type FormEvent, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { usePostingAccountLookup } from "@/app/src/hooks/modules/financial-maintenance/charts-of-accounts/useChartOfAccountsLookup";
import { useDisbursementTypeStore } from "@/app/src/hooks/modules/financial-maintenance/disbursement-type/useDisbursementType";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { fetchDisbursementTypeExpenseParentOptions } from "@/app/src/services/modules/financial-maintenance/disbursement-type/DisbursementTypeApi";
import { DisbursementTypeQueryKeys } from "@/app/src/services/modules/financial-maintenance/disbursement-type/DisbursementTypeQueryKeys";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { ApiClientError } from "@/app/src/services/shared/api/ApiClient";
import type { PostingAccountLookupOption } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartOfAccountsLookupTypes";
import type {
  DisbursementType,
  DisbursementTypeFormErrors,
  DisbursementTypeFormPageOptions,
  DisbursementTypeFormValues,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import { validateDisbursementTypeForm } from "@/app/src/validations/modules/financial-maintenance/disbursement-type/DisbursementTypeMaintenanceValidation";

const EmptyDisbursementTypeFormValues: DisbursementTypeFormValues = {
  type: "EXPENSE",
  disbursementTypeName: "",
  description: "",
  status: "Active",
  accountSetupMode: "Existing",
  expenseCoaId: "",
  expenseParentCoaId: "",
};

export function useDisbursementTypeFormPage({ existingDisbursementType, isOpen = true, kind = "disbursement", mode, onSaved }: DisbursementTypeFormPageOptions) {
  const { addDisbursementType, isMutating, updateDisbursementType } = useDisbursementTypeStore(undefined, {
    kind,
    refetchOnMount: false,
  });
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const companyId = authProfileQuery.data?.activeCompanyId ?? null;
  const expenseParentOptionsQuery = useQuery({
    queryKey: DisbursementTypeQueryKeys.expenseParentOptions(companyId, kind),
    queryFn: () => fetchDisbursementTypeExpenseParentOptions(kind),
    enabled: Boolean(companyId && kind !== "collection"),
    retry: false,
  });
  const postingAccountsQuery = usePostingAccountLookup();
  const accountOptions = useMemo(() => createPostingAccountOptions(postingAccountsQuery.data ?? []), [postingAccountsQuery.data]);
  const initialValues: DisbursementTypeFormValues = existingDisbursementType
    ? {
        type: existingDisbursementType.type,
        disbursementTypeName: existingDisbursementType.disbursementTypeName,
        description: existingDisbursementType.description,
        status: existingDisbursementType.status,
        accountSetupMode: existingDisbursementType.accountSetupMode ?? "Existing",
        expenseCoaId: existingDisbursementType.expenseCoaId ?? "",
        expenseParentCoaId: existingDisbursementType.expenseParentCoaId ?? "",
      }
    : {
        ...EmptyDisbursementTypeFormValues,
        type: kind === "collection" ? "COLLECTION" : "EXPENSE",
      };
  const initialValuesRef = useRef<DisbursementTypeFormValues>(initialValues);
  const [values, setValues] = useState<DisbursementTypeFormValues>(initialValues);
  const [errors, setErrors] = useState<DisbursementTypeFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const isReadonly = mode === "view";

  const draft = useModuleDraft({
    enabled: isOpen && !isReadonly,
    initialValues,
    key: createModuleDraftKey({
      mode,
      moduleId: `financial-maintenance:${kind === "collection" ? "collection-type" : "disbursement-type"}`,
      recordId: existingDisbursementType?.id,
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
      ...(name === "accountSetupMode" && value === "Auto" ? { expenseCoaId: "" } : {}),
      ...(name === "accountSetupMode" && value === "Existing" ? { expenseParentCoaId: "" } : {}),
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

  function handleAccountSetupModeChange(value: DisbursementTypeFormValues["accountSetupMode"]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      accountSetupMode: value,
      ...(value === "Auto" ? { expenseCoaId: "" } : { expenseParentCoaId: "" }),
    }));
    setErrors((current) => ({ ...current, accountSetupMode: undefined, expenseCoaId: undefined, expenseParentCoaId: undefined }));
  }

  function handleExpenseAccountChange(value: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      expenseCoaId: value,
    }));
    setErrors((current) => ({ ...current, expenseCoaId: undefined }));
  }

  function handleStatusChange(status: DisbursementTypeFormValues["status"]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, status }));
    setErrors((current) => ({ ...current, status: undefined }));
  }

  function validate() {
    const nextErrors = validateDisbursementTypeForm(values);

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
      `financial-maintenance:disbursement-type:submit:${mode}:${existingDisbursementType?.id ?? values.disbursementTypeName ?? "new"}`,
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
      let savedRecord: DisbursementType | undefined;
      if (mode === "edit" && existingDisbursementType) {
        savedRecord = await updateDisbursementType({ ...existingDisbursementType, ...values });
      } else {
        savedRecord = await addDisbursementType(values);
        setValues(EmptyDisbursementTypeFormValues);
        setErrors({});
      }
      draft.clearDraft();
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      onSaved?.(savedRecord);
    } catch (error) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();

      if (error instanceof ApiClientError && error.message.toLowerCase().includes("default account name")) {
        setErrors((current) => ({
          ...current,
          disbursementTypeName: error.message,
        }));
        return;
      }

      setErrors((current) => ({
        ...current,
        disbursementTypeName: error instanceof Error ? error.message : "Could not save disbursement type.",
      }));
    }
  }

  return {
    clearDraft: draft.clearDraft,
    discardDraft: draft.discardDraft,
    saveDraft: draft.saveDraft,
    accountOptions,
    errors,
    expenseParentOptions: expenseParentOptionsQuery.data ?? [],
    handleAccountSetupModeChange,
    handleExpenseAccountChange,
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

function createPostingAccountOptions(accounts: PostingAccountLookupOption[]): ModuleChartAccount[] {
  return accounts.map((account) => ({
    accountCategory: "SPECIFIC",
    accountName: account.accountTitle,
    accountNumber: account.accountCode,
    accountType: String(account.accountType ?? ""),
    description: account.description || account.accountTitle,
    id: account.accountId || (account as unknown as { id?: string }).id || "",
    normalBalance: account.accountNature === "CREDIT" ? "Credit" : "Debit",
    statementGroup: "",
    statementSection: "",
    status: String(account.status ?? "").toLowerCase() === "inactive" ? "Inactive" : "Active",
  }));
}
