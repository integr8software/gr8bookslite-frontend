import {
  DeliveryReceiptBranchOptions,
  DeliveryReceiptCurrencyOptions,
  DeliveryReceiptPartyOptions,
  DeliveryReceiptStatusOptions,
  DeliveryReceiptTermOptions,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import type { DeliveryReceiptFormValues } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
  DateField,
  FieldClassName,
  FieldShell,
  TextField,
  type DeliveryReceiptFieldUpdater,
} from "@/app/src/ui/modules/inventory/delivery-receipt/action/DeliveryReceiptFieldControls";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

type DeliveryReceiptCustomerFieldsProps = {
  isReadonly: boolean;
  values: DeliveryReceiptFormValues;
  onUpdateField: DeliveryReceiptFieldUpdater<DeliveryReceiptFormValues>;
};

export function DeliveryReceiptCustomerFields({
  isReadonly,
  onUpdateField,
  values,
}: DeliveryReceiptCustomerFieldsProps) {
  return (
    <div className="grid min-w-0 content-start gap-x-8 gap-y-3 xl:grid-cols-3">
      <div className="grid min-w-0 content-start gap-3">
        <FieldShell controlId="delivery-receipt-vce-name" label="Party Name" isRequired>
          <AppAdvancedDropdown
            id="delivery-receipt-vce-name"
            value={values.vceName}
            readOnly={isReadonly}
            options={DeliveryReceiptPartyOptions}
            placeholder=""
            searchPlaceholder="Search Party Name"
            onChange={(value) => onUpdateField("vceName", String(value))}
          />
        </FieldShell>
        <FieldShell controlId="delivery-receipt-bill-to-name" label="Bill To Name">
          <AppAdvancedDropdown
            id="delivery-receipt-bill-to-name"
            value={values.billToName}
            readOnly={isReadonly}
            options={DeliveryReceiptPartyOptions}
            placeholder=""
            searchPlaceholder="Search bill to"
            onChange={(value) => onUpdateField("billToName", String(value))}
          />
        </FieldShell>
        <TextField
          id="delivery-receipt-contact-person"
          label="Contact Person"
          readOnly={isReadonly}
          value={values.contactPerson}
          onChange={(value) => onUpdateField("contactPerson", value)}
        />
        <TextField
          id="delivery-receipt-contact-no"
          label="Contact No."
          readOnly={isReadonly}
          value={values.contactNo}
          onChange={(value) => onUpdateField("contactNo", value)}
        />
        <TextField
          id="delivery-receipt-project-ref"
          label="Proj. Ref No"
          readOnly={isReadonly}
          value={values.projectRef}
          onChange={(value) => onUpdateField("projectRef", value)}
        />
        <TextField
          id="delivery-receipt-project-name"
          label="Project Name"
          readOnly={isReadonly}
          value={values.projectName}
          onChange={(value) => onUpdateField("projectName", value)}
        />
        <FieldShell controlId="delivery-receipt-remarks" label="Remarks">
          <AppLimitedTextarea
            id="delivery-receipt-remarks"
            value={values.remarks}
            maxLength={250}
            readOnly={isReadonly}
            className={`${FieldClassName} min-h-24 py-3`}
            counterMode="remaining"
            onChange={(event) => onUpdateField("remarks", event.target.value)}
          />
        </FieldShell>
      </div>
      <div className="grid min-w-0 content-start gap-3">
        <TextField
          id="delivery-receipt-vce-code"
          label="Party Code"
          isRequired
          readOnly={isReadonly}
          value={values.vceCode}
          onChange={(value) => onUpdateField("vceCode", value)}
        />
        <TextField
          id="delivery-receipt-bill-to-code"
          label="Bill To Code"
          readOnly={isReadonly}
          value={values.billToCode}
          onChange={(value) => onUpdateField("billToCode", value)}
        />
        <FieldShell controlId="delivery-receipt-branch" label="Warehouse" isRequired>
          <AppAdvancedDropdown
            id="delivery-receipt-branch"
            value={values.branch}
            readOnly={isReadonly}
            options={DeliveryReceiptBranchOptions}
            placeholder="--Select Warehouse--"
            searchPlaceholder="Search warehouse"
            onChange={(value) => onUpdateField("branch", String(value))}
          />
        </FieldShell>
        <FieldShell controlId="delivery-receipt-terms" label="Terms of Payment" isRequired>
          <AppAdvancedDropdown
            id="delivery-receipt-terms"
            value={values.terms}
            readOnly={isReadonly}
            options={DeliveryReceiptTermOptions}
            placeholder="--Select Terms--"
            searchPlaceholder="Search terms"
            onChange={(value) => onUpdateField("terms", String(value))}
          />
        </FieldShell>
        <DateField
          id="delivery-receipt-due-date"
          label="Due Date"
          readOnly={isReadonly}
          value={values.dueDate}
          onChange={(value) => onUpdateField("dueDate", value)}
        />
        <FieldShell controlId="delivery-receipt-currency" label="Currency">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8.5rem]">
            <AppAdvancedDropdown
              id="delivery-receipt-currency-select"
              value={values.currency}
              readOnly={isReadonly}
              options={DeliveryReceiptCurrencyOptions}
              placeholder="PHP"
              onChange={(value) => onUpdateField("currency", String(value))}
            />
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
              <label
                htmlFor="delivery-receipt-exchange-rate"
                className="text-sm font-semibold text-darknavy"
              >
                FX Rate:
              </label>
              <MoneyNumberField
                id="delivery-receipt-exchange-rate"
                value={values.exchangeRate}
                readOnly={isReadonly}
                onValueChange={(value) => onUpdateField("exchangeRate", value)}
                className={`${FieldClassName} text-right`}
              />
            </div>
          </div>
        </FieldShell>
        <TextField
          id="delivery-receipt-res-center"
          label="Responsibility Center"
          isRequired
          readOnly={isReadonly}
          value={values.resCenter}
          onChange={(value) => onUpdateField("resCenter", value)}
        />
      </div>
      <div className="grid min-w-0 content-start gap-3">
        <TextField
          id="delivery-receipt-transaction-no"
          label="DR No."
          isRequired
          readOnly={isReadonly}
          value={values.transactionNo}
          onChange={(value) => onUpdateField("transactionNo", value)}
        />
        <DateField
          id="delivery-receipt-document-date"
          label="DR Date"
          isRequired
          readOnly={isReadonly}
          value={values.documentDate}
          onChange={(value) => onUpdateField("documentDate", value)}
        />
        <TextField
          id="delivery-receipt-pl-no"
          label="PL No"
          readOnly={isReadonly}
          value={values.plNo}
          onChange={(value) => onUpdateField("plNo", value)}
        />
        <TextField
          id="delivery-receipt-so-no"
          label="SO No."
          readOnly={isReadonly}
          value={values.soNo}
          onChange={(value) => onUpdateField("soNo", value)}
        />
        <FieldShell controlId="delivery-receipt-status" label="Status">
					<AppAdvancedDropdown
						id="delivery-receipt-status"
						value={values.status}
						readOnly
						options={DeliveryReceiptStatusOptions}
						placeholder="Draft"
						searchPlaceholder="Search status"
            onChange={(value) => onUpdateField("status", String(value))}
          />
        </FieldShell>
      </div>
    </div>
  );
}
