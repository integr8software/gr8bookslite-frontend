import type { SalesQuotationStatus } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const SalesQuotationHref = getModuleRoute("SQ");

export const SalesQuotationStorageKey = "gr8books.salesQuotations";

export const SalesQuotationTablePaginationStorageKey = "sales.sales-quotation";

export const SalesQuotationStatusOptions: SalesQuotationStatus[] = ["Draft", "Open", "Approved", "Closed", "Cancelled"];

export const SalesQuotationStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  ...SalesQuotationStatusOptions.map((status) => ({
    label: status,
    value: status,
  })),
] as const;

export const SalesQuotationCurrencyOptions = ["PHP", "USD", "JPY", "EUR"] as const;

export const SalesQuotationUomOptions = ["PC", "BOX", "LOT", "SET", "KG"] as const;

export const SalesQuotationBooleanOptions = ["True", "False"] as const;

export const SalesQuotationFormSignatoryModuleCodes = ["sales-sales-quotation", "sales-quotation", "sales"] as const;

export const SalesQuotationActionPageCopy = {
  add: {
    title: "New Sales Quotation",
    description: "Capture supplier, project, currency, and item request details, then preview the printable sales quotation.",
  },
  edit: {
    title: "Edit Sales Quotation",
    description: "Update supplier, project, currency, item, and approval details for this request.",
  },
  view: {
    title: "Sales Quotation",
    description: "Review request details and preview the printable sales quotation.",
  },
} as const;
