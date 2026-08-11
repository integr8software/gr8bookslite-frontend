import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { CashSalesInvoiceStatus } from "@/app/src/types/modules/sales/cash-sales-invoice/CashSalesInvoiceTypes";

export const CashSalesInvoiceHref = getModuleRoute("CSI");
export const CashSalesInvoiceStorageKey = "gr8books.cash-sales-invoice.records";
export const CashSalesInvoiceTablePaginationStorageKey = "sales-cash-sales-invoice";

export const CashSalesInvoiceStatuses = {
  cancelled: "Cancelled",
  draft: "Draft",
  posted: "Posted",
} as const;

export const CashSalesInvoiceStatusOptions: CashSalesInvoiceStatus[] = [
  "Draft",
  "Posted",
  "Cancelled",
];

export const CashSalesInvoiceStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: CashSalesInvoiceStatuses.draft, value: CashSalesInvoiceStatuses.draft },
  { label: CashSalesInvoiceStatuses.posted, value: CashSalesInvoiceStatuses.posted },
  { label: CashSalesInvoiceStatuses.cancelled, value: CashSalesInvoiceStatuses.cancelled },
] as const;

export const CashSalesInvoiceStatusFilters = [
  "all",
  CashSalesInvoiceStatuses.draft,
  CashSalesInvoiceStatuses.posted,
  CashSalesInvoiceStatuses.cancelled,
] as const;
