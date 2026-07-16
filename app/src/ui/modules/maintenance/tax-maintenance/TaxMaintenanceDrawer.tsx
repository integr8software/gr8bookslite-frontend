"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  TaxMaintenanceActionCopy,
  TaxMaintenanceDrawerFormId,
  TaxMaintenanceTitle,
} from "@/app/src/constants/modules/maintenance/financial-management/tax-maintenance/TaxMaintenanceConstants";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type {
  TaxMaintenance,
  TaxMaintenanceAccountField,
  TaxMaintenanceDrawerMode,
  TaxMaintenanceFormValues,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";
import { getMaintenanceSavePendingLabel } from "@/app/src/ui/modules/maintenance/shared/MaintenanceLoadingLabels";
import { TaxMaintenanceFields } from "@/app/src/ui/modules/maintenance/tax-maintenance/TaxMaintenanceFields";
import {
  type TaxMaintenanceFormErrors,
  validateTaxMaintenanceForm,
} from "@/app/src/validations/modules/maintenance/tax-maintenance/TaxMaintenanceValidation";

const EmptyTaxFormValues: TaxMaintenanceFormValues = {
  name: "",
  percentage: "0",
  inputVatAccountId: "",
  outputVatAccountId: "",
  vatPayableAccountId: "",
  deferredInputTaxAccountId: "",
  deferredOutputVatAccountId: "",
  status: "Active",
};

type TaxMaintenanceDrawerProps = {
  accountOptions: ModuleChartAccount[];
  isOpen: boolean;
  isSaving: boolean;
  mode: TaxMaintenanceDrawerMode;
  tax?: TaxMaintenance;
  onClose: () => void;
  onSave: (values: TaxMaintenance | TaxMaintenanceFormValues) => Promise<void>;
};

export function TaxMaintenanceDrawer({
  accountOptions,
  isOpen,
  isSaving,
  mode,
  tax,
  onClose,
  onSave,
}: TaxMaintenanceDrawerProps) {
  const [values, setValues] = useState<TaxMaintenanceFormValues>(() =>
    tax ? toFormValues(tax) : EmptyTaxFormValues,
  );
  const [errors, setErrors] = useState<TaxMaintenanceFormErrors>({});
  const copy = TaxMaintenanceActionCopy[mode];
  const isReadonly = mode === "view";

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
    <MaintenanceFormDrawer
      description={copy.description}
      eyebrow={TaxMaintenanceTitle}
      formId={TaxMaintenanceDrawerFormId}
      isOpen={isOpen}
      isReadonly={isReadonly}
      isSaving={isSaving}
      onBeforeSaveConfirm={validateBeforeSubmit}
      onClose={onClose}
      savingLabel={getMaintenanceSavePendingLabel(mode)}
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
    </MaintenanceFormDrawer>
  );
}

function toFormValues(tax: TaxMaintenance): TaxMaintenanceFormValues {
  return {
    name: tax.name,
    percentage: tax.percentage,
    inputVatAccountId: tax.inputVatAccountId,
    outputVatAccountId: tax.outputVatAccountId,
    vatPayableAccountId: tax.vatPayableAccountId,
    deferredInputTaxAccountId: tax.deferredInputTaxAccountId,
    deferredOutputVatAccountId: tax.deferredOutputVatAccountId,
    status: tax.status,
  };
}
