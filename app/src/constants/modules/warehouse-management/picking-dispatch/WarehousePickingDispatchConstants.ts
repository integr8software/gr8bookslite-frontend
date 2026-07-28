import type {
  WarehousePickingDispatchConfig,
  WarehousePickingDispatchModule,
} from "@/app/src/types/modules/warehouse-management/picking-dispatch/WarehousePickingDispatchTypes";

const actionColumn = { id: "actions", label: "Action", className: "w-28" };
const statusColumn = { id: "status", label: "Status", className: "w-36" };

export const WarehousePickingDispatchConfigs: Record<
  WarehousePickingDispatchModule,
  WarehousePickingDispatchConfig
> = {
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
};

export const WarehousePickingDispatchPaginationStorageKey = "warehouse-picking-dispatch";

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
  value: Omit<WarehousePickingDispatchConfig, "emptyDescription">,
): WarehousePickingDispatchConfig {
  return {
    ...value,
    emptyDescription: `No ${value.title.toLowerCase()} records match the current warehouse and filters.`,
  };
}
