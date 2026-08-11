import {
  BillingCurrencyOptions,
  BillingPartyOptions,
  BillingResponsibilityCenterOptions,
  BillingStatusOptions,
  BillingTermOptions,
} from "@/app/src/data/modules/sales/billing/BillingData";
import type { BillingFormValues } from "@/app/src/types/modules/sales/billing/BillingTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { FieldClassName, FieldShell, type BillingFieldUpdater } from "@/app/src/ui/modules/sales/billing/form/BillingFieldControls";

type BillingCustomerFieldsProps = {
  isReadonly: boolean;
  onUpdateField: BillingFieldUpdater<BillingFormValues>;
  values: BillingFormValues;
};

export function BillingCustomerFields({ isReadonly, onUpdateField, values }: BillingCustomerFieldsProps) {
  return (
    <div className="grid min-w-0 gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(16rem,0.65fr)]">
      <div className="grid min-w-0 content-start gap-3">
        <FieldShell controlId="billing-name" label="Party Name" isRequired>
          <AppAdvancedDropdown
            id="billing-name"
            value={values.name}
            readOnly={isReadonly}
            options={BillingPartyOptions}
            placeholder=""
            searchPlaceholder="Search customer"
            onChange={(value) => {
              const partyName = String(value);
              const selectedParty = BillingPartyOptions.find((option) => option.value === partyName);

              onUpdateField("name", partyName);
              onUpdateField("code", selectedParty?.label ?? "");
            }}
          />
        </FieldShell>
        <FieldShell controlId="billing-bill-to-name" label="Bill To Name">
          <input
            id="billing-bill-to-name"
            value={values.billToName}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("billToName", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="billing-address" label="Address">
          <input
            id="billing-address"
            value={values.address}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("address", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="billing-contact-person" label="Contact Person">
          <input
            id="billing-contact-person"
            value={values.contactPerson}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("contactPerson", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="billing-contact-no" label="Contact No.">
          <input
            id="billing-contact-no"
            value={values.contactNo}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("contactNo", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="billing-project-code" label="Project Code">
          <input
            id="billing-project-code"
            value={values.projectCode}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("projectCode", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="billing-project-name" label="Project Name">
          <input
            id="billing-project-name"
            value={values.projectName}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("projectName", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="billing-remarks" label="Remarks">
          <AppLimitedTextarea
            id="billing-remarks"
            value={values.remarks}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("remarks", event.target.value)}
            className={`${FieldClassName} min-h-24 py-3`}
            counterMode="remaining"
            maxLength={250}
          />
        </FieldShell>
      </div>
      <div className="grid min-w-0 content-start gap-3">
        <FieldShell controlId="billing-code" label="Party Code">
          <input
            id="billing-code"
            value={values.code}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("code", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="billing-terms" label="Terms of Payment">
          <AppAdvancedDropdown
            id="billing-terms"
            value={values.terms}
            readOnly={isReadonly}
            options={BillingTermOptions}
            placeholder="--Select Terms--"
            searchPlaceholder="Search terms"
            onChange={(value) => onUpdateField("terms", String(value))}
          />
        </FieldShell>
        <FieldShell controlId="billing-due-date" label="Due Date">
          <input
            id="billing-due-date"
            type="date"
            value={values.dueDate}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("dueDate", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="billing-currency" label="Currency">
          <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_6.5rem] sm:items-start">
            <AppAdvancedDropdown
              id="billing-currency"
              value={values.currency}
              readOnly={isReadonly}
              isClearable={false}
              options={BillingCurrencyOptions}
              placeholder="Currency"
              searchPlaceholder="Search currency"
              onChange={(value) => onUpdateField("currency", String(value))}
            />
            <label htmlFor="billing-exchange-rate" className="pt-2 text-sm font-semibold text-darknavy">
              ER
            </label>
            <MoneyNumberField
              id="billing-exchange-rate"
              value={values.exchangeRate}
              readOnly={isReadonly}
              onValueChange={(value) => onUpdateField("exchangeRate", value)}
              className={`${FieldClassName} text-right tabular-nums`}
            />
          </div>
        </FieldShell>
        <FieldShell controlId="billing-res-center" label="Responsibility Center">
          <AppAdvancedDropdown
            id="billing-res-center"
            value={values.residentCustomerCode}
            readOnly={isReadonly}
            options={BillingResponsibilityCenterOptions}
            placeholder="--Select Responsibility Center--"
            searchPlaceholder="Search responsibility center"
            onChange={(value) => onUpdateField("residentCustomerCode", String(value))}
          />
        </FieldShell>
      </div>
      <div className="grid min-w-0 content-start gap-3">
        <FieldShell controlId="billing-invoice-no" label="SI No.">
          <input
            id="billing-invoice-no"
            value={values.invoiceNo}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("invoiceNo", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="billing-document-date" label="SI Date" isRequired>
          <input
            id="billing-document-date"
            type="date"
            value={values.documentDate}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("documentDate", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="billing-so-no" label="SO No.">
          <input
            id="billing-so-no"
            value={values.soNo}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("soNo", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="billing-customer-po-no" label="Customer PO No.">
          <input
            id="billing-customer-po-no"
            value={values.poNo}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("poNo", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="billing-sales-personnel" label="Sales Personnel">
          <input
            id="billing-sales-personnel"
            value={values.teamAssigned}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("teamAssigned", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="billing-status" label="Status">
          <AppAdvancedDropdown
            id="billing-status"
            value={values.status}
            readOnly
            options={BillingStatusOptions}
            placeholder="Select status"
            searchPlaceholder="Search status"
            onChange={(value) => onUpdateField("status", String(value))}
          />
        </FieldShell>
      </div>
    </div>
  );
}
