import {
  ServiceInvoiceCurrencyOptions,
  ServiceInvoicePartyOptions,
  ServiceInvoiceTeamOptions,
  ServiceInvoiceTermOptions,
} from "@/app/src/data/modules/sales/service-invoice/ServiceInvoiceData";
import type { ServiceInvoiceFormValues } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  AttachedDropdown,
  FieldClassName,
  FieldShell,
  SelectField,
  type ServiceInvoiceFieldUpdater,
} from "@/app/src/ui/modules/sales/service-invoice/action/ServiceInvoiceFieldControls";

type ServiceInvoiceCustomerFieldsProps = {
  isReadonly: boolean;
  onUpdateField: ServiceInvoiceFieldUpdater<ServiceInvoiceFormValues>;
  values: ServiceInvoiceFormValues;
};

export function ServiceInvoiceCustomerFields({
  isReadonly,
  onUpdateField,
  values,
}: ServiceInvoiceCustomerFieldsProps) {
  return (
    <div className="grid min-w-0 content-start gap-x-8 gap-y-3 xl:grid-cols-3">
      <div className="grid min-w-0 content-start gap-3">
        <FieldShell controlId="service-invoice-name" label="Party Name" isRequired>
          <AttachedDropdown
            id="service-invoice-name"
            value={values.name}
            readOnly={isReadonly}
            options={ServiceInvoicePartyOptions}
            placeholder=""
            searchPlaceholder="Search customer"
            onAdd={() => undefined}
            onChange={(value) => onUpdateField("name", value)}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-code" label="Party Code">
          <input
            id="service-invoice-code"
            value={values.code}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("code", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-contact-person" label="Contact Person">
          <input
            id="service-invoice-contact-person"
            value={values.contactPerson}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("contactPerson", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-business-style" label="Business Style">
          <input
            id="service-invoice-business-style"
            value={values.businessStyle}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("businessStyle", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-project-name" label="Project Name">
          <input
            id="service-invoice-project-name"
            value={values.projectName}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("projectName", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-remarks" label="Remarks">
          <AppLimitedTextarea
            id="service-invoice-remarks"
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
        <FieldShell controlId="service-invoice-terms" label="Terms of Payment">
          <SelectField
            id="service-invoice-terms"
            value={values.terms}
            readOnly={isReadonly}
            options={ServiceInvoiceTermOptions}
            placeholder="--Select Terms--"
            onChange={(value) => onUpdateField("terms", value)}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-due-date" label="Due Date">
          <input
            id="service-invoice-due-date"
            type="date"
            value={values.dueDate}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("dueDate", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-currency" label="Currency">
          <div className="grid min-w-0 gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
            <AppAdvancedDropdown
              id="service-invoice-currency"
              value={values.currency}
              readOnly={isReadonly}
              isClearable={false}
              options={ServiceInvoiceCurrencyOptions}
              placeholder="Currency"
              searchPlaceholder="Search currency"
              onChange={(value) => onUpdateField("currency", String(value))}
            />
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
              <label
                htmlFor="service-invoice-exchange-rate"
                className="text-sm font-semibold text-darknavy"
              >
                ER:
              </label>
              <MoneyNumberField
                id="service-invoice-exchange-rate"
                value={values.exchangeRate}
                readOnly={isReadonly}
                onValueChange={(value) => onUpdateField("exchangeRate", value)}
                className={`${FieldClassName} text-right`}
              />
            </div>
          </div>
        </FieldShell>
        <FieldShell controlId="service-invoice-res-center" label="Res Center">
          <input
            id="service-invoice-res-center"
            value={values.residentCustomerCode}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("residentCustomerCode", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-team-assigned" label="Team Personnel">
          <SelectField
            id="service-invoice-team-assigned"
            value={values.teamAssigned}
            readOnly={isReadonly}
            options={ServiceInvoiceTeamOptions}
            placeholder="--Select Team--"
            onChange={(value) => onUpdateField("teamAssigned", value)}
          />
        </FieldShell>
      </div>
      <div className="grid min-w-0 content-start gap-3">
        <FieldShell controlId="service-invoice-invoice-no" label="SI No.">
          <input
            id="service-invoice-invoice-no"
            value={values.invoiceNo}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("invoiceNo", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-document-date" label="SI Date" isRequired>
          <input
            id="service-invoice-document-date"
            type="date"
            value={values.documentDate}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("documentDate", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-jo-no" label="JO No.">
          <input
            id="service-invoice-jo-no"
            value={values.joNo}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("joNo", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-po-no" label="PO No.">
          <input
            id="service-invoice-po-no"
            value={values.poNo}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("poNo", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
      </div>
    </div>
  );
}
