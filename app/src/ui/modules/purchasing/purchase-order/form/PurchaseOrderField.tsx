import {
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
  isCopyLocked?: boolean;
  values: PurchaseOrderFormValues;
  onUpdateField: PurchaseOrderFieldUpdater<PurchaseOrderFormValues>;
};

export function PurchaseOrderSupplierFields({ isReadonly, isCopyLocked = false, onUpdateField, values }: PurchaseOrderSupplierFieldsProps) {
  const sourceReadOnly = isReadonly || isCopyLocked;
  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="grid min-w-0 content-start gap-4">
        <TextField
          id="purchase-order-party-name"
          label="Party Name"
          isRequired
          readOnly={sourceReadOnly}
          value={values.vceName}
          onChange={(value) => onUpdateField("vceName", value)}
        />
        <TextField
          id="purchase-order-address"
          label="Address"
          readOnly={sourceReadOnly}
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
          id="purchase-order-project-name"
          label="Project Name"
          readOnly={sourceReadOnly}
          value={values.projectName}
          onChange={(value) => onUpdateField("projectName", value)}
        />
        <div className="grid min-w-0 gap-2">
          <label htmlFor="purchase-order-remarks" className="text-sm font-semibold text-darknavy">
            Remarks
          </label>
          <AppLimitedTextarea
            id="purchase-order-remarks"
            readOnly={sourceReadOnly}
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
          readOnly={sourceReadOnly}
          value={values.vceCode}
          onChange={(value) => onUpdateField("vceCode", value)}
        />
        <SelectField
          id="purchase-order-purchase-type"
          label="Purchase Type"
          isRequired
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
        <SelectField
          id="purchase-order-terms-of-payment"
          label="Terms of Payment"
          readOnly={isReadonly}
          value={values.termsOfPayment}
          options={PurchaseOrderTermsOptions}
          onChange={(value) => onUpdateField("termsOfPayment", value)}
        />
        <TextField
          id="purchase-order-project-code"
          label="Project Code"
          readOnly={sourceReadOnly}
          value={values.projectCode}
          onChange={(value) => onUpdateField("projectCode", value)}
        />
      </div>
      <div className="grid min-w-0 content-start gap-4">
        <TextField
          id="purchase-order-trans-no"
          label="PO No."
          isRequired
          readOnly={sourceReadOnly}
          value={values.transNo}
          onChange={(value) => onUpdateField("transNo", value)}
        />
        <DateField
          id="purchase-order-document-date"
          label="PO Date"
          isRequired
          readOnly={isReadonly}
          value={values.documentDate}
          onChange={(value) => onUpdateField("documentDate", value)}
        />
        <DateField
          id="purchase-order-delivery-date"
          label="Date Needed"
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
        exchangeRateControlId="purchase-order-exchange-rate"
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
