import {
  GoodsReceiptCurrencyOptions,
  GoodsReceiptPartyOptions,
  GoodsReceiptStatusOptions,
  GoodsReceiptTransactionTypeOptions,
  GoodsReceiptWarehouseOptions,
} from "@/app/src/data/modules/inventory/goods-receipt/GoodsReceiptData";
import type { GoodsReceiptFormValues } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  DateField,
  FieldClassName,
  FieldShell,
  TextField,
  type GoodsReceiptFieldUpdater,
} from "@/app/src/ui/modules/inventory/goods-receipt/action/GoodsReceiptFieldControls";

type GoodsReceiptWarehouseFieldsProps = {
  isReadonly: boolean;
  values: GoodsReceiptFormValues;
  onUpdateField: GoodsReceiptFieldUpdater<GoodsReceiptFormValues>;
};

export function GoodsReceiptWarehouseFields({
  isReadonly,
  onUpdateField,
  values,
}: GoodsReceiptWarehouseFieldsProps) {
  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-3">
      <div className="grid min-w-0 content-start gap-4">
        <FieldShell controlId="goods-receipt-vce-name" label="Party Name" isRequired>
          <AppAdvancedDropdown
            id="goods-receipt-vce-name"
            value={values.vceName}
            readOnly={isReadonly}
            options={GoodsReceiptPartyOptions}
            placeholder=""
            searchPlaceholder="Search Party Name"
            onChange={(value) => onUpdateField("vceName", String(value))}
          />
        </FieldShell>
        <TextField
          id="goods-receipt-project-ref"
          label="Proj. Ref No"
          readOnly={isReadonly}
          value={values.projectRef}
          onChange={(value) => onUpdateField("projectRef", value)}
        />
        <TextField
          id="goods-receipt-project-name"
          label="Project Name"
          readOnly={isReadonly}
          value={values.projectName}
          onChange={(value) => onUpdateField("projectName", value)}
        />
        <FieldShell controlId="goods-receipt-remarks" label="Remarks">
          <AppLimitedTextarea
            id="goods-receipt-remarks"
            value={values.remarks}
            readOnly={isReadonly}
            onChange={(event) => onUpdateField("remarks", event.target.value)}
            className={`${FieldClassName} min-h-24 py-3`}
            counterMode="remaining"
            maxLength={250}
          />
        </FieldShell>
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <TextField
          id="goods-receipt-vce-code"
          label="Party Code"
          isRequired
          readOnly={isReadonly}
          value={values.vceCode}
          onChange={(value) => onUpdateField("vceCode", value)}
        />
        <FieldShell controlId="goods-receipt-transaction-type" label="GR Type" isRequired>
          <AppAdvancedDropdown
            id="goods-receipt-transaction-type"
            value={values.transactionType}
            readOnly={isReadonly}
            options={GoodsReceiptTransactionTypeOptions}
            placeholder="--Select Transaction Type--"
            searchPlaceholder="Search transaction type"
            onChange={(value) => onUpdateField("transactionType", String(value))}
          />
        </FieldShell>
        <FieldShell controlId="goods-receipt-source-warehouse" label="Source Warehouse" isRequired>
          <AppAdvancedDropdown
            id="goods-receipt-source-warehouse"
            value={values.sourceWarehouse}
            readOnly={isReadonly}
            options={GoodsReceiptWarehouseOptions}
            placeholder="--Select Warehouse--"
            searchPlaceholder="Search warehouse"
            onChange={(value) => onUpdateField("sourceWarehouse", String(value))}
          />
        </FieldShell>
        <FieldShell
          controlId="goods-receipt-receiving-warehouse"
          label="Receiving Warehouse"
          isRequired
        >
          <AppAdvancedDropdown
            id="goods-receipt-receiving-warehouse"
            value={values.receivingWarehouse ?? ""}
            readOnly={isReadonly}
            options={GoodsReceiptWarehouseOptions}
            placeholder="--Select Warehouse--"
            searchPlaceholder="Search warehouse"
            onChange={(value) => onUpdateField("receivingWarehouse", String(value))}
          />
        </FieldShell>
        <FieldShell controlId="goods-receipt-currency" label="Currency">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8.5rem]">
            <AppAdvancedDropdown
              id="goods-receipt-currency"
              value={values.currency}
              readOnly={isReadonly}
              options={GoodsReceiptCurrencyOptions}
              placeholder="Select currency"
              searchPlaceholder="Search currency"
              onChange={(value) => onUpdateField("currency", String(value))}
            />
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
              <label
                htmlFor="goods-receipt-exchange-rate"
                className="text-sm font-semibold text-darknavy"
              >
                ER:
              </label>
              <MoneyNumberField
                id="goods-receipt-exchange-rate"
                value={values.exchangeRate}
                readOnly={isReadonly}
                onValueChange={(value) => onUpdateField("exchangeRate", value)}
                className={`${FieldClassName} text-right`}
              />
            </div>
          </div>
        </FieldShell>
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <TextField
          id="goods-receipt-transaction-no"
          label="GR No."
          isRequired
          readOnly={isReadonly}
          value={values.transactionNo}
          onChange={(value) => onUpdateField("transactionNo", value)}
        />
        <DateField
          id="goods-receipt-document-date"
          label="GR Date"
          readOnly={isReadonly}
          value={values.documentDate}
          onChange={(value) => onUpdateField("documentDate", value)}
        />
        <TextField
          id="goods-receipt-gi-no"
          label="GI No"
          readOnly={isReadonly}
          value={values.giNo}
          onChange={(value) => onUpdateField("giNo", value)}
        />
        <TextField
          id="goods-receipt-si-ref"
          label="SI Ref"
          readOnly={isReadonly}
          value={values.siRef}
          onChange={(value) => onUpdateField("siRef", value)}
        />
        <TextField
          id="goods-receipt-ic-no"
          label="IC No"
          readOnly={isReadonly}
          value={values.icNo}
          onChange={(value) => onUpdateField("icNo", value)}
        />
        <FieldShell controlId="goods-receipt-status" label="Status" isRequired>
          <AppAdvancedDropdown
            id="goods-receipt-status"
            value={values.status}
            readOnly
            options={GoodsReceiptStatusOptions}
            placeholder="Draft"
            searchPlaceholder="Search status"
            onChange={(value) => onUpdateField("status", String(value))}
          />
        </FieldShell>
      </div>
    </div>
  );
}
