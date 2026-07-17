import { useState, type ReactNode } from "react";
import {
  calculateSalesInvoiceTotals,
  SalesInvoiceBranchOptions,
  SalesInvoiceCurrencyOptions,
  SalesInvoiceDefaultAccountOptions,
  SalesInvoiceResCenterOptions,
  SalesInvoiceTermOptions,
} from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceData";
import type { SalesInvoiceFormValues } from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type SalesInvoiceDetailsFormProps = {
  isReadonly: boolean;
  values: SalesInvoiceFormValues;
  onUpdateField: <Key extends keyof SalesInvoiceFormValues>(
    key: Key,
    value: SalesInvoiceFormValues[Key],
  ) => void;
};

export function SalesInvoiceDetailsForm({
  isReadonly,
  onUpdateField,
  values,
}: SalesInvoiceDetailsFormProps) {
  const totals = calculateSalesInvoiceTotals(values.lineItems);
  const amountDue = totals.netAmount + totals.vatAmount;
  const [activeTab, setActiveTab] =
    useState<SalesInvoiceDetailsTab>("customer");

  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <SalesInvoiceDetailsTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-5 min-w-0">
        {activeTab === "customer" ? (
          <div className="grid min-w-0 gap-x-8 gap-y-4 xl:grid-cols-2">
            <div className="grid min-w-0 content-start gap-4">
              <TextField id="sales-invoice-party-code" label="Party Code" value={values.vceCode} readOnly={isReadonly} isRequired onChange={(value) => onUpdateField("vceCode", value)} />
              <FieldShell controlId="sales-invoice-party-name" label="Party Name" isRequired>
                <AttachedInput id="sales-invoice-party-name" value={values.vceName} readOnly={isReadonly} onChange={(value) => onUpdateField("vceName", value)} />
              </FieldShell>
              <TextField id="sales-invoice-bill-to-code" label="Bill To Code" value={values.billToCode} readOnly={isReadonly} onChange={(value) => onUpdateField("billToCode", value)} />
              <TextField id="sales-invoice-bill-to-name" label="Bill To Name" value={values.billToName} readOnly={isReadonly} onChange={(value) => onUpdateField("billToName", value)} />
              <FieldShell controlId="sales-invoice-currency" label="Currency">
                <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <Dropdown id="sales-invoice-currency" value={values.currency} readOnly={isReadonly} options={SalesInvoiceCurrencyOptions} placeholder="Currency" onChange={(value) => onUpdateField("currency", value)} />
                  <div className="grid min-w-0 gap-2 sm:grid-cols-[auto_9rem] sm:items-center">
                    <label htmlFor="sales-invoice-exchange-rate" className="whitespace-nowrap text-sm font-semibold text-darknavy">
                      Exchange Rate
                    </label>
                    <MoneyNumberField id="sales-invoice-exchange-rate" value={values.exchangeRate} readOnly={isReadonly} onValueChange={(value) => onUpdateField("exchangeRate", value)} className={`${FieldClassName} text-right`} />
                  </div>
                </div>
              </FieldShell>
              <TextField id="sales-invoice-address" label="Address" value={values.address} readOnly={isReadonly} onChange={(value) => onUpdateField("address", value)} />
            </div>
            <div className="grid min-w-0 content-start gap-4">
              <SelectField id="sales-invoice-branch" label="Branch" value={values.branch} readOnly={isReadonly} options={SalesInvoiceBranchOptions} onChange={(value) => onUpdateField("branch", value)} />
              <TextField id="sales-invoice-contact-no" label="Contact No." value={values.contactNo} readOnly={isReadonly} onChange={(value) => onUpdateField("contactNo", value)} />
              <FieldShell controlId="sales-invoice-remarks" label="Remarks">
                <AppLimitedTextarea id="sales-invoice-remarks" value={values.remarks} readOnly={isReadonly} onChange={(event) => onUpdateField("remarks", event.target.value)} className={`${FieldClassName} min-h-24 py-3`} counterMode="remaining" maxLength={250} />
              </FieldShell>
              <SelectField id="sales-invoice-terms" label="Terms" value={values.terms} readOnly={isReadonly} options={SalesInvoiceTermOptions} placeholder="--Select Terms--" onChange={(value) => onUpdateField("terms", value)} />
              <TextField id="sales-invoice-due-date" type="date" label="Due Date" value={values.dueDate} readOnly={isReadonly} onChange={(value) => onUpdateField("dueDate", value)} />
              <FieldShell controlId="sales-invoice-default-account" label="Default Account" isRequired>
                <AttachedDropdown id="sales-invoice-default-account" value={values.defaultAccount} readOnly={isReadonly} options={SalesInvoiceDefaultAccountOptions} placeholder="--Select Debit Account--" onChange={(value) => onUpdateField("defaultAccount", value)} />
              </FieldShell>
            </div>
          </div>
        ) : null}

        {activeTab === "totals" ? (
          <div className="grid min-w-0 gap-x-8 gap-y-4 xl:grid-cols-2">
            <div className="grid min-w-0 content-start gap-4">
              <ReadOnlyMoneyField label="Total Sales" value={totals.grossAmount.toFixed(2)} />
              <ReadOnlyMoneyField label="VAT Amount" value={totals.vatAmount.toFixed(2)} />
              <MoneyField label="EWT Amount" value={values.ewtAmount} readOnly={isReadonly} onChange={(value) => onUpdateField("ewtAmount", value)} />
              <ReadOnlyMoneyField label="Discount" value={totals.discount.toFixed(2)} />
              <ReadOnlyMoneyField label="Amount Due" value={amountDue.toFixed(2)} />
            </div>
            <div className="grid min-w-0 content-start gap-4">
              <MoneyField label="Comm Amount" value={values.commAmount} readOnly={isReadonly} onChange={(value) => onUpdateField("commAmount", value)} />
              <FieldShell controlId="sales-invoice-comm-remarks" label="Comm Remarks">
                <AppLimitedTextarea id="sales-invoice-comm-remarks" value={values.commRemarks} readOnly={isReadonly} onChange={(event) => onUpdateField("commRemarks", event.target.value)} className={`${FieldClassName} min-h-24 py-3`} counterMode="used" />
              </FieldShell>
              <SelectField id="sales-invoice-res-center" label="Res.Center" value={values.resCenter} readOnly={isReadonly} options={SalesInvoiceResCenterOptions} placeholder="--Select Res. Center--" onChange={(value) => onUpdateField("resCenter", value)} />
            </div>
          </div>
        ) : null}

        {activeTab === "references" ? (
          <div className="grid min-w-0 gap-x-8 gap-y-4 xl:grid-cols-2">
            <div className="grid min-w-0 content-start gap-4">
              <TextField id="sales-invoice-trans-no" label="Trans No." value={values.transNo} readOnly={isReadonly} isRequired onChange={(value) => onUpdateField("transNo", value)} />
              <TextField id="sales-invoice-document-date" type="date" label="Document Date" value={values.documentDate} readOnly={isReadonly} onChange={(value) => onUpdateField("documentDate", value)} />
              <TextField id="sales-invoice-sj-no" label="SJ No." value={values.sjNo} readOnly={isReadonly} onChange={(value) => onUpdateField("sjNo", value)} />
              <TextField id="sales-invoice-dr-no" label="DR No." value={values.drNo} readOnly={isReadonly} onChange={(value) => onUpdateField("drNo", value)} />
              <TextField id="sales-invoice-so-no" label="SO No." value={values.soNo} readOnly={isReadonly} onChange={(value) => onUpdateField("soNo", value)} />
              <TextField id="sales-invoice-so-date" type="date" label="SO Date" value={values.soDate} readOnly={isReadonly} onChange={(value) => onUpdateField("soDate", value)} />
            </div>
            <div className="grid min-w-0 content-start gap-4">
              <TextField id="sales-invoice-gr-no" label="GR No." value={values.grNo} readOnly={isReadonly} onChange={(value) => onUpdateField("grNo", value)} />
              <TextField id="sales-invoice-po-no" label="PO No." value={values.poNo} readOnly={isReadonly} onChange={(value) => onUpdateField("poNo", value)} />
              <TextField id="sales-invoice-icr-no" label="ICR No." value={values.icrNo} readOnly={isReadonly} onChange={(value) => onUpdateField("icrNo", value)} />
              <TextField id="sales-invoice-status" label="Status" value={values.status} readOnly onChange={(value) => onUpdateField("status", value)} />
              <TextField id="sales-invoice-project-ref" label="ProjectRef" value={values.projectRef} readOnly={isReadonly} onChange={(value) => onUpdateField("projectRef", value)} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

type SalesInvoiceDetailsTab = "customer" | "totals" | "references";

function SalesInvoiceDetailsTabs({
  activeTab,
  onChange,
}: {
  activeTab: SalesInvoiceDetailsTab;
  onChange: (tab: SalesInvoiceDetailsTab) => void;
}) {
  const tabs: { id: SalesInvoiceDetailsTab; label: string }[] = [
    { id: "customer", label: "Customer & Billing" },
    { id: "totals", label: "Totals & Commission" },
    { id: "references", label: "Document References" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Sales invoice details"
      className="inline-flex max-w-full overflow-x-auto rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={joinClasses(
              "h-8 whitespace-nowrap rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
              isActive
                ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function TextField({ id, isRequired = false, label, onChange, readOnly, type = "text", value }: { id: string; isRequired?: boolean; label: string; onChange: (value: string) => void; readOnly: boolean; type?: "date" | "text"; value: string }) {
  return (
    <FieldShell controlId={id} isRequired={isRequired} label={label}>
      <input id={id} type={type} value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} className={FieldClassName} />
    </FieldShell>
  );
}

function MoneyField({ label, onChange, readOnly, value }: { label: string; onChange: (value: string) => void; readOnly: boolean; value: string }) {
  return (
    <FieldShell controlId={`sales-invoice-${label.replace(/\W+/g, "-").toLowerCase()}`} label={label}>
      <MoneyNumberField value={value} readOnly={readOnly} onValueChange={onChange} className={`${FieldClassName} text-right`} />
    </FieldShell>
  );
}

function ReadOnlyMoneyField({ label, value }: { label: string; value: string }) {
  return (
    <FieldShell controlId={`sales-invoice-${label.replace(/\W+/g, "-").toLowerCase()}`} label={label}>
      <MoneyNumberField
        value={value}
        readOnly
        onValueChange={() => undefined}
        className={`${FieldClassName} !bg-darknavy/5 text-right text-darknavy/60`}
      />
    </FieldShell>
  );
}

function SelectField({ id, label, onChange, options, placeholder, readOnly, value }: { id: string; label: string; onChange: (value: string) => void; options: AppAdvancedDropdownOption[]; placeholder?: string; readOnly: boolean; value: string }) {
  return (
    <FieldShell controlId={id} label={label}>
      <Dropdown id={id} value={value} readOnly={readOnly} options={options} placeholder={placeholder} onChange={onChange} />
    </FieldShell>
  );
}

function Dropdown({ id, onChange, options, placeholder = "", readOnly, value }: { id: string; onChange: (value: string) => void; options: AppAdvancedDropdownOption[]; placeholder?: string; readOnly: boolean; value: string }) {
  return <AppAdvancedDropdown id={id} value={value} readOnly={readOnly} options={options} placeholder={placeholder} searchPlaceholder="Search..." onChange={(nextValue) => onChange(String(nextValue))} />;
}

function AttachedInput({ id, onChange, readOnly, value }: { id: string; onChange: (value: string) => void; readOnly: boolean; value: string }) {
  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0">
      <input id={id} value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} className={`${FieldClassName} sm:rounded-r-none`} />
      <button type="button" disabled={readOnly} className={AttachedAddButtonClassName}>Add</button>
    </div>
  );
}

function AttachedDropdown({ id, onChange, options, placeholder, readOnly, value }: { id: string; onChange: (value: string) => void; options: AppAdvancedDropdownOption[]; placeholder: string; readOnly: boolean; value: string }) {
  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0">
      <AppAdvancedDropdown className={AttachedDropdownClassName} id={id} value={value} readOnly={readOnly} options={options} placeholder={placeholder} searchPlaceholder="Search..." onChange={(nextValue) => onChange(String(nextValue))} />
      <button type="button" disabled={readOnly} className={AttachedAddButtonClassName}>Add</button>
    </div>
  );
}

function FieldShell({ children, controlId, isRequired = false, label }: { children: ReactNode; controlId: string; isRequired?: boolean; label: string }) {
  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
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

const AttachedDropdownClassName = "sm:[&_.app-advanced-dropdown-control]:rounded-r-none";

const AttachedAddButtonClassName = joinClasses(
  "inline-flex h-11 w-20 shrink-0 items-center justify-center gap-2 rounded-lg border border-darknavy/10 border-l-darknavy/20 bg-skyblue/8 px-3 text-sm font-semibold text-skyblue transition hover:border-skyblue/25 hover:bg-skyblue/12 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15 disabled:cursor-not-allowed disabled:opacity-45 sm:rounded-l-none",
);
