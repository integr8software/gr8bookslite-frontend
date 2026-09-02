import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  ResponsibilityCenterInitialFormValues,
  createResponsibilityCenterFormValues,
  createResponsibilityCenterFromForm,
  updateResponsibilityCenterFromForm,
} from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { createModuleDraftKey, useModuleDraft } from "@/app/src/hooks/shared/module/useModuleDraft";
import { fetchResponsibilityCenterCodeSuggestion } from "@/app/src/services/modules/financial-maintenance/responsibility-center/ResponsibilityCenterApi";
import type {
  ResponsibilityCenterClassification,
  ResponsibilityCenterFormErrors,
  ResponsibilityCenterFormPageOptions,
  ResponsibilityCenterFormValues,
  ResponsibilityCenterTypeOption,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import { validateResponsibilityCenterForm } from "@/app/src/validations/modules/financial-maintenance/responsibility-center/ResponsibilityCenterValidation";

export function useResponsibilityCenterFormPage({
  center,
  initialValues,
  isOpen = true,
  mode,
  onSaved,
}: ResponsibilityCenterFormPageOptions) {
  const store = useResponsibilityCenterStore(undefined, { refetchOnMount: false });
  const isReadonly = mode === "view";
  const defaultInitialValues = center
    ? createResponsibilityCenterFormValues(center)
    : (initialValues ?? ResponsibilityCenterInitialFormValues);
  const initialValuesRef = useRef<ResponsibilityCenterFormValues>(defaultInitialValues);
  const [errors, setErrors] = useState<ResponsibilityCenterFormErrors>({});
  const [values, setValues] = useState<ResponsibilityCenterFormValues>(defaultInitialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [hasManualCode, setHasManualCode] = useState(Boolean(center?.code));

  const draft = useModuleDraft({
    enabled: isOpen && !isReadonly,
    initialValues: defaultInitialValues,
    key: createModuleDraftKey({
      mode,
      moduleId: "financial-maintenance:responsibility-center",
      recordId: center?.id,
    }),
    setValues,
    values,
  });

  const parentOptions = useMemo(
    () => store.centers.filter(({ id, status }) => id !== center?.id && status === "Active"),
    [store.centers, center?.id],
  );
  const typeOptions = useMemo(
    () => store.types.filter((type) => type.classificationId === values.classificationId),
    [store.types, values.classificationId],
  );
  const nameLabel = values.classificationId && values.financialType ? `${values.financialType} Name` : "Name";
  const codePlaceholder = useMemo(() => {
    const selectedType = store.types.find(({ id }) => id === values.typeId);

    if (!selectedType) {
      return "Select classification and type first";
    }

    return `${selectedType.classificationCode}-${selectedType.codePrefix}-001`;
  }, [store.types, values.typeId]);

  useEffect(() => {
    if (!values.typeId || hasManualCode || mode !== "add") {
      return;
    }

    let isMounted = true;

    fetchResponsibilityCenterCodeSuggestion(values.typeId)
      .then((code) => {
        if (!isMounted) return;
        setValues((current) => (current.typeId === values.typeId && !current.code ? { ...current, code } : current));
      })
      .catch(() => {
        // Code remains manually editable if suggestion fails.
      });

    return () => {
      isMounted = false;
    };
  }, [hasManualCode, mode, values.typeId]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const field = event.target.name as keyof ResponsibilityCenterFormValues;
    const value =
      event.target instanceof HTMLInputElement && event.target.type === "checkbox"
        ? event.target.checked
        : field === "code"
          ? event.target.value.toUpperCase()
          : event.target.value;

    if (isReadonly) {
      return;
    }

    if (field === "classificationId" || field === "typeId") {
      setHasManualCode(false);
    }

    if (field === "code") {
      setHasManualCode(String(value).trim().length > 0);
    }

    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "classificationId" ? createClassificationDefaults(String(value), store.classifications) : {}),
      ...(field === "typeId" ? createTypeDefaults(String(value), store.types) : {}),
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleFieldChange<TKey extends keyof ResponsibilityCenterFormValues>(field: TKey, value: ResponsibilityCenterFormValues[TKey]) {
    if (isReadonly) {
      return;
    }

    if (field === "classificationId" || field === "typeId") {
      setHasManualCode(false);
    }

    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "classificationId" ? createClassificationDefaults(String(value), store.classifications) : {}),
      ...(field === "typeId" ? createTypeDefaults(String(value), store.types) : {}),
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateBeforeSubmit() {
    const nextErrors = validateResponsibilityCenterForm(values, store.centers, center?.id);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
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
      `financial-maintenance:responsibility-center:submit:${mode}:${center?.id ?? values.code ?? "new"}`,
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
      const savedCenter =
        mode === "edit" && center
          ? await store.updateCenter(updateResponsibilityCenterFromForm(center, values))
          : await store.addCenter(createResponsibilityCenterFromForm(values));

      draft.clearDraft();
      if (mode === "add") {
        setValues(defaultInitialValues);
        setErrors({});
        setHasManualCode(false);
      }
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      onSaved?.(savedCenter);
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
    classifications: store.classifications,
    isReadonly,
    isSubmitting: isSubmitting || store.isMutating,
    nameLabel,
    codePlaceholder,
    parentOptions,
    typeOptions,
    values,
    handleFieldChange,
    handleInputChange,
    handleSubmit,
    validateBeforeSubmit,
  };
}

function createClassificationDefaults(classificationId: string, classifications: ResponsibilityCenterClassification[]) {
  const classification = classifications.find(({ id }) => id === classificationId);

  return {
    typeId: "",
    category: "Department" as const,
    financialType: classification?.name ?? ("Cost Center" as const),
    parentId: "",
    code: "",
  };
}

function createTypeDefaults(typeId: string, types: ResponsibilityCenterTypeOption[]) {
  const type = types.find((typeOption) => typeOption.id === typeId);

  if (!type) {
    return {};
  }

  return {
    financialType: type.classificationName,
    code: "",
  };
}
