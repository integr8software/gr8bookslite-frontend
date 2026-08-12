import { useCallback, useMemo, useState } from "react";
import {
  calculateDeliveryReceiptTotalQuantity,
  createBlankDeliveryReceiptAccountingEntry,
  formatDeliveryReceiptQuantity,
  DeliveryReceiptPartyOptions,
  DeliveryReceiptResponsibilityCenterOptions,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import type {
  DeliveryReceiptAccountingEntry,
  DeliveryReceiptEntryTab,
  DeliveryReceiptLineEntry,
} from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
  type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { AccountingEntryTable } from "@/app/src/ui/shared/accounting-entry/AccountingEntryTable";
import { DeliveryReceiptEntryTabs } from "@/app/src/ui/modules/inventory/delivery-receipt/entries/DeliveryReceiptEntryTabs";
import { createDeliveryReceiptLineColumns } from "@/app/src/ui/modules/inventory/delivery-receipt/entries/DeliveryReceiptLineColumns";
import {
  clearDeliveryReceiptLines,
  createDeliveryReceiptLineEntries,
  duplicateDeliveryReceiptLine,
  insertDeliveryReceiptLine,
  moveDeliveryReceiptLine,
  removeDeliveryReceiptLine,
} from "@/app/src/ui/modules/inventory/delivery-receipt/entries/utils/DeliveryReceiptEntryRowUtils";

type DeliveryReceiptEntrySectionProps = {
  accountingRows: DeliveryReceiptAccountingEntry[];
  isReadonly: boolean;
  rows: DeliveryReceiptLineEntry[];
  onAccountingRowsChange: (rows: DeliveryReceiptAccountingEntry[]) => void;
  onRowsChange: (rows: DeliveryReceiptLineEntry[]) => void;
};

export function DeliveryReceiptEntrySection({
  accountingRows,
  isReadonly,
  onAccountingRowsChange,
  onRowsChange,
  rows,
}: DeliveryReceiptEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<DeliveryReceiptEntryTab>("delivery");
  const updateEntry = useCallback(
    (rowId: string, updates: Partial<DeliveryReceiptLineEntry>) => {
      onRowsChange(rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)));
    },
    [onRowsChange, rows],
  );
  const totalQuantity = useMemo(() => calculateDeliveryReceiptTotalQuantity(rows), [rows]);
  const columns = useMemo<ModuleDataEntryColumn<DeliveryReceiptLineEntry>[]>(
    () => createDeliveryReceiptLineColumns(isReadonly, updateEntry),
    [isReadonly, updateEntry],
  );
  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        isHideable: !["itemCode", "name", "quantity"].includes(column.id),
        isVisible: true,
        label: column.header,
        width: column.width,
        widthMode: column.widthMode,
      })),
    [columns],
  );

  if (activeTab === "accounting") {
    return (
      <AccountingEntryTable
        createBlankRow={createBlankDeliveryReceiptAccountingEntry}
        description="Record delivery receipt accounting distributions."
        fieldOptions={{
          partyName: DeliveryReceiptPartyOptions,
          vatType: DeliveryReceiptVatTypeOptions,
          atcCode: DeliveryReceiptTaxTypeOptions,
          responsibilityCenter: DeliveryReceiptResponsibilityCenterOptions,
        }}
        isReadonly={isReadonly}
        readOnlyFields={["partyCode"]}
        rows={accountingRows}
        title={<DeliveryReceiptEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />}
        onFieldChange={(_row, columnId, value) => {
          if (columnId !== "partyName") return undefined;

          return {
            partyCode: DeliveryReceiptPartyOptions.find((option) => option.value === value)?.value ?? "",
            partyName: value,
          };
        }}
        onRowsChange={onAccountingRowsChange}
      />
    );
  }

  function addRows(count: number) {
    onRowsChange([...rows, ...createDeliveryReceiptLineEntries(count)]);
  }

  return (
    <ModuleDataEntry
      columns={columns}
      columnOptions={columnOptions}
      description=""
      emptyRowLabel="delivery line"
      exportOptions={EntryExportOptions}
      footerDetails={
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-darknavy">
          <span>Total Qty: {formatDeliveryReceiptQuantity(totalQuantity)}</span>
        </div>
      }
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={{
        quantity: formatDeliveryReceiptQuantity(totalQuantity),
      }}
      title={<DeliveryReceiptEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />}
      onAddRows={addRows}
      onAutoColumnWidth={() => undefined}
      onClearRows={(action: ModuleDataEntryClearAction) => onRowsChange(clearDeliveryReceiptLines(rows, action))}
      onDuplicateRow={(rowId) => onRowsChange(duplicateDeliveryReceiptLine(rows, rowId))}
      onFitColumnWidth={() => undefined}
      onImport={() => undefined}
      onInsertRow={(rowId, position) => onRowsChange(insertDeliveryReceiptLine(rows, rowId, position))}
      onMoveRow={(fromRowId, toRowId) => onRowsChange(moveDeliveryReceiptLine(rows, fromRowId, toRowId))}
      onRemoveRow={(rowId) => onRowsChange(removeDeliveryReceiptLine(rows, rowId))}
      onToggleColumnVisibility={() => undefined}
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
    />
  );
}

const DeliveryReceiptVatTypeOptions = [
  { name: "VATable", value: "VATable" },
  { name: "Zero Rated", value: "Zero Rated" },
  { name: "Exempt", value: "Exempt" },
];

const DeliveryReceiptTaxTypeOptions = [
  { name: "None", value: "" },
  { name: "WI010", value: "WI010", label: "Professional fees" },
  { name: "WC158", value: "WC158", label: "Goods" },
];

const EntryExportOptions = [
  { id: "csv", label: "CSV", onSelect: () => undefined },
  { id: "excel", label: "Excel", onSelect: () => undefined },
  { id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];
