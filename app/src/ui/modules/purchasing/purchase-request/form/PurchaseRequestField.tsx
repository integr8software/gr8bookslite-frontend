import {
  PurchaseRequestCurrencyOptions,
  PurchaseRequestStatusOptions,
  PurchaseRequestTypeOptions,
} from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import type {
  PurchaseRequestFieldUpdater,
  PurchaseRequestFormValues,
  PurchaseRequestStatus,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import {
  PurchaseRequestAttachedTextField,
  PurchaseRequestDateField,
  PurchaseRequestFieldClassName,
  PurchaseRequestFieldShell,
  PurchaseRequestSelectField,
  PurchaseRequestTextField,
} from "@/app/src/ui/modules/purchasing/purchase-request/form/PurchaseRequestFieldControls";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

type PurchaseRequestSupplierFieldsProps = {
  isReadonly: boolean;
  values: PurchaseRequestFormValues;
  onUpdateField: PurchaseRequestFieldUpdater<PurchaseRequestFormValues>;
};

export function PurchaseRequestSupplierFields({ isReadonly, onUpdateField, values }: PurchaseRequestSupplierFieldsProps) {
  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-3">
      <div className="grid min-w-0 gap-4">
        <PurchaseRequestAttachedTextField
          id="purchase-request-vce-name"
          label="Party Name"
          isRequired
          readOnly={isReadonly}
          value={values.vceName}
          onAdd={() => undefined}
          onChange={(value) => onUpdateField("vceName", value)}
        />
        <PurchaseRequestFieldShell controlId="purchase-request-vendor-address" label="Vendor Address">
          <textarea
            id="purchase-request-vendor-address"
            readOnly={isReadonly}
            value={values.vendorAddress ?? ""}
            onChange={(event) => onUpdateField("vendorAddress", event.target.value)}
            className={`${PurchaseRequestFieldClassName} min-h-20 py-3`}
          />
        </PurchaseRequestFieldShell>
        <PurchaseRequestFieldShell controlId="purchase-request-remarks" label="Remarks">
          <AppLimitedTextarea
            id="purchase-request-remarks"
            readOnly={isReadonly}
            value={values.remarks ?? ""}
            onChange={(event) => onUpdateField("remarks", event.target.value)}
            className={`${PurchaseRequestFieldClassName} min-h-20 py-3`}
            counterMode="remaining"
            maxLength={250}
          />
        </PurchaseRequestFieldShell>
      </div>

      <div className="grid min-w-0 content-start gap-4 xl:col-start-2">
        <PurchaseRequestTextField
          id="purchase-request-vce-code"
          label="Party Code"
          isRequired
          readOnly={isReadonly}
          value={values.vceCode}
          onChange={(value) => onUpdateField("vceCode", value)}
        />
        <PurchaseRequestSelectField
          id="purchase-request-purchase-type"
          label="Purchase Type"
          isRequired
          readOnly={isReadonly}
          value={values.purchaseType}
          options={PurchaseRequestTypeOptions}
          onChange={(value) => onUpdateField("purchaseType", value)}
        />
        <PurchaseRequestFieldShell controlId="purchase-request-currency" label="Currency">
          <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(6.5rem,0.65fr)] sm:items-center">
            <AppAdvancedDropdown
              id="purchase-request-currency"
              value={values.currency ?? ""}
              readOnly={isReadonly}
              options={PurchaseRequestCurrencyOptions.map((option) => ({
                name: option,
                value: option,
              }))}
              placeholder="PHP"
              onChange={(value) => onUpdateField("currency", String(value))}
            />
            <label htmlFor="purchase-request-exchange-rate" className="text-sm font-semibold text-darknavy">
              ER:
            </label>
            <MoneyNumberField
              id="purchase-request-exchange-rate"
              value={String(values.exchangeRate ?? "")}
              readOnly={isReadonly}
              onValueChange={(value) => onUpdateField("exchangeRate", Number(value) || 0)}
              className={`${PurchaseRequestFieldClassName} text-right tabular-nums`}
            />
          </div>
        </PurchaseRequestFieldShell>
        <PurchaseRequestTextField
          id="purchase-request-for-department"
          label="For Department"
          readOnly={isReadonly}
          value={values.forDepartment}
          onChange={(value) => onUpdateField("forDepartment", value)}
        />
      </div>

      <div className="grid min-w-0 content-start gap-4 xl:col-start-3">
        <PurchaseRequestTextField
          id="purchase-request-trans-no"
          label="PR No."
          isRequired
          readOnly={isReadonly}
          value={values.transNo}
          onChange={(value) => onUpdateField("transNo", value)}
        />
        <PurchaseRequestDateField
          id="purchase-request-pr-date"
          label="PR Date"
          readOnly={isReadonly}
          value={values.prDate}
          onChange={(value) => onUpdateField("prDate", value)}
        />
        <PurchaseRequestSelectField
          id="purchase-request-status"
          label="Status"
          readOnly
          value={values.status}
          options={PurchaseRequestStatusOptions}
          onChange={(value) => onUpdateField("status", value as PurchaseRequestStatus)}
        />
        <PurchaseRequestTextField
          id="purchase-request-bom-no"
          label="BOM No."
          readOnly={isReadonly}
          value={values.bomNo}
          onChange={(value) => onUpdateField("bomNo", value)}
        />
        <PurchaseRequestTextField
          id="purchase-request-project-code"
          label="Project Code"
          readOnly={isReadonly}
          value={values.projectCode}
          onChange={(value) => onUpdateField("projectCode", value)}
        />
        <PurchaseRequestTextField
          id="purchase-request-project-name"
          label="Project Name"
          readOnly={isReadonly}
          value={values.projectName}
          onChange={(value) => onUpdateField("projectName", value)}
        />
      </div>
    </div>
  );
}
