"use client";

import { type ChangeEvent, type FormEvent, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { usePostingAccountLookup } from "@/app/src/hooks/modules/financial-maintenance/charts-of-accounts/useChartOfAccountsLookup";
import { useCollectionTypeStore } from "@/app/src/hooks/modules/financial-maintenance/collection-type/useCollectionType";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { ApiClientError } from "@/app/src/services/shared/api/ApiClient";
import type { PostingAccountLookupOption } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartOfAccountsLookupTypes";
import type {
  CollectionTypeFormErrors,
  CollectionTypeFormPageOptions,
  CollectionTypeFormValues,
} from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";
import { validateCollectionTypeForm } from "@/app/src/validations/modules/financial-maintenance/collection-type/CollectionTypeValidation";

const EmptyCollectionTypeFormValues: CollectionTypeFormValues = {
  type: "COLLECTION",
  collectionTypeName: "",
  description: "",
  status: "Active",
  accountSetupMode: "Existing",
  revenueCoaId: "",
  expenseParentCoaId: "",
};

export function useCollectionTypeFormPage({
  existingCollectionType,
  isOpen = true,
  kind = "collection",
  mode,
  onSaved,
}: CollectionTypeFormPageOptions) {
  const { addCollectionType, isMutating, updateCollectionType } = useCollectionTypeStore(undefined, {
    kind,
    refetchOnMount: false,
  });
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const companyId = authProfileQuery.data?.activeCompanyId ?? null;
  const postingAccountsQuery = usePostingAccountLookup({}, { enabled: Boolean(companyId) });
  const accountOptions = useMemo(() => createPostingAccountOptions(postingAccountsQuery.data ?? []), [postingAccountsQuery.data]);
  const initialValues: CollectionTypeFormValues = existingCollectionType
    ? {
        type: existingCollectionType.type,
        collectionTypeName: existingCollectionType.collectionTypeName,
        description: existingCollectionType.description,
        status: existingCollectionType.status,
        accountSetupMode: existingCollectionType.accountSetupMode ?? "Existing",
        revenueCoaId: existingCollectionType.revenueCoaId ?? "",
        expenseParentCoaId: existingCollectionType.expenseParentCoaId ?? "",
      }
    : {
        ...EmptyCollectionTypeFormValues,
        type: kind === "collection" ? "COLLECTION" : "EXPENSE",
      };
  const initialValuesRef = useRef<CollectionTypeFormValues>(initialValues);
  const [values, setValues] = useState<CollectionTypeFormValues>(initialValues);
  const [errors, setErrors] = useState<CollectionTypeFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const isReadonly = mode === "view";

  const draft = useModuleDraft({
    enabled: isOpen && !isReadonly,
    initialValues,
    key: createModuleDraftKey({
      mode,
      moduleId: `financial-maintenance:${kind === "collection" ? "collection-type" : "disbursement-type"}`,
      recordId: existingCollectionType?.id,
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
      ...(name === "accountSetupMode" && value === "Auto" ? { revenueCoaId: "" } : {}),
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

  function handleStatusChange(status: CollectionTypeFormValues["status"]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, status }));
    setErrors((current) => ({ ...current, status: undefined }));
  }

  function handleAccountSetupModeChange(value: CollectionTypeFormValues["accountSetupMode"]) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      accountSetupMode: value,
      ...(value === "Auto" ? { revenueCoaId: "" } : {}),
    }));
    setErrors((current) => ({ ...current, accountSetupMode: undefined, revenueCoaId: undefined }));
  }

  function handleRevenueAccountChange(value: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      revenueCoaId: value,
    }));
    setErrors((current) => ({ ...current, revenueCoaId: undefined }));
  }

  function validate() {
    const nextErrors = validateCollectionTypeForm(values);

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
      `financial-maintenance:collection-type:submit:${mode}:${existingCollectionType?.id ?? values.collectionTypeName ?? "new"}`,
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
      if (mode === "edit" && existingCollectionType) {
        await updateCollectionType({ ...existingCollectionType, ...values });
      } else {
        await addCollectionType(values);
        setValues(EmptyCollectionTypeFormValues);
        setErrors({});
      }
      draft.clearDraft();
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      onSaved();
    } catch (error) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();

      if (error instanceof ApiClientError && error.message.toLowerCase().includes("default account name")) {
        setErrors((current) => ({
          ...current,
          collectionTypeName: error.message,
        }));
        return;
      }

      setErrors((current) => ({
        ...current,
        collectionTypeName: error instanceof Error ? error.message : "Could not save collection type.",
      }));
    }
  }

  return {
    clearDraft: draft.clearDraft,
    discardDraft: draft.discardDraft,
    saveDraft: draft.saveDraft,
    accountOptions,
    errors,
    expenseParentOptions: [],
    handleAccountSetupModeChange,
    handleInputChange,
    handleRevenueAccountChange,
    handleStatusChange,
    handleExpenseParentChange,
    handleSubmit,
    isLoadingExpenseParentOptions: false,
    isReadonly,
    isSubmitting: isSubmitting || isMutating,
    refreshExpenseParentOptions: async () => undefined,
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
    id: account.accountId,
    normalBalance: account.accountNature === "CREDIT" ? "Credit" : "Debit",
    statementGroup: "",
    statementSection: "",
    status: "Active",
  }));
}
