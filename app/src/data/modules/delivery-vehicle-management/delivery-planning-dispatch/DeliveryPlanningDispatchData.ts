import {
	createDeliveryVehicleMockRecord as mock,
	createDeliveryVehicleModuleRecord,
} from "@/app/src/data/modules/delivery-vehicle-management/DeliveryVehicleModuleData";
import type { DeliveryTripRecord } from "@/app/src/types/modules/delivery-vehicle-management/delivery-planning-dispatch/DeliveryPlanningDispatchTypes";

export const DeliveryPlanningDispatchMockData: DeliveryTripRecord[] = [
	mock("dvd-1", "TRP-260725-011", "BGC Priority Route", "In Transit", { originWarehouse: "Pasig Distribution Hub", loadPlan: "LP-2026-0724-06", vehicle: "FLEET-032 - Hino 500", driver: "Liza Santos", route: "Pasig to BGC to Makati", plannedDeparture: "Jul 25, 2026 - 10:00 AM", stops: "4 stops - 6 documents", odometer: "91,705 km" }, { progress: 50 }),
	mock("dvd-2", "TRP-260725-012", "East Metro Retail Run", "Ready for Dispatch", { originWarehouse: "Pasig Distribution Hub", loadPlan: "LP-2026-0725-01", vehicle: "FLEET-014 - Isuzu N-Series", driver: "Marco Reyes", route: "Pasig to Marikina to Antipolo", plannedDeparture: "Jul 25, 2026 - 1:00 PM", stops: "5 stops - 4 documents", odometer: "48,220 km" }, { progress: 100 }),
	mock("dvd-3", "TRP-260725-013", "South Metro Cold Chain", "Loading", { originWarehouse: "Makati Fulfillment Center", loadPlan: "LP-2026-0725-02", vehicle: "FLEET-021 - Toyota HiAce", driver: "Joel Mendoza", route: "Makati to Paranaque to Alabang", plannedDeparture: "Jul 25, 2026 - 3:30 PM", stops: "3 stops - 3 documents", odometer: "65,410 km" }, { progress: 68, alert: "Warehouse loading is not yet complete." }),
];

export function createDeliveryTripRecord(values: Record<string, string>, status: string) {
	return createDeliveryVehicleModuleRecord("delivery-planning-dispatch", "TRP", values, status);
}
