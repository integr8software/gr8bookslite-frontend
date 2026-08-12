"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DiscountMaintenanceHref } from "@/app/src/constants/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceConstants";
import {
  DiscountMaintenanceInitialFormValues,
  createDiscountFromForm,
  createDiscountMaintenanceFormValues,
  getDiscountAccountCode,
  getDiscountAccountGroupPath,
  getDiscountAccountTitle,
  updateDiscountFromForm,
} from "@/app/src/data/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceData";
import type {
  DiscountMaintenanceActionMode,
  Discount,
  DiscountMaintenanceFormErrors,
  DiscountMaintenanceFormValues,
} from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";
import { validateDiscountMaintenanceForm } from "@/app/src/validations/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceValidation";
import { useDiscountMaintenanceStore } from "@/app/src/hooks/modules/financial-maintenance/discount-maintenance/useDiscountMaintenance";

type DiscountMaintenanceFormPageOptions = {
  existingDiscount?: Discount;
  mode?: DiscountMaintenanceActionMode;
  onSaved?: () => void;
};

export function useDiscountMaintenanceFormPage(options: DiscountMaintenanceFormPageOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const { addDiscount, discounts, isMutating, updateDiscount } = useDiscountMaintenanceStore();
  const mode = options.mode ?? getActionMode(pathname);
  const existingDiscount = options.existingDiscount ?? discounts.find((discount) => discount.id === params.recordId);
  const [values, setValues] = useState<DiscountMaintenanceFormValues>(() =>
    existingDiscount ? createDiscountMaintenanceFormValues(existingDiscount) : DiscountMaintenanceInitialFormValues,
  );
  const [errors, setErrors] = useState<DiscountMaintenanceFormErrors>({});
  const isReadonly = mode === "view";
  const generatedAccount = useMemo(
    () => ({
      accountCode: getDiscountAccountCode(values.type, values.name),
      accountGroupPath: getDiscountAccountGroupPath(values.type),
      accountTitle: getDiscountAccountTitle(values.type, values.name),
    }),
    [values.name, values.type],
  );

  function updateField(
    field: keyof DiscountMaintenanceFormValues,
    value: DiscountMaintenanceFormValues[keyof DiscountMaintenanceFormValues],
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    updateField(event.target.name as keyof DiscountMaintenanceFormValues, event.target.value);
  }

  function validateBeforeSubmit() {
    const nextErrors = validateDiscountMaintenanceForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please fix the highlighted discount fields.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateBeforeSubmit()) {
      return;
    }

    if (mode === "edit" && existingDiscount) {
      await updateDiscount(updateDiscountFromForm(existingDiscount, values));
    } else if (mode === "edit") {
      toast.error("Could not find the discount to update.");
      return;
    } else {
      await addDiscount(createDiscountFromForm(values));
    }

    options.onSaved?.();
    if (!options.onSaved) router.push(DiscountMaintenanceHref);
  }

  return {
    errors,
    existingDiscount,
    generatedAccount,
    handleInputChange,
    handleStatusChange: (status: DiscountMaintenanceFormValues["status"]) => updateField("status", status),
    handleSubmit,
    isMutating,
    isReadonly,
    mode,
    needsRecord: mode === "edit" || mode === "view",
    validateBeforeSubmit,
    values,
  };
}

function getActionMode(pathname: string): DiscountMaintenanceActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
