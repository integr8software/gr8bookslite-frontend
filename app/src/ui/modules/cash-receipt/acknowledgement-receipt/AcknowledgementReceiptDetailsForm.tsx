import type { ReactNode } from "react";
import {
  AcknowledgementReceiptCurrencyOptions,
  AcknowledgementReceiptPartyOptions,
  AcknowledgementReceiptPaymentTypeOptions,
} from "@/app/src/data/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptData";
import type { AcknowledgementReceiptFormValues } from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type AcknowledgementReceiptDetailsFormProps = {
  isReadonly: boolean;
  values: AcknowledgementReceiptFormValues;
  onOpenPartyDrawer: () => void;
  onOpenPaymentTypeDialog: () => void;
  onUpdateField: <Key extends keyof AcknowledgementReceiptFormValues>(key: Key, value: AcknowledgementReceiptFormValues[Key]) => void;
};

export function AcknowledgementReceiptDetailsForm({
  isReadonly,
  onOpenPartyDrawer,
  onOpenPaymentTypeDialog,
  onUpdateField,
  values,
}: AcknowledgementReceiptDetailsFormProps) {
  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid min-w-0 gap-x-8 gap-y-5 xl:grid-cols-2">
        <div className="grid min-w-0 gap-4">
          <FieldShell controlId="acknowledgement-receipt-payment-type" label="Payment Type" isRequired>
            <AttachedDropdown
              id="acknowledgement-receipt-payment-type"
              value={values.paymentType}
              readOnly={isReadonly}
              options={AcknowledgementReceiptPaymentTypeOptions}
              placeholder="Select payment type"
              searchPlaceholder="Search payment type"
              onAdd={onOpenPaymentTypeDialog}
              onChange={(value) => onUpdateField("paymentType", value)}
            />
          </FieldShell>
          <FieldShell controlId="acknowledgement-receipt-party" label="Party Name" isRequired>
            <AttachedDropdown
              id="acknowledgement-receipt-party"
              value={values.customerName}
              readOnly={isReadonly}
              options={AcknowledgementReceiptPartyOptions}
              placeholder="Select Party Name"
              searchPlaceholder="Search Party Name"
              onAdd={onOpenPartyDrawer}
              onChange={(value) => onUpdateField("customerName", value)}
            />
          </FieldShell>
          <FieldShell controlId="acknowledgement-receipt-currency" label="Currency">
            <CurrencyExchangeRateRow
              currencyControl={
                <AppAdvancedDropdown
                  id="acknowledgement-receipt-currency"
                  className="w-full min-w-0"
                  value={values.currency}
                  readOnly={isReadonly}
                  isClearable={false}
                  options={AcknowledgementReceiptCurrencyOptions}
                  placeholder="Currency"
                  searchPlaceholder="Search currency"
                  onChange={(value) => onUpdateField("currency", String(value))}
                />
              }
              exchangeRateControl={
                <MoneyNumberField
                  id="acknowledgement-receipt-exchange-rate"
                  value={values.exchangeRate}
                  readOnly={isReadonly}
                  onValueChange={(value) => onUpdateField("exchangeRate", value)}
                  className={`${FieldClassName} text-right tabular-nums`}
                />
              }
            />
          </FieldShell>
          <FieldShell controlId="acknowledgement-receipt-remarks" label="Remarks">
            <AppLimitedTextarea
              id="acknowledgement-receipt-remarks"
              value={values.remarks}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
              className={`${FieldClassName} min-h-24 py-3`}
              counterMode="used"
            />
          </FieldShell>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <FieldShell controlId="acknowledgement-receipt-transaction-no" label="Transaction No." isRequired>
            <input
              id="acknowledgement-receipt-transaction-no"
              value={values.receiptNo}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("receiptNo", event.target.value)}
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="acknowledgement-receipt-document-date" label="Document Date" isRequired>
            <input
              id="acknowledgement-receipt-document-date"
              type="date"
              value={values.receiptDate}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("receiptDate", event.target.value)}
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="acknowledgement-receipt-reference-no" label="Reference No">
            <input
              id="acknowledgement-receipt-reference-no"
              value={values.referenceNo}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("referenceNo", event.target.value)}
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="acknowledgement-receipt-status" label="Status">
            <input
              id="acknowledgement-receipt-status"
              value={values.status}
              readOnly
              className={`${FieldClassName} !bg-darknavy/5 text-darknavy/60`}
            />
          </FieldShell>
        </div>
      </div>
    </section>
  );
}

function AttachedDropdown({
  id,
  onChange,
  onAdd,
  options,
  placeholder,
  readOnly,
  searchPlaceholder,
  value,
}: {
  id: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  options: AppAdvancedDropdownOption[];
  placeholder: string;
  readOnly: boolean;
  searchPlaceholder: string;
  value: string;
}) {
  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-0">
      <AppAdvancedDropdown
        className={AttachedDropdownClassName}
        id={id}
        value={value}
        readOnly={readOnly}
        options={options}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        onChange={(nextValue) => onChange(String(nextValue))}
      />
      <button type="button" disabled={readOnly} onClick={onAdd} className={AttachedAddButtonClassName}>
        Add
      </button>
    </div>
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
