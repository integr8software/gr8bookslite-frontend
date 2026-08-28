import type { ReactNode } from "react";
import { CollectionReceiptCurrencyOptions } from "@/app/src/data/modules/cash-receipt/collection-receipt/CollectionReceiptData";
import type { CollectionReceiptFormValues } from "@/app/src/types/modules/cash-receipt/collection-receipt/CollectionReceiptTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLookupDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppLookupDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";

type CollectionReceiptDetailsFormProps = {
  isReadonly: boolean;
  partyOptions: AppAdvancedDropdownOption[];
  paymentTypeOptions: AppAdvancedDropdownOption[];
  receiptCodeLabel?: string;
  values: CollectionReceiptFormValues;
  onOpenPartyDrawer: () => void;
  onOpenPaymentTypeDialog: () => void;
  onUpdateField: <Key extends keyof CollectionReceiptFormValues>(key: Key, value: CollectionReceiptFormValues[Key]) => void;
};

export function CollectionReceiptDetailsForm({
  isReadonly,
  onOpenPartyDrawer,
  onOpenPaymentTypeDialog,
  onUpdateField,
  partyOptions,
  paymentTypeOptions,
  receiptCodeLabel = "CR",
  values,
}: CollectionReceiptDetailsFormProps) {
  const selectedPaymentTypeId = values.paymentId || paymentTypeOptions.find((option) => option.name === values.paymentType)?.value || "";

  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid min-w-0 gap-x-8 gap-y-5 xl:grid-cols-2">
        <div className="grid min-w-0 gap-4">
          <FieldShell controlId="collection-receipt-party" label="Party Name" isRequired>
            <AppLookupDropdown
              value={values.partyCode}
              readOnly={isReadonly}
              options={partyOptions}
              placeholder="Select Party Name"
              searchPlaceholder="Search Party Name"
              addAction={!isReadonly ? { label: "Add Party Name", onClick: onOpenPartyDrawer } : undefined}
              onChange={(partyCode, partyName) => {
                onUpdateField("partyCode", partyCode);
                onUpdateField("customerName", partyName);
              }}
            />
          </FieldShell>
          <FieldShell controlId="collection-receipt-payment-type" label="Payment Type" isRequired>
            <AppAdvancedDropdown
              id="collection-receipt-payment-type"
              value={selectedPaymentTypeId}
              readOnly={isReadonly}
              options={paymentTypeOptions}
              placeholder="Select payment type"
              searchPlaceholder="Search payment type"
              addAction={!isReadonly ? { label: "Add Payment Type", onClick: onOpenPaymentTypeDialog } : undefined}
              onChange={(value) => {
                const paymentId = String(value);
                const selectedOption = paymentTypeOptions.find((option) => option.value === paymentId);

                onUpdateField("paymentId", paymentId);
                onUpdateField("paymentType", selectedOption?.name ?? paymentId);
              }}
            />
          </FieldShell>
          {isCheckPaymentType(values.paymentType) ? (
            <>
              <FieldShell controlId="collection-receipt-bank-name" label="Bank Name">
                <input
                  id="collection-receipt-bank-name"
                  value={values.bankName}
                  readOnly={isReadonly}
                  onChange={(event) => onUpdateField("bankName", event.target.value)}
                  className={FieldClassName}
                />
              </FieldShell>
              <FieldShell controlId="collection-receipt-check-no" label="Check No.">
                <input
                  id="collection-receipt-check-no"
                  value={values.checkNo}
                  readOnly={isReadonly}
                  onChange={(event) => onUpdateField("checkNo", event.target.value)}
                  className={FieldClassName}
                />
              </FieldShell>
              <FieldShell controlId="collection-receipt-check-date" label="Check Date">
                <input
                  id="collection-receipt-check-date"
                  type="date"
                  value={values.checkDate}
                  readOnly={isReadonly}
                  onChange={(event) => onUpdateField("checkDate", event.target.value)}
                  className={FieldClassName}
                />
              </FieldShell>
            </>
          ) : null}
          <FieldShell controlId="collection-receipt-currency" label="Currency">
            <CurrencyExchangeRateRow
              exchangeRateControlId="collection-receipt-exchange-rate"
              currencyControl={
                <AppAdvancedDropdown
                  id="collection-receipt-currency"
                  className="w-full min-w-0"
                  value={values.currency}
                  readOnly={isReadonly}
                  isClearable={false}
                  options={CollectionReceiptCurrencyOptions}
                  placeholder="Currency"
                  searchPlaceholder="Search currency"
                  onChange={(value) => onUpdateField("currency", String(value))}
                />
              }
              exchangeRateControl={
                <MoneyNumberField
                  id="collection-receipt-exchange-rate"
                  value={values.exchangeRate}
                  readOnly={isReadonly}
                  onValueChange={(value) => onUpdateField("exchangeRate", value)}
                  className={`${FieldClassName} text-right tabular-nums`}
                />
              }
            />
          </FieldShell>
          <FieldShell controlId="collection-receipt-remarks" label="Remarks">
            <AppLimitedTextarea
              id="collection-receipt-remarks"
              value={values.remarks}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
              className={`${FieldClassName} min-h-24 py-3`}
              counterMode="used"
            />
          </FieldShell>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <FieldShell controlId="collection-receipt-party-code" label="Party Code">
            <input id="collection-receipt-party-code" value={values.partyCode} readOnly className={FieldClassName} />
          </FieldShell>
          <FieldShell controlId="collection-receipt-transaction-no" label={`${receiptCodeLabel} No.`} isRequired>
            <input
              id="collection-receipt-transaction-no"
              value={values.receiptNo}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("receiptNo", event.target.value)}
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="collection-receipt-document-date" label={`${receiptCodeLabel} Date`} isRequired>
            <input
              id="collection-receipt-document-date"
              type="date"
              value={values.receiptDate}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("receiptDate", event.target.value)}
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="collection-receipt-reference-no" label="Reference No">
            <input
              id="collection-receipt-reference-no"
              value={values.referenceNo}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("referenceNo", event.target.value)}
              className={FieldClassName}
            />
          </FieldShell>
          <FieldShell controlId="collection-receipt-status" label="Status">
            <input
              id="collection-receipt-status"
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

function isCheckPaymentType(paymentType: string) {
  return paymentType.trim().toLowerCase().includes("check");
}
