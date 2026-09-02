import { useCallback } from "react";
import {
  createBlankAcknowledgementReceiptLineEntry,
  shouldClearAcknowledgementReceiptEntry,
} from "@/app/src/data/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptData";
import type { AcknowledgementReceiptLineEntry } from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function useAcknowledgementReceiptEntryRows({
  onRowsChange,
  rows,
}: {
  onRowsChange: (rows: AcknowledgementReceiptLineEntry[]) => void;
  rows: AcknowledgementReceiptLineEntry[];
}) {
  const updateEntry = useCallback(
    (rowId: string, updates: Partial<AcknowledgementReceiptLineEntry>) => {
      onRowsChange(rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)));
    },
    [onRowsChange, rows],
  );

  function addRows(count: number) {
    onRowsChange([...rows, ...Array.from({ length: count }, () => createBlankAcknowledgementReceiptLineEntry())]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createBlankAcknowledgementReceiptLineEntry()]);
      return;
    }

    const nextRows = rows.filter((row) => !shouldClearAcknowledgementReceiptEntry(row, action));
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankAcknowledgementReceiptLineEntry()]);
  }

  function duplicateRow(rowId: string) {
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    const row = rows[rowIndex];

    if (!row) {
      return;
    }

    const nextRows = [...rows];
    nextRows.splice(rowIndex + 1, 0, {
      ...row,
      id: createBlankAcknowledgementReceiptLineEntry().id,
    });
    onRowsChange(nextRows);
  }

  function insertRow(rowId: string, position: "above" | "below") {
    const rowIndex = rows.findIndex((row) => row.id === rowId);

    if (rowIndex < 0) {
      return;
    }

    const nextRows = [...rows];
    nextRows.splice(position === "above" ? rowIndex : rowIndex + 1, 0, createBlankAcknowledgementReceiptLineEntry());
    onRowsChange(nextRows);
  }

  function moveRow(fromRowId: string, toRowId: string) {
    const fromIndex = rows.findIndex((row) => row.id === fromRowId);
    const toIndex = rows.findIndex((row) => row.id === toRowId);

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return;
    }

    const nextRows = [...rows];
    const [movedRow] = nextRows.splice(fromIndex, 1);

    if (!movedRow) {
      return;
    }

    nextRows.splice(toIndex, 0, movedRow);
    onRowsChange(nextRows);
  }

  function removeRow(rowId: string) {
    const nextRows = rows.filter((row) => row.id !== rowId);
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankAcknowledgementReceiptLineEntry()]);
  }

  return {
    addRows,
    clearRows,
    duplicateRow,
    insertRow,
    moveRow,
    removeRow,
    updateEntry,
  };
}
