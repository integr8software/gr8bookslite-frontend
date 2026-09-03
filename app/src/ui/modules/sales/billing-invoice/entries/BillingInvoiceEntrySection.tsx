import { useCallback, useMemo, useState } from "react";
import {
  BillingInvoiceTaxTypeOptions,
  BillingInvoiceVatTypeOptions,
  calculateBillingInvoiceTotals,
  createBillingInvoiceAccountingEntries,
  createBlankBillingInvoiceAccountEntry,
  createBlankBillingInvoiceLineEntry,
  formatBillingInvoiceAmount,
} from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  BillingInvoiceAccountEntry,
  BillingInvoiceEntriesTab,
  BillingInvoiceLineEntry,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { AccountingEntryTable } from "@/app/src/ui/shared/accounting-entry/AccountingEntryTable";
import {
  ModuleDataEntry,
  type ModuleDataEntryClearAction,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
  type ModuleDataEntryExportOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { createBillingInvoiceServiceDetailColumns } from "@/app/src/ui/modules/sales/billing-invoice/entries/BillingInvoiceServiceDetailColumns";
import {
  duplicateEntryRow,
  insertEntryRow,
  moveEntryRow,
  recalculateServiceInvoiceEntry,
  removeEntryRow,
  shouldClearServiceInvoiceLineEntry,
} from "@/app/src/ui/modules/sales/service-invoice/entries/utils/ServiceInvoiceEntryRowUtils";
import type { ServiceInvoiceLineEntry } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type BillingInvoiceEntrySectionProps = {
  accountRows: BillingInvoiceAccountEntry[];
  customerPartyOptions: AppAdvancedDropdownOption[];
  isReadonly: boolean;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  rows: BillingInvoiceLineEntry[];
  onAccountRowsChange: (rows: BillingInvoiceAccountEntry[]) => void;
  onRowsChange: (rows: BillingInvoiceLineEntry[]) => void;
};

export function BillingInvoiceEntrySection({
  accountRows,
  customerPartyOptions,
  isReadonly,
  onAccountRowsChange,
  onRowsChange,
  responsibilityCenterOptions,
  rows,
}: BillingInvoiceEntrySectionProps) {
  const [activeTab, setActiveTab] = useState<BillingInvoiceEntriesTab>("items");
  const accountingRows = hasAccountingRows(accountRows)
    ? accountRows
    : createBillingInvoiceAccountingEntries({
        code: "",
        defaultAccount: accountRows[0]?.accountTitle ?? "",
        lineEntries: rows,
        name: "",
        transactionNo: "",
      });
  const updateLineEntry = useCallback(
    (rowId: string, updates: Partial<BillingInvoiceLineEntry>) => {
      onRowsChange(
        rows.map((row) =>
          row.id === rowId
            ? (recalculateServiceInvoiceEntry(
                { ...row, ...updates } as unknown as ServiceInvoiceLineEntry,
                updates as unknown as Partial<ServiceInvoiceLineEntry>,
              ) as unknown as BillingInvoiceLineEntry)
            : row,
        ),
      );
    },
    [onRowsChange, rows],
  );
  const itemColumns = useMemo(() => createBillingInvoiceServiceDetailColumns(isReadonly, updateLineEntry), [isReadonly, updateLineEntry]);

  if (activeTab === "accounts") {
    return (
      <AccountingEntryTable
        createBlankRow={createBlankBillingInvoiceAccountEntry}
        description="Record billing invoice accounting distributions."
        fieldOptions={{
          partyName: customerPartyOptions,
          vatType: BillingInvoiceVatTypeOptions,
          atcCode: BillingInvoiceTaxTypeOptions,
          responsibilityCenter: responsibilityCenterOptions,
        }}
        isReadonly={isReadonly}
        readOnlyFields={["partyCode"]}
        rows={accountingRows}
        title={<BillingInvoiceEntryTabsControl activeTab={activeTab} onTabChange={setActiveTab} />}
        onFieldChange={(row, columnId, value) => {
          if (columnId !== "partyName") return undefined;

          const selectedParty = customerPartyOptions.find((option) => option.value === value);

          return {
            partyCode: selectedParty?.label ?? "",
            partyName: value,
          };
        }}
        onRowsChange={onAccountRowsChange}
      />
    );
  }

  function addRows(count: number) {
    onRowsChange([...rows, ...Array.from({ length: count }, () => createBlankBillingInvoiceLineEntry())]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createBlankBillingInvoiceLineEntry()]);
      return;
    }

    const nextRows = rows.filter((row) => !shouldClearServiceInvoiceLineEntry(row as unknown as ServiceInvoiceLineEntry, action));
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankBillingInvoiceLineEntry()]);
  }

  return (
    <ModuleDataEntry
      columns={itemColumns}
      columnOptions={createColumnOptions(itemColumns, ["description", "grossAmount"])}
      description=""
      emptyRowLabel="item"
      exportOptions={EntryExportOptions}
      isDraggable
      isReadonly={isReadonly}
      rows={rows}
      summaryCells={createBillingSummaryCells(rows)}
      title={<BillingInvoiceEntryTabsControl activeTab={activeTab} onTabChange={setActiveTab} />}
      onAddRows={addRows}
      onAutoColumnWidth={() => undefined}
      onClearRows={clearRows}
      onDuplicateRow={(rowId) => onRowsChange(duplicateEntryRow(rows, rowId, () => createBlankBillingInvoiceLineEntry().id))}
      onFitColumnWidth={() => undefined}
      onImport={() => undefined}
      onInsertRow={(rowId, position) => onRowsChange(insertEntryRow(rows, rowId, position, createBlankBillingInvoiceLineEntry))}
      onMoveRow={(fromRowId, toRowId) => onRowsChange(moveEntryRow(rows, fromRowId, toRowId))}
      onRemoveRow={(rowId) => onRowsChange(removeEntryRow(rows, rowId, createBlankBillingInvoiceLineEntry))}
      onToggleColumnVisibility={() => undefined}
      onUpdateColumnHeader={() => undefined}
      onUpdateColumnWidth={() => undefined}
    />
  );
}

function BillingInvoiceEntryTabsControl({
  activeTab,
  onTabChange,
}: {
  activeTab: BillingInvoiceEntriesTab;
  onTabChange: (tab: BillingInvoiceEntriesTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Billing invoice row entry sections"
      className="inline-flex items-center gap-1 rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      {BillingInvoiceEntryTabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[
              "h-7 rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
              isActive
                ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
            ].join(" ")}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
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

function createBillingSummaryCells(rows: BillingInvoiceLineEntry[]) {
  const totals = calculateBillingInvoiceTotals(rows);

  return {
    discountAmount: formatBillingInvoiceAmount(totals.discountAmount),
    grossAmount: formatBillingInvoiceAmount(totals.grossAmount),
    netAmount: formatBillingInvoiceAmount(totals.netAmount),
    vatAmount: formatBillingInvoiceAmount(totals.vatAmount),
    wvatAmount: formatBillingInvoiceAmount(totals.wvatAmount),
  };
}

function hasAccountingRows(rows: BillingInvoiceAccountEntry[]) {
  return rows.some(
    (row) =>
      row.accountCode.trim() !== "" ||
      row.accountTitle.trim() !== "" ||
      parseMoneyNumberInput(row.debit) > 0 ||
      parseMoneyNumberInput(row.credit) > 0,
  );
}

const BillingInvoiceEntryTabs = [
  { id: "items", label: "Item Entry" },
  { id: "accounts", label: "Accounting Entries" },
] satisfies Array<{
  id: BillingInvoiceEntriesTab;
  label: string;
}>;

const EntryExportOptions = [
  { id: "csv", label: "CSV", onSelect: () => undefined },
  { id: "excel", label: "Excel", onSelect: () => undefined },
  { id: "pdf", label: "PDF", onSelect: () => undefined },
] satisfies ModuleDataEntryExportOption[];
