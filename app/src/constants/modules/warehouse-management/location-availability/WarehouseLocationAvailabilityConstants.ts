import type {
  WarehouseLocationAvailabilityConfig,
  WarehouseLocationAvailabilityModule,
} from "@/app/src/types/modules/warehouse-management/location-availability/WarehouseLocationAvailabilityTypes";

const actionColumn = { id: "actions", label: "Action", className: "w-28" };
const statusColumn = { id: "status", label: "Status", className: "w-36" };

export const WarehouseLocationAvailabilityConfigs: Record<
  WarehouseLocationAvailabilityModule,
  WarehouseLocationAvailabilityConfig
> = {
  "item-location-setup": config({
    module: "item-location-setup",
    group: "Warehouse Storage",
    title: "Item Location Setup",
    description:
      "Define receiving, putaway, picking, reserve, return, damage, and hold locations for each item.",
    columns: columns(
      "itemCode:Item Code",
      "itemName:Item Name",
      "category:Category",
      "receiving:Receiving",
      "picking:Primary Pick",
      "reserve:Reserve",
    ),
    searchPlaceholder: "Search item code or name",
    warehouseMode: "one",
    primaryAction: "Add Item Location",
  }),
  "capacity-storage-rules": config({
    module: "capacity-storage-rules",
    group: "Warehouse Storage",
    title: "Capacity & Storage Rules",
    description: "Set capacity limits and safe-storage restrictions for warehouse locations.",
    columns: columns(
      "locationCode:Location Code",
      "locationName:Location",
      "maxWeight:Max Weight",
      "maxVolume:Max Volume",
      "utilization:Utilization",
      "restrictions:Restrictions",
    ),
    searchPlaceholder: "Search location or restriction",
    warehouseMode: "one",
    primaryAction: "Add Rule",
  }),
  "location-availability": config({
    module: "location-availability",
    group: "Warehouse Storage",
    title: "Location Availability",
    description:
      "Control whether warehouse locations can participate in receiving, putaway, transfer, and picking.",
    columns: columns(
      "locationCode:Location Code",
      "locationName:Location",
      "type:Type",
      "reason:Reason",
      "effectiveDate:Effective Date",
      "expectedAvailable:Expected Available",
    ),
    searchPlaceholder: "Search location code or reason",
    warehouseMode: "one",
    primaryAction: "Update Availability",
  }),
  "stock-by-warehouse": config({
    module: "stock-by-warehouse",
    group: "Warehouse Inventory",
    title: "Stock by Warehouse",
    description: "Review item balances summarized across warehouses you are allowed to view.",
    columns: columns(
      "warehouse:Warehouse",
      "item:Item",
      "unit:Unit",
      "onHand:On Hand",
      "reserved:Reserved",
      "blocked:Blocked",
      "qualityHold:Quality Hold",
      "available:Available",
    ),
    searchPlaceholder: "Search warehouse or item",
    warehouseMode: "all-or-one",
    readOnly: true,
  }),
  "stock-by-location": config({
    module: "stock-by-location",
    group: "Warehouse Inventory",
    title: "Stock by Location",
    description: "Inspect warehouse balances by storage location, item, and tracked lot or serial.",
    columns: columns(
      "location:Location",
      "item:Item",
      "lot:Lot / Serial",
      "onHand:On Hand",
      "reserved:Reserved",
      "available:Available",
      "occupancy:Occupancy",
    ),
    searchPlaceholder: "Search location, item, lot, or serial",
    warehouseMode: "one",
    readOnly: true,
  }),
  "stock-movement-history": config({
    module: "stock-movement-history",
    group: "Warehouse Inventory",
    title: "Stock Movement History",
    description:
      "Trace every posted warehouse movement to its source document and responsible user.",
    columns: columns(
      "date:Movement Date",
      "document:Document",
      "item:Item",
      "quantity:Quantity",
      "source:Source",
      "destination:Destination",
      "postedBy:Posted By",
    ),
    searchPlaceholder: "Search document, item, or location",
    warehouseMode: "all-or-one",
    readOnly: true,
  }),
  "item-availability": config({
    module: "item-availability",
    group: "Warehouse Inventory",
    title: "Item Availability",
    description: "See where an item is usable and how much may be promised, allocated, or picked.",
    columns: columns(
      "itemCode:Item Code",
      "itemName:Item Name",
      "warehouse:Warehouse",
      "location:Location",
      "onHand:On Hand",
      "reserved:Reserved",
      "blocked:Blocked",
      "qualityHold:Quality Hold",
      "available:Available",
    ),
    searchPlaceholder: "Search item code or name",
    warehouseMode: "all-or-one",
    readOnly: true,
  }),
  "location-transfer": config({
    module: "location-transfer",
    group: "Warehouse Operations",
    title: "Location Transfer",
    description:
      "Move inventory between two valid storage locations inside the selected warehouse.",
    columns: columns(
      "number:Transfer No.",
      "date:Date",
      "source:Source Location",
      "destination:Destination Location",
      "items:Items",
      "quantity:Quantity",
    ),
    searchPlaceholder: "Search transfer number or location",
    warehouseMode: "one",
    primaryAction: "New Location Transfer",
  }),
  "receiving-putaway": config({
    module: "receiving-putaway",
    group: "Warehouse Operations",
    title: "Receiving & Putaway",
    description: "Receive inbound stock and place it into validated final storage locations.",
    columns: columns(
      "document:Receiving Document",
      "source:Source",
      "expectedDate:Expected Date",
      "items:Items",
      "received:Received",
      "putaway:Putaway",
      "progress:Progress",
    ),
    searchPlaceholder: "Search receiving document or source",
    warehouseMode: "one",
    primaryAction: "Start Receiving",
  }),
  "picking-dispatch": config({
    module: "picking-dispatch",
    group: "Warehouse Operations",
    title: "Picking & Dispatch",
    description: "Allocate, pick, stage, and release stock for approved outbound demand.",
    columns: columns(
      "document:Pick Document",
      "source:Source Demand",
      "requestedDate:Requested Date",
      "items:Items",
      "picked:Picked",
      "staging:Staging Location",
      "readiness:Readiness",
    ),
    searchPlaceholder: "Search pick document or source demand",
    warehouseMode: "one",
    primaryAction: "Create Pick Work",
  }),
  "stock-count": config({
    module: "stock-count",
    group: "Warehouse Operations",
    title: "Stock Count",
    description: "Plan physical counts, record observations, and review warehouse variances.",
    columns: columns(
      "number:Count No.",
      "date:Count Date",
      "scope:Location Scope",
      "items:Items",
      "counted:Counted",
      "variance:Variance",
      "assignedTo:Assigned To",
    ),
    searchPlaceholder: "Search count number or assignee",
    warehouseMode: "one",
    primaryAction: "New Stock Count",
  }),
  "stock-adjustment": config({
    module: "stock-adjustment",
    group: "Warehouse Operations",
    title: "Stock Adjustment",
    description:
      "Record controlled inventory increases or decreases with approval and audit evidence.",
    columns: columns(
      "number:Adjustment No.",
      "date:Date",
      "location:Location",
      "items:Items",
      "quantityChange:Quantity Change",
      "reason:Reason",
      "requestedBy:Requested By",
    ),
    searchPlaceholder: "Search adjustment number, item, or reason",
    warehouseMode: "one",
    primaryAction: "New Adjustment",
  }),
};

export const WarehouseLocationAvailabilityPaginationStorageKey = "warehouse-management-workspace";

function columns(...items: string[]) {
  return [
    ...items.map((item) => {
      const [id = "", label = ""] = item.split(":");
      return { id, label };
    }),
    statusColumn,
    actionColumn,
  ];
}

function config(
  value: Omit<WarehouseLocationAvailabilityConfig, "emptyDescription">,
): WarehouseLocationAvailabilityConfig {
  return {
    ...value,
    emptyDescription: `No ${value.title.toLowerCase()} records match the current warehouse and filters.`,
  };
}
