import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const SalesOrderHref = getModuleRoute("SO");

export const SalesOrderStorageKey = "gr8books.salesOrders";

export const SalesOrderTablePaginationStorageKey = "sales.sales-order";

export const SalesOrderStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: "Open", value: "Open" },
  { label: "Approved", value: "Approved" },
  { label: "Draft", value: "Draft" },
  { label: "Closed", value: "Closed" },
  { label: "Cancelled", value: "Cancelled" },
] as const;
