import {
  Ban,
  CheckCircle2,
  Clock3,
  Download,
  PackageCheck,
  Upload,
  XCircle,
} from "lucide-react";
import type { ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import type { ReceivingReportStatus } from "@/app/src/data/modules/inventory/receiving-report/ReceivingReportData";
import type {
  ReceivingReportAccountingColumnConfig,
  ReceivingReportAccountingEntryField,
  ReceivingReportActionMode,
  ReceivingReportColumnConfig,
  ReceivingReportColumnKind,
  ReceivingReportEntryTab,
  ReceivingReportFormField,
  ReceivingReportLineField,
} from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";

export const ReceivingReportHref = "/inventory/receiving-report";
export const ReceivingReportTablePaginationStorageKey =
  "inventory-receiving-report";

export const ReceivingReportActionCopy = {
  add: {
    title: "Add Receiving Report",
    description:
      "Complete vendor details, receiving references, warehouse amounts, and received item entries before saving.",
  },
  edit: {
    title: "Edit Receiving Report",
    description:
      "Update vendor details, warehouse amounts, references, and received item entries.",
  },
  view: {
    title: "View Receiving Report",
    description:
      "Review the receiving report details, references, warehouse totals, and item entries.",
  },
} satisfies Record<ReceivingReportActionMode, { description: string; title: string }>;

export const ReceivingReportEntryTabsList = [
  { id: "items", label: "Item Entry" },
  { id: "accounting", label: "Accounting Entry" },
] satisfies Array<{ id: ReceivingReportEntryTab; label: string }>;

export const ReceivingReportCurrencyOptions = ["PHP", "USD", "EUR", "JPY"] as const;
export const ReceivingReportWarehouseOptions = [
  "Laguna",
  "Manila",
  "Cebu",
  "Davao",
] as const;
export const ReceivingReportStatusOptions = [
  "Draft",
  "Open",
  "Approved",
  "Closed",
  "Cancelled",
] as const;
export const ReceivingReportTermsOfPaymentOptions = [
  "",
  "COD",
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
] as const;
export const ReceivingReportUomOptions = ["", "PCS", "BOX", "KG", "LTR"] as const;
export const ReceivingReportResponsibilityCenterOptions = [
  "",
  "Warehouse",
  "Purchasing",
  "Operations",
] as const;

export const ReceivingReportDefaultEmptyValues = new Set([
  "0.00",
  "0.0000",
  "False",
  "Laguna",
]);

export const DefaultHiddenReceivingReportItemColumns = new Set<string>([
  "barcode",
  "expiryDate",
  "lotNo",
  "color",
  "brand",
  "size",
  "model",
]);

export const DefaultVisibleReceivingReportAccountingColumns = new Set<string>([
  "accountTitle",
  "debit",
  "credit",
  "particulars",
]);

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

export const ReceivingReportOverflowItems = [
  { icon: Upload, label: "Upload", onSelect: () => undefined, type: "button" },
  { icon: Download, label: "Export", onSelect: () => undefined, type: "button" },
] satisfies ModuleActionMenuItem[];

export const ReceivingReportStatusFilterOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Draft", value: "Draft" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Disapproved", value: "Disapproved" },
  { label: "Closed", value: "Closed" },
  { label: "Cancelled", value: "Cancelled" },
] as const;

export const receivingReportStatusIconByStatus = {
  Approved: CheckCircle2,
  Cancelled: Ban,
  Closed: PackageCheck,
  Disapproved: XCircle,
  Draft: Clock3,
  Pending: Clock3,
} satisfies Record<ReceivingReportStatus, typeof CheckCircle2>;

export const receivingReportStatusClassNameByStatus = {
  Approved: "bg-citron/25 text-darknavy",
  Cancelled: "bg-darknavy/10 text-darknavy/70",
  Closed: "bg-skyblue/20 text-darknavy",
  Disapproved: "bg-coralpink/15 text-coralpink",
  Draft: "bg-offwhite text-darknavy/70",
  Pending: "bg-offwhite text-darknavy",
} satisfies Record<ReceivingReportStatus, string>;

export const receivingReportFieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";

export const receivingReportFieldShellClassName =
  "grid min-w-0 gap-1.5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start";

export const ReceivingReportEntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

export const ReceivingReportItemColumnConfigs = [
  receivingReportColumn("Item Code *", "itemCode", "text", 150, "w-[9.5rem]"),
  receivingReportColumn("Barcode", "barcode", "text", 130, "w-[8rem]"),
  receivingReportColumn("Item Name *", "description", "text", 220, "w-[13.75rem]"),
  receivingReportColumn("PO Qty", "poQty", "amount", 105, "w-[6.5rem]"),
  receivingReportColumn("RR Qty *", "rrQty", "amount", 110, "w-[7rem]"),
  receivingReportColumn(
    "UOM *",
    "uom",
    "dropdown",
    105,
    "w-[6.5rem]",
    dropdownOptions(ReceivingReportUomOptions),
  ),
  receivingReportColumn("Expiration Date", "expiryDate", "date", 125, "w-[7.75rem]"),
  receivingReportColumn("Lot No", "lotNo", "text", 105, "w-[6.5rem]"),
  receivingReportColumn("Color", "color", "text", 95, "w-[6rem]"),
  receivingReportColumn("Brand", "brand", "text", 95, "w-[6rem]"),
  receivingReportColumn("Size", "size", "text", 90, "w-[5.75rem]"),
  receivingReportColumn("Model", "model", "text", 110, "w-[7rem]"),
  receivingReportColumn("UC *", "cost", "amount", 110, "w-[7rem]"),
  receivingReportColumn("Total Cost (Net of VAT)", "grossAmount", "amount", 150, "w-[9.5rem]"),
  receivingReportColumn("VAT Amt", "vatAmount", "amount", 130, "w-[8rem]"),
  receivingReportColumn("Total Cost (Gross of VAT)", "netAmount", "amount", 160, "w-[10rem]"),
];

export const ReceivingReportAccountingColumnConfigs = [
  receivingReportAccountingColumn("Account Code", "accountCode", "text", 140, "w-[8.75rem]"),
  receivingReportAccountingColumn("Account Title", "accountTitle", "text", 220, "w-[13.75rem]"),
  receivingReportAccountingColumn("Debit", "debit", "amount", 130, "w-[8rem]"),
  receivingReportAccountingColumn("Credit", "credit", "amount", 130, "w-[8rem]"),
  receivingReportAccountingColumn("Party Code", "partyCode", "text", 140, "w-[8.75rem]"),
  receivingReportAccountingColumn("Party Name", "partyName", "text", 220, "w-[13.75rem]"),
  receivingReportAccountingColumn("Particulars", "particulars", "text", 220, "w-[13.75rem]"),
  receivingReportAccountingColumn("VAT Type", "vatType", "text", 140, "w-[8.75rem]"),
  receivingReportAccountingColumn("EWT Code", "ewtCode", "text", 140, "w-[8.75rem]"),
  receivingReportAccountingColumn(
    "Responsibility Center",
    "responsibilityCenter",
    "text",
    190,
    "w-[12rem]",
  ),
  receivingReportAccountingColumn("Reference No.", "referenceNo", "text", 160, "w-[10rem]"),
];

function receivingReportColumn(
  header: string,
  id: ReceivingReportLineField,
  kind: ReceivingReportColumnKind,
  width: number,
  widthClassName: string,
  options?: ReceivingReportColumnConfig["options"],
): ReceivingReportColumnConfig {
  return { header, id, kind, options, width, widthClassName };
}

function receivingReportAccountingColumn(
  header: string,
  id: ReceivingReportAccountingEntryField,
  kind: "amount" | "text",
  width: number,
  widthClassName: string,
): ReceivingReportAccountingColumnConfig {
  return { header, id, kind, width, widthClassName };
}

function dropdownOptions(options: readonly string[]) {
  return options.map((option) => ({
    label: option,
    name: option,
    value: option,
  }));
}
