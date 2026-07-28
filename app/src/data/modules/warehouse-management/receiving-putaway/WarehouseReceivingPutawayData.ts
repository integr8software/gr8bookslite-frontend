import type {
  WarehouseReceivingPutawayModule,
  WarehouseReceivingPutawayRecord,
} from "@/app/src/types/modules/warehouse-management/receiving-putaway/WarehouseReceivingPutawayTypes";
import { MockWarehousesData } from "@/app/src/data/modules/warehouse-management/receiving-putaway/MockWarehousesData";

const moduleRows: Record<WarehouseReceivingPutawayModule, Array<Record<string, string>>> = {
  "receiving-putaway": [
    {
      document: "GRN-2026-0718",
      source: "PO-10482 - Universal Robina Corp.",
      supplier: "Universal Robina Corp.",
      expectedDate: "Jul 28, 2026",
      dockDoor: "RCV-DOCK-01",
      receivingType: "Purchase Order",
      items: "12 SKUs / 420 cases",
      received: "420 / 420 cases",
      putaway: "336 / 420 cases",
      stagingLocation: "RCV-STAGE-A",
      targetLocations: "A-01-R01-L01-B01, A-02-R03-L02-B07",
      qcStatus: "Released",
      progress: "80%",
      handledBy: "Mika Reyes",
      status: "Putaway In Progress",
    },
    {
      document: "GRN-2026-0719",
      source: "PO-10491 - Nestle Philippines",
      supplier: "Nestle Philippines",
      expectedDate: "Jul 28, 2026",
      dockDoor: "RCV-DOCK-02",
      receivingType: "Purchase Order",
      items: "7 SKUs / 188 cartons",
      received: "188 / 188 cartons",
      putaway: "0 / 188 cartons",
      stagingLocation: "QC-HOLD-01",
      targetLocations: "QA-03-R01-L01-B19",
      qcStatus: "Sampling",
      progress: "45%",
      handledBy: "Jules Tan",
      status: "Received",
    },
    {
      document: "ITR-IN-2026-0044",
      source: "Warehouse Transfer WT-2026-0098",
      supplier: "North Distribution Hub",
      expectedDate: "Jul 29, 2026",
      dockDoor: "RCV-DOCK-03",
      receivingType: "Inter-warehouse Transfer",
      items: "18 SKUs / 26 pallets",
      received: "0 / 26 pallets",
      putaway: "0 / 26 pallets",
      stagingLocation: "Inbound yard slot Y-04",
      targetLocations: "BULK-01-R01-L01-B02, STAGE-03-R02-L01-B11",
      qcStatus: "Pending arrival",
      progress: "0%",
      handledBy: "Inbound Team A",
      status: "Expected",
    },
    {
      document: "RMA-2026-0037",
      source: "Customer Return SO-88421",
      supplier: "Robinsons Supermarket",
      expectedDate: "Jul 30, 2026",
      dockDoor: "RET-DOCK-01",
      receivingType: "Customer Return",
      items: "5 SKUs / 34 cases",
      received: "18 / 34 cases",
      putaway: "0 / 34 cases",
      stagingLocation: "RET-QA-02",
      targetLocations: "QA-02-R03-L01-B12",
      qcStatus: "Damage inspection",
      progress: "25%",
      handledBy: "Celine Dizon",
      status: "Receiving",
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
