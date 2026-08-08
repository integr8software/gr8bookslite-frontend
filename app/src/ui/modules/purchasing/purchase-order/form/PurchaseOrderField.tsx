import {
  PurchaseOrderBooleanOptions,
  PurchaseOrderCurrencyOptions,
  PurchaseOrderStatusOptions,
  PurchaseOrderTermsOptions,
  PurchaseOrderTypeOptions,
} from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import type {
  PurchaseOrderFieldUpdater,
  PurchaseOrderFormValues,
  PurchaseOrderStatus,
} from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  DateField,
  FieldShell,
  PurchaseOrderFieldClassName,
  SelectField,
  TextField,
} from "@/app/src/ui/modules/purchasing/purchase-order/form/PurchaseOrderFieldControls";

type PurchaseOrderSupplierFieldsProps = {
  isReadonly: boolean;
  values: PurchaseOrderFormValues;
  onUpdateField: PurchaseOrderFieldUpdater<PurchaseOrderFormValues>;
};

export function PurchaseOrderSupplierFields({ isReadonly, onUpdateField, values }: PurchaseOrderSupplierFieldsProps) {
  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="grid min-w-0 content-start gap-4">
        <TextField
          id="purchase-order-party-name"
          label="Party Name"
          readOnly={isReadonly}
          value={values.vceName}
          onChange={(value) => onUpdateField("vceName", value)}
        />
        <TextField
          id="purchase-order-address"
          label="Address"
          readOnly={isReadonly}
          value={values.address}
          onChange={(value) => onUpdateField("address", value)}
        />
        <TextField
          id="purchase-order-email-address"
          label="Email Address"
          readOnly={isReadonly}
          value={values.emailAddress}
          onChange={(value) => onUpdateField("emailAddress", value)}
        />
        <TextField
          id="purchase-order-contact-no"
          label="Contact No."
          readOnly={isReadonly}
          value={values.contactNo}
          onChange={(value) => onUpdateField("contactNo", value)}
        />
        <TextField
          id="purchase-order-pr-no"
          label="PR No."
          readOnly={isReadonly}
          value={values.prNo}
          onChange={(value) => onUpdateField("prNo", value)}
        />
        <TextField
          id="purchase-order-project-code"
          label="Project Code"
          readOnly={isReadonly}
          value={values.projectCode}
          onChange={(value) => onUpdateField("projectCode", value)}
        />
        <TextField
          id="purchase-order-project-name"
          label="Project Name"
          readOnly={isReadonly}
          value={values.projectName}
          onChange={(value) => onUpdateField("projectName", value)}
        />
        <div className="grid min-w-0 gap-2">
          <label htmlFor="purchase-order-remarks" className="text-sm font-semibold text-darknavy">
            Remarks
          </label>
          <AppLimitedTextarea
            id="purchase-order-remarks"
            readOnly={isReadonly}
            value={values.remarks ?? ""}
            onChange={(event) => onUpdateField("remarks", event.target.value)}
            className={`${PurchaseOrderFieldClassName} min-h-23 py-3`}
            counterMode="remaining"
            maxLength={250}
          />
        </div>
      </div>
      <div className="grid min-w-0 content-start gap-4">
        <TextField
          id="purchase-order-party-code"
          label="Party Code"
          readOnly={isReadonly}
          value={values.vceCode}
          onChange={(value) => onUpdateField("vceCode", value)}
        />
        <SelectField
          id="purchase-order-terms-of-payment"
          label="Terms of Payment"
          readOnly={isReadonly}
          value={values.termsOfPayment}
          options={PurchaseOrderTermsOptions}
          onChange={(value) => onUpdateField("termsOfPayment", value)}
        />
        <SelectField
          id="purchase-order-purchase-type"
          label="Purchase Type"
          readOnly={isReadonly}
          value={values.purchaseType}
          options={PurchaseOrderTypeOptions}
          onChange={(value) => onUpdateField("purchaseType", value)}
        />
        <CurrencyExchangeRateField
          isReadonly={isReadonly}
          currency={values.currency}
          exchangeRate={values.exchangeRate}
          onCurrencyChange={(value) => onUpdateField("currency", value)}
          onExchangeRateChange={(value) => onUpdateField("exchangeRate", value)}
        />
        <BooleanSelectField
          id="purchase-order-partial-payment"
          label="Partial Payment"
          readOnly={isReadonly}
          value={values.partialPayment ? "True" : "False"}
          onChange={(value) => onUpdateField("partialPayment", value === "True")}
        />
        <TextField
          id="purchase-order-importation-no"
          label="Importation No."
          readOnly={isReadonly}
          value={values.importationNo}
          onChange={(value) => onUpdateField("importationNo", value)}
        />
      </div>
      <div className="grid min-w-0 content-start gap-4">
        <TextField
          id="purchase-order-trans-no"
          label="PO No."
          readOnly={isReadonly}
          value={values.transNo}
          onChange={(value) => onUpdateField("transNo", value)}
        />
        <DateField
          id="purchase-order-document-date"
          label="Document Date"
          readOnly={isReadonly}
          value={values.documentDate}
          onChange={(value) => onUpdateField("documentDate", value)}
        />
        <DateField
          id="purchase-order-delivery-date"
          label="Delivery Date"
          readOnly={isReadonly}
          value={values.deliveryDate}
          onChange={(value) => onUpdateField("deliveryDate", value)}
        />
        <SelectField
          id="purchase-order-status"
          label="Status"
          readOnly
          value={values.status}
          options={PurchaseOrderStatusOptions}
          onChange={(value) => onUpdateField("status", value as PurchaseOrderStatus)}
        />
      </div>
    </div>
  );
}

function CurrencyExchangeRateField({
  currency,
  exchangeRate,
  isReadonly,
  onCurrencyChange,
  onExchangeRateChange,
}: {
  currency: string;
  exchangeRate: number;
  isReadonly: boolean;
  onCurrencyChange: (value: string) => void;
  onExchangeRateChange: (value: number) => void;
}) {
  return (
    <FieldShell controlId="purchase-order-currency" label="Currency">
      <CurrencyExchangeRateRow
        currencyControl={
          <AppAdvancedDropdown
            id="purchase-order-currency"
            className="w-full min-w-0"
            value={currency ?? ""}
            readOnly={isReadonly}
            isClearable={false}
            options={PurchaseOrderCurrencyOptions.map((option) => ({
              name: option,
              value: option,
            }))}
            placeholder="PHP"
            onChange={(value) => onCurrencyChange(String(value))}
          />
        }
        exchangeRateControl={
          <MoneyNumberField
            id="purchase-order-exchange-rate"
            value={String(exchangeRate ?? "")}
            readOnly={isReadonly}
            onValueChange={(value) => onExchangeRateChange(Number(value) || 0)}
            className={`${PurchaseOrderFieldClassName} text-right tabular-nums`}
          />
        }
      />
    </FieldShell>
  );
}

function BooleanSelectField({
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
    <div className="grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center">
      <label htmlFor={id} className="text-sm font-semibold text-darknavy">
        {label}
      </label>
      <AppAdvancedDropdown
        id={id}
        value={value}
        readOnly={readOnly}
        options={PurchaseOrderBooleanOptions.map((option) => ({
          name: option,
          value: option,
        }))}
        placeholder="False"
        onChange={(nextValue) => onChange(String(nextValue))}
      />
    </div>
  );
}
