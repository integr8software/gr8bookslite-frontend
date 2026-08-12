import { type ReactNode } from "react";
import {
  SalesInvoiceCurrencyOptions,
  SalesInvoiceResCenterOptions,
  SalesInvoiceStatusOptions,
  SalesInvoiceTermOptions,
} from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceOptions";
import type { SalesInvoiceFormValues } from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

type SalesInvoiceDetailsFormProps = {
  isReadonly: boolean;
  values: SalesInvoiceFormValues;
  onUpdateField: <Key extends keyof SalesInvoiceFormValues>(key: Key, value: SalesInvoiceFormValues[Key]) => void;
};

export function SalesInvoiceDetailsForm({ isReadonly, onUpdateField, values }: SalesInvoiceDetailsFormProps) {
  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid min-w-0 gap-x-8 gap-y-4 xl:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(16rem,0.65fr)]">
        <div className="grid min-w-0 content-start gap-4">
          <TextField
            id="sales-invoice-party-name"
            isRequired
            label="Party Name"
            readOnly={isReadonly}
            value={values.vceName}
            onChange={(value) => onUpdateField("vceName", value)}
          />
          <TextField
            id="sales-invoice-bill-to-name"
            label="Bill To Name"
            readOnly={isReadonly}
            value={values.billToName}
            onChange={(value) => onUpdateField("billToName", value)}
          />
          <TextField
            id="sales-invoice-address"
            label="Address"
            readOnly={isReadonly}
            value={values.address}
            onChange={(value) => onUpdateField("address", value)}
          />
          <TextField
            id="sales-invoice-contact-person"
            label="Contact Person"
            readOnly={isReadonly}
            value={values.contactPerson}
            onChange={(value) => onUpdateField("contactPerson", value)}
          />
          <TextField
            id="sales-invoice-contact-no"
            label="Contact No"
            readOnly={isReadonly}
            value={values.contactNo}
            onChange={(value) => onUpdateField("contactNo", value)}
          />
          <TextField
            id="sales-invoice-project-code"
            label="Project Code"
            readOnly={isReadonly}
            value={values.projectRef}
            onChange={(value) => onUpdateField("projectRef", value)}
          />
          <TextField
            id="sales-invoice-project-name"
            label="Project Name"
            readOnly={isReadonly}
            value={values.projectName}
            onChange={(value) => onUpdateField("projectName", value)}
          />
          <FieldShell controlId="sales-invoice-remarks" label="Remarks">
            <AppLimitedTextarea
              id="sales-invoice-remarks"
              className={`${FieldClassName} min-h-20 py-3`}
              counterMode="remaining"
              maxLength={250}
              readOnly={isReadonly}
              value={values.remarks}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
            />
          </FieldShell>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <TextField
            id="sales-invoice-party-code"
            isRequired
            label="Party Code"
            readOnly={isReadonly}
            value={values.vceCode}
            onChange={(value) => onUpdateField("vceCode", value)}
          />
          <TextField
            id="sales-invoice-bill-to-code"
            label="Bill to Code"
            readOnly={isReadonly}
            value={values.billToCode}
            onChange={(value) => onUpdateField("billToCode", value)}
          />
          <SelectField
            id="sales-invoice-terms"
            label="Terms of Payment"
            options={SalesInvoiceTermOptions}
            placeholder="--Select Terms--"
            readOnly={isReadonly}
            value={values.terms}
            onChange={(value) => onUpdateField("terms", value)}
          />
          <TextField
            id="sales-invoice-due-date"
            label="Due Date"
            readOnly={isReadonly}
            type="date"
            value={values.dueDate}
            onChange={(value) => onUpdateField("dueDate", value)}
          />
          <FieldShell controlId="sales-invoice-currency" label="Currency">
            <CurrencyExchangeRateRow
              exchangeRateControlId="sales-invoice-exchange-rate"
              currencyControl={
                <AppAdvancedDropdown
                  id="sales-invoice-currency"
                  className="w-full min-w-0"
                  options={SalesInvoiceCurrencyOptions}
                  placeholder="Currency"
                  readOnly={isReadonly}
                  value={values.currency}
                  onChange={(value) => onUpdateField("currency", String(value))}
                />
              }
              exchangeRateControl={
                <MoneyNumberField
                  id="sales-invoice-exchange-rate"
                  className={`${FieldClassName} text-right tabular-nums`}
                  readOnly={isReadonly}
                  value={values.exchangeRate}
                  onValueChange={(value) => onUpdateField("exchangeRate", value)}
                />
              }
            />
          </FieldShell>
          <SelectField
            id="sales-invoice-res-center"
            label="Res Center"
            options={SalesInvoiceResCenterOptions}
            placeholder="--Select Res. Center--"
            readOnly={isReadonly}
            value={values.resCenter}
            onChange={(value) => onUpdateField("resCenter", value)}
          />
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <TextField
            id="sales-invoice-trans-no"
            isRequired
            label="SI No"
            readOnly={isReadonly}
            value={values.transNo}
            onChange={(value) => onUpdateField("transNo", value)}
          />
          <TextField
            id="sales-invoice-document-date"
            label="SI Date"
            readOnly={isReadonly}
            type="date"
            value={values.documentDate}
            onChange={(value) => onUpdateField("documentDate", value)}
          />
          <TextField
            id="sales-invoice-dr-no"
            label="DR No."
            readOnly={isReadonly}
            value={values.drNo}
            onChange={(value) => onUpdateField("drNo", value)}
          />
          <TextField
            id="sales-invoice-sales-personnel"
            label="Sales Personnel"
            readOnly={isReadonly}
            value={values.salesPersonnel}
            onChange={(value) => onUpdateField("salesPersonnel", value)}
          />
          <SelectField
            id="sales-invoice-status"
            label="Status"
            options={SalesInvoiceStatusOptions}
            placeholder="Select status"
            readOnly
            value={values.status}
            onChange={(value) => onUpdateField("status", value)}
          />
        </div>
      </div>
    </section>
  );
}

function TextField({
  id,
  isRequired = false,
  label,
  onChange,
  readOnly,
  type = "text",
  value,
}: {
  id: string;
  isRequired?: boolean;
  label: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  type?: "date" | "text";
  value: string;
}) {
  return (
    <FieldShell controlId={id} isRequired={isRequired} label={label}>
      <input
        id={id}
        className={FieldClassName}
        readOnly={readOnly}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

function SelectField({
  id,
  label,
  onChange,
  options,
  placeholder,
  readOnly,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  options: AppAdvancedDropdownOption[];
  placeholder?: string;
  readOnly: boolean;
  value: string;
}) {
  return (
    <FieldShell controlId={id} label={label}>
      <AppAdvancedDropdown
        id={id}
        options={options}
        placeholder={placeholder}
        readOnly={readOnly}
        searchPlaceholder="Search..."
        value={value}
        onChange={(nextValue) => onChange(String(nextValue))}
      />
    </FieldShell>
  );
}

function FieldShell({
  children,
  controlId,
  isRequired = false,
  label,
}: {
  children: ReactNode;
  controlId: string;
  isRequired?: boolean;
  label: string;
}) {
  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-start">
      <label htmlFor={controlId} className="pt-2 text-sm font-semibold text-darknavy">
        {label}
        {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const FieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";
