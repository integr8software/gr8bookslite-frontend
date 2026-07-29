import { GoodsIssueStatusFilterOptions } from "@/app/src/constants/modules/inventory/goods-issue/GoodsIssueConstants";
import {
  GoodsIssuePartyOptions,
  GoodsIssueTransactionTypeOptions,
  GoodsIssueWarehouseOptions,
} from "@/app/src/data/modules/inventory/goods-issue/GoodsIssueData";
import type { GoodsIssueFormValues } from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
  AttachedDropdown,
  DateField,
  FieldClassName,
  FieldShell,
  TextField,
  type GoodsIssueFieldUpdater,
} from "@/app/src/ui/modules/inventory/goods-issue/action/GoodsIssueFieldControls";

type GoodsIssueWarehouseFieldsProps = {
  isReadonly: boolean;
  values: GoodsIssueFormValues;
  onUpdateField: GoodsIssueFieldUpdater<GoodsIssueFormValues>;
};

export function GoodsIssueWarehouseFields({
  isReadonly,
  onUpdateField,
  values,
}: GoodsIssueWarehouseFieldsProps) {
  function updateTransactionType(value: string) {
    onUpdateField("transactionType", value);

    if (value !== "Variance") {
      onUpdateField("icNo", "");
    }
  }
  const shouldShowIcNo = values.transactionType === "Variance";

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-2">
      <div className="grid min-w-0 gap-4">
        <TextField
          id="goods-issue-transaction-no"
          label="GI No."
          isRequired
          readOnly={isReadonly}
          value={values.transactionNo}
          onChange={(value) => onUpdateField("transactionNo", value)}
        />
        <TextField
          id="goods-issue-vce-code"
          label="Party Code"
          isRequired
          readOnly={isReadonly}
          value={values.vceCode}
          onChange={(value) => onUpdateField("vceCode", value)}
        />
        <FieldShell controlId="goods-issue-vce-name" label="Party Name" isRequired>
          <AttachedDropdown
            id="goods-issue-vce-name"
            value={values.vceName}
            readOnly={isReadonly}
            options={GoodsIssuePartyOptions}
            placeholder=""
            searchPlaceholder="Search Party Name"
            onAdd={() => undefined}
            onChange={(value) => onUpdateField("vceName", value)}
          />
        </FieldShell>
        <FieldShell controlId="goods-issue-transaction-type" label="Transaction Type" isRequired>
          <AttachedDropdown
            id="goods-issue-transaction-type"
            value={values.transactionType}
            readOnly={isReadonly}
            options={GoodsIssueTransactionTypeOptions}
            placeholder="--Select Transaction Type--"
            searchPlaceholder="Search transaction type"
            onAdd={() => undefined}
            onChange={updateTransactionType}
          />
        </FieldShell>
        <DateField
          id="goods-issue-document-date"
          label="Document Date"
          readOnly={isReadonly}
          value={values.documentDate}
          onChange={(value) => onUpdateField("documentDate", value)}
        />
        <FieldShell controlId="goods-issue-source-warehouse" label="Source Warehouse" isRequired>
          <AttachedDropdown
            id="goods-issue-source-warehouse"
            value={values.sourceWarehouse}
            readOnly={isReadonly}
            options={GoodsIssueWarehouseOptions}
            placeholder="--Select Warehouse--"
            searchPlaceholder="Search warehouse"
            onAdd={() => undefined}
            onChange={(value) => onUpdateField("sourceWarehouse", value)}
          />
        </FieldShell>
        <FieldShell controlId="goods-issue-remarks" label="Remarks">
          <AppLimitedTextarea
            id="goods-issue-remarks"
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
        {shouldShowIcNo ? (
          <TextField
            id="goods-issue-ic-no"
            label="IC No."
            readOnly={isReadonly}
            value={values.icNo}
            onChange={(value) => onUpdateField("icNo", value)}
          />
        ) : null}
        <TextField
          id="goods-issue-mr-no"
          label="MR No."
          readOnly={isReadonly}
          value={values.mrNo}
          onChange={(value) => onUpdateField("mrNo", value)}
        />
        <TextField
          id="goods-issue-rr-no"
          label="RR No."
          readOnly={isReadonly}
          value={values.rrNo}
          onChange={(value) => onUpdateField("rrNo", value)}
        />
        <TextField
          id="goods-issue-project-ref"
          label="Project Ref"
          readOnly={isReadonly}
          value={values.projectRef}
          onChange={(value) => onUpdateField("projectRef", value)}
        />
        <TextField
          id="goods-issue-project-name"
          label="Project Name"
          readOnly={isReadonly}
          value={values.projectName}
          onChange={(value) => onUpdateField("projectName", value)}
        />
        <FieldShell controlId="goods-issue-status" label="Status">
          <AppAdvancedDropdown
            id="goods-issue-status"
            value={values.status}
            readOnly={isReadonly}
            options={GoodsIssueStatusOptions}
            placeholder="Select status"
            searchPlaceholder="Search status"
            onChange={(value) => onUpdateField("status", String(value))}
          />
        </FieldShell>
      </div>
    </div>
  );
}

const GoodsIssueStatusOptions = GoodsIssueStatusFilterOptions.filter(
  (option) => option.value !== "all",
).map((option) => ({
  name: option.label,
  value: option.value,
}));
