import type {
  WarehouseReceivingPutawayConfig,
  WarehouseReceivingPutawayModule,
} from "@/app/src/types/modules/warehouse-management/receiving-putaway/WarehouseReceivingPutawayTypes";

const actionColumn = { id: "actions", label: "Action", className: "w-28" };
const statusColumn = { id: "status", label: "Status", className: "w-36" };

export const WarehouseReceivingPutawayConfigs: Record<
  WarehouseReceivingPutawayModule,
  WarehouseReceivingPutawayConfig
> = {
  "receiving-putaway": config({
    module: "receiving-putaway",
    group: "Warehouse Operations",
    title: "Receiving & Putaway",
    description: "Receive inbound stock and place it into validated final warehouse storage.",
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
};

export const WarehouseReceivingPutawayPaginationStorageKey = "warehouse-receiving-putaway";

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
  value: Omit<WarehouseReceivingPutawayConfig, "emptyDescription">,
): WarehouseReceivingPutawayConfig {
  return {
    ...value,
    emptyDescription: `No ${value.title.toLowerCase()} records match the current warehouse and filters.`,
  };
}
