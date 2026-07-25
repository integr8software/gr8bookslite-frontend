"use client";

import { useCallback, useEffect, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import toast from "react-hot-toast";
import { TermManagementDatemodeOptions } from "@/app/src/constants/modules/financial-maintenance/term-management/TermManagementConstants";
import { createTerm } from "@/app/src/services/modules/financial-maintenance/term-management/TermManagementApi";
import type {
  TermManagement,
  TermManagementDatemode,
  TermManagementFormValues,
} from "@/app/src/types/modules/financial-maintenance/term-management/TermManagementTypes";
import { QuickAddDialog } from "@/app/src/ui/shared/module/QuickAddDialog";
import { validateTermManagementForm } from "@/app/src/validations/modules/financial-maintenance/term-management/TermManagementValidation";

type TermManagementQuickAddDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (term: TermManagement) => void;
};

const initialValues: TermManagementFormValues = {
  name: "",
  description: "",
  datemode: "Day",
  period: "0",
  status: "Active",
};

export function TermManagementQuickAddDialog({
  isOpen,
  onClose,
  onSaved,
}: TermManagementQuickAddDialogProps) {
  const [values, setValues] = useState<TermManagementFormValues>(initialValues);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const timeoutId = window.setTimeout(() => {
      setValues(initialValues);
      setError("");
    });
    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  const handleSave = useCallback(async () => {
    const normalizedValues = {
      ...values,
      name: values.name.trim(),
      period: normalizeWholeNumberText(values.period),
    };
    const nextErrors = validateTermManagementForm(normalizedValues);
    const nextError =
      nextErrors.name ??
      nextErrors.datemode ??
      nextErrors.period ??
      nextErrors.status ??
      nextErrors.description;

    if (nextError) {
      setValues(normalizedValues);
      setError(nextError);
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const savedTerm = await createTerm(normalizedValues);
      onSaved(savedTerm);
      toast.success("Terms saved.");
    } catch (error) {
      setError(getErrorMessage(error, "Could not save terms."));
    } finally {
      setIsSaving(false);
    }
  }, [onSaved, values]);

  return (
    <QuickAddDialog
      error={error}
      isOpen={isOpen}
      isPending={isSaving}
      title="Add Terms"
      onClose={onClose}
      onSave={handleSave}
    >
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-darknavy">
          Term Name <span className="text-coralpink">*</span>
        </span>
        <input
          value={values.name}
          disabled={isSaving}
          onChange={(event) => {
            setValues((current) => ({ ...current, name: event.target.value }));
            setError("");
          }}
          className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-darknavy">Date Mode</span>
          <select
            value={values.datemode}
            disabled={isSaving}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                datemode: event.target.value as TermManagementDatemode,
              }))
            }
            className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
          >
            {TermManagementDatemodeOptions.map((dateMode) => (
              <option key={dateMode} value={dateMode}>
                {dateMode}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-darknavy">Period</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={values.period}
            disabled={isSaving}
            onChange={(event) => {
              setValues((current) => ({
                ...current,
                period: normalizeWholeNumberText(event.target.value),
              }));
              setError("");
            }}
            onKeyDown={preventNonWholeNumberInput}
            onPaste={(event) => {
              if (!isWholeNumberText(event.clipboardData.getData("text").trim()))
                event.preventDefault();
            }}
            className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
          />
        </label>
      </div>
    </QuickAddDialog>
  );
}

const blockedWholeNumberKeys = new Set(["e", "E", "+", "-", "."]);
function preventNonWholeNumberInput(event: ReactKeyboardEvent<HTMLInputElement>) {
  if (blockedWholeNumberKeys.has(event.key)) event.preventDefault();
}
function normalizeWholeNumberText(value: string) {
  return value.replace(/\D/g, "");
}
function isWholeNumberText(value: string) {
  return /^\d+$/.test(value);
}
function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
