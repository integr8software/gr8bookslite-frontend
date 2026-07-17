"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  EmptyTaxFormValues,
  TaxMaintenanceActionCopy,
  TaxMaintenanceDrawerFormId,
  TaxMaintenanceTitle,
} from "@/app/src/constants/modules/maintenance/tax-maintenance/TaxMaintenanceConstants";
import type {
  TaxMaintenance,
  TaxMaintenanceAccountField,
  TaxMaintenanceDefaultAccountIds,
  TaxMaintenanceDrawerProps,
  TaxMaintenanceFormValues,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { TaxMaintenanceFields } from "@/app/src/ui/modules/maintenance/tax-maintenance/TaxMaintenanceFields";
import {
  type TaxMaintenanceFormErrors,
  validateTaxMaintenanceForm,
} from "@/app/src/validations/modules/maintenance/tax-maintenance/TaxMaintenanceValidation";

export function TaxMaintenanceDrawer({
  accountOptions,
  defaultAccountIds,
  isOpen,
  isSaving,
  mode,
  tax,
  onClose,
  onSave,
}: TaxMaintenanceDrawerProps) {
  const [values, setValues] = useState<TaxMaintenanceFormValues>(() =>
    tax ? toFormValues(tax) : createDefaultTaxFormValues(defaultAccountIds),
  );
  const [errors, setErrors] = useState<TaxMaintenanceFormErrors>({});
  const copy = TaxMaintenanceActionCopy[mode];
  const isReadonly = mode === "view";

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const field = event.target.name as keyof TaxMaintenanceFormValues;
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleAccountChange(
    field: TaxMaintenanceAccountField,
    value: string,
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateBeforeSubmit() {
    const nextErrors = validateTaxMaintenanceForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateBeforeSubmit()) {
      return;
    }

    await onSave(tax ? { ...tax, ...values } : values);
  }

  return (
    <ModuleDrawer
      description={copy.description}
      eyebrow={TaxMaintenanceTitle}
      formId={TaxMaintenanceDrawerFormId}
      isOpen={isOpen}
      isReadonly={isReadonly}
      isSaving={isSaving}
      onBeforeSaveConfirm={validateBeforeSubmit}
      onClose={onClose}
      savingLabel={getModuleSavePendingLabel(mode)}
      submitLabel={mode === "edit" ? "Update Tax" : "Save Tax"}
      title={copy.title}
    >
      <form
        id={TaxMaintenanceDrawerFormId}
        onSubmit={handleSubmit}
        className="px-6 py-5"
      >
        <TaxMaintenanceFields
          accountOptions={accountOptions}
          errors={errors}
          isReadonly={isReadonly}
          values={values}
          onAccountChange={handleAccountChange}
          onInputChange={handleInputChange}
        />
      </form>
    </ModuleDrawer>
  );
}

function toFormValues(tax: TaxMaintenance): TaxMaintenanceFormValues {
  return {
    name: tax.name,
    description: tax.description,
    percentage: tax.percentage,
    inputVatAccountId: tax.inputVatAccountId,
    outputVatAccountId: tax.outputVatAccountId,
    deferredVatAccountId: tax.deferredVatAccountId,
    expandedWithholdingTaxAccountId: tax.expandedWithholdingTaxAccountId,
    creditableWithholdingTaxAccountId: tax.creditableWithholdingTaxAccountId,
    withholdingVatableTaxAccountId: tax.withholdingVatableTaxAccountId,
    finalWithholdingTaxAccountId: tax.finalWithholdingTaxAccountId,
    status: tax.status,
  };
}

function createDefaultTaxFormValues(
  defaultAccountIds: TaxMaintenanceDefaultAccountIds,
): TaxMaintenanceFormValues {
  return {
    ...EmptyTaxFormValues,
    ...defaultAccountIds,
  };
}



