import { SalesQuotationCurrencyOptions } from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import type { SalesOrderFormValues } from "@/app/src/types/modules/sales/sales-order/SalesOrderTypes";
import {
  SalesQuotationAttachedTextField,
  SalesQuotationDateField,
  SalesQuotationFieldClassName,
  SalesQuotationFieldShell,
  SalesQuotationSelectField,
  SalesQuotationTextField,
} from "@/app/src/ui/modules/sales/sales-quotation/action/SalesQuotationFieldControls";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";

export function SalesOrderDetailsFields({
  isReadonly,
  onUpdateField,
  values,
}: {
  isReadonly: boolean;
  onUpdateField: <Key extends keyof SalesOrderFormValues>(key: Key, value: SalesOrderFormValues[Key]) => void;
  values: SalesOrderFormValues;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid min-w-0 gap-5 xl:grid-cols-3">
        <div className="grid content-start min-w-0 gap-4">
          <SalesQuotationAttachedTextField
            id="sales-order-party-name"
            label="Party Name"
            isRequired
            readOnly={isReadonly}
            value={values.partyName}
            onAdd={() => undefined}
            onChange={(value) => onUpdateField("partyName", value)}
          />
          <SalesQuotationTextField
            id="sales-order-contact-person"
            label="Contact Person"
            readOnly={isReadonly}
            value={values.contactPerson}
            onChange={(value) => onUpdateField("contactPerson", value)}
          />
          <SalesQuotationTextField
            id="sales-order-contact-no"
            label="Contact No."
            readOnly={isReadonly}
            value={values.contactNo}
            onChange={(value) => onUpdateField("contactNo", value)}
          />
          <SalesQuotationFieldShell controlId="sales-order-party-address" label="Party Address">
            <textarea
              id="sales-order-party-address"
              readOnly={isReadonly}
              value={values.partyAddress}
              onChange={(event) => onUpdateField("partyAddress", event.target.value)}
              className={`${SalesQuotationFieldClassName} min-h-20 py-3`}
            />
          </SalesQuotationFieldShell>
          <SalesQuotationFieldShell controlId="sales-order-remarks" label="Remarks">
            <AppLimitedTextarea
              id="sales-order-remarks"
              readOnly={isReadonly}
              value={values.remarks}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
              className={`${SalesQuotationFieldClassName} min-h-20 py-3`}
              counterMode="remaining"
              maxLength={250}
            />
          </SalesQuotationFieldShell>
        </div>
        <div className="grid content-start min-w-0 gap-4">
          <SalesQuotationTextField
            id="sales-order-party-code"
            label="Party Code"
            isRequired
            readOnly={isReadonly}
            value={values.partyCode}
            onChange={(value) => onUpdateField("partyCode", value)}
          />
          <SalesQuotationSelectField
            id="sales-order-currency"
            label="Currency"
            readOnly={isReadonly}
            value={values.currency}
            options={SalesQuotationCurrencyOptions}
            onChange={(value) => onUpdateField("currency", value)}
          />
          <SalesQuotationFieldShell controlId="sales-order-exchange-rate" label="Exchange Rate">
            <input
              id="sales-order-exchange-rate"
              type="number"
              readOnly={isReadonly}
              value={values.exchangeRate}
              onChange={(event) => onUpdateField("exchangeRate", Number(event.target.value))}
              className={`${SalesQuotationFieldClassName} text-right`}
            />
          </SalesQuotationFieldShell>
        </div>
        <div className="grid content-start min-w-0 gap-4">
          <SalesQuotationTextField
            id="sales-order-trans-no"
            label="Sales Order No."
            isRequired
            readOnly={isReadonly}
            value={values.transNo}
            onChange={(value) => onUpdateField("transNo", value)}
          />
          <SalesQuotationDateField
            id="sales-order-document-date"
            label="SO Date"
            readOnly={isReadonly}
            value={values.prDate}
            onChange={(value) => onUpdateField("prDate", value)}
          />
          <SalesQuotationTextField
            id="sales-order-reference-no"
            label="Sales Quotation No."
            readOnly
            value={values.referenceNo}
            onChange={() => undefined}
          />
          <SalesQuotationTextField id="sales-order-status" label="Status" readOnly value={values.status} onChange={() => undefined} />
        </div>
      </div>
    </section>
  );
}
