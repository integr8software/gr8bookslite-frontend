import {
  createDeliveryVehicleMockRecord as mock,
  createDeliveryVehicleModuleRecord,
} from "@/app/src/data/modules/delivery-vehicle-management/DeliveryVehicleModuleData";
import type { FuelAndIncidentRecord } from "@/app/src/types/modules/delivery-vehicle-management/fuel-and-incidents/FuelAndIncidentsTypes";

export const FuelAndIncidentsMockData: FuelAndIncidentRecord[] = [
  mock("dvfi-1", "FTX-260725-018", "Diesel full tank", "Recorded", { vehicle: "FLEET-014 · Isuzu N-Series", trip: "TRP-260725-012", dateTime: "Jul 25, 2026 · 9:05 AM", location: "Pasig Fleet Fuel Bay", odometer: "48,220 km", details: "42.6 L · ₱58.40/L · ₱2,487.84", reference: "RCPT-88201" }, { category: "Fuel" }),
  mock("dvfi-2", "FTX-260725-019", "Diesel partial fill", "Flagged", { vehicle: "FLEET-032 · Hino 500", trip: "TRP-260725-011", dateTime: "Jul 25, 2026 · 9:34 AM", location: "C5 Service Station", odometer: "91,704 km", details: "65.0 L · consumption 18% above baseline", reference: "OR-104952" }, { category: "Fuel", alert: "Consumption variance requires review." }),
  mock("dvfi-3", "INC-260725-006", "Cargo door damage", "Under Review", { vehicle: "FLEET-051 · Suzuki Carry", trip: "TRP-260724-009", dateTime: "Jul 24, 2026 · 6:22 PM", location: "Caloocan City", odometer: "22,082 km", details: "Rear cargo door dented during unloading; no cargo loss.", reference: "IR-260724-41" }, { category: "Incidents", alert: "Inspection follow-up scheduled." }),
];

export function createFuelAndIncidentRecord(
  values: Record<string, string>,
  status: string,
  category?: string,
) {
  return createDeliveryVehicleModuleRecord(
    "fuel-and-incidents",
    category === "Incidents" ? "INC" : "FTX",
    values,
    status,
    category,
  );
}

