import {
  createDeliveryVehicleMockRecord as mock,
  createDeliveryVehicleModuleRecord,
} from "@/app/src/data/modules/delivery-vehicle-management/DeliveryVehicleModuleData";
import type { VehicleRepairMaintenanceRecord } from "@/app/src/types/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceTypes";

export const VehicleRepairMaintenanceMockData: VehicleRepairMaintenanceRecord[] = [
  mock(
    "dvmr-1",
    "WO-2607-0048",
    "Brake system repair",
    "In Progress",
    {
      vehicle: "FLEET-044 - Mitsubishi L300",
      maintenanceType: "Inspection Repair",
      priority: "Critical",
      schedule: "Jul 25, 2026 - 8:30 AM",
      serviceProvider: "Prime Fleet Services",
      description: "Replace front brake pads and inspect hydraulic system.",
      estimatedCost: "PHP 18,500",
    },
    { progress: 45, alert: "Vehicle is out of service until release." },
  ),
  mock(
    "dvmr-2",
    "WO-2607-0049",
    "80,000 km preventive service",
    "Scheduled",
    {
      vehicle: "FLEET-032 - Hino 500",
      maintenanceType: "Preventive",
      priority: "Normal",
      schedule: "Jul 27, 2026 - 7:30 AM",
      serviceProvider: "Hino Pasig",
      description: "Engine oil, filters, belts, brake and suspension inspection.",
      estimatedCost: "PHP 31,200",
    },
    { progress: 0 },
  ),
  mock(
    "dvmr-3",
    "WO-2607-0047",
    "Cold unit belt replacement",
    "Waiting for Parts",
    {
      vehicle: "FLEET-021 - Toyota HiAce",
      maintenanceType: "Corrective",
      priority: "High",
      schedule: "Jul 26, 2026 - 9:00 AM",
      serviceProvider: "Thermo Fleet PH",
      description: "Replace refrigeration compressor belt.",
      estimatedCost: "PHP 12,600",
    },
    { progress: 25, alert: "Part ETA July 27." },
  ),
];

export function createVehicleRepairMaintenanceRecord(
  values: Record<string, string>,
  status: string,
) {
  return createDeliveryVehicleModuleRecord("vehicle-repair-maintenance", "WO", values, status);
}
