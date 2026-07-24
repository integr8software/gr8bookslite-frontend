import { GoodsReceiptStatusFilterOptions } from "@/app/src/constants/modules/inventory/goods-receipt/GoodsReceiptConstants";
import {
  GoodsReceiptPartyOptions,
  GoodsReceiptTransactionTypeOptions,
  GoodsReceiptWarehouseOptions,
} from "@/app/src/data/modules/inventory/goods-receipt/GoodsReceiptData";
import type { GoodsReceiptFormValues } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
  AttachedDropdown,
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
    <div className="grid min-w-0 gap-5 xl:grid-cols-2">
      <div className="grid min-w-0 gap-4">
        <TextField
          id="goods-receipt-transaction-no"
          label="GR No."
          isRequired
          readOnly={isReadonly}
          value={values.transactionNo}
          onChange={(value) => onUpdateField("transactionNo", value)}
        />
        <TextField
          id="goods-receipt-vce-code"
          label="Party Code"
          isRequired
          readOnly={isReadonly}
          value={values.vceCode}
          onChange={(value) => onUpdateField("vceCode", value)}
        />
        <FieldShell controlId="goods-receipt-vce-name" label="Party Name" isRequired>
          <AttachedDropdown
            id="goods-receipt-vce-name"
            value={values.vceName}
            readOnly={isReadonly}
            options={GoodsReceiptPartyOptions}
            placeholder=""
            searchPlaceholder="Search Party Name"
            onAdd={() => undefined}
            onChange={(value) => onUpdateField("vceName", value)}
          />
        </FieldShell>
        <FieldShell controlId="goods-receipt-transaction-type" label="Transaction Type" isRequired>
          <AttachedDropdown
            id="goods-receipt-transaction-type"
            value={values.transactionType}
            readOnly={isReadonly}
            options={GoodsReceiptTransactionTypeOptions}
            placeholder="--Select Transaction Type--"
            searchPlaceholder="Search transaction type"
            onAdd={() => undefined}
            onChange={(value) => onUpdateField("transactionType", value)}
          />
        </FieldShell>
        <DateField
          id="goods-receipt-document-date"
          label="Document Date"
          readOnly={isReadonly}
          value={values.documentDate}
          onChange={(value) => onUpdateField("documentDate", value)}
        />
        <FieldShell controlId="goods-receipt-source-warehouse" label="Source Warehouse" isRequired>
          <AttachedDropdown
            id="goods-receipt-source-warehouse"
            value={values.sourceWarehouse}
            readOnly={isReadonly}
            options={GoodsReceiptWarehouseOptions}
            placeholder="--Select Warehouse--"
            searchPlaceholder="Search warehouse"
            onAdd={() => undefined}
            onChange={(value) => onUpdateField("sourceWarehouse", value)}
          />
        </FieldShell>
        <FieldShell controlId="goods-receipt-receiving-warehouse" label="Receiving Warehouse">
          <AttachedDropdown
            id="goods-receipt-receiving-warehouse"
            value={values.receivingWarehouse ?? ""}
            readOnly={isReadonly}
            options={GoodsReceiptWarehouseOptions}
            placeholder="--Select Warehouse--"
            searchPlaceholder="Search warehouse"
            onAdd={() => undefined}
            onChange={(value) => onUpdateField("receivingWarehouse", value)}
          />
        </FieldShell>
      </div>
      <div className="grid min-w-0 content-start gap-4">
        <TextField
          id="goods-receipt-ic-no"
          label="IC No."
          readOnly={isReadonly}
          value={values.icNo}
          onChange={(value) => onUpdateField("icNo", value)}
        />
        <TextField
          id="goods-receipt-gi-no"
          label="GI No."
          readOnly={isReadonly}
          value={values.giNo}
          onChange={(value) => onUpdateField("giNo", value)}
        />
        <TextField
          id="goods-receipt-si-ref"
          label="SI Ref."
          readOnly={isReadonly}
          value={values.siRef}
          onChange={(value) => onUpdateField("siRef", value)}
        />
        <TextField
          id="goods-receipt-project-ref"
          label="Project Ref"
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
        <FieldShell controlId="goods-receipt-status" label="Status">
          <AppAdvancedDropdown
            id="goods-receipt-status"
            value={values.status}
            readOnly={isReadonly}
            options={GoodsReceiptStatusOptions}
            placeholder="Select status"
            searchPlaceholder="Search status"
            onChange={(value) => onUpdateField("status", String(value))}
          />
        </FieldShell>
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
    </div>
  );
}

const GoodsReceiptStatusOptions = GoodsReceiptStatusFilterOptions.filter(
  (option) => option.value !== "all",
).map((option) => ({
  name: option.label,
  value: option.value,
}));
