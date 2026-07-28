import type {
  WarehouseReceivingPutawayModule,
  WarehouseReceivingPutawayRecord,
} from "@/app/src/types/modules/warehouse-management/receiving-putaway/WarehouseReceivingPutawayTypes";
import { MockWarehousesData } from "@/app/src/data/modules/warehouse-management/receiving-putaway/MockWarehousesData";

const moduleRows: Record<WarehouseReceivingPutawayModule, Array<Record<string, string>>> = {
  "receiving-putaway": [
    {
      document: "GR-000184",
      source: "PO-000527",
      expectedDate: "Jul 24, 2026",
      items: "8",
      received: "6 / 8",
      putaway: "4 / 8",
      progress: "50%",
      status: "Putaway In Progress",
    },
    {
      document: "RR-000291",
      source: "PO-000525",
      expectedDate: "Jul 24, 2026",
      items: "5",
      received: "5 / 5",
      putaway: "0 / 5",
      progress: "50%",
      status: "Received",
    },
    {
      document: "WT-000087",
      source: "North Distribution Hub",
      expectedDate: "Jul 25, 2026",
      items: "12",
      received: "0 / 12",
      putaway: "0 / 12",
      progress: "0%",
      status: "Expected",
    },
  ],
};

export function createWarehouseReceivingPutawayRecords(
  module: WarehouseReceivingPutawayModule,
): WarehouseReceivingPutawayRecord[] {
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
