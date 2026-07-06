"use client";

import { useEffect, useId, useRef } from "react";
import { BankMasterfileAccountTypeOptions } from "@/app/src/constants/modules/maintenance/financial-management/bank-masterfile/BankMasterfileConstants";
import type {
  BankDetailsKey,
  ChartAccountFormValues,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import {
  Field,
  Input,
  Select,
} from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsControls";

const RequiredBankFields: BankDetailsKey[] = [
  "bankName",
  "bankAccountNumber",
  "accountType",
  "currency",
];

export function ChartsOfAccountsBankFields({
  readOnly = false,
  submitted,
  values,
  onBankFieldChange,
}: {
  readOnly?: boolean;
  submitted: boolean;
  values: ChartAccountFormValues;
  onBankFieldChange: (key: BankDetailsKey, value: string) => void;
}) {
  const firstInvalidField = RequiredBankFields.find(
    (field) => !values.bankDetails[field].trim(),
  );
  const focusTargetRef = useRef<BankDetailsKey | null>(null);

  if (!submitted) {
    focusTargetRef.current = null;
  } else if (!focusTargetRef.current) {
    focusTargetRef.current = firstInvalidField ?? null;
  }

  const focusTarget = focusTargetRef.current;

  return (
    <div className="grid items-start gap-4 sm:grid-cols-2">
      <BankTextField
        autoFocus={focusTarget === "bankName"}
        label="Bank Name"
        fieldKey="bankName"
        readOnly={readOnly}
        required
        submitted={submitted}
        value={values.bankDetails.bankName}
        onChange={onBankFieldChange}
      />
      <BankTextField
        label="Branch"
        fieldKey="branch"
        readOnly={readOnly}
        submitted={submitted}
        value={values.bankDetails.branch}
        onChange={onBankFieldChange}
      />
      <BankTextField
        autoFocus={focusTarget === "bankAccountNumber"}
        label="Bank Account Number"
        fieldKey="bankAccountNumber"
        readOnly={readOnly}
        required
        submitted={submitted}
        value={values.bankDetails.bankAccountNumber}
        onChange={onBankFieldChange}
      />
      <BankAccountTypeField
        autoFocus={focusTarget === "accountType"}
        readOnly={readOnly}
        submitted={submitted}
        value={values.bankDetails.accountType}
        onChange={(value) => onBankFieldChange("accountType", value)}
      />
      <BankTextField
        autoFocus={focusTarget === "currency"}
        label="Currency"
        fieldKey="currency"
        maxLength={10}
        readOnly={readOnly}
        required
        submitted={submitted}
        value={values.bankDetails.currency}
        onChange={onBankFieldChange}
      />
      <BankTextField
        label="Exchange Rate"
        fieldKey="currencyExchangeRate"
        min="0"
        readOnly={readOnly}
        submitted={submitted}
        type="number"
        value={values.bankDetails.currencyExchangeRate}
        onChange={onBankFieldChange}
      />
    </div>
  );
}

function BankTextField({
  autoFocus,
  fieldKey,
  label,
  maxLength,
  min,
  readOnly,
  required = false,
  submitted,
  type = "text",
  value,
  onChange,
}: {
  autoFocus?: boolean;
  fieldKey: BankDetailsKey;
  label: string;
  maxLength?: number;
  min?: string;
  readOnly?: boolean;
  required?: boolean;
  submitted: boolean;
  type?: string;
  value: string;
  onChange: (key: BankDetailsKey, value: string) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <Field
      label={label}
      htmlFor={inputId}
      required={required}
      error={submitted && required && !value ? "Required" : undefined}
      reserveMessageSpace
    >
      <Input
        id={inputId}
        maxLength={maxLength}
        min={min}
        readOnly={readOnly}
        ref={inputRef}
        type={type}
        value={value}
        onChange={(event) => {
          if (!readOnly) {
            onChange(fieldKey, event.target.value);
          }
        }}
      />
    </Field>
  );
}

function BankAccountTypeField({
  autoFocus,
  readOnly,
  submitted,
  value,
  onChange,
}: {
  autoFocus?: boolean;
  readOnly?: boolean;
  submitted: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const selectId = useId();
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (autoFocus) {
      selectRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <Field
      label="Account Type"
      htmlFor={selectId}
      required
      error={submitted && !value ? "Required" : undefined}
      reserveMessageSpace
    >
      <Select
        id={selectId}
        disabled={readOnly}
        ref={selectRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {BankMasterfileAccountTypeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </Field>
  );
}
