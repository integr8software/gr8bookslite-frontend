import type { WarehouseInventoryStockItem as WarehouseStockItem } from "@/app/src/types/modules/warehouse-management/warehouse-inventory-stock/WarehouseInventoryStockTypes";
import type { WarehouseStorageRecord, WarehouseStorageStatus } from "@/app/src/types/modules/warehouse-management/warehouse-storage/WarehouseStorageTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";

type LayoutKind = "ambient" | "bulk" | "branch" | "cold" | "hazmat";

type SlotPlan = {
  aisle: string;
  binCount: number;
  locationType: string;
  rackStart: number;
  racks: number;
  shelfCount: number;
  zone: string;
};

const LayoutPlans: Record<LayoutKind, SlotPlan[]> = {
  ambient: [
    { aisle: "01", binCount: 4, locationType: "Picking", rackStart: 1, racks: 2, shelfCount: 2, zone: "A" },
    { aisle: "02", binCount: 4, locationType: "Pallet", rackStart: 3, racks: 2, shelfCount: 2, zone: "A" },
    { aisle: "03", binCount: 4, locationType: "Case", rackStart: 5, racks: 2, shelfCount: 2, zone: "A" },
    { aisle: "02", binCount: 3, locationType: "Reserve", rackStart: 7, racks: 2, shelfCount: 2, zone: "B" },
    { aisle: "03", binCount: 2, locationType: "Quality Hold", rackStart: 1, racks: 1, shelfCount: 1, zone: "QA" },
  ],
  cold: [
    { aisle: "01", binCount: 3, locationType: "Cold Storage", rackStart: 1, racks: 2, shelfCount: 2, zone: "CHILL" },
    { aisle: "02", binCount: 3, locationType: "Cold Storage", rackStart: 3, racks: 2, shelfCount: 2, zone: "FREEZER" },
    { aisle: "03", binCount: 2, locationType: "Receiving", rackStart: 5, racks: 1, shelfCount: 1, zone: "RCV" },
  ],
  branch: [
    { aisle: "01", binCount: 4, locationType: "General Storage", rackStart: 1, racks: 1, shelfCount: 2, zone: "STOCK" },
    { aisle: "02", binCount: 4, locationType: "Display", rackStart: 2, racks: 1, shelfCount: 2, zone: "DISPLAY" },
    { aisle: "03", binCount: 2, locationType: "Blocked", rackStart: 3, racks: 1, shelfCount: 1, zone: "HOLD" },
  ],
  bulk: [
    { aisle: "01", binCount: 2, locationType: "Bulk Floor", rackStart: 1, racks: 3, shelfCount: 1, zone: "BULK" },
    { aisle: "02", binCount: 2, locationType: "Pallet", rackStart: 4, racks: 3, shelfCount: 1, zone: "BULK" },
    { aisle: "03", binCount: 2, locationType: "Dispatch", rackStart: 1, racks: 2, shelfCount: 1, zone: "STAGE" },
  ],
  hazmat: [
    { aisle: "01", binCount: 2, locationType: "Controlled", rackStart: 1, racks: 2, shelfCount: 2, zone: "HAZ" },
    { aisle: "02", binCount: 2, locationType: "Quarantine", rackStart: 3, racks: 1, shelfCount: 2, zone: "QA" },
    { aisle: "03", binCount: 2, locationType: "Receiving", rackStart: 4, racks: 1, shelfCount: 1, zone: "RCV" },
  ],
};

export function createWarehouseStorageLayoutMockWarehouses(warehouses: WarehouseRecord[]) {
  const sourceWarehouses = getThreeWarehouseSources(warehouses);

  return sourceWarehouses.map((warehouse, index) => {
    if (warehouse.locations.length > 0 || warehouse.items.length > 0) {
      return warehouse;
    }

    const layoutKind = getLayoutKind(index);
    const locations = createLayoutLocations(warehouse, layoutKind);
    const items = createLayoutItems(locations, layoutKind);

    return {
      ...warehouse,
      items,
      locations,
    };
  });
}

function createLayoutLocations(warehouse: WarehouseRecord, layoutKind: LayoutKind) {
  const locations: WarehouseStorageRecord[] = [];
  let sequence = 1;

  LayoutPlans[layoutKind].forEach((plan) => {
    Array.from({ length: plan.racks }).forEach((_, rackOffset) => {
      const rackNo = String(plan.rackStart + rackOffset).padStart(2, "0");

      Array.from({ length: plan.shelfCount }).forEach((__, shelfIndex) => {
        const shelfNo = String(shelfIndex + 1).padStart(2, "0");

        Array.from({ length: plan.binCount }).forEach(() => {
          const binNo = String(sequence).padStart(2, "0");
          const status = getStatusForSequence(sequence, plan.locationType);
          const locationCode = `${plan.zone}-${plan.aisle}-R${rackNo}-L${shelfNo}-B${binNo}`;

          locations.push({
            aisle: plan.aisle,
            binNo,
            capacity: layoutKind === "cold" ? "500" : layoutKind === "branch" ? "120" : "1000",
            capacityUom: layoutKind === "branch" ? "EA" : "kg",
            id: `${warehouse.id}-loc-${locationCode.toLowerCase()}`,
            locationCode,
            locationName: getLocationName(plan, sequence),
            locationType: plan.locationType,
            notes: getLocationNotes(plan.locationType),
            rackNo,
            room: layoutKind === "cold" ? getColdRoom(plan.zone) : undefined,
            shelfNo,
            status,
            temperatureZone: layoutKind === "cold" ? getTemperatureZone(plan.zone) : undefined,
            warehouseId: warehouse.id,
            warehouseName: warehouse.name,
            zone: plan.zone,
          });

          sequence += 1;
        });
      });
    });
  });

  return locations;
}

function createLayoutItems(locations: WarehouseStorageRecord[], layoutKind: LayoutKind) {
  return locations
    .filter((_, index) => index % 3 === 0 || index % 5 === 0)
    .slice(0, 32)
    .map((location, index) =>
      createItem(
        `${layoutKind}-item-${String(index + 1).padStart(3, "0")}`,
        `${layoutKind.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
        getItemName(layoutKind, index),
        location.locationType || "Inventory",
        layoutKind === "branch" ? "EA" : "case",
        12 + index * 4,
        index % 4,
        location.locationCode,
        90 + index * 7,
      ),
    );
}

function createItem(
  id: string,
  itemCode: string,
  itemName: string,
  category: string,
  uom: string,
  onHand: number,
  reserved: number,
  storageLocation: string,
  unitCost: number,
): WarehouseStockItem {
  return {
    allocated: 0,
    category,
    id,
    itemCode,
    itemId: id,
    itemName,
    lotNumber: `LOT-${itemCode}-${String(onHand).padStart(3, "0")}`,
    onHand,
    reserved,
    serialNumber: category === "Controlled" || category === "Quarantine" ? `SN-${itemCode}` : "",
    storageLocation,
    unitCost,
    uom,
  };
}

function getThreeWarehouseSources(warehouses: WarehouseRecord[]) {
  const fallbackWarehouses = [
    createWarehouse("demo-wh-main", "WH-MAIN", "Main Warehouse", "Head Office"),
    createWarehouse("demo-wh-cold", "WH-COLD", "Cold Storage", "Head Office"),
    createWarehouse("demo-wh-branch", "WH-BRANCH", "Branch Stockroom", "Branch"),
    createWarehouse("demo-wh-bulk", "WH-BULK", "Bulk Distribution", "Logistics"),
    createWarehouse("demo-wh-hazmat", "WH-HAZ", "Controlled Materials", "Compliance"),
  ];
  const sourceWarehouses = warehouses.slice(0, 5);
  const sourceKeys = new Set(
    sourceWarehouses.flatMap((warehouse) => [
      normalizeWarehouseIdentity(warehouse.code),
      normalizeWarehouseIdentity(warehouse.name),
    ]),
  );
  const distinctFallbacks = fallbackWarehouses.filter((warehouse) => {
    const codeKey = normalizeWarehouseIdentity(warehouse.code);
    const nameKey = normalizeWarehouseIdentity(warehouse.name);

    return !sourceKeys.has(codeKey) && !sourceKeys.has(nameKey);
  });

  return [...sourceWarehouses, ...distinctFallbacks].slice(0, 5);
}

function createWarehouse(id: string, code: string, name: string, branchName: string): WarehouseRecord {
  return {
    access: [],
    address: "",
    availability: "All Branches",
    availableBranches: [branchName],
    branchAvailabilityMode: "All Branches",
    branchName,
    branchUnitIds: [],
    code,
    contactNo: "",
    createdAt: null,
    createdBy: null,
    description: "Demo warehouse for warehouse storage layout setup.",
    id,
    items: [],
    locations: [],
    managerName: "",
    movements: [],
    name,
    status: "Active",
    transfers: [],
    updatedAt: null,
    updatedBy: null,
  };
}

function getLayoutKind(index: number): LayoutKind {
  const layoutKinds: LayoutKind[] = ["ambient", "cold", "branch", "bulk", "hazmat"];

  return layoutKinds[index % layoutKinds.length] ?? "ambient";
}

function getStatusForSequence(sequence: number, locationType: string): WarehouseStorageStatus {
  if (locationType === "Blocked" || locationType === "Quality Hold") {
    return "Blocked";
  }

  if (sequence % 13 === 0) {
    return "Inactive";
  }

  if (sequence % 7 === 0) {
    return "Reserved";
  }

  return "Active";
}

function getLocationName(plan: SlotPlan, sequence: number) {
  if (plan.locationType === "Picking" && sequence === 1) {
    return "Fast-moving goods bin";
  }

  if (plan.locationType === "Pallet" && sequence === 7) {
    return "Reserve pallet slot";
  }

  if (plan.locationType === "Case") {
    return "Case storage";
  }

  if (plan.locationType === "Quality Hold") {
    return "Quality hold";
  }

  return `${plan.locationType} bin ${String(sequence).padStart(2, "0")}`;
}

function getLocationNotes(locationType: string) {
  if (locationType === "Cold Storage") {
    return "Temperature-controlled stock location.";
  }

  if (locationType === "Quality Hold" || locationType === "Blocked") {
    return "Blocked from normal picking until released.";
  }

  return "Available for warehouse storage operations.";
}

function getColdRoom(zone: string) {
  return zone === "FREEZER" ? "Freezer Room" : zone === "CHILL" ? "Chiller Room" : "Receiving Dock";
}

function getTemperatureZone(zone: string) {
  return zone === "FREEZER" ? "-18C" : zone === "CHILL" ? "2C to 8C" : "Ambient";
}

function getItemName(layoutKind: LayoutKind, index: number) {
  const itemNames: Record<LayoutKind, string[]> = {
    ambient: ["Great Taste White Coffee 30g x 10", "Doña Maria Jasmine Rice 5kg", "Century Tuna Flakes in Oil 180g", "Del Monte Spaghetti Pasta 900g"],
    bulk: ["Magnolia All-Purpose Flour 25kg", "Cooking Oil Drum 200L", "Corrugated Carton Bundle", "Export Pallet Load"],
    branch: ["Selecta Ice Cream Promo Pack", "Surf Powder Detergent 1kg", "Counter Display Candy Tray", "Store Replenishment Bundle"],
    cold: ["Nestle Fresh Milk 1L", "Monterey Frozen Pork Kasim", "Zest-O Chilled Juice Case", "Magnolia Ice Cream 1.5L"],
    hazmat: ["Zonrox Bleach 1L", "Food-Grade Sanitizer 20L", "Spill Kit Safety Stock", "Quarantine Inspection Lot"],
  };
  const names = itemNames[layoutKind];

  return `${names[index % names.length]} ${String(index + 1).padStart(2, "0")}`;
}

function normalizeWarehouseIdentity(value: string | undefined) {
  return value?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "") ?? "";
}
