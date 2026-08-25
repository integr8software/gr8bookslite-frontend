import { SalesQuotationStatusOptions } from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";

export const SalesQuotationServicesHref = "/sales/sales-quotation-services";
export const SalesQuotationServicesStorageKey = "gr8books.salesQuotationServices";
export const SalesQuotationServicesTablePaginationStorageKey = "sales.sales-quotation-services";
export const SalesQuotationServicesStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	...SalesQuotationStatusOptions.map((status) => ({ label: status, value: status })),
] as const;
