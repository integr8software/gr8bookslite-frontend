"use client";

import { Search } from "lucide-react";
import { VehicleTypesTablePaginationStorageKey } from "@/app/src/constants/modules/delivery-vehicle-management/vehicle-types/VehicleTypesConstants";
import { useVehicleTypesListPage } from "@/app/src/hooks/modules/delivery-vehicle-management/vehicle-types/useVehicleTypesListPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";

export function VehicleTypesListPage() {
  const page = useVehicleTypesListPage();

  return (
    <section className="grid gap-5">
      <ModuleHeader
        titleAs="h1"
        eyebrow={`${page.config.code} · Delivery Vehicle Management`}
        title={page.config.title}
        description={page.config.description}
      />
      <ModuleTable
        emptyTitle={`No ${page.config.title.toLowerCase()} found`}
        emptyDescription={`No ${page.config.noun} records are available yet.`}
        emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
        minWidthClassName="min-w-[82rem]"
        paginationStorageKey={VehicleTypesTablePaginationStorageKey}
        table={page.table}
        tableTitle={page.config.title}
        renderRow={(row) => (
          <tr key={row.id} className="module-table-row">
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={`px-4 py-3.5 align-middle text-sm text-darknavy ${getColumnMetaClassName(cell.column.columnDef.meta)}`}
              >
                {cell.column.id === "status" ? (
                  <ModuleStatusBadge status={row.original.status} />
                ) : cell.column.id === "actions" ? (
                  <span className="text-darknavy/35">—</span>
                ) : (
                  String(cell.getValue() || "—")
                )}
              </td>
            ))}
          </tr>
        )}
      />
    </section>
  );
}
