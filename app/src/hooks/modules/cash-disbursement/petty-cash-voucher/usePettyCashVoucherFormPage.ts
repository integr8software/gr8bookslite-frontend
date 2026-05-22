"use client";

import { useState } from "react";
import { PettyCashVoucherInitialFormValues } from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import type {
  PettyCashVoucherFormErrors,
  PettyCashVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { validatePettyCashVoucherForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherValidation";

export function usePettyCashVoucherFormPage() {
  const [values, setValues] = useState<PettyCashVoucherFormValues>(
    PettyCashVoucherInitialFormValues,
  );
  const [errors, setErrors] = useState<PettyCashVoucherFormErrors>({});

  function updateField<TKey extends keyof PettyCashVoucherFormValues>(
    field: TKey,
    value: PettyCashVoucherFormValues[TKey],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit() {
    const nextErrors = validatePettyCashVoucherForm(values);

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  return {
    errors,
    handleSubmit,
    updateField,
    values,
  };
}
