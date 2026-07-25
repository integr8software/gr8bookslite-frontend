import {
  createDeliveryVehicleMockRecord as mock,
  createDeliveryVehicleModuleRecord,
} from "@/app/src/data/modules/delivery-vehicle-management/DeliveryVehicleModuleData";
import type { LoadPlanRecord } from "@/app/src/types/modules/delivery-vehicle-management/load-planning/LoadPlanningTypes";

export const LoadPlanningMockData: LoadPlanRecord[] = [
  mock("dvlp-1", "LP-2026-0725-01", "East Metro Retail Run", "Ready for Assignment", { originWarehouse: "Pasig Distribution Hub", routeZone: "East Metro", schedule: "Jul 25, 2026 · 1:00 PM", requiredType: "Light Truck", demand: "4 delivery orders", weight: "2,680 kg", volume: "13.2 m³", readiness: "Ready", remarks: "All loads staged at Bay 4." }, { progress: 76 }),
  mock("dvlp-2", "LP-2026-0725-02", "South Metro Cold Chain", "Planned", { originWarehouse: "Makati Fulfillment Center", routeZone: "South Metro", schedule: "Jul 25, 2026 · 3:30 PM", requiredType: "Refrigerated Van", demand: "3 delivery orders", weight: "940 kg", volume: "7.8 m³", readiness: "Picking", remarks: "Temperature range 2–8°C." }, { progress: 86, alert: "One order is still being picked." }),
  mock("dvlp-3", "LP-2026-0726-01", "Cebu North Transfer", "Draft", { originWarehouse: "Cebu Central Warehouse", routeZone: "Cebu North", schedule: "Jul 26, 2026 · 7:00 AM", requiredType: "Light Truck", demand: "2 transfer orders", weight: "1,820 kg", volume: "10.5 m³", readiness: "Expected", remarks: "Awaiting pallet dimensions." }, { progress: 52 }),
];

export function createLoadPlanRecord(values: Record<string, string>, status: string) {
  return createDeliveryVehicleModuleRecord("load-planning", "LP", values, status);
}

