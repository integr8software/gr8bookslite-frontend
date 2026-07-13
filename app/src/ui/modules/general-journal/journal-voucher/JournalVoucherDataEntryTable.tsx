"use client";

import { useState } from "react";
import {
  JournalVoucherLineColumnIds,
  JournalVoucherLineColumnLabels,
  JournalVoucherLineColumnWidths,
  JournalVoucherProtectedLineColumnIds,
  JournalVoucherVatTypeOptions,
  type JournalVoucherLineColumnId,
} from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";
import { formatJournalVoucherAmount } from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherData";
import type { useJournalVoucherFormPage } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucherFormPage";
import type {
  JournalVoucherLine,
  JournalVoucherLineField,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import {
  MoneyNumberField,
  formatMoneyNumberInput,
  parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type JournalVoucherDataEntryTableProps = {
  page: ReturnType<typeof useJournalVoucherFormPage>;
};

export function JournalVoucherDataEntryTable({
  page,
}: JournalVoucherDataEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<JournalVoucherLineColumnId[]>([
    ...JournalVoucherLineColumnIds,
  ]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<
    JournalVoucherLineColumnId[]
  >([...JournalVoucherLineColumnIds]);
  const [columnLabels, setColumnLabels] = useState<
    Record<JournalVoucherLineColumnId, string>
  >({ ...JournalVoucherLineColumnLabels });
  const [columnWidths, setColumnWidths] = useState<
    Record<JournalVoucherLineColumnId, number>
  >({ ...JournalVoucherLineColumnWidths });
  const visibleColumnOrder = columnOrder.filter((columnId) =>
    visibleColumnIds.includes(columnId),
  );
  const columns: ModuleDataEntryColumn<JournalVoucherLine>[] =
    visibleColumnOrder.map((columnId) => ({
      header: columnLabels[columnId],
      id: columnId,
      isRemovable: !JournalVoucherProtectedLineColumnIds.has(columnId),
      renderCell: (line) => renderLineCell(page, line, columnId),
      width: columnWidths[columnId],
      widthClassName: "",
      widthMode: "fixed",
    }));
  const columnOptions: ModuleDataEntryColumnOption[] = columnOrder.map(
    (columnId) => ({
      id: columnId,
      isHideable: !JournalVoucherProtectedLineColumnIds.has(columnId),
      isVisible: visibleColumnIds.includes(columnId),
      label: columnLabels[columnId],
      width: columnWidths[columnId],
      widthMode: "fixed",
    }),
  );

  function updateColumnHeader(columnId: string, header: string) {
    if (!isJournalVoucherLineColumnId(columnId)) {
      return;
    }

    setColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateColumnWidth(columnId: string, width: number) {
    if (!isJournalVoucherLineColumnId(columnId)) {
      return;
    }

    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitColumnWidth(columnId: string) {
    if (!isJournalVoucherLineColumnId(columnId)) {
      return;
    }

    updateColumnWidth(
      columnId,
      calculateLineColumnFitWidth({
        columnId,
        columnLabels,
        lines: page.values.lines,
      }),
    );
  }

  function moveColumn(fromColumnId: string, toColumnId: string) {
    if (
      !isJournalVoucherLineColumnId(fromColumnId) ||
      !isJournalVoucherLineColumnId(toColumnId)
    ) {
      return;
    }

    setColumnOrder((currentOrder) => {
      const fromIndex = currentOrder.indexOf(fromColumnId);
      const toIndex = currentOrder.indexOf(toColumnId);

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return currentOrder;
      }

      const nextOrder = [...currentOrder];
      const [movedColumn] = nextOrder.splice(fromIndex, 1);

      nextOrder.splice(toIndex, 0, movedColumn);
      return nextOrder;
    });
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isJournalVoucherLineColumnId(columnId)) {
      return;
    }

    if (!isVisible && JournalVoucherProtectedLineColumnIds.has(columnId)) {
      return;
    }

    setVisibleColumnIds((currentVisibleIds) => {
      if (isVisible) {
        const nextVisibleIds = new Set([...currentVisibleIds, columnId]);

        return columnOrder.filter((currentColumnId) =>
          nextVisibleIds.has(currentColumnId),
        );
      }

      if (currentVisibleIds.length <= 1) {
        return currentVisibleIds;
      }

      return currentVisibleIds.filter(
        (currentColumnId) => currentColumnId !== columnId,
      );
    });
  }

  function clearCell(rowId: string, columnId: string) {
    if (!isJournalVoucherLineColumnId(columnId)) {
      return;
    }

    page.updateLine(
      rowId,
      columnId,
      columnId === "debit" || columnId === "credit" ? 0 : "",
    );
  }

  function createExportRows() {
    return [
      visibleColumnOrder.map((columnId) => columnLabels[columnId]),
      ...page.values.lines.map((line) =>
        visibleColumnOrder.map((columnId) => getLineExportCell(line, columnId)),
      ),
    ];
  }

  function handleExportCsv() {
    const csv = createExportRows()
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    downloadBlob(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
      "journal-voucher-entries.csv",
    );
  }

  function handleExportExcel() {
    const htmlRows = createExportRows()
      .map(
        (row) =>
          `<tr>${row
            .map((cell) => `<td>${escapeHtml(String(cell))}</td>`)
            .join("")}</tr>`,
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table>${htmlRows}</table></body></html>`;

    downloadBlob(
      new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }),
      "journal-voucher-entries.xls",
    );
  }

  return (
    <ModuleDataEntry
      columns={columns}
      columnOptions={columnOptions}
      description="Use the editable entry grid for manual accounting distributions."
      emptyRowLabel="entry"
      error={page.errors.lines ?? page.errors.balance}
      exportOptions={[
        {
          id: "csv",
          label: "CSV",
          onSelect: handleExportCsv,
        },
        {
          id: "excel",
          label: "Excel",
          onSelect: handleExportExcel,
        },
      ]}
      footerDetails={
        <span
          className={joinClasses(
            "text-sm font-semibold",
            page.totals.isBalanced ? "text-emerald-700" : "text-coralpink",
          )}
        >
          Variance: {formatJournalVoucherAmount(Math.abs(page.totals.variance))}
        </span>
      }
      getCellValue={(line, columnId) =>
        isJournalVoucherLineColumnId(columnId)
          ? getLineExportCell(line, columnId)
          : ""
      }
      isDraggable
      isReadonly={page.isReadonly}
      isRowNumberColumnFixed
      rows={page.values.lines}
      summaryCells={{
        credit: formatJournalVoucherAmount(page.totals.totalCredit),
        debit: formatJournalVoucherAmount(page.totals.totalDebit),
      }}
      summaryRowHeader="Totals"
      title="Data Entry"
      onAddRows={page.addLines}
      onAutoColumnWidth={fitColumnWidth}
      onClearCell={clearCell}
      onClearRows={page.clearLines}
      onDuplicateRow={page.duplicateLine}
      onFitColumnWidth={fitColumnWidth}
      onInsertRow={page.insertLine}
      onMoveColumn={moveColumn}
      onMoveRow={page.moveLine}
      onRemoveRow={page.removeLine}
      onToggleColumnVisibility={toggleColumnVisibility}
      onUpdateColumnHeader={updateColumnHeader}
      onUpdateColumnWidth={updateColumnWidth}
    />
  );
}

function renderLineCell(
  page: ReturnType<typeof useJournalVoucherFormPage>,
  line: JournalVoucherLine,
  columnId: JournalVoucherLineColumnId,
) {
  const lineErrors = page.errors.lineErrors?.[line.id] ?? {};
  const isReadonly = page.isReadonly;

  switch (columnId) {
    case "debit":
    case "credit":
      return (
        <LineAmountInput
          disabled={isReadonly}
          error={lineErrors[columnId]}
          value={line[columnId]}
          onChange={(value) => page.updateLine(line.id, columnId, value)}
        />
      );
    case "vatType":
      return (
        <LineSelect
          disabled={isReadonly}
          value={line.vatType}
          options={JournalVoucherVatTypeOptions}
          onChange={(value) => page.updateLine(line.id, "vatType", value)}
        />
      );
    default:
      return (
        <LineInput
          disabled={isReadonly}
          error={lineErrors[columnId as keyof typeof lineErrors]}
          value={String(line[columnId] ?? "")}
          onChange={(value) =>
            page.updateLine(line.id, columnId as JournalVoucherLineField, value)
          }
        />
      );
  }
}

function LineInput({
  disabled,
  error,
  onChange,
  value,
}: {
  disabled: boolean;
  error?: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      title={error}
      className={accountingCellControlClassName(
        error ? "ring-2 ring-inset ring-red-500/45" : "",
      )}
    />
  );
}

function LineSelect({
  disabled,
  onChange,
  options,
  value,
}: {
  disabled: boolean;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
}) {
  return (
    <select
      className={accountingCellControlClassName()}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function LineAmountInput({
  disabled,
  error,
  onChange,
  value,
}: {
  disabled: boolean;
  error?: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <MoneyNumberField
      value={value > 0 ? formatMoneyNumberInput(String(value)) : ""}
      onValueChange={(nextValue) => onChange(parseMoneyNumberInput(nextValue))}
      disabled={disabled}
      title={error}
      className={accountingCellControlClassName(
        joinClasses("text-right tabular-nums", error ? "ring-2 ring-inset ring-red-500/45" : ""),
      )}
    />
  );
}

function accountingCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}

function isJournalVoucherLineColumnId(
  columnId: string,
): columnId is JournalVoucherLineColumnId {
  return JournalVoucherLineColumnIds.includes(
    columnId as JournalVoucherLineColumnId,
  );
}

function getLineExportCell(
  line: JournalVoucherLine,
  columnId: JournalVoucherLineColumnId,
) {
  switch (columnId) {
    case "debit":
    case "credit":
      return line[columnId] > 0 ? String(line[columnId]) : "";
    default:
      return String(line[columnId] ?? "");
  }
}

function calculateLineColumnFitWidth({
  columnId,
  columnLabels,
  lines,
}: {
  columnId: JournalVoucherLineColumnId;
  columnLabels: Record<JournalVoucherLineColumnId, string>;
  lines: JournalVoucherLine[];
}) {
  const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
  const contentWidth = lines.reduce(
    (currentWidth, line) =>
      Math.max(
        currentWidth,
        estimateTextWidth(String(getLineExportCell(line, columnId)), 24),
      ),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

function estimateTextWidth(value: string, padding: number) {
  return clampColumnWidth(value.trim().length * 7.5 + padding);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
