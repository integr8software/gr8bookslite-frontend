import {
  createDeliveryVehicleMockRecord as mock,
  createDeliveryVehicleModuleRecord,
} from "@/app/src/data/modules/delivery-vehicle-management/DeliveryVehicleModuleData";
import type { VehicleInspectionRecord } from "@/app/src/types/modules/delivery-vehicle-management/vehicle-inspections/VehicleInspectionsTypes";

export const VehicleInspectionsMockData: VehicleInspectionRecord[] = [
  mock("dvin-1", "INS-260725-031", "Pre-trip · FLEET-014", "Passed", { vehicle: "FLEET-014 · Isuzu N-Series", inspectionType: "Pre-trip", inspector: "Ramon Velasco", inspectionDate: "Jul 25, 2026 · 9:20 AM", checklist: "24 of 24 checks passed", findings: "No findings." }, { progress: 100 }),
  mock("dvin-2", "INS-260725-032", "Pre-trip · FLEET-021", "Passed with Observation", { vehicle: "FLEET-021 · Toyota HiAce", inspectionType: "Pre-trip", inspector: "Ramon Velasco", inspectionDate: "Jul 25, 2026 · 10:05 AM", checklist: "23 passed · 1 observation", findings: "Monitor rear-left tire pressure." }, { progress: 96 }),
  mock("dvin-3", "INS-260725-033", "Periodic · FLEET-044", "Failed", { vehicle: "FLEET-044 · Mitsubishi L300", inspectionType: "Periodic", inspector: "Nestor Abad", inspectionDate: "Jul 25, 2026 · 8:15 AM", checklist: "20 passed · 2 failed", findings: "Brake imbalance and expired registration." }, { progress: 91, alert: "Dispatch-blocking findings linked to WO-2607-0048." }),
];

export function createVehicleInspectionRecord(values: Record<string, string>, status: string) {
  return createDeliveryVehicleModuleRecord("vehicle-inspections", "INS", values, status);
}

