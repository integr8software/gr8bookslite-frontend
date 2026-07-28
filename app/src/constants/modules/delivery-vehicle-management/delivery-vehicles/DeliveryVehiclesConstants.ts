import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const DeliveryVehiclesHref = MODULE_ROUTE_MAP.DVE;
export const DeliveryVehiclesApiPath = "/delivery-vehicle-management/delivery-vehicles";
export const DeliveryVehiclesTablePaginationStorageKey =
  "delivery-vehicle-management:delivery-vehicles";

export const DeliveryVehiclesConfig: DeliveryVehicleModuleConfig = {
  key: "delivery-vehicles",
  code: "DVE",
  title: "Delivery Vehicles",
  description: "Manage fleet identity, compliance, capacity, and home-base information.",
  primaryAction: "Add Vehicle",
  noun: "vehicle",
  searchPlaceholder: "Search fleet no., plate, make, or model",
  statuses: ["Active", "Inactive", "Retired"],
  fields: [
    { key: "fleetNumber", label: "Fleet number", required: true },
    { key: "plateNumber", label: "Plate number", required: true },
    { key: "vehicleType", label: "Vehicle type", required: true, type: "select", options: ["Light Truck", "Refrigerated Van", "Delivery Van", "Motorcycle", "Wing Van", "Box Truck"] },
    { key: "makeModel", label: "Make and model", required: true },
    { key: "yearModel", label: "Year model", required: true, type: "number" },
    { key: "vin", label: "VIN / chassis number", required: true },
    { key: "engineNumber", label: "Engine number", required: true },
    { key: "fuelType", label: "Fuel type", type: "select", options: ["Diesel", "Gasoline", "Hybrid", "Electric"] },
    { key: "grossVehicleWeight", label: "Gross vehicle weight (kg)", required: true, type: "number" },
    { key: "payloadCapacity", label: "Payload capacity (kg)", required: true, type: "number" },
    { key: "cargoVolume", label: "Cargo volume (cbm)", type: "number" },
    { key: "temperatureControl", label: "Temperature control", type: "select", options: ["Ambient", "Chilled", "Frozen", "Multi-temperature"] },
    { key: "palletCapacity", label: "Pallet capacity", type: "number" },
    { key: "baseWarehouse", label: "Base warehouse", required: true, type: "select", options: ["Pasig Distribution Hub", "Makati Fulfillment Center", "Cebu Central Warehouse"] },
    { key: "assignedDriver", label: "Assigned driver", type: "select", options: ["Ramon Santos", "Leah Dizon", "Miguel Reyes", "Carlo Bautista"] },
    { key: "costCenter", label: "Cost center", type: "select", options: ["Metro Manila Distribution", "Cold Chain Operations", "Central Visayas Logistics"] },
    { key: "ownership", label: "Ownership", type: "select", options: ["Company owned", "Leased", "Third party"] },
    { key: "lessorOrVendor", label: "Lessor / vendor" },
    { key: "registrationNumber", label: "Registration number", required: true },
    { key: "registrationExpiry", label: "Registration expiry", required: true, type: "date" },
    { key: "insurancePolicy", label: "Insurance policy number", required: true },
    { key: "insuranceExpiry", label: "Insurance expiry", required: true, type: "date" },
    { key: "ltfrbFranchise", label: "LTFRB franchise / permit" },
    { key: "odometer", label: "Current odometer (km)", required: true, type: "number" },
    { key: "lastServiceDate", label: "Last service date", type: "date" },
    { key: "nextServiceDueKm", label: "Next service due (km)", type: "number" },
    { key: "availability", label: "Availability", required: true, type: "select", options: ["Available", "Assigned", "Under Maintenance", "Out of Service"] },
    { key: "remarks", label: "Remarks", type: "textarea" },
  ],
  formSections: [
    {
      key: "vehicle",
      title: "Vehicle",
      description: "Core fleet identity, plate, chassis, and engine details.",
      fieldKeys: ["fleetNumber", "plateNumber", "vehicleType", "makeModel", "yearModel", "vin", "engineNumber", "fuelType"],
    },
    {
      key: "capacity",
      title: "Capacity & Specs",
      description: "Physical capacity and transport constraints used during dispatch planning.",
      fieldKeys: ["grossVehicleWeight", "payloadCapacity", "cargoVolume", "temperatureControl", "palletCapacity"],
    },
    {
      key: "ownership",
      title: "Ownership & Assignment",
      description: "Operating warehouse, driver assignment, cost center, and ownership setup.",
      fieldKeys: ["baseWarehouse", "assignedDriver", "costCenter", "ownership", "lessorOrVendor"],
    },
    {
      key: "registration",
      title: "Registration Details",
      description: "Compliance dates and references needed before a vehicle can be dispatched.",
      fieldKeys: ["registrationNumber", "registrationExpiry", "insurancePolicy", "insuranceExpiry", "ltfrbFranchise"],
    },
    {
      key: "status",
      title: "Status",
      description: "Current operating state, service readings, and fleet notes.",
      fieldKeys: ["odometer", "lastServiceDate", "nextServiceDueKm", "availability", "remarks"],
      includeStatus: true,
    },
  ],
  tableFieldKeys: ["plateNumber", "vehicleType", "baseWarehouse", "availability"],
  insightLabel: "Compliance alerts",
  insightStatuses: ["Inactive", "Retired"],
  operationalNote: "Vehicle records keep capacity, ownership, registration, and status together; type defaults are maintained under Vehicle Types.",
};
