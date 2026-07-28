import {
  createDeliveryVehicleMockRecord as mock,
  createDeliveryVehicleModuleRecord,
} from "@/app/src/data/modules/delivery-vehicle-management/DeliveryVehicleModuleData";
import type { TripMonitoringEventRecord } from "@/app/src/types/modules/delivery-vehicle-management/trip-monitoring/TripMonitoringTypes";

export const TripMonitoringMockData: TripMonitoringEventRecord[] = [
  mock("dvtk-1", "EVT-72401", "Departed Pasig Hub", "Departed Origin", { trip: "TRP-260725-011", stop: "Origin", eventTime: "Jul 25, 2026 - 10:18 AM", location: "Pasig Distribution Hub", source: "Mobile", odometer: "91,705 km", notes: "Seal DV-882 verified." }),
  mock("dvtk-2", "EVT-72402", "Arrived at BGC Stop 1", "Arrived at Stop", { trip: "TRP-260725-011", stop: "Bonifacio High Street", eventTime: "Jul 25, 2026 - 10:54 AM", location: "Taguig City", source: "GPS", odometer: "91,719 km", notes: "Within requested window." }),
  mock("dvtk-3", "EVT-72404", "Traffic delay to Stop 2", "Delay Reported", { trip: "TRP-260725-011", stop: "Ayala Triangle", eventTime: "Jul 25, 2026 - 11:46 AM", location: "EDSA southbound", source: "Manual", odometer: "91,728 km", notes: "ETA moved by 25 minutes." }, { alert: "Latest update is 34 minutes old." }),
];

export function createTripMonitoringEventRecord(values: Record<string, string>, status: string) {
  return createDeliveryVehicleModuleRecord("trip-monitoring", "EVT", values, status);
}

