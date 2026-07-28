import type {
  WarehousePickingDispatchModule,
  WarehousePickingDispatchRecord,
} from "@/app/src/types/modules/warehouse-management/picking-dispatch/WarehousePickingDispatchTypes";
import { MockWarehousesData } from "@/app/src/data/modules/warehouse-management/picking-dispatch/MockWarehousesData";

const moduleRows: Record<WarehousePickingDispatchModule, Array<Record<string, string>>> = {
  "picking-dispatch": [
    {
      document: "PICK-2026-1184",
      source: "SO-88521 - Puregold Price Club",
      customer: "Puregold Price Club",
      requestedDate: "Jul 28, 2026",
      shipBy: "Jul 28, 2026 16:00",
      carrier: "2GO Freight",
      priority: "High",
      items: "14 SKUs / 312 cases",
      picked: "312 / 312 cases",
      allocatedLocations: "A-01-R01-L01-B01, A-03-R05-L02-B18",
      staging: "DSP-STAGE-01",
      wave: "WAVE-AM-07",
      readiness: "Ready for dispatch",
      assignedPicker: "Paolo Santos",
      status: "Staged",
    },
    {
      document: "PICK-2026-1185",
      source: "SO-88537 - Mercury Drug",
      customer: "Mercury Drug",
      requestedDate: "Jul 28, 2026",
      shipBy: "Jul 29, 2026 10:00",
      carrier: "LBC Logistics",
      priority: "Normal",
      items: "9 SKUs / 96 cartons",
      picked: "54 / 96 cartons",
      allocatedLocations: "CHILL-01-R02-L01-B05, FREEZER-02-R04-L02-B16",
      staging: "DSP-STAGE-02",
      wave: "COLD-WAVE-03",
      readiness: "Picking in progress",
      assignedPicker: "Hazel Lim",
      status: "Picking",
    },
    {
      document: "PICK-2026-1186",
      source: "Warehouse Transfer WT-2026-0101",
      customer: "Cebu Branch Stockroom",
      requestedDate: "Jul 29, 2026",
      shipBy: "Jul 30, 2026 12:00",
      carrier: "Internal Fleet",
      priority: "Normal",
      items: "22 SKUs / 18 pallets",
      picked: "0 / 18 pallets",
      allocatedLocations: "BULK-01-R01-L01-B02, BULK-02-R05-L01-B08",
      staging: "Not assigned",
      wave: "Transfer Wave 04",
      readiness: "Awaiting allocation",
      assignedPicker: "Unassigned",
      status: "Open",
    },
    {
      document: "GI-2026-0442",
      source: "Internal Issue - Production Line 2",
      customer: "Manufacturing Line 2",
      requestedDate: "Jul 28, 2026",
      shipBy: "Jul 28, 2026 13:00",
      carrier: "Material runner",
      priority: "Urgent",
      items: "6 SKUs / 42 cases",
      picked: "42 / 42 cases",
      allocatedLocations: "HAZ-01-R01-L01-B01, STOCK-01-R01-L02-B04",
      staging: "LINE-FEED-02",
      wave: "Issue Wave 11",
      readiness: "Released",
      assignedPicker: "Ramon Cruz",
      status: "Released",
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
