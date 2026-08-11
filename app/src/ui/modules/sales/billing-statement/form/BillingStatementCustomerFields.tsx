import {
  BillingStatementCurrencyOptions,
  BillingStatementTermsOptions,
} from "@/app/src/constants/modules/sales/billing-statement/BillingStatementConstants";
import type {
  BillingStatementFieldUpdater,
  BillingStatementFormErrors,
  BillingStatementFormValues,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";
import {
  PurchaseRequestDateField,
  PurchaseRequestFieldClassName,
  PurchaseRequestFieldShell,
  PurchaseRequestTextField,
} from "@/app/src/ui/modules/purchasing/purchase-request/form/PurchaseRequestFieldControls";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

type BillingStatementCustomerFieldsProps = {
  errors: BillingStatementFormErrors;
  isReadonly: boolean;
  values: BillingStatementFormValues;
  onUpdateField: BillingStatementFieldUpdater<BillingStatementFormValues>;
};

export function BillingStatementCustomerFields({ errors, isReadonly, onUpdateField, values }: BillingStatementCustomerFieldsProps) {
  return (
    <div className="grid min-w-0 content-start gap-x-8 gap-y-3 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="grid min-w-0 content-start gap-3">
        <PurchaseRequestTextField
          id="billing-statement-name"
          label="Party Name"
          isRequired
          readOnly={isReadonly}
          value={values.name}
          onChange={(value) => onUpdateField("name", value)}
        />
        <FieldError error={errors.name} />
        <PurchaseRequestTextField
          id="billing-statement-address"
          label="Address"
          readOnly={isReadonly}
          value={values.businessStyle}
          onChange={(value) => onUpdateField("businessStyle", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-contact-person"
          label="Contact Person"
          readOnly={isReadonly}
          value={values.contactPerson}
          onChange={(value) => onUpdateField("contactPerson", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-contact-no"
          label="Contact No."
          readOnly={isReadonly}
          value={values.refNo}
          onChange={(value) => onUpdateField("refNo", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-project-name"
          label="Project Name"
          readOnly={isReadonly}
          value={values.projectName}
          onChange={(value) => onUpdateField("projectName", value)}
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
      </div>

      <div className="grid min-w-0 content-start gap-3">
        <PurchaseRequestTextField
          id="billing-statement-code"
          label="Party Code"
          isRequired
          readOnly={isReadonly}
          value={values.code}
          onChange={(value) => onUpdateField("code", value)}
        />
        <FieldError error={errors.code} />
        <BillingSelectField
          id="billing-statement-terms"
          label="Terms of Payment"
          readOnly={isReadonly}
          value={values.terms}
          options={BillingStatementTermsOptions}
          placeholder="--Select Terms--"
          onChange={(value) => onUpdateField("terms", value)}
        />
        <PurchaseRequestDateField
          id="billing-statement-due-date"
          label="Due Date"
          readOnly={isReadonly}
          value={values.dueDate}
          onChange={(value) => onUpdateField("dueDate", value)}
        />
        <PurchaseRequestFieldShell controlId="billing-statement-currency" label="Currency">
          <CurrencyExchangeRateRow
            currencyControl={
              <AppAdvancedDropdown
                id="billing-statement-currency"
                className="w-full min-w-0"
                value={values.currency}
                readOnly={isReadonly}
                isClearable={false}
                options={BillingStatementCurrencyOptions.map((option) => ({
                  name: option,
                  value: option,
                }))}
                placeholder="Currency"
                onChange={(value) => onUpdateField("currency", String(value))}
              />
            }
            exchangeRateControl={
              <MoneyNumberField
                id="billing-statement-exchange-rate"
                value={String(values.exchangeRate)}
                readOnly={isReadonly}
                onValueChange={(value) => onUpdateField("exchangeRate", Number(value) || 0)}
                className={`${PurchaseRequestFieldClassName} text-right tabular-nums`}
              />
            }
          />
        </PurchaseRequestFieldShell>
        <PurchaseRequestTextField
          id="billing-statement-res-center"
          label="Responsibility Center"
          readOnly={isReadonly}
          value={values.resCustomerCode}
          onChange={(value) => onUpdateField("resCustomerCode", value)}
        />
      </div>

      <div className="grid min-w-0 content-start gap-3">
        <PurchaseRequestTextField
          id="billing-statement-trans-no"
          label="BS No."
          isRequired
          readOnly={isReadonly}
          value={values.transNo}
          onChange={(value) => onUpdateField("transNo", value)}
        />
        <FieldError error={errors.transNo} />
        <PurchaseRequestDateField
          id="billing-statement-document-date"
          label="BS Date"
          readOnly={isReadonly}
          value={values.documentDate}
          onChange={(value) => onUpdateField("documentDate", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-so-no"
          label="SO No."
          readOnly={isReadonly}
          value={values.sqNo}
          onChange={(value) => onUpdateField("sqNo", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-po-no"
          label="PO No."
          readOnly={isReadonly}
          value={values.poNo}
          onChange={(value) => onUpdateField("poNo", value)}
        />
        <PurchaseRequestTextField
          id="billing-statement-sales-personnel"
          label="Sales Personnel"
          readOnly={isReadonly}
          value={values.teamAssigned}
          onChange={(value) => onUpdateField("teamAssigned", value)}
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
  placeholder,
  readOnly,
  value,
}: {
  id: string;
  isRequired?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
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
        placeholder={placeholder}
        onChange={(nextValue) => onChange(String(nextValue))}
      />
    </PurchaseRequestFieldShell>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="-mt-3 pl-0 text-xs font-semibold text-coralpink sm:pl-40">{error}</p>;
}
