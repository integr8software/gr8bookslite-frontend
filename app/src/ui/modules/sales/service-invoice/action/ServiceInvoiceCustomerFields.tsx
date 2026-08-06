import {
  ServiceInvoiceCurrencyOptions,
  ServiceInvoicePartyOptions,
  ServiceInvoiceResponsibilityCenterOptions,
  ServiceInvoiceStatusOptions,
  ServiceInvoiceTermOptions,
} from "@/app/src/data/modules/sales/service-invoice/ServiceInvoiceData";
import type { ServiceInvoiceFormValues } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  FieldClassName,
  FieldShell,
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
          <AppAdvancedDropdown
            id="service-invoice-name"
            value={values.name}
            readOnly={isReadonly}
            options={ServiceInvoicePartyOptions}
            placeholder=""
            searchPlaceholder="Search customer"
            showSelectedDetails
            addAction={{
              disabled: isReadonly,
              label: "Add",
              onClick: () => undefined,
            }}
            onChange={(value) => {
              const partyName = String(value);
              const selectedParty = ServiceInvoicePartyOptions.find(
                (option) => option.value === partyName,
              );

              onUpdateField("name", partyName);
              onUpdateField("code", selectedParty?.label ?? "");
            }}
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
        <FieldShell controlId="service-invoice-address" label="Address">
          <input
            id="service-invoice-address"
            value={values.address}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("address", event.target.value)}
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
        <FieldShell controlId="service-invoice-contact-no" label="Contact No.">
          <input
            id="service-invoice-contact-no"
            value={values.contactNo}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("contactNo", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-bill-to-name" label="Bill To Name">
          <input
            id="service-invoice-bill-to-name"
            value={values.billToName}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("billToName", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-project-code" label="Project Code">
          <input
            id="service-invoice-project-code"
            value={values.projectCode}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("projectCode", event.target.value)}
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
          <AppAdvancedDropdown
            id="service-invoice-terms"
            value={values.terms}
            readOnly={isReadonly}
            options={ServiceInvoiceTermOptions}
            placeholder="--Select Terms--"
            searchPlaceholder="Search terms"
            onChange={(value) => onUpdateField("terms", String(value))}
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
        <FieldShell controlId="service-invoice-res-center" label="Responsibility Center">
          <AppAdvancedDropdown
            id="service-invoice-res-center"
            value={values.residentCustomerCode}
            readOnly={isReadonly}
            options={ServiceInvoiceResponsibilityCenterOptions}
            placeholder="--Select Responsibility Center--"
            searchPlaceholder="Search responsibility center"
            onChange={(value) => onUpdateField("residentCustomerCode", String(value))}
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
        <FieldShell controlId="service-invoice-so-no" label="SO No.">
          <input
            id="service-invoice-so-no"
            value={values.soNo}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("soNo", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-customer-po-no" label="Customer PO No.">
          <input
            id="service-invoice-customer-po-no"
            value={values.poNo}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("poNo", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-sales-personnel" label="Sales Personnel">
          <input
            id="service-invoice-sales-personnel"
            value={values.teamAssigned}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("teamAssigned", event.target.value)}
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="service-invoice-status" label="Status">
          <AppAdvancedDropdown
            id="service-invoice-status"
            value={values.status}
            readOnly
            options={ServiceInvoiceStatusOptions}
            placeholder="Select status"
            searchPlaceholder="Search status"
            onChange={(value) => onUpdateField("status", String(value))}
          />
        </FieldShell>
      </div>
    </div>
  );
}
