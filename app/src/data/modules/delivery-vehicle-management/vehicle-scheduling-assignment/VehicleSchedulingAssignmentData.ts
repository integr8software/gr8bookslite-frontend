import {
  createDeliveryVehicleMockRecord as mock,
  createDeliveryVehicleModuleRecord,
} from "@/app/src/data/modules/delivery-vehicle-management/DeliveryVehicleModuleData";
import type { VehicleSchedulingAssignmentRecord } from "@/app/src/types/modules/delivery-vehicle-management/vehicle-scheduling-assignment/VehicleSchedulingAssignmentTypes";

export const VehicleSchedulingAssignmentMockData: VehicleSchedulingAssignmentRecord[] = [
  mock("dvas-1", "ASN-260725-01", "East Metro Team A", "Confirmed", { loadPlan: "LP-2026-0725-01 · East Metro", originWarehouse: "Pasig Distribution Hub", schedule: "Jul 25, 2026 · 1:00 PM", vehicle: "FLEET-014 · Isuzu N-Series", driver: "Marco Reyes", crew: "Nico Ramos, Ben Yu", notes: "Capacity and compliance checks passed." }),
  mock("dvas-2", "ASN-260725-02", "BGC Priority Team", "Released", { loadPlan: "LP-2026-0724-06 · BGC", originWarehouse: "Pasig Distribution Hub", schedule: "Jul 25, 2026 · 10:00 AM", vehicle: "FLEET-032 · Hino 500", driver: "Liza Santos", crew: "Mia Cruz", notes: "Released to dispatch." }),
  mock("dvas-3", "ASN-260725-03", "Cold Chain Crew", "Reserved", { loadPlan: "LP-2026-0725-02 · South Metro", originWarehouse: "Makati Fulfillment Center", schedule: "Jul 25, 2026 · 3:30 PM", vehicle: "FLEET-021 · Toyota HiAce", driver: "Joel Mendoza", crew: "Ana Lim", notes: "Awaiting final load readiness." }, { alert: "Vehicle insurance expires soon." }),
];

export function createVehicleSchedulingAssignmentRecord(values: Record<string, string>, status: string) {
  return createDeliveryVehicleModuleRecord("vehicle-scheduling-assignment", "ASN", values, status);
}

