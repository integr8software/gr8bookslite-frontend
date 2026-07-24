export type MockWarehouse = {
  code: string;
  id: string;
  name: string;
};

/**
 * Mock scope options for non-backend Warehouse Management screens.
 * Warehouses and Warehouse Access keep their existing backend data sources.
 */
export const MockWarehousesData: readonly MockWarehouse[] = [
  { id: "wh-main", code: "MW", name: "Main Warehouse" },
  { id: "wh-north", code: "NDH", name: "North Distribution Hub" },
  { id: "wh-cold", code: "CSF", name: "Cold Storage Facility" },
];

export function getMockWarehouseById(warehouseId: string | null) {
  return MockWarehousesData.find((warehouse) => warehouse.id === warehouseId) ?? null;
}
