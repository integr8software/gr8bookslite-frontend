import {
  CanvassFormCurrencyOptions,
  CanvassFormPurchaseTypeOptions,
  CanvassFormStatusOptions,
} from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import type {
  CanvassFormFieldUpdater,
  CanvassFormStatus,
  CanvassFormValues,
} from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import {
  DateField,
  FieldClassName,
  FieldShell,
  SelectField,
  TextField,
} from "@/app/src/ui/modules/purchasing/canvass-form/form/CanvassFormFieldControls";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

type CanvassFormRequestFieldsProps = {
  isReadonly: boolean;
  values: CanvassFormValues;
  onUpdateField: CanvassFormFieldUpdater<CanvassFormValues>;
};

export function CanvassFormRequestFields({ isReadonly, onUpdateField, values }: CanvassFormRequestFieldsProps) {
  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="grid min-w-0 content-start gap-4">
        <TextField
          id="canvass-form-requested-by"
          label="Requested By"
          isRequired
          readOnly={isReadonly}
          value={values.requestedBy}
          onChange={(value) => onUpdateField("requestedBy", value)}
        />
        <DateField
          id="canvass-form-date-needed"
          label="Date Needed"
          readOnly={isReadonly}
          value={values.requiredBefore}
          onChange={(value) => onUpdateField("requiredBefore", value)}
        />
        <TextField
          id="canvass-form-project-name"
          label="Project Name"
          readOnly={isReadonly}
          value={values.projectName}
          onChange={(value) => onUpdateField("projectName", value)}
        />
        <FieldShell controlId="canvass-form-remarks" label="Remarks">
          <AppLimitedTextarea
            id="canvass-form-remarks"
            readOnly={isReadonly}
            value={values.remarks ?? ""}
            onChange={(event) => onUpdateField("remarks", event.target.value)}
            className={`${FieldClassName} min-h-24 resize-none py-3`}
            counterMode="remaining"
            maxLength={250}
          />
        </FieldShell>
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <SelectField
          id="canvass-form-purchase-type"
          label="Purchase Type"
          readOnly={isReadonly}
          value={values.purchaseType}
          options={CanvassFormPurchaseTypeOptions}
          onChange={(value) => onUpdateField("purchaseType", value)}
        />
        <FieldShell controlId="canvass-form-currency" label="Currency">
          <CurrencyExchangeRateRow
            exchangeRateControlId="canvass-form-exchange-rate"
            currencyControl={
              <AppAdvancedDropdown
                id="canvass-form-currency"
                className="w-full min-w-0"
                value={values.currency ?? ""}
                readOnly={isReadonly}
                options={CanvassFormCurrencyOptions.map((option) => ({
                  name: option,
                  value: option,
                }))}
                placeholder="PHP"
                onChange={(value) => onUpdateField("currency", String(value))}
              />
            }
            exchangeRateControl={
              <MoneyNumberField
                id="canvass-form-exchange-rate"
                value={String(values.exchangeRate ?? "")}
                readOnly={isReadonly}
                onValueChange={(value) => onUpdateField("exchangeRate", Number(value) || 0)}
                className={`${FieldClassName} text-right tabular-nums`}
              />
            }
          />
        </FieldShell>
        <TextField
          id="canvass-form-project-code"
          label="Project Code"
          readOnly={isReadonly}
          value={values.projectCode}
          onChange={(value) => onUpdateField("projectCode", value)}
        />
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <TextField
          id="canvass-form-trans-no"
          label="Canvass No."
          isRequired
          readOnly={isReadonly}
          value={values.transNo}
          onChange={(value) => onUpdateField("transNo", value)}
        />
        <DateField
          id="canvass-form-document-date"
          label="Canvass Date"
          readOnly={isReadonly}
          value={values.documentDate}
          onChange={(value) => onUpdateField("documentDate", value)}
        />
        <FieldShell controlId="canvass-form-status" label="Status">
          <AppAdvancedDropdown
            id="canvass-form-status"
            value={values.status}
            readOnly
            options={CanvassFormStatusOptions.map((option) => ({
              name: option,
              value: option,
            }))}
            placeholder="Draft"
            onChange={(value) => onUpdateField("status", String(value) as CanvassFormStatus)}
          />
        </FieldShell>
        {values.prNo.trim() ? (
          <TextField
            id="canvass-form-pr-no"
            label="PR No."
            readOnly={isReadonly}
            value={values.prNo}
            onChange={(value) => onUpdateField("prNo", value)}
          />
        ) : null}
        {values.poNo.trim() ? (
          <TextField
            id="canvass-form-po-no"
            label="PO No."
            readOnly={isReadonly}
            value={values.poNo}
            onChange={(value) => onUpdateField("poNo", value)}
          />
        ) : null}
      </div>
    </div>
  );
}
