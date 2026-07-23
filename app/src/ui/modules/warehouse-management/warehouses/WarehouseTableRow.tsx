import type { WarehouseTableRowProps } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import { WarehouseRecordActions } from "@/app/src/ui/modules/warehouse-management/warehouses/WarehouseRecordActions";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { formatDateTime } from "@/app/src/utils/date.util";

export function WarehouseTableRow({ warehouse, visibleColumnIds, onDeleteWarehouse, onEditWarehouse, onViewWarehouse }: WarehouseTableRowProps) {
  return (
    <tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
      {visibleColumnIds.includes("code") ? <td className="px-4 py-4 font-medium text-darknavy">{warehouse.code}</td> : null}
      {visibleColumnIds.includes("name") ? (
        <td className="px-4 py-4">
          <div className="font-medium">{warehouse.name}</div>
        </td>
      ) : null}
      {visibleColumnIds.includes("description") ? <td className="px-4 py-4">{warehouse.description}</td> : null}
      {visibleColumnIds.includes("address") ? <td className="px-4 py-4">{warehouse.address}</td> : null}
      {visibleColumnIds.includes("availableBranchLabel") ? <td className="px-4 py-4">{warehouse.availableBranchLabel}</td> : null}
      {visibleColumnIds.includes("managerName") ? <td className="px-4 py-4">{warehouse.managerName}</td> : null}
      {visibleColumnIds.includes("createdBy") ? <td className="px-4 py-4">{warehouse.createdBy ?? ""}</td> : null}
      {visibleColumnIds.includes("createdAt") ? (
        <td className="px-4 py-4">{formatDateTime(warehouse.createdAt ?? undefined, { emptyValue: "", locale: "en-US" })}</td>
      ) : null}
      {visibleColumnIds.includes("updatedBy") ? <td className="px-4 py-4">{warehouse.updatedBy ?? ""}</td> : null}
      {visibleColumnIds.includes("updatedAt") ? (
        <td className="px-4 py-4">{formatDateTime(warehouse.updatedAt ?? undefined, { emptyValue: "", locale: "en-US" })}</td>
      ) : null}
      {visibleColumnIds.includes("status") ? (
        <td className="px-4 py-4 text-center">
          <ModuleStatusBadge status={warehouse.status} />
        </td>
      ) : null}
      {visibleColumnIds.includes("actions") ? (
        <td className="px-4 py-4 text-center">
          <WarehouseRecordActions
            warehouse={warehouse}
            onDeleteWarehouse={onDeleteWarehouse}
            onEditWarehouse={onEditWarehouse}
            onViewWarehouse={onViewWarehouse}
          />
        </td>
      ) : null}
    </tr>
  );
}
