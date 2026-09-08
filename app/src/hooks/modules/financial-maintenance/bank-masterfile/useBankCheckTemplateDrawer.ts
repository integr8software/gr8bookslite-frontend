"use client";

import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  BankCheckTemplateInitialValues,
  BankCheckTemplateStorageKey,
} from "@/app/src/constants/modules/financial-maintenance/bank-masterfile/BankMasterfileConstants";
import type {
  BankCheckTemplate,
  BankCheckTemplateFormErrors,
  BankCheckTemplateFormValues,
} from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";
import { validateBankCheckTemplate } from "@/app/src/validations/modules/financial-maintenance/bank-masterfile/BankCheckTemplateValidation";

export function useBankCheckTemplateDrawer(bankId?: string) {
  const [templates, setTemplates] = useState<BankCheckTemplate[]>(() => loadBankCheckTemplates(bankId));
  const [values, setValues] = useState<BankCheckTemplateFormValues>(BankCheckTemplateInitialValues);
  const [errors, setErrors] = useState<BankCheckTemplateFormErrors>({});

  const defaultTemplate = useMemo(() => templates.find((template) => template.isDefault), [templates]);

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }, []);

  const handleDefaultChange = useCallback((isDefault: boolean) => {
    setValues((current) => ({ ...current, isDefault }));
  }, []);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bankId) {
      return;
    }

    const validationErrors = validateBankCheckTemplate(values);
    const duplicateName = templates.some((template) => template.name.trim().toLowerCase() === values.name.trim().toLowerCase());
    if (duplicateName) {
      validationErrors.name = "A template with this name already exists for this bank.";
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please review the highlighted template fields.");
      return;
    }

    const template: BankCheckTemplate = {
      ...values,
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${bankId}-${Date.now()}`,
      bankId,
      createdAt: new Date().toISOString(),
    };

    let allTemplates: BankCheckTemplate[] = [];
    try {
      const stored = window.localStorage.getItem(BankCheckTemplateStorageKey);
      const parsed = stored ? (JSON.parse(stored) as BankCheckTemplate[]) : [];
      allTemplates = Array.isArray(parsed) ? parsed : [];
    } catch {
      allTemplates = [];
    }

    if (template.isDefault) {
      allTemplates = allTemplates.map((item) => (item.bankId === bankId ? { ...item, isDefault: false } : item));
    }
    const nextAllTemplates = [...allTemplates, template];
    try {
      window.localStorage.setItem(BankCheckTemplateStorageKey, JSON.stringify(nextAllTemplates));
    } catch {
      toast.error("The template draft could not be saved in this browser.");
      return;
    }
    setTemplates(nextAllTemplates.filter((item) => item.bankId === bankId));
    setValues(BankCheckTemplateInitialValues);
    setErrors({});
    toast.success("Check template draft saved.");
  }, [bankId, templates, values]);

  return {
    defaultTemplate,
    errors,
    templates,
    values,
    handleDefaultChange,
    handleInputChange,
    handleSubmit,
  };
}

function loadBankCheckTemplates(bankId?: string) {
  if (!bankId || typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(BankCheckTemplateStorageKey);
    const parsed = stored ? (JSON.parse(stored) as BankCheckTemplate[]) : [];
    return Array.isArray(parsed) ? parsed.filter((template) => template.bankId === bankId) : [];
  } catch {
    return [];
  }
}
