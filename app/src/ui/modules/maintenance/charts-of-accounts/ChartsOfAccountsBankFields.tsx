"use client";

import { useId } from "react";
import { ChartsOfAccountsBankFields as BankFields } from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import type {
  BankDetailsKey,
  ChartAccountFormValues,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import {
  Field,
  Input,
} from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsControls";

export function ChartsOfAccountsBankFields({
  values,
  onBankFieldChange,
}: {
  values: ChartAccountFormValues;
  onBankFieldChange: (key: BankDetailsKey, value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {BankFields.map((field) => (
        <BankDetailField
          key={field.key}
          field={field}
          value={values.bankDetails?.[field.key] ?? ""}
          onChange={(value) => onBankFieldChange(field.key, value)}
        />
      ))}
    </div>
  );
}

function BankDetailField({
  field,
  value,
  onChange,
}: {
  field: (typeof BankFields)[number];
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();

  return (
    <Field label={field.label} htmlFor={inputId}>
      <Input
        id={inputId}
        type={field.type ?? "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}
