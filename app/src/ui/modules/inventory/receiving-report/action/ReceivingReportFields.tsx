import type { ChangeEvent } from "react";
import { ReceivingReportCurrencyOptions, receivingReportFieldClassName, receivingReportFieldShellClassName } from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import type { ReceivingReportSectionChangeHandler } from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";

type FieldProps = {
  disabled: boolean;
  error?: string;
  label: string;
  name: string;
  onChange: ReceivingReportSectionChangeHandler;
  required?: boolean;
  type?: string;
  value: string;
};

export function TextField({
  disabled,
  error,
  label,
  name,
  onChange,
  required,
  type = "text",
  value,
}: FieldProps) {
  return (
    <label className={receivingReportFieldShellClassName}>
      <FieldLabel label={label} required={required} controlName={name} />
      <span className="min-w-0">
        <input
          className={getReceivingReportFieldClassName(error)}
          disabled={disabled}
          name={name}
          onChange={onChange}
          type={type}
          value={value}
          aria-invalid={Boolean(error)}
        />
        {error ? <ErrorText message={error} /> : null}
      </span>
    </label>
  );
}

export function TextAreaField({
  disabled,
  error,
  label,
  name,
  onChange,
  required,
  value,
}: FieldProps) {
  return (
    <label className={receivingReportFieldShellClassName}>
      <FieldLabel label={label} required={required} controlName={name} />
      <span className="min-w-0">
        <textarea
          className={`${getReceivingReportFieldClassName(error)} min-h-20 py-2`}
          disabled={disabled}
          name={name}
          onChange={onChange}
          value={value}
          aria-invalid={Boolean(error)}
        />
        {error ? <ErrorText message={error} /> : null}
        <span className="mt-1 block text-xs font-medium text-darknavy/45">
          Characters remaining: {Math.max(250 - value.length, 0)}
        </span>
      </span>
    </label>
  );
}

export function SelectField({
  disabled,
  error,
  label,
  name,
  onChange,
  options,
  required,
  value,
}: FieldProps & { options: readonly string[] }) {
  return (
    <label className={receivingReportFieldShellClassName}>
      <FieldLabel label={label} required={required} controlName={name} />
      <span className="min-w-0">
        <select
          className={getReceivingReportFieldClassName(error)}
          disabled={disabled}
          name={name}
          onChange={onChange}
          value={value}
          aria-invalid={Boolean(error)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error ? <ErrorText message={error} /> : null}
      </span>
    </label>
  );
}

export function CurrencyExchangeRateField({
  currencyError,
  currencyValue,
  disabled,
  exchangeRateError,
  exchangeRateValue,
  onChange,
}: {
  currencyError?: string;
  currencyValue: string;
  disabled: boolean;
  exchangeRateError?: string;
  exchangeRateValue: string;
  onChange: (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
}) {
  const hasError = Boolean(currencyError || exchangeRateError);

  return (
    <div className="grid min-w-0 gap-1.5 sm:grid-cols-[7.5rem_minmax(0,1fr)_max-content_6.5rem] sm:items-start">
      <FieldLabel label="Currency" required controlName="currency" />
      <span className="min-w-0">
        <select
          className={getReceivingReportFieldClassName(currencyError)}
          disabled={disabled}
          name="currency"
          onChange={onChange}
          value={currencyValue}
          aria-invalid={Boolean(currencyError)}
          aria-label="Currency"
        >
          {ReceivingReportCurrencyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </span>
      <FieldLabel label="Exchange Rate" required controlName="exchangeRate" />
      <span className="min-w-0">
        <input
          className={`${getReceivingReportFieldClassName(exchangeRateError)} text-right tabular-nums`}
          disabled={disabled}
          name="exchangeRate"
          onChange={onChange}
          value={exchangeRateValue}
          aria-invalid={Boolean(exchangeRateError)}
          aria-label="Exchange Rate"
        />
      </span>
      {hasError ? (
        <span className="sm:col-span-4">
          {currencyError ? <ErrorText message={currencyError} /> : null}
          {exchangeRateError ? <ErrorText message={exchangeRateError} /> : null}
        </span>
      ) : null}
    </div>
  );
}

export function FieldLabel({
  controlName,
  label,
  required,
}: {
  controlName: string;
  label: string;
  required?: boolean;
}) {
  return (
    <span className="pt-2 text-sm font-semibold text-darknavy" id={`${controlName}-label`}>
      {label}
      {required ? <span className="ml-1 text-coralpink">*</span> : null}
    </span>
  );
}

export function ErrorText({ message }: { message: string }) {
  return <span className="mt-1 block text-xs font-semibold text-red-600">{message}</span>;
}

export function getReceivingReportFieldClassName(error?: string) {
  return joinClasses(
    receivingReportFieldClassName,
    error
      ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-200"
      : undefined,
  );
}
