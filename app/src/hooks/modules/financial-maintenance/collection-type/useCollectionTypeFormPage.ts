"use client";

import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useCollectionTypeStore } from "@/app/src/hooks/modules/financial-maintenance/collection-type/useCollectionType";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { ApiClientError } from "@/app/src/services/shared/api/ApiClient";
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
  expenseParentCoaId: "",
};

export function useCollectionTypeFormPage({ existingCollectionType, isOpen = true, kind = "collection", mode, onSaved }: CollectionTypeFormPageOptions) {
  const { addCollectionType, isMutating, updateCollectionType } = useCollectionTypeStore(undefined, {
    kind,
    refetchOnMount: false,
  });
  const initialValues: CollectionTypeFormValues = existingCollectionType
    ? {
        type: existingCollectionType.type,
        collectionTypeName: existingCollectionType.collectionTypeName,
        description: existingCollectionType.description,
        status: existingCollectionType.status,
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
    errors,
    expenseParentOptions: [],
    handleInputChange,
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
