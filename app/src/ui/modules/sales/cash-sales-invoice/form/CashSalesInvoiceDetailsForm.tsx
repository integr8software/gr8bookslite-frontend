import {
  CashSalesInvoiceCurrencyOptions,
  CashSalesInvoiceDefaultAccountOptions,
  CashSalesInvoicePartyOptions,
  CashSalesInvoiceResponsibilityCenterOptions,
  CashSalesInvoiceStatusDropdownOptions,
  CashSalesInvoiceTermOptions,
  CashSalesInvoiceWarehouseOptions,
} from "@/app/src/data/modules/sales/cash-sales-invoice/CashSalesInvoiceData";
import type {
  CashSalesInvoiceFieldUpdater,
  CashSalesInvoiceFormValues,
} from "@/app/src/types/modules/sales/cash-sales-invoice/CashSalesInvoiceTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  FieldClassName,
  FieldShell,
  SelectField,
  TextField,
} from "@/app/src/ui/modules/sales/billing-invoice/form/BillingInvoiceFieldControls";

type CashSalesInvoiceDetailsFormProps = {
  isReadonly: boolean;
  values: CashSalesInvoiceFormValues;
  onUpdateField: CashSalesInvoiceFieldUpdater<CashSalesInvoiceFormValues>;
};

export function CashSalesInvoiceDetailsForm({
  isReadonly,
  onUpdateField,
  values,
}: CashSalesInvoiceDetailsFormProps) {
  return (
    <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
      <div className="grid min-w-0 gap-x-8 gap-y-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(16rem,0.65fr)]">
        <div className="grid min-w-0 content-start gap-3">
          <FieldShell controlId="cash-sales-invoice-party-name" label="Party Name" isRequired>
            <AppAdvancedDropdown
              id="cash-sales-invoice-party-name"
              value={values.partyName}
              readOnly={isReadonly}
              options={CashSalesInvoicePartyOptions}
              placeholder=""
              searchPlaceholder="Search party"
              onChange={(value) => {
                const partyName = String(value);
                const selectedParty = CashSalesInvoicePartyOptions.find(
                  (option) => option.value === partyName,
                );

                onUpdateField("partyName", partyName);
                onUpdateField("partyCode", selectedParty?.label ?? "");
              }}
            />
          </FieldShell>
          <TextField
            id="cash-sales-invoice-address"
            label="Address"
            value={values.address}
            readOnly={isReadonly}
            onChange={(value) => onUpdateField("address", value)}
          />
          <TextField
            id="cash-sales-invoice-contact-no"
            label="Contact No"
            value={values.contactNo}
            readOnly={isReadonly}
            onChange={(value) => onUpdateField("contactNo", value)}
          />
          <FieldShell controlId="cash-sales-invoice-warehouse" label="Warehouse" isRequired>
            <SelectField
              value={values.warehouse}
              readOnly={isReadonly}
              options={CashSalesInvoiceWarehouseOptions}
              placeholder="--Select Warehouse--"
              onChange={(value) => onUpdateField("warehouse", value)}
            />
          </FieldShell>
          <FieldShell controlId="cash-sales-invoice-default-account" label="Default Account" isRequired>
            <SelectField
              value={values.defaultAccount}
              readOnly={isReadonly}
              options={CashSalesInvoiceDefaultAccountOptions}
              placeholder="--Select Debit Account--"
              onChange={(value) => onUpdateField("defaultAccount", value)}
            />
          </FieldShell>
        </div>

        <div className="grid min-w-0 content-start gap-3">
          <TextField
            id="cash-sales-invoice-party-code"
            label="Party Code"
            value={values.partyCode}
            readOnly={isReadonly}
            onChange={(value) => onUpdateField("partyCode", value)}
          />
          <FieldShell controlId="cash-sales-invoice-terms" label="Terms of Payment" isRequired>
            <SelectField
              value={values.terms}
              readOnly={isReadonly}
              options={CashSalesInvoiceTermOptions}
              placeholder="--Select Terms--"
              onChange={(value) => onUpdateField("terms", value)}
            />
          </FieldShell>
          <DateField
            id="cash-sales-invoice-due-date"
            label="Due Date"
            value={values.dueDate}
            readOnly={isReadonly}
            onChange={(value) => onUpdateField("dueDate", value)}
          />
          <CurrencyExchangeRateField
            currency={values.currency}
            exchangeRate={values.exchangeRate}
            readOnly={isReadonly}
            onCurrencyChange={(value) => onUpdateField("currency", value)}
            onExchangeRateChange={(value) => onUpdateField("exchangeRate", value)}
          />
          <FieldShell controlId="cash-sales-invoice-responsibility-center" label="Responsibility Center">
            <SelectField
              value={values.responsibilityCenter}
              readOnly={isReadonly}
              options={CashSalesInvoiceResponsibilityCenterOptions}
              placeholder="--Select Res. Center--"
              onChange={(value) => onUpdateField("responsibilityCenter", value)}
            />
          </FieldShell>
          <FieldShell controlId="cash-sales-invoice-remarks" label="Remarks">
            <AppLimitedTextarea
              id="cash-sales-invoice-remarks"
              value={values.remarks}
              readOnly={isReadonly}
              onChange={(event) => onUpdateField("remarks", event.target.value)}
              className={`${FieldClassName} min-h-20 py-3`}
              counterMode="remaining"
              maxLength={250}
            />
          </FieldShell>
        </div>

        <div className="grid min-w-0 content-start gap-3">
          <TextField
            id="cash-sales-invoice-trans-no"
            label="CSI No."
            value={values.transNo}
            readOnly={isReadonly}
            onChange={(value) => onUpdateField("transNo", value)}
          />
          <DateField
            id="cash-sales-invoice-document-date"
            label="CSI Date"
            value={values.documentDate}
            readOnly={isReadonly}
            onChange={(value) => onUpdateField("documentDate", value)}
          />
          <TextField
            id="cash-sales-invoice-sj-no"
            label="SJ No."
            value={values.sjNo}
            readOnly={isReadonly}
            onChange={(value) => onUpdateField("sjNo", value)}
          />
          <FieldShell controlId="cash-sales-invoice-status" label="Status">
            <AppAdvancedDropdown
              id="cash-sales-invoice-status"
              value={values.status}
              readOnly
              options={CashSalesInvoiceStatusDropdownOptions}
              placeholder="Select status"
              onChange={(value) => onUpdateField("status", String(value) as typeof values.status)}
            />
          </FieldShell>
        </div>
      </div>
    </section>
  );
}

function CurrencyExchangeRateField({
  currency,
  exchangeRate,
  onCurrencyChange,
  onExchangeRateChange,
  readOnly,
}: {
  currency: string;
  exchangeRate: string;
  onCurrencyChange: (value: string) => void;
  onExchangeRateChange: (value: string) => void;
  readOnly: boolean;
}) {
  return (
    <FieldShell controlId="cash-sales-invoice-currency" label="Currency">
      <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_6.5rem] sm:items-start">
        <AppAdvancedDropdown
          id="cash-sales-invoice-currency"
          value={currency}
          readOnly={readOnly}
          options={CashSalesInvoiceCurrencyOptions}
          placeholder="Currency"
          onChange={(value) => onCurrencyChange(String(value))}
        />
        <label htmlFor="cash-sales-invoice-exchange-rate" className="pt-2 text-sm font-semibold text-darknavy">
          ER
        </label>
        <MoneyNumberField
          id="cash-sales-invoice-exchange-rate"
          value={exchangeRate}
          readOnly={readOnly}
          onValueChange={onExchangeRateChange}
          className={`${FieldClassName} text-right tabular-nums`}
        />
      </div>
    </FieldShell>
  );
}

function DateField({
  id,
  label,
  onChange,
  readOnly,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  value: string;
}) {
  return (
    <FieldShell controlId={id} label={label}>
      <input
        id={id}
        type="date"
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className={FieldClassName}
      />
    </FieldShell>
  );
}
