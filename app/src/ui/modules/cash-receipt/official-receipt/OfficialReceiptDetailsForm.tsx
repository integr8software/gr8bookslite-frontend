import type { ReactNode } from "react";
import {
  OfficialReceiptCurrencyOptions,
  OfficialReceiptPartyOptions,
  OfficialReceiptPaymentTypeOptions,
} from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import type { OfficialReceiptFormValues } from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";

type OfficialReceiptDetailsFormProps = {
  isReadonly: boolean;
  receiptCodeLabel?: string;
  values: OfficialReceiptFormValues;
  onOpenPartyDrawer: () => void;
  onOpenPaymentTypeDialog: () => void;
  onPartyNameChange?: (partyName: string) => void;
  onUpdateField: <Key extends keyof OfficialReceiptFormValues>(key: Key, value: OfficialReceiptFormValues[Key]) => void;
};

export function OfficialReceiptDetailsForm({
  isReadonly,
  onOpenPartyDrawer,
  onOpenPaymentTypeDialog,
  onPartyNameChange,
  onUpdateField,
  receiptCodeLabel = "OR",
  values,
}: OfficialReceiptDetailsFormProps) {
  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid min-w-0 gap-x-8 gap-y-5 xl:grid-cols-2">
        <div className="grid min-w-0 gap-4">
          <FieldShell controlId="official-receipt-party" label="Party Name" isRequired>
            <AppAdvancedDropdown
              id="official-receipt-party"
              value={values.customerName}
              readOnly={isReadonly}
              options={OfficialReceiptPartyOptions}
              placeholder="Select Party Name"
              searchPlaceholder="Search Party Name"
              addAction={!isReadonly ? { label: "Add Party Name", onClick: onOpenPartyDrawer } : undefined}
              onChange={(value) => {
                onUpdateField("customerName", String(value));
                onPartyNameChange?.(String(value));
              }}
            />
          </FieldShell>
          <FieldShell controlId="official-receipt-payment-type" label="Payment Type" isRequired>
            <AppAdvancedDropdown
              id="official-receipt-payment-type"
              value={values.paymentType}
              readOnly={isReadonly}
              options={OfficialReceiptPaymentTypeOptions}
              placeholder="Select payment type"
              searchPlaceholder="Search payment type"
              addAction={!isReadonly ? { label: "Add Payment Type", onClick: onOpenPaymentTypeDialog } : undefined}
              onChange={(value) => onUpdateField("paymentType", String(value))}
            />
          </FieldShell>
          <FieldShell controlId="official-receipt-currency" label="Currency">
            <CurrencyExchangeRateRow
              exchangeRateControlId="official-receipt-exchange-rate"
              currencyControl={
                <AppAdvancedDropdown
                  id="official-receipt-currency"
                  className="w-full min-w-0"
                  value={values.currency}
                  readOnly={isReadonly}
                  isClearable={false}
                  options={OfficialReceiptCurrencyOptions}
                  placeholder="Currency"
                  searchPlaceholder="Search currency"
                  onChange={(value) => onUpdateField("currency", String(value))}
                />
              }
              exchangeRateControl={
                <MoneyNumberField
                  id="official-receipt-exchange-rate"
                  value={values.exchangeRate}
                  readOnly={isReadonly}
                  onValueChange={(value) => onUpdateField("exchangeRate", value)}
                  className={`${FieldClassName} text-right tabular-nums`}
                />
              }
            />
          </FieldShell>
          <FieldShell controlId="official-receipt-remarks" label="Remarks">
            <AppLimitedTextarea
              id="official-receipt-remarks"
              value={values.remarks}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
              className={`${FieldClassName} min-h-24 py-3`}
              counterMode="used"
            />
          </FieldShell>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <FieldShell controlId="official-receipt-party-code" label="Party Code">
            <input
              id="official-receipt-party-code"
              value={values.partyCode}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("partyCode", event.target.value)}
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="official-receipt-transaction-no" label={`${receiptCodeLabel} No.`} isRequired>
            <input
              id="official-receipt-transaction-no"
              value={values.receiptNo}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("receiptNo", event.target.value)}
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="official-receipt-document-date" label={`${receiptCodeLabel} Date`} isRequired>
            <input
              id="official-receipt-document-date"
              type="date"
              value={values.receiptDate}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("receiptDate", event.target.value)}
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="official-receipt-reference-no" label="Reference No">
            <input
              id="official-receipt-reference-no"
              value={values.referenceNo}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("referenceNo", event.target.value)}
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="official-receipt-status" label="Status">
            <input
              id="official-receipt-status"
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
        <ModuleFieldRequiredMark fallbackRequired={isRequired} label={label} />
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const FieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";
