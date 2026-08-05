import {
  createDeliveryVehicleMockRecord as mock,
} from "@/app/src/data/modules/delivery-vehicle-management/DeliveryVehicleModuleData";
import type { VehicleRepairMaintenanceRecord } from "@/app/src/types/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceTypes";

export const VehicleRepairMaintenanceMockData: VehicleRepairMaintenanceRecord[] = [
  mock(
    "dvmr-1",
    "WO-2607-0048",
    "Brake system repair",
    "In Progress",
    {
      workOrderNo: "WO-2607-0048",
      workOrderDate: "2026-07-23",
      vehicle: "FLEET-044 - Mitsubishi L300",
      maintenanceType: "Inspection Repair",
      priority: "Critical",
      serviceProvider: "Prime Fleet Services",
      description: "Replace front brake pads and inspect hydraulic system.",
      estimatedCost: "18500",
      schedule: "2026-07-25",
    },
    {
      alert: "Vehicle is out of service until release.",
      createdAt: "2026-07-23T09:20:00+08:00",
      progress: 45,
      updatedAt: "2026-07-25T08:45:00+08:00",
    },
  ),
  mock(
    "dvmr-2",
    "WO-2607-0049",
    "80,000 km preventive service",
    "Scheduled",
    {
      workOrderNo: "WO-2607-0049",
      workOrderDate: "2026-07-22",
      vehicle: "FLEET-032 - Hino 500",
      maintenanceType: "Preventive",
      priority: "Normal",
      serviceProvider: "Hino Pasig",
      description: "Engine oil, filters, belts, brake and suspension inspection.",
      estimatedCost: "31200",
      schedule: "2026-07-27",
    },
    { createdAt: "2026-07-22T13:10:00+08:00", progress: 0 },
  ),
  mock(
    "dvmr-3",
    "WO-2607-0047",
    "Cold unit belt replacement",
    "Waiting for Parts",
    {
      workOrderNo: "WO-2607-0047",
      workOrderDate: "2026-07-22",
      vehicle: "FLEET-021 - Toyota HiAce",
      maintenanceType: "Corrective",
      priority: "High",
      serviceProvider: "Thermo Fleet PH",
      description: "Replace refrigeration compressor belt.",
      estimatedCost: "12600",
      schedule: "2026-07-26",
    },
    {
      alert: "Part ETA July 27.",
      createdAt: "2026-07-22T11:55:00+08:00",
      progress: 25,
    },
  ),
  mock(
    "dvmr-4",
    "WO-2607-0050",
    "Annual registration renewal",
    "Draft",
    {
      workOrderNo: "WO-2607-0050",
      workOrderDate: "2026-07-24",
      vehicle: "FLEET-014 - Isuzu N-Series",
      maintenanceType: "Registration/Compliance",
      priority: "Normal",
      serviceProvider: "LTO Liaison Services",
      description: "Prepare registration renewal, smoke test, and compliance documents.",
      estimatedCost: "9800",
      schedule: "2026-08-01",
    },
    { createdAt: "2026-07-24T10:00:00+08:00", progress: 5 },
  ),
  mock(
    "dvmr-5",
    "WO-2607-0051",
    "Rear tire replacement",
    "Completed",
    {
      workOrderNo: "WO-2607-0051",
      workOrderDate: "2026-07-20",
      vehicle: "FLEET-063 - Hyundai H-100",
      maintenanceType: "Tire",
      priority: "Low",
      serviceProvider: "RoadReady Tire Center",
      description: "Replace two rear tires and complete balancing.",
      estimatedCost: "22400",
      schedule: "2026-07-24",
    },
    { createdAt: "2026-07-20T09:35:00+08:00", progress: 100 },
  ),
  mock(
    "dvmr-6",
    "WO-2607-0052",
    "Starter motor replacement",
    "Released",
    {
      workOrderNo: "WO-2607-0052",
      workOrderDate: "2026-07-21",
      vehicle: "FLEET-057 - Yamaha Mio Gear",
      maintenanceType: "Corrective",
      priority: "High",
      serviceProvider: "MotoCare Makati",
      description: "Replace starter motor and road-test dispatch readiness.",
      estimatedCost: "7400",
      schedule: "2026-07-23",
    },
    { createdAt: "2026-07-21T14:30:00+08:00", progress: 100 },
  ),
  mock(
    "dvmr-7",
    "WO-2607-0053",
    "Accident damage inspection",
    "Cancelled",
    {
      workOrderNo: "WO-2607-0053",
      workOrderDate: "2026-07-19",
      vehicle: "FLEET-082 - Suzuki Carry",
      maintenanceType: "Emergency",
      priority: "Critical",
      serviceProvider: "Cebu Fleet Bodyworks",
      description: "Cancelled after vehicle was moved to disposal review.",
      estimatedCost: "0",
      schedule: "2026-07-22",
    },
    {
      alert: "Work order cancelled due to inactive vehicle status.",
      createdAt: "2026-07-19T17:00:00+08:00",
      progress: 0,
    },
  ),
  mock(
    "dvmr-8",
    "WO-2607-0054",
    "Quarterly safety inspection",
    "Scheduled",
    {
      workOrderNo: "WO-2607-0054",
      workOrderDate: "2026-07-25",
      vehicle: "FLEET-071 - Foton Tornado",
      maintenanceType: "Preventive",
      priority: "Normal",
      serviceProvider: "Foton North Service",
      description: "Inspect cooling unit, brakes, lights, and cargo door seals.",
      estimatedCost: "15800",
      schedule: "2026-07-29",
    },
    { createdAt: "2026-07-25T08:00:00+08:00", progress: 0 },
  ),
  mock(
    "dvmr-9",
    "WO-2607-0055",
    "Battery replacement",
    "Scheduled",
    {
      workOrderNo: "WO-2607-0055",
      workOrderDate: "2026-07-25",
      vehicle: "FLEET-014 - Isuzu N-Series",
      maintenanceType: "Battery",
      priority: "Normal",
      serviceProvider: "PowerCell Fleet Battery",
      description: "Replace weak battery and clean terminal connectors.",
      estimatedCost: "6800",
      schedule: "2026-07-30",
    },
    { createdAt: "2026-07-25T10:45:00+08:00", progress: 0 },
  ),
  mock(
    "dvmr-10",
    "WO-2607-0056",
    "Engine overheating inspection",
    "In Progress",
    {
      workOrderNo: "WO-2607-0056",
      workOrderDate: "2026-07-26",
      vehicle: "FLEET-032 - Hino 500",
      maintenanceType: "Engine",
      priority: "Critical",
      serviceProvider: "Hino Pasig",
      description: "Diagnose overheating, inspect radiator, hoses, thermostat, and fan clutch.",
      estimatedCost: "28500",
      schedule: "2026-07-26",
    },
    {
      alert: "Vehicle blocked from dispatch pending engine temperature test.",
      createdAt: "2026-07-26T08:15:00+08:00",
      progress: 35,
    },
  ),
  mock(
    "dvmr-11",
    "WO-2607-0057",
    "Electrical lighting repair",
    "Draft",
    {
      workOrderNo: "WO-2607-0057",
      workOrderDate: "2026-07-26",
      vehicle: "FLEET-082 - Suzuki Carry",
      maintenanceType: "Electrical",
      priority: "High",
      serviceProvider: "Cebu Fleet Bodyworks",
      description: "Repair intermittent brake light and inspect rear harness.",
      estimatedCost: "5600",
      schedule: "2026-07-31",
    },
    { createdAt: "2026-07-26T11:20:00+08:00", progress: 5 },
  ),
  mock(
    "dvmr-12",
    "WO-2607-0058",
    "Air-conditioning service",
    "Completed",
    {
      workOrderNo: "WO-2607-0058",
      workOrderDate: "2026-07-24",
      vehicle: "FLEET-021 - Toyota HiAce",
      maintenanceType: "Air Conditioning",
      priority: "Low",
      serviceProvider: "Thermo Fleet PH",
      description: "Clean evaporator, check refrigerant level, and replace cabin filter.",
      estimatedCost: "9200",
      schedule: "2026-07-25",
    },
    { createdAt: "2026-07-24T15:30:00+08:00", progress: 100 },
  ),
  mock(
    "dvmr-13",
    "WO-2607-0059",
    "Suspension noise check",
    "Waiting for Parts",
    {
      workOrderNo: "WO-2607-0059",
      workOrderDate: "2026-07-27",
      vehicle: "FLEET-063 - Hyundai H-100",
      maintenanceType: "Suspension",
      priority: "High",
      serviceProvider: "RoadReady Tire Center",
      description: "Replace worn stabilizer links once parts arrive.",
      estimatedCost: "13400",
      schedule: "2026-07-28",
    },
    {
      alert: "Stabilizer links awaiting supplier delivery.",
      createdAt: "2026-07-27T09:05:00+08:00",
      progress: 20,
    },
  ),
  mock(
    "dvmr-14",
    "WO-2607-0060",
    "Oil change and road test",
    "Released",
    {
      workOrderNo: "WO-2607-0060",
      workOrderDate: "2026-07-23",
      vehicle: "FLEET-071 - Foton Tornado",
      maintenanceType: "Oil Change",
      priority: "Normal",
      serviceProvider: "Foton North Service",
      description: "Change engine oil, replace oil filter, and complete release road test.",
      estimatedCost: "11200",
      schedule: "2026-07-24",
    },
    { createdAt: "2026-07-23T13:10:00+08:00", progress: 100 },
  ),
];

export function createVehicleRepairMaintenanceRecord(
  values: Record<string, string>,
  status: string,
) {
  const workOrderNo = values.workOrderNo.trim() || createSuggestedWorkOrderNumber();
  const workOrderDate = values.workOrderDate || formatDateInput(new Date());
  const normalizedValues = {
    ...values,
    workOrderNo,
    workOrderDate,
  };

  return mock(
    `vehicle-repair-maintenance-${workOrderNo}`,
    workOrderNo,
    normalizedValues.description || workOrderNo,
    status,
    normalizedValues,
    {
      createdAt: createTransactionDateTime(workOrderDate),
    },
  );
}

function createSuggestedWorkOrderNumber() {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const sequence = String(Date.now()).slice(-4);

  return `WO-${year}${month}-${sequence}`;
}

function createTransactionDateTime(dateValue: string) {
  return `${dateValue}T09:00:00+08:00`;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
