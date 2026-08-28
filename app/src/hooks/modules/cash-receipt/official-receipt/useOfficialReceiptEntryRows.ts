import { useCallback } from "react";
import {
  createBlankOfficialReceiptLineEntry,
  shouldClearOfficialReceiptEntry,
} from "@/app/src/data/modules/cash-receipt/official-receipt/OfficialReceiptData";
import type { OfficialReceiptLineEntry } from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function useOfficialReceiptEntryRows({
  onRowsChange,
  rows,
}: {
  onRowsChange: (rows: OfficialReceiptLineEntry[]) => void;
  rows: OfficialReceiptLineEntry[];
}) {
  const updateEntry = useCallback(
    (rowId: string, updates: Partial<OfficialReceiptLineEntry>) => {
      onRowsChange(
        rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row)),
      );
    },
    [onRowsChange, rows],
  );

  function addRows(count: number) {
    onRowsChange([
      ...rows,
      ...Array.from({ length: count }, () => createBlankOfficialReceiptLineEntry()),
    ]);
  }

  function clearRows(action: ModuleDataEntryClearAction) {
    if (action === "all") {
      onRowsChange([createBlankOfficialReceiptLineEntry()]);
      return;
    }

    const nextRows = rows.filter((row) => !shouldClearOfficialReceiptEntry(row, action));
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankOfficialReceiptLineEntry()]);
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
      id: createBlankOfficialReceiptLineEntry().id,
    });
    onRowsChange(nextRows);
  }

  function insertRow(rowId: string, position: "above" | "below") {
    const rowIndex = rows.findIndex((row) => row.id === rowId);

    if (rowIndex < 0) {
      return;
    }

    const nextRows = [...rows];
    nextRows.splice(
      position === "above" ? rowIndex : rowIndex + 1,
      0,
      createBlankOfficialReceiptLineEntry(),
    );
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
    onRowsChange(nextRows.length > 0 ? nextRows : [createBlankOfficialReceiptLineEntry()]);
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
