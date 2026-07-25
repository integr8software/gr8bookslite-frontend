import {
  createDeliveryVehicleMockRecord as mock,
  createDeliveryVehicleModuleRecord,
} from "@/app/src/data/modules/delivery-vehicle-management/DeliveryVehicleModuleData";
import type { VehicleAvailabilityRecord } from "@/app/src/types/modules/delivery-vehicle-management/vehicle-availability/VehicleAvailabilityTypes";

export const VehicleAvailabilityMockData: VehicleAvailabilityRecord[] = [
  mock("dva-1", "FLEET-014", "Isuzu N-Series", "Available", { vehicle: "FLEET-014 · Isuzu N-Series", vehicleType: "Light Truck", baseWarehouse: "Pasig Distribution Hub", availableFrom: "Now", reason: "No active restrictions" }),
  mock("dva-2", "FLEET-021", "Toyota HiAce", "Reserved", { vehicle: "FLEET-021 · Toyota HiAce", vehicleType: "Delivery Van", baseWarehouse: "Makati Fulfillment Center", availableFrom: "Jul 25, 4:30 PM", reason: "Reserved by ASN-260725-04" }),
  mock("dva-3", "FLEET-044", "Mitsubishi L300", "Under Maintenance", { vehicle: "FLEET-044 · Mitsubishi L300", vehicleType: "Delivery Van", baseWarehouse: "Cebu Central Warehouse", availableFrom: "Pending release", reason: "WO-2607-0048 · brake repair" }, { alert: "Blocking maintenance order is active." }),
];

export function createVehicleAvailabilityRecord(values: Record<string, string>, status: string) {
  return createDeliveryVehicleModuleRecord("vehicle-availability", "BLK", values, status);
}

