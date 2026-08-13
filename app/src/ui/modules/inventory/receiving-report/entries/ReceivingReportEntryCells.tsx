import type {
  ReceivingReportAccountingEntry,
  ReceivingReportAccountingColumnConfig,
  ReceivingReportAccountingEntryUpdater,
  ReceivingReportColumnConfig,
  ReceivingReportEntryUpdater,
  ReceivingReportLine,
} from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";
import {
  EntryAmountInput,
  EntryDropdown,
  EntryInput,
} from "@/app/src/ui/modules/inventory/receiving-report/entries/ReceivingReportEntryControls";

export function ReceivingReportEntryCell({
  column,
  isReadonly,
  onUpdateEntry,
  row,
}: {
  column: ReceivingReportColumnConfig;
  isReadonly: boolean;
  onUpdateEntry: ReceivingReportEntryUpdater;
  row: ReceivingReportLine;
}) {
  const value = row[column.id];

  if (column.kind === "dropdown") {
    return (
      <EntryDropdown
        options={column.options ?? []}
        readOnly={isReadonly}
        value={value}
        onChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
      />
    );
  }

  if (column.kind === "amount") {
    return (
      <EntryAmountInput
        value={value}
        readOnly={isReadonly}
        onValueChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
      />
    );
  }

  return (
    <EntryInput
      type={column.kind === "date" ? "date" : "text"}
      value={value}
      readOnly={isReadonly}
      onChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
    />
  );
}

export function ReceivingReportAccountingEntryCell({
  column,
  isReadonly,
  onUpdateEntry,
  row,
}: {
  column: ReceivingReportAccountingColumnConfig;
  isReadonly: boolean;
  onUpdateEntry: ReceivingReportAccountingEntryUpdater;
  row: ReceivingReportAccountingEntry;
}) {
  const value = row[column.id];

  if (column.kind === "amount") {
    return (
      <EntryAmountInput
        value={value}
        readOnly={isReadonly}
        onValueChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
      />
    );
  }

  return (
    <EntryInput
      type="text"
      value={value}
      readOnly={isReadonly}
      onChange={(nextValue) => onUpdateEntry(row.id, column.id, nextValue)}
    />
  );
}
