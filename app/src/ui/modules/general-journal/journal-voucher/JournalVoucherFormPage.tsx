"use client";

import type { ChangeEventHandler } from "react";
import {
  JournalVoucherCurrencyOptions,
  JournalVoucherStatusOptions,
} from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";
import { useJournalVoucherFormPage } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucherFormPage";
import { JournalVoucherDataEntryTable } from "@/app/src/ui/modules/general-journal/journal-voucher/JournalVoucherDataEntryTable";
import { JournalVoucherHeaderPage } from "@/app/src/ui/modules/general-journal/journal-voucher/JournalVoucherHeaderPage";
import { JournalVoucherNotFound } from "@/app/src/ui/modules/general-journal/journal-voucher/JournalVoucherNotFound";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

const fieldClassName =
  "app-theme-field h-10 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue disabled:bg-offwhite disabled:text-darknavy/55";
const textareaClassName =
  "app-theme-field min-h-[7.5rem] w-full resize-y rounded-md border border-darknavy/10 bg-white px-3 py-2 text-sm leading-6 text-darknavy outline-none transition focus:border-skyblue disabled:bg-offwhite disabled:text-darknavy/55";
const errorClassName = "mt-1 text-xs font-medium text-red-600";

export function JournalVoucherFormPage() {
  const page = useJournalVoucherFormPage();

  if (page.needsRecord && !page.existingRecord) {
    return <JournalVoucherNotFound />;
  }

  return (
    <>
      <form onSubmit={page.handleSubmit} className="grid gap-5">
        <JournalVoucherHeaderPage page={page} />

        <section className="grid gap-5 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <div className="grid gap-4">
              <TextareaField
                label="Remarks"
                name="remarks"
                value={page.values.remarks}
                error={page.errors.remarks}
                disabled={page.isReadonly}
                onChange={page.handleInputChange}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Currency Type *"
                  name="currencyType"
                  value={page.values.currencyType}
                  error={page.errors.currencyType}
                  disabled={page.isReadonly}
                  options={JournalVoucherCurrencyOptions}
                  onChange={page.handleInputChange}
                />
                <TextField
                  label="Currency Rate *"
                  name="currencyRate"
                  type="number"
                  min="0"
                  step="0.000001"
                  value={String(page.values.currencyRate)}
                  error={page.errors.currencyRate}
                  disabled={page.isReadonly}
                  onChange={page.handleInputChange}
                />
              </div>
            </div>

            <div className="grid content-start gap-4">
              <TextField
                label="Transaction Number *"
                name="transactionNo"
                value={page.values.transactionNo}
                error={page.errors.transactionNo}
                disabled={page.isReadonly}
                onChange={page.handleInputChange}
              />
              <TextField
                label="Document Date *"
                name="documentDate"
                type="date"
                value={page.values.documentDate}
                error={page.errors.documentDate}
                disabled={page.isReadonly}
                onChange={page.handleInputChange}
              />
              <SelectField
                label="Status *"
                name="status"
                value={page.values.status}
                error={page.errors.status}
                disabled={page.isReadonly}
                options={JournalVoucherStatusOptions}
                onChange={page.handleInputChange}
              />
            </div>
          </div>
        </section>

        <JournalVoucherDataEntryTable page={page} />
      </form>

      <AppDialog
        isOpen={page.isDeleteDialogOpen}
        isPending={page.isMutating}
        title="Delete journal voucher?"
        description={`This will remove ${page.existingRecord?.transactionNo ?? "the selected journal voucher"}.`}
        confirmLabel="Delete Journal Voucher"
        tone="danger"
        onCancel={() => page.setIsDeleteDialogOpen(false)}
        onConfirm={page.handleConfirmDelete}
      />
    </>
  );
}

type FieldProps = {
  disabled: boolean;
  error?: string;
  label: string;
  name: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  value: string;
  type?: string;
  min?: string;
  step?: string;
};

function TextField({
  disabled,
  error,
  label,
  name,
  onChange,
  value,
  type = "text",
  min,
  step,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
        {label}
      </span>
      <input
        className={fieldClassName}
        disabled={disabled}
        min={min}
        name={name}
        onChange={onChange}
        step={step}
        type={type}
        value={value}
      />
      {error ? <span className={errorClassName}>{error}</span> : null}
    </label>
  );
}

function SelectField({
  disabled,
  error,
  label,
  name,
  onChange,
  options,
  value,
}: FieldProps & { options: readonly string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
        {label}
      </span>
      <select
        className={fieldClassName}
        disabled={disabled}
        name={name}
        onChange={onChange}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <span className={errorClassName}>{error}</span> : null}
    </label>
  );
}

function TextareaField({
  disabled,
  error,
  label,
  name,
  onChange,
  value,
}: Omit<FieldProps, "onChange"> & {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/60">
        {label}
      </span>
      <textarea
        className={textareaClassName}
        disabled={disabled}
        name={name}
        onChange={onChange}
        value={value}
      />
      {error ? <span className={errorClassName}>{error}</span> : null}
    </label>
  );
}
