"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { InventoryCountLine } from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";
import type { ModuleDataEntryColumnOption } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import { ModuleDataEntryColumnSettingsButton } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryColumnSettings";

type InventoryCountColumnId =
  | "rowNumber"
  | "itemCode"
  | "barcode"
  | "itemName"
  | "systemQty"
  | "uom"
  | "countQty"
  | "variance"
  | "expiryDate"
  | "lotNo"
  | "serialNumber"
  | "responsibilityCenter"
  | "color"
  | "brand"
  | "size"
  | "model";

type InventoryCountColumn = {
  id: InventoryCountColumnId;
  header: string;
  widthClassName: string;
  isLockedVisible: boolean;
  cellClassName?: string;
  render: (row: InventoryCountLine, index: number) => ReactNode;
};

export function InventoryCountItemsTable({ rows }: { rows: InventoryCountLine[] }) {
  const [columnOrder, setColumnOrder] = useState<InventoryCountColumnId[]>(
    InventoryCountColumns.map((column) => column.id),
  );
  const [columnLabels, setColumnLabels] = useState<Record<InventoryCountColumnId, string>>(
    () =>
      Object.fromEntries(
        InventoryCountColumns.map((column) => [column.id, column.header]),
      ) as Record<InventoryCountColumnId, string>,
  );
  const [visibleOptionalColumnIds, setVisibleOptionalColumnIds] = useState<
    InventoryCountColumnId[]
  >([]);
  const totalVariance = rows.reduce(
    (total, row) => total + (Number.parseFloat(row.variance) || 0),
    0,
  );
  const visibleColumns = useMemo(
    () =>
      columnOrder
        .map((columnId) => InventoryCountColumns.find((column) => column.id === columnId))
        .filter((column): column is InventoryCountColumn => Boolean(column))
        .filter(
          (column) => column.isLockedVisible || visibleOptionalColumnIds.includes(column.id),
        ),
    [columnOrder, visibleOptionalColumnIds],
  );

  const columnOptions = useMemo<ModuleDataEntryColumnOption[]>(
    () =>
      columnOrder
        .map((columnId) => InventoryCountColumns.find((column) => column.id === columnId))
        .filter((column): column is InventoryCountColumn => Boolean(column))
        .map((column) => ({
          id: column.id,
          isHideable: !column.isLockedVisible,
          isVisible: column.isLockedVisible || visibleOptionalColumnIds.includes(column.id),
          label: columnLabels[column.id] ?? column.header,
        })),
    [columnLabels, columnOrder, visibleOptionalColumnIds],
  );

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    const column = InventoryCountColumns.find((item) => item.id === columnId);

    if (!column || column.isLockedVisible) {
      return;
    }

    setVisibleOptionalColumnIds((current) =>
      isVisible
        ? Array.from(new Set([...current, column.id]))
        : current.filter((item) => item !== column.id),
    );
  }

  function moveColumn(fromColumnId: string, toColumnId: string) {
    setColumnOrder((current) => {
      const fromIndex = current.indexOf(fromColumnId as InventoryCountColumnId);
      const toIndex = current.indexOf(toColumnId as InventoryCountColumnId);

      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
        return current;
      }

      const next = [...current];
      const [movedColumn] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedColumn);

      return next;
    });
  }

  function updateColumnHeader(columnId: string, header: string) {
    const column = InventoryCountColumns.find((item) => item.id === columnId);

    if (!column) {
      return;
    }

    setColumnLabels((current) => ({
      ...current,
      [column.id]: header,
    }));
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-sm font-semibold text-darknavy">Inventory Count Items</h2>
          <span className="rounded-full border border-darknavy/10 bg-offwhite px-2 py-0.5 text-xs font-medium text-darknavy/55">
            {rows.length} {rows.length === 1 ? "item" : "items"}
          </span>
        </div>
        <ModuleDataEntryColumnSettingsButton
          align="right"
          columns={columnOptions}
          onMoveColumn={moveColumn}
          onToggleColumnVisibility={toggleColumnVisibility}
          onUpdateColumnHeader={updateColumnHeader}
        />
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-max min-w-full table-fixed border-collapse text-left text-xs text-darknavy">
          <colgroup>
            {visibleColumns.map((column) => (
              <col key={column.id} className={column.widthClassName} />
            ))}
          </colgroup>
          <thead>
            <tr className="theme-accent-contrast-text bg-skyblue">
              {visibleColumns.map((column) => (
                <TableHeaderCell key={column.id} className={column.cellClassName}>
                  {columnLabels[column.id] ?? column.header}
                </TableHeaderCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className="border-b border-darknavy/10 last:border-b-0 even:bg-offwhite/55"
              >
                {visibleColumns.map((column) => (
                  <TableCell key={column.id} className={column.cellClassName}>
                    {column.render(row, rowIndex)}
                  </TableCell>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-darknavy/10 px-4 py-3">
        <span className="text-xs font-medium text-darknavy/55">
          {rows.length} {rows.length === 1 ? "item" : "items"}
        </span>
        <span className="text-sm font-semibold text-darknavy">
          Total Variance: {totalVariance.toFixed(2)}
        </span>
      </div>
    </section>
  );
}

const InventoryCountColumns: InventoryCountColumn[] = [
  lockedColumn("No", "rowNumber", "w-[4rem]", (_row, index) => index + 1),
  lockedColumn("Item Code *", "itemCode", "w-[8.25rem]", (row) => row.itemCode),
  optionalColumn("Barcode", "barcode", "w-[8.25rem]", (row) => row.barcode),
  lockedColumn("Item Name *", "itemName", "w-[15rem]", (row) => row.itemName),
  lockedColumn(
    "Stock Qty",
    "systemQty",
    "w-[7.5rem]",
    (row) => row.systemQty,
    "text-right tabular-nums",
  ),
  lockedColumn("UOM *", "uom", "w-[7rem]", (row) => row.uom),
  lockedColumn(
    "Inventory Count",
    "countQty",
    "w-[9rem]",
    (row) => row.countQty,
    "text-right tabular-nums",
  ),
  lockedColumn(
    "Variance",
    "variance",
    "w-[7.5rem]",
    (row) => row.variance,
    "text-right tabular-nums",
  ),
  optionalColumn("Expiration Date", "expiryDate", "w-[9rem]", (row) => row.expiryDate),
  optionalColumn("Lot No", "lotNo", "w-[7.5rem]", (row) => row.lotNo),
  optionalColumn("Serial No.", "serialNumber", "w-[8.25rem]", (row) => row.serialNumber),
  optionalColumn(
    "Res Center",
    "responsibilityCenter",
    "w-[8.25rem]",
    (row) => row.responsibilityCenter,
  ),
  optionalColumn("Color", "color", "w-[6.5rem]", (row) => row.color),
  optionalColumn("Brand", "brand", "w-[6.5rem]", (row) => row.brand),
  optionalColumn("Size", "size", "w-[6rem]", (row) => row.size),
  optionalColumn("Model", "model", "w-[7rem]", (row) => row.model),
];

function lockedColumn(
  header: string,
  id: InventoryCountColumnId,
  widthClassName: string,
  render: InventoryCountColumn["render"],
  cellClassName?: string,
): InventoryCountColumn {
  return {
    id,
    header,
    widthClassName,
    isLockedVisible: true,
    cellClassName,
    render,
  };
}

function optionalColumn(
  header: string,
  id: InventoryCountColumnId,
  widthClassName: string,
  render: InventoryCountColumn["render"],
  cellClassName?: string,
): InventoryCountColumn {
  return {
    id,
    header,
    widthClassName,
    isLockedVisible: false,
    cellClassName,
    render,
  };
}

export function TableHeaderCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`h-9 border-r border-white/20 px-2 py-1.5 text-xs font-semibold last:border-r-0 ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td className={`h-9 border-r border-darknavy/10 px-2 py-1.5 last:border-r-0 ${className}`}>
      {children}
    </td>
  );
}
