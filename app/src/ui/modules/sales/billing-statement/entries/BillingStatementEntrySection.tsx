import { useCallback, useMemo, useState } from "react";
import {
  calculateBillingStatementTotals,
  createBillingStatementId,
  createBlankBillingStatementAccountingEntry,
  createBlankBillingStatementItem,
  formatBillingStatementCurrency,
  recalculateBillingStatementItem,
} from "@/app/src/data/modules/sales/billing-statement/BillingStatementData";
import type {
  BillingStatementAccountingEntry,
  BillingStatementItem,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";
import type { PurchasingEntryTab } from "@/app/src/types/modules/purchasing/PurchasingAccountingTypes";
import { AccountingEntryTable } from "@/app/src/ui/shared/accounting-entry/AccountingEntryTable";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
  type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { PurchasingEntryTabs } from "@/app/src/ui/modules/purchasing/shared/PurchasingEntryTabs";
import { createBillingStatementLineColumns } from "@/app/src/ui/modules/sales/billing-statement/entries/BillingStatementLineColumns";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type BillingStatementEntrySectionProps = {
  accountingRows: BillingStatementAccountingEntry[];
  customerPartyOptions: AppAdvancedDropdownOption[];
  error?: string;
  isReadonly: boolean;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  rows: BillingStatementItem[];
  onAccountingRowsChange: (rows: BillingStatementAccountingEntry[]) => void;
  onRowsChange: (rows: BillingStatementItem[]) => void;
};

export function BillingStatementEntrySection({
  accountingRows,
  customerPartyOptions,
  error,
  isReadonly,
  onAccountingRowsChange,
  onRowsChange,
  responsibilityCenterOptions,
  rows,
}: BillingStatementEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<PurchasingEntryTab>("details");

  const updateEntry = useCallback(
    (rowId: string, updates: Partial<BillingStatementItem>) => {
      onRowsChange(rows.map((row) => (row.id === rowId ? recalculateBillingStatementItem({ ...row, ...updates }) : row)));
    },
    [onRowsChange, rows],
  );

  const columns = useMemo(() => createBillingStatementLineColumns(isReadonly, updateEntry), [isReadonly, updateEntry]);

  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () => createColumnOptions(columns, ["description", "grossAmount"]),
    [columns],
  );

  if (activeTab === "accounting") {
    return (
      <AccountingEntryTable
        createBlankRow={createBlankBillingStatementAccountingEntry}
        description="Record billing statement accounting distributions."
        error={error}
        fieldOptions={{
          partyName: customerPartyOptions,
          vatType: [
            { name: "VAT (12%)", value: "VAT (12%)" },
            { name: "Zero-rated", value: "Zero-rated" },
            { name: "VAT Exempt", value: "VAT Exempt" },
          ],
          atcCode: [
            { name: "0.00", value: "0.00" },
            { name: "1.00", value: "1.00" },
            { name: "2.00", value: "2.00" },
            { name: "5.00", value: "5.00" },
          ],
          responsibilityCenter: responsibilityCenterOptions,
        }}
        isReadonly={isReadonly}
        readOnlyFields={["partyCode"]}
        rows={accountingRows}
        title={<PurchasingEntryTabs activeTab={activeTab} detailsLabel="Items" onTabChange={setActiveTab} />}
        onFieldChange={(row, columnId, value) => {
          if (columnId !== "partyName") return undefined;

          const selectedParty = customerPartyOptions.find((option) => option.value === value);

          return {
            partyCode: selectedParty?.label ?? "",
            partyName: value,
          };
        }}
        onRowsChange={onAccountingRowsChange}
      />
    );
  }

  return (
    <ModuleDataEntry
      columns={columns}
      columnOptions={columnOptions}
      description=""
      emptyRowLabel="billing line"
      error={error}
      exportOptions={EntryExportOptions}
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={createItemSummaryCells(rows)}
      title={<PurchasingEntryTabs activeTab={activeTab} detailsLabel="Items" onTabChange={setActiveTab} />}
      onAddRows={(count) => onRowsChange([...rows, ...Array.from({ length: count }, () => createBlankBillingStatementItem())])}
      onAutoColumnWidth={() => undefined}
      onClearRows={(action) => onRowsChange(clearRows(rows, action, createBlankBillingStatementItem))}
      onDuplicateRow={(rowId) => onRowsChange(duplicateRow(rows, rowId, () => createBillingStatementId("item")))}
      onFitColumnWidth={() => undefined}
      onImport={() => undefined}
      onInsertRow={(rowId, position) => onRowsChange(insertRow(rows, rowId, position, createBlankBillingStatementItem))}
      onMoveRow={(fromRowId, toRowId) => onRowsChange(moveRow(rows, fromRowId, toRowId))}
      onRemoveRow={(rowId) => onRowsChange(removeRow(rows, rowId, createBlankBillingStatementItem))}
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

const EntryExportOptions: ModuleDataEntryExportOption[] = [
  { id: "csv", label: "CSV", onSelect: () => undefined },
  { id: "excel", label: "Excel", onSelect: () => undefined },
  { id: "pdf", label: "PDF", onSelect: () => undefined },
];

function createItemSummaryCells(rows: BillingStatementItem[]) {
  const totals = calculateBillingStatementTotals(rows);

  return {
    amount: formatBillingStatementCurrency(rows.reduce((sum, r) => sum + Number(r.amount || 0), 0)),
    discountAmount: formatBillingStatementCurrency(totals.discountAmount),
    grossAmount: formatBillingStatementCurrency(totals.grossAmount),
    netAmount: formatBillingStatementCurrency(totals.netAmount),
    quantity: rows.reduce((sum, r) => sum + Number(r.quantity || 0), 0).toFixed(2),
    vatAmount: formatBillingStatementCurrency(totals.vatAmount),
  };
}

function clearRows<TRow extends { id: string }>(rows: TRow[], action: ModuleDataEntryClearAction, factory: () => TRow): TRow[] {
  if (action === "all") {
    return [factory()];
  }
  return rows.length > 0 ? rows : [factory()];
}

function duplicateRow<TRow extends { id: string }>(rows: TRow[], rowId: string, idFactory: () => string): TRow[] {
  const index = rows.findIndex((row) => row.id === rowId);
  if (index === -1) return rows;
  const target = rows[index];
  const duplicate = { ...target, id: idFactory() };
  const next = [...rows];
  next.splice(index + 1, 0, duplicate);
  return next;
}

function insertRow<TRow extends { id: string }>(rows: TRow[], rowId: string, position: "above" | "below", factory: () => TRow): TRow[] {
  const index = rows.findIndex((row) => row.id === rowId);
  if (index === -1) return [...rows, factory()];
  const insertIndex = position === "above" ? index : index + 1;
  const next = [...rows];
  next.splice(insertIndex, 0, factory());
  return next;
}

function moveRow<TRow extends { id: string }>(rows: TRow[], fromId: string, toId: string): TRow[] {
  const fromIndex = rows.findIndex((row) => row.id === fromId);
  const toIndex = rows.findIndex((row) => row.id === toId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return rows;
  const next = [...rows];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

function removeRow<TRow extends { id: string }>(rows: TRow[], rowId: string, factory: () => TRow): TRow[] {
  const next = rows.filter((row) => row.id !== rowId);
  return next.length > 0 ? next : [factory()];
}
