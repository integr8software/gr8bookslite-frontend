import type {
  WarehousePickingDispatchModule,
  WarehousePickingDispatchRecord,
} from "@/app/src/types/modules/warehouse-management/picking-dispatch/WarehousePickingDispatchTypes";
import { MockWarehousesData } from "@/app/src/data/modules/warehouse-management/picking-dispatch/MockWarehousesData";

const moduleRows: Record<WarehousePickingDispatchModule, Array<Record<string, string>>> = {
  "picking-dispatch": [
    {
      document: "PL-000392",
      source: "SO-001284",
      requestedDate: "Jul 24, 2026",
      items: "6",
      picked: "6 / 6",
      staging: "DSP-01",
      readiness: "Ready",
      status: "Staged",
    },
    {
      document: "PL-000393",
      source: "GI-000416",
      requestedDate: "Jul 24, 2026",
      items: "9",
      picked: "5 / 9",
      staging: "DSP-02",
      readiness: "In progress",
      status: "Picking",
    },
    {
      document: "PL-000394",
      source: "WT-000088",
      requestedDate: "Jul 25, 2026",
      items: "4",
      picked: "0 / 4",
      staging: "-",
      readiness: "Awaiting allocation",
      status: "Open",
    },
  ],
};

export function createWarehousePickingDispatchRecords(
  module: WarehousePickingDispatchModule,
): WarehousePickingDispatchRecord[] {
  return moduleRows[module].map((cells, index) => {
    const warehouse =
      MockWarehousesData[index % MockWarehousesData.length] ?? MockWarehousesData[0];

    return {
      cells,
      id: `${module}-${index + 1}`,
      status: cells.status ?? "Active",
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
    };
  });
}
