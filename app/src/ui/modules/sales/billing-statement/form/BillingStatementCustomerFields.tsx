import {
  BillingStatementCurrencyOptions,
  BillingStatementDebitAccountOptions,
  BillingStatementDescriptionOptions,
  BillingStatementStatusOptions,
  BillingStatementTermsOptions,
} from "@/app/src/constants/modules/sales/billing-statement/BillingStatementConstants";
import type {
  BillingStatementFieldUpdater,
  BillingStatementFormErrors,
  BillingStatementFormValues,
  BillingStatementStatus,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";
import {
  PurchaseRequestAttachedTextField,
  PurchaseRequestDateField,
  PurchaseRequestFieldClassName,
  PurchaseRequestFieldShell,
  PurchaseRequestSelectField,
  PurchaseRequestTextField,
} from "@/app/src/ui/modules/purchasing/purchase-request/form/PurchaseRequestFieldControls";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

type BillingStatementCustomerFieldsProps = {
  errors: BillingStatementFormErrors;
  isReadonly: boolean;
  values: BillingStatementFormValues;
  onUpdateField: BillingStatementFieldUpdater<BillingStatementFormValues>;
};

export function BillingStatementCustomerFields({ errors, isReadonly, onUpdateField, values }: BillingStatementCustomerFieldsProps) {
  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-3">
      <div className="grid min-w-0 content-start gap-4">
        <PurchaseRequestTextField
          id="billing-statement-code"
          label="Code"
          isRequired
          readOnly={isReadonly}
          value={values.code}
          onChange={(value) => onUpdateField("code", value)}
        />
        <FieldError error={errors.code} />
        <PurchaseRequestAttachedTextField
          id="billing-statement-name"
          label="Name"
          isRequired
          readOnly={isReadonly}
          value={values.name}
          onAdd={() => undefined}
          onChange={(value) => onUpdateField("name", value)}
        />
        <FieldError error={errors.name} />
        <PurchaseRequestFieldShell controlId="billing-statement-currency" label="Currency">
          <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(6.5rem,0.65fr)] sm:items-center">
            <AppAdvancedDropdown
              id="billing-statement-currency"
              value={values.currency}
              readOnly={isReadonly}
              options={BillingStatementCurrencyOptions.map((option) => ({
                name: option,
                value: option,
              }))}
              placeholder="PHP"
              onChange={(value) => onUpdateField("currency", String(value))}
            />
            <label htmlFor="billing-statement-exchange-rate" className="text-sm font-semibold text-darknavy">
              FX Rate:
            </label>
            <MoneyNumberField
              id="billing-statement-exchange-rate"
              value={String(values.exchangeRate)}
              readOnly={isReadonly}
              onValueChange={(value) => onUpdateField("exchangeRate", Number(value) || 0)}
              className={`${PurchaseRequestFieldClassName} text-right tabular-nums`}
            />
          </div>
        </PurchaseRequestFieldShell>
        <PurchaseRequestTextField
          id="billing-statement-contact-person"
          label="Contact Person"
          readOnly={isReadonly}
          value={values.contactPerson}
          onChange={(value) => onUpdateField("contactPerson", value)}
        />
        <PurchaseRequestFieldShell controlId="billing-statement-remarks" label="Remarks">
          <AppLimitedTextarea
            id="billing-statement-remarks"
            readOnly={isReadonly}
            value={values.remarks}
            onChange={(event) => onUpdateField("remarks", event.target.value)}
            className={`${PurchaseRequestFieldClassName} min-h-24 py-3`}
            counterMode="remaining"
            maxLength={250}
          />
        </PurchaseRequestFieldShell>
        <BillingSelectField
          id="billing-statement-terms"
          label="Terms"
          readOnly={isReadonly}
          value={values.terms}
          options={BillingStatementTermsOptions}
          onChange={(value) => onUpdateField("terms", value)}
        />
        <PurchaseRequestDateField
          id="billing-statement-due-date"
          label="Due Date"
          readOnly={isReadonly}
          value={values.dueDate}
          onChange={(value) => onUpdateField("dueDate", value)}
        />
        <BillingAttachedSelectField
          id="billing-statement-description"
          label="Description"
          readOnly={isReadonly}
          value={values.description}
          options={BillingStatementDescriptionOptions}
          onChange={(value) => onUpdateField("description", value)}
        />
        <BillingAttachedSelectField
          id="billing-statement-default-account"
          label="Default Account"
          isRequired
          readOnly={isReadonly}
          value={values.defaultAccount}
          options={BillingStatementDebitAccountOptions}
          onChange={(value) => onUpdateField("defaultAccount", value)}
        />
        <FieldError error={errors.defaultAccount} />
        <BillingSelectField
          id="billing-statement-team-assigned"
          label="Team Assigned"
          readOnly={isReadonly}
          value={values.teamAssigned}
          options={BillingStatementTermsOptions}
          onChange={(value) => onUpdateField("teamAssigned", value)}
        />
        <PurchaseRequestDateField
          id="billing-statement-start-date"
          label="Start Date"
          readOnly={isReadonly}
          value={values.startDate}
          onChange={(value) => onUpdateField("startDate", value)}
        />
        <PurchaseRequestDateField
          id="billing-statement-expiration-date"
          label="Date of Expiration"
          readOnly={isReadonly}
          value={values.expirationDate}
          onChange={(value) => onUpdateField("expirationDate", value)}
        />
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <AmountField label="Net Amount" value={values.netAmount} />
        <AmountField label="VAT Amount" value={values.vatAmount} />
        <AmountField label="WVAT Amount" value={values.wvatAmount} />
        <AmountField label="EWT Amount" value={values.ewtAmount} />
        <AmountField label="Discount Amount" value={values.discountAmount} />
        <AmountField label="Gross Amount" value={values.grossAmount} />
        <div className="h-px bg-darknavy/10" />
        <PurchaseRequestTextField
          id="billing-statement-sales-associate"
          label="Sales Associate"
          readOnly={isReadonly}
          value={values.salesAssociate}
          onChange={(value) => onUpdateField("salesAssociate", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-res-customer-code"
          label="Res. Customer Code"
          readOnly={isReadonly}
          value={values.resCustomerCode}
          onChange={(value) => onUpdateField("resCustomerCode", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-res-customer"
          label="Res. Customer"
          readOnly={isReadonly}
          value={values.resCustomer}
          onChange={(value) => onUpdateField("resCustomer", value)}
        />
        <EditableAmountField
          id="billing-statement-recoupment"
          label="Recoupment"
          readOnly={isReadonly}
          value={values.recoupment}
          onChange={(value) => onUpdateField("recoupment", value)}
        />
        <EditableAmountField
          id="billing-statement-retention"
          label="Retention"
          readOnly={isReadonly}
          value={values.retention}
          onChange={(value) => onUpdateField("retention", value)}
        />
        <EditableAmountField
          id="billing-statement-donation"
          label="Donation"
          readOnly={isReadonly}
          value={values.donation}
          onChange={(value) => onUpdateField("donation", value)}
        />
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <PurchaseRequestTextField
          id="billing-statement-trans-no"
          label="Trans No."
          isRequired
          readOnly={isReadonly}
          value={values.transNo}
          onChange={(value) => onUpdateField("transNo", value)}
        />
        <FieldError error={errors.transNo} />
        <PurchaseRequestDateField
          id="billing-statement-document-date"
          label="Document Date"
          readOnly={isReadonly}
          value={values.documentDate}
          onChange={(value) => onUpdateField("documentDate", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-sj-no"
          label="SJ No."
          readOnly={isReadonly}
          value={values.sjNo}
          onChange={(value) => onUpdateField("sjNo", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-jo-no"
          label="JO No."
          readOnly={isReadonly}
          value={values.joNo}
          onChange={(value) => onUpdateField("joNo", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-po-no"
          label="PO No."
          readOnly={isReadonly}
          value={values.poNo}
          onChange={(value) => onUpdateField("poNo", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-sq-no"
          label="SQ No."
          readOnly={isReadonly}
          value={values.sqNo}
          onChange={(value) => onUpdateField("sqNo", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-invoice-no"
          label="Invoice No."
          readOnly={isReadonly}
          value={values.invoiceNo}
          onChange={(value) => onUpdateField("invoiceNo", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-ref-no"
          label="Ref No."
          readOnly={isReadonly}
          value={values.refNo}
          onChange={(value) => onUpdateField("refNo", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-business-style"
          label="Bus. Style"
          readOnly={isReadonly}
          value={values.businessStyle}
          onChange={(value) => onUpdateField("businessStyle", value)}
        />
        <PurchaseRequestSelectField
          id="billing-statement-status"
          label="Status"
          readOnly
          value={values.status}
          options={BillingStatementStatusOptions}
          onChange={(value) => onUpdateField("status", value as BillingStatementStatus)}
        />
        <PurchaseRequestTextField
          id="billing-statement-project-ref"
          label="ProjectRef"
          readOnly={isReadonly}
          value={values.projectRef}
          onChange={(value) => onUpdateField("projectRef", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-project-name"
          label="Project Name"
          readOnly={isReadonly}
          value={values.projectName}
          onChange={(value) => onUpdateField("projectName", value)}
        />
      </div>
    </div>
  );
}

function BillingSelectField({
  id,
  isRequired = false,
  label,
  onChange,
  options,
  readOnly,
  value,
}: {
  id: string;
  isRequired?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  readOnly: boolean;
  value: string;
}) {
  return (
    <PurchaseRequestFieldShell controlId={id} label={label} isRequired={isRequired}>
      <AppAdvancedDropdown
        id={id}
        value={value}
        readOnly={readOnly}
        options={options.map((option) => ({ name: option, value: option }))}
        placeholder="--Select Option--"
        onChange={(nextValue) => onChange(String(nextValue))}
      />
    </PurchaseRequestFieldShell>
  );
}

function BillingAttachedSelectField(props: Parameters<typeof BillingSelectField>[0]) {
  return (
    <PurchaseRequestFieldShell controlId={props.id} label={props.label} isRequired={props.isRequired}>
      <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0">
        <AppAdvancedDropdown
          id={props.id}
          value={props.value}
          readOnly={props.readOnly}
          options={props.options.map((option) => ({ name: option, value: option }))}
          placeholder="--Select Option--"
          className="[&_.app-advanced-dropdown-control]:rounded-r-none"
          onChange={(nextValue) => props.onChange(String(nextValue))}
        />
        <button
          type="button"
          disabled={props.readOnly}
          className="inline-flex h-11 w-20 shrink-0 items-center justify-center rounded-lg border border-darknavy/10 border-l-darknavy/20 bg-skyblue/8 px-3 text-sm font-semibold text-skyblue transition hover:border-skyblue/25 hover:bg-skyblue/12 disabled:cursor-not-allowed disabled:opacity-45 sm:rounded-l-none"
        >
          Add
        </button>
      </div>
    </PurchaseRequestFieldShell>
  );
}

function AmountField({ label, value }: { label: string; value: number }) {
  return (
    <PurchaseRequestFieldShell controlId={`billing-statement-${label}`} label={label}>
      <MoneyNumberField
        id={`billing-statement-${label}`}
        value={String(value)}
        readOnly
        onValueChange={() => undefined}
        className={`${PurchaseRequestFieldClassName} text-right tabular-nums`}
      />
    </PurchaseRequestFieldShell>
  );
}

function EditableAmountField({
  id,
  label,
  onChange,
  readOnly,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: number) => void;
  readOnly: boolean;
  value: number;
}) {
  return (
    <PurchaseRequestFieldShell controlId={id} label={label}>
      <MoneyNumberField
        id={id}
        value={String(value)}
        readOnly={readOnly}
        onValueChange={(nextValue) => onChange(Number(nextValue) || 0)}
        className={`${PurchaseRequestFieldClassName} text-right tabular-nums`}
      />
    </PurchaseRequestFieldShell>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="-mt-3 pl-0 text-xs font-semibold text-coralpink sm:pl-40">{error}</p>;
}
