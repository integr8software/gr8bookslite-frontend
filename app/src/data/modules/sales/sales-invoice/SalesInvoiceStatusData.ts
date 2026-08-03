import type {
  SalesInvoiceRecord,
  SalesInvoiceStatus,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";

export function countSalesInvoicesByStatus(
  invoices: SalesInvoiceRecord[],
  status: SalesInvoiceStatus,
) {
  return invoices.filter((invoice) => invoice.status === status).length;
}

export function isSalesInvoiceActiveStatus(status: SalesInvoiceStatus) {
  return status === "Active" || status === "Approved";
}

export function normalizeSalesInvoiceStatus(value: string): SalesInvoiceStatus {
  const statuses: SalesInvoiceStatus[] = [
    "Active",
    "Approved",
    "Cancelled",
    "Closed",
    "Draft",
    "Pending",
  ];

  return statuses.includes(value as SalesInvoiceStatus)
    ? (value as SalesInvoiceStatus)
    : "Draft";
}
