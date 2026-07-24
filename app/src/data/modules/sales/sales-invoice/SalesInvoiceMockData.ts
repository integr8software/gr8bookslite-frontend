import type { SalesInvoiceRecord } from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";

export const MockSalesInvoices: SalesInvoiceRecord[] = [
  {
    id: "si-001",
    amount: 184500,
    customerName: "Aster Foods Corporation",
    dueDate: "2026-08-02",
    invoiceDate: "2026-07-03",
    invoiceNo: "SI-2026-0001",
    referenceNo: "SO-2026-0188",
    status: "Approved",
  },
  {
    id: "si-002",
    amount: 76250,
    customerName: "Northline Retail Group",
    dueDate: "2026-08-04",
    invoiceDate: "2026-07-05",
    invoiceNo: "SI-2026-0002",
    referenceNo: "DR-2026-0042",
    status: "Pending",
  },
  {
    id: "si-003",
    amount: 52000,
    customerName: "Bluecrest Trading",
    dueDate: "2026-07-24",
    invoiceDate: "2026-07-09",
    invoiceNo: "SI-2026-0003",
    referenceNo: "SO-2026-0196",
    status: "Active",
  },
  {
    id: "si-004",
    amount: 128900,
    customerName: "Harborview Logistics",
    dueDate: "2026-08-12",
    invoiceDate: "2026-07-13",
    invoiceNo: "SI-2026-0004",
    referenceNo: "DR-2026-0061",
    status: "Draft",
  },
];
