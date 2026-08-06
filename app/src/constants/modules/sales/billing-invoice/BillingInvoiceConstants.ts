import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ColumnDef } from "@tanstack/react-table";
import type { BillingInvoiceRecord } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";

export const BillingInvoiceHref = getModuleRoute("BI");

export const BillingInvoiceStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: "Active", value: "Active" },
	{ label: "Pending", value: "Pending" },
	{ label: "Approved", value: "Approved" },
	{ label: "Disapproved", value: "Disapproved" },
	{ label: "Closed", value: "Closed" },
	{ label: "Cancelled", value: "Cancelled" },
] as const;

export const BillingInvoiceStatusFilters = [
	"all",
	"Active",
	"Pending",
	"Approved",
	"Disapproved",
	"Closed",
	"Cancelled",
] as const;

export const BillingInvoiceTablePaginationStorageKey = "sales-billing-invoice";

export const BillingInvoiceTableColumns = [
	{
		id: "transactionNo",
		accessorKey: "transactionNo",
		header: "Trans No.",
		sortingFn: "alphanumeric",
		meta: { className: "w-[12rem]" },
	},
	{
		id: "documentDate",
		accessorKey: "documentDate",
		header: "Document Date",
		sortingFn: "datetime",
		meta: { className: "w-[10rem]" },
	},
	{
		id: "customerName",
		accessorKey: "customerName",
		header: "Customer Name",
		sortingFn: "alphanumeric",
		meta: { className: "w-[18rem]" },
	},
	{
		id: "invoiceNo",
		accessorKey: "invoiceNo",
		header: "Invoice No.",
		sortingFn: "alphanumeric",
		meta: { className: "w-[12rem]" },
	},
	{
		id: "referenceNo",
		accessorKey: "referenceNo",
		header: "Reference No.",
		sortingFn: "alphanumeric",
		meta: { className: "w-[12rem]" },
	},
	{
		id: "amount",
		accessorKey: "amount",
		header: "Gross Amount",
		sortingFn: "basic",
		meta: { className: "w-[11rem]" },
	},
	{
		id: "status",
		accessorKey: "status",
		header: "Status",
		sortingFn: "alphanumeric",
		meta: { className: "w-[10rem]" },
	},
	{
		id: "actions",
		header: "Actions",
		enableSorting: false,
		meta: { className: "w-[9rem] text-center" },
	},
] satisfies ColumnDef<BillingInvoiceRecord>[];

