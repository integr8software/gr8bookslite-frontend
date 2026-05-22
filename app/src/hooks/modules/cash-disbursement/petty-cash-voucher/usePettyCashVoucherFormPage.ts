"use client";

import { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  PettyCashVoucherInitialFormValues,
  PettyCashVoucherRecords,
  createPettyCashVoucherFormValues,
} from "@/app/src/data/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherData";
import type {
  PettyCashVoucherFormMode,
  PettyCashVoucherFormErrors,
  PettyCashVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { validatePettyCashVoucherForm } from "@/app/src/validations/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherValidation";

export function usePettyCashVoucherFormPage() {
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const mode = getPettyCashVoucherFormMode(pathname);
  const existingVoucher = PettyCashVoucherRecords.find(
    (record) => record.id === params.recordId,
  );
  const isReadonly = mode === "view";
  const [values, setValues] = useState<PettyCashVoucherFormValues>(() =>
    existingVoucher
      ? createPettyCashVoucherFormValues(existingVoucher)
      : PettyCashVoucherInitialFormValues,
  );
  const [errors, setErrors] = useState<PettyCashVoucherFormErrors>({});

  function updateField<TKey extends keyof PettyCashVoucherFormValues>(
    field: TKey,
    value: PettyCashVoucherFormValues[TKey],
  ) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit() {
    if (isReadonly) {
      return true;
    }

    const nextErrors = validatePettyCashVoucherForm(values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted voucher fields.");
      return false;
    }

    toast.success(
      mode === "edit"
        ? "Petty cash voucher updated."
        : "Petty cash voucher created.",
    );
    return true;
  }

  return {
    errors,
    existingVoucher,
    handleSubmit,
    isReadonly,
    mode,
    needsRecord: mode === "edit" || mode === "view",
    updateField,
    values,
  };
}

function getPettyCashVoucherFormMode(pathname: string): PettyCashVoucherFormMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
