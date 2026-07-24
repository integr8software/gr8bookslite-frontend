import { z } from "zod";
import type { WarehouseStockMovementHistoryColumn } from "@/app/src/types/modules/warehouse-management/warehouse-inventory/stock-movement-history/WarehouseStockMovementHistoryTypes";

const WarehouseStockMovementHistoryDraftSchema = z.object({
  status: z.string().trim().min(1, "Status is required."),
  warehouseId: z.string().trim().min(1, "Warehouse is required."),
});

export function validateWarehouseStockMovementHistoryDraft({
  columns,
  status,
  values,
  warehouseId,
}: {
  columns: WarehouseStockMovementHistoryColumn[];
  status: string;
  values: Record<string, string>;
  warehouseId: string;
}) {
  const baseResult = WarehouseStockMovementHistoryDraftSchema.safeParse({
    status,
    warehouseId,
  });
  if (!baseResult.success) {
    return baseResult.error.issues[0]?.message ?? "Complete the required fields.";
  }

  const missingColumn = columns
    .slice(0, Math.min(columns.length, 2))
    .find((column) => !values[column.id]?.trim());

  return missingColumn ? `${missingColumn.label} is required.` : null;
}
