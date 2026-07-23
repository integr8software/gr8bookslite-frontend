import { MockSalesInvoices } from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceMockData";
import type { SalesInvoiceRecord } from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";

export const SalesInvoiceStorageKey = "gr8books.sales-invoice.invoices";

export function getInitialSalesInvoices() {
  return readStoredSalesInvoices() ?? MockSalesInvoices;
}

export function readStoredSalesInvoices() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedInvoices = window.localStorage.getItem(SalesInvoiceStorageKey);

  if (!storedInvoices) {
    return null;
  }

  try {
    const parsedInvoices = JSON.parse(storedInvoices) as SalesInvoiceRecord[];

    return Array.isArray(parsedInvoices) ? parsedInvoices : null;
  } catch {
    return null;
  }
}

export function writeStoredSalesInvoices(invoices: SalesInvoiceRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SalesInvoiceStorageKey, JSON.stringify(invoices));
}
