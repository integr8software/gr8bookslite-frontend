import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { DeliveryVehicleModuleConfig } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";

export const TripTrackingHref = MODULE_ROUTE_MAP.DVTK;
export const TripTrackingTablePaginationStorageKey =
  "delivery-vehicle-management:trip-tracking";

export const TripTrackingConfig: DeliveryVehicleModuleConfig = {
  key: "trip-tracking",
  code: "DVTK",
  title: "Trip Tracking",
  description: "Monitor current trip state and append a traceable delivery event timeline.",
  primaryAction: "Log Trip Event",
  noun: "tracking event",
  searchPlaceholder: "Search trip, stop, event, or location",
  statuses: ["Dispatched", "Departed Origin", "Arrived at Stop", "Delivery Started", "Delivery Completed", "Delivery Failed", "Delay Reported", "Incident Reported", "Returned to Origin", "Trip Completed"],
  fields: [
    { key: "trip", label: "Trip", required: true },
    { key: "stop", label: "Stop or destination" },
    { key: "eventTime", label: "Event date and time", required: true, type: "datetime-local" },
    { key: "location", label: "Location", required: true },
    { key: "source", label: "Source", required: true, type: "select", options: ["Manual", "Mobile", "GPS", "System"] },
    { key: "odometer", label: "Odometer (km)", type: "number" },
    { key: "notes", label: "Notes or proof reference", type: "textarea" },
  ],
  tableFieldKeys: ["trip", "stop", "eventTime", "source"],
  insightLabel: "Needs attention",
  insightStatuses: ["Delivery Failed", "Delay Reported", "Incident Reported"],
  operationalNote: "Tracking events are append-only; corrections create a new audited event.",
};
