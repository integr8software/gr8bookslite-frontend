import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import { MainModuleCatalogSearchItems } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const SalesInvoiceModuleKey = "sales-sales-invoice";
export const SalesInvoiceModuleCode = "SI";
export const SalesInvoiceModule =
  MainModuleCatalogSearchItems.find(
    (item) => item.key === SalesInvoiceModuleKey,
  ) ?? null;

export const SalesInvoiceHref =
  SalesInvoiceModule?.href ?? getModuleRoute(SalesInvoiceModuleCode);
export const SalesInvoiceTitle = SalesInvoiceModule?.label ?? "Sales Invoice";

export const SalesInvoiceStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Closed", value: "Closed" },
  { label: "Cancelled", value: "Cancelled" },
] as const;

export const SalesInvoiceStatusFilters = [
  "all",
  "Active",
  "Pending",
  "Approved",
  "Closed",
  "Cancelled",
] as const;

export const SalesInvoiceTablePaginationStorageKey = SalesInvoiceModuleKey;
