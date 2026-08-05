import type {
  ReceivingReportFormField,
  ReceivingReportFormMode,
} from "@/app/src/ui/modules/inventory/receiving-report/ReceivingReportFormTypes";

export const ReceivingReportHref = "/inventory/receiving-report";

export const ReceivingReportFormCopy = {
  add: {
    title: "Add Receiving Report",
    description:
      "Complete vendor details, receiving references, warehouse amounts, and received item entries before saving.",
  },
  edit: {
    title: "Edit Receiving Report",
    description: "Update vendor details, warehouse amounts, references, and received item entries.",
  },
  view: {
    title: "View Receiving Report",
    description:
      "Review the receiving report details, references, warehouse totals, and item entries.",
  },
} satisfies Record<ReceivingReportFormMode, { description: string; title: string }>;

export const CurrencyOptions = ["PHP", "USD", "EUR", "JPY"] as const;
export const WarehouseOptions = ["Laguna", "Manila", "Cebu", "Davao"] as const;
export const TermsOfPaymentOptions = ["", "COD", "Net 15", "Net 30", "Net 45", "Net 60"] as const;
export const ResponsibilityCenterOptions = ["", "Warehouse", "Purchasing", "Operations"] as const;

export const RequiredReceivingReportFields = [
  { field: "vceCode", message: "Party code is required." },
  { field: "vceName", message: "Party name is required." },
  { field: "currency", message: "Currency is required." },
  { field: "exchangeRate", message: "Exchange rate is required." },
  { field: "address", message: "Address is required." },
  { field: "contactNo", message: "Contact number is required." },
  { field: "warehouse", message: "Warehouse is required." },
  { field: "responsibilityCenter", message: "Responsibility center is required." },
  { field: "status", message: "Status is required." },
  { field: "transNo", message: "Transaction number is required." },
  { field: "documentDate", message: "Document date is required." },
  { field: "poNo", message: "PO number is required." },
] satisfies Array<{ field: ReceivingReportFormField; message: string }>;

export const receivingReportFieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";

export const receivingReportFieldShellClassName =
  "grid min-w-0 gap-1.5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start";
