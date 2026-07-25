import {
  createDeliveryVehicleMockRecord as mock,
  createDeliveryVehicleModuleRecord,
} from "@/app/src/data/modules/delivery-vehicle-management/DeliveryVehicleModuleData";
import type { DeliveryVehicleRecord } from "@/app/src/types/modules/delivery-vehicle-management/delivery-vehicles/DeliveryVehiclesTypes";

export const DeliveryVehiclesMockData: DeliveryVehicleRecord[] = [
  mock("dve-1", "FLEET-014", "Isuzu N-Series", "Active", { plateNumber: "NCR 8214", vehicleType: "Light Truck", makeModel: "Isuzu N-Series 2024", baseWarehouse: "Pasig Distribution Hub", registrationExpiry: "2027-03-14", insuranceExpiry: "2027-01-30", odometer: "48,220 km", ownership: "Company owned" }, { progress: 71 }),
  mock("dve-2", "FLEET-021", "Toyota HiAce", "Active", { plateNumber: "NCR 5931", vehicleType: "Delivery Van", makeModel: "Toyota HiAce 2023", baseWarehouse: "Makati Fulfillment Center", registrationExpiry: "2026-08-09", insuranceExpiry: "2026-08-02", odometer: "65,410 km", ownership: "Leased" }, { progress: 64, alert: "Insurance expires in 8 days." }),
  mock("dve-3", "FLEET-044", "Mitsubishi L300", "Inactive", { plateNumber: "NCR 1187", vehicleType: "Delivery Van", makeModel: "Mitsubishi L300 2020", baseWarehouse: "Cebu Central Warehouse", registrationExpiry: "2026-05-19", insuranceExpiry: "2026-06-02", odometer: "132,608 km", ownership: "Company owned" }, { alert: "Registration and insurance expired." }),
];

export function createDeliveryVehicleRecord(values: Record<string, string>, status: string) {
  return createDeliveryVehicleModuleRecord("delivery-vehicles", "FLEET", values, status);
}

