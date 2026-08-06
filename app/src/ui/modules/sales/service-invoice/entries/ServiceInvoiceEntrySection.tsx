import { useCallback, useMemo, useState } from "react";
import {
  calculateServiceInvoiceTotals,
  createBlankServiceInvoiceLineEntry,
  createServiceInvoiceAccountingEntries as createDefaultServiceInvoiceAccountingEntries,
  formatServiceInvoiceAmount,
  ServiceInvoicePartyOptions,
  ServiceInvoiceResponsibilityCenterOptions,
  ServiceInvoiceTaxTypeOptions,
  ServiceInvoiceVatTypeOptions,
} from "@/app/src/data/modules/sales/service-invoice/ServiceInvoiceData";
import type {
  ServiceInvoiceAccountingEntry,
  ServiceInvoiceEntryTab,
  ServiceInvoiceFormValues,
  ServiceInvoiceLineEntry,
} from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
  type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { AccountingEntryTable } from "@/app/src/ui/shared/accounting-entry/AccountingEntryTable";
import { createServiceInvoiceServiceDetailColumns } from "@/app/src/ui/modules/sales/service-invoice/entries/ServiceInvoiceServiceDetailColumns";
import {
  createBlankServiceInvoiceAccountingEntry,
  createServiceInvoiceLineEntries,
  duplicateEntryRow,
  insertEntryRow,
  moveEntryRow,
  recalculateServiceInvoiceEntry,
  removeEntryRow,
  shouldClearServiceInvoiceLineEntry,
} from "@/app/src/ui/modules/sales/service-invoice/entries/utils/ServiceInvoiceEntryRowUtils";
import { ServiceInvoiceEntryTabs } from "@/app/src/ui/modules/sales/service-invoice/entries/ServiceInvoiceEntryTabs";

type ServiceInvoiceEntrySectionProps = {
  isReadonly: boolean;
  values: ServiceInvoiceFormValues;
  onAccountingRowsChange: (rows: ServiceInvoiceAccountingEntry[]) => void;
  onRowsChange: (rows: ServiceInvoiceLineEntry[]) => void;
};

export function ServiceInvoiceEntrySection({ isReadonly, onAccountingRowsChange, onRowsChange, values }: ServiceInvoiceEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<ServiceInvoiceEntryTab>("service");
  const serviceRows = values.lineEntries;
  const accountingRows =
    values.accountingEntries?.length > 0 ? values.accountingEntries : createDefaultServiceInvoiceAccountingEntries(values);
  const updateServiceEntry = useCallback(
    (rowId: string, updates: Partial<ServiceInvoiceLineEntry>) => {
      onRowsChange(serviceRows.map((row) => (row.id === rowId ? recalculateServiceInvoiceEntry({ ...row, ...updates }) : row)));
    },
    [onRowsChange, serviceRows],
  );
  const serviceColumns = useMemo(
    () => createServiceInvoiceServiceDetailColumns(isReadonly, updateServiceEntry),
    [isReadonly, updateServiceEntry],
  );

  if (activeTab === "accounting") {
    return (
      <AccountingEntryTable
        createBlankRow={createBlankServiceInvoiceAccountingEntry}
        description="Record service invoice accounting distributions."
        fieldOptions={{
          partyName: ServiceInvoicePartyOptions,
          vatType: ServiceInvoiceVatTypeOptions,
          atcCode: ServiceInvoiceTaxTypeOptions,
          responsibilityCenter: ServiceInvoiceResponsibilityCenterOptions,
        }}
        isReadonly={isReadonly}
        readOnlyFields={["partyCode"]}
        rows={accountingRows}
        title={<ServiceInvoiceEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />}
        onFieldChange={(row, columnId, value) => {
          if (columnId !== "partyName") return undefined;

          const selectedParty = ServiceInvoicePartyOptions.find((option) => option.value === value);

          return {
            partyCode: selectedParty?.label ?? "",
            partyName: value,
          };
        }}
        onRowsChange={onAccountingRowsChange}
      />
    );
  }

  function addRows(count: number) {
    onRowsChange([...serviceRows, ...createServiceInvoiceLineEntries(count)]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createBlankServiceInvoiceLineEntry()]);
      return;
    }

    const nextRows = serviceRows.filter((row) => !shouldClearServiceInvoiceLineEntry(row, action));
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankServiceInvoiceLineEntry()]);
  }

  return (
    <ModuleDataEntry
      columns={serviceColumns}
      columnOptions={createColumnOptions(serviceColumns, ["description", "grossAmount"])}
      description=""
      emptyRowLabel="entry"
      exportOptions={EntryExportOptions}
      isDraggable
      isReadonly={isReadonly}
      rows={serviceRows}
      summaryCells={createServiceSummaryCells(serviceRows)}
      title={<ServiceInvoiceEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />}
      onAddRows={addRows}
      onAutoColumnWidth={() => undefined}
      onClearRows={clearRows}
      onDuplicateRow={(rowId) => onRowsChange(duplicateEntryRow(serviceRows, rowId, () => createBlankServiceInvoiceLineEntry().id))}
      onFitColumnWidth={() => undefined}
      onImport={() => undefined}
      onInsertRow={(rowId, position) => onRowsChange(insertEntryRow(serviceRows, rowId, position, createBlankServiceInvoiceLineEntry))}
      onMoveRow={(fromRowId, toRowId) => onRowsChange(moveEntryRow(serviceRows, fromRowId, toRowId))}
      onRemoveRow={(rowId) => onRowsChange(removeEntryRow(serviceRows, rowId, createBlankServiceInvoiceLineEntry))}
      onToggleColumnVisibility={() => undefined}
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
    />
  );
}

function createColumnOptions<TRow>(
  columns: ModuleDataEntryColumn<TRow>[],
  protectedColumnIds: string[] = [],
): ModuleDataEntryColumnOption[] {
  return columns.map((column) => ({
    id: column.id,
    isHideable: !protectedColumnIds.includes(column.id),
    isVisible: true,
    label: column.header,
    width: column.width,
    widthMode: column.widthMode,
  }));
}

function createServiceSummaryCells(rows: ServiceInvoiceLineEntry[]) {
  const totals = calculateServiceInvoiceTotals(rows);

  return {
    discountAmount: formatServiceInvoiceAmount(totals.discountAmount),
    grossAmount: formatServiceInvoiceAmount(totals.grossAmount),
    netAmount: formatServiceInvoiceAmount(totals.netAmount),
    vatAmount: formatServiceInvoiceAmount(totals.vatAmount),
    wvatAmount: formatServiceInvoiceAmount(totals.wvatAmount),
  };
}

const EntryExportOptions = [
  { id: "csv", label: "CSV", onSelect: () => undefined },
  { id: "excel", label: "Excel", onSelect: () => undefined },
  { id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];
