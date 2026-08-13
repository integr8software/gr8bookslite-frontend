import type {
  CustomizeReportMarginSetup,
  CustomizeReportTableColumn,
  CustomizeReportTableSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";
export const AlignmentGuideThreshold = 6;
export const MaxLayoutHistoryLength = 50;
export const DefaultGridSize = 10;
export const MinFieldWidth = 40;
export const MinFieldHeight = 18;
export const DefaultFieldColor = "#0f172a";
export const DefaultFontFamily = "Arial, Helvetica, sans-serif";
export const FontFamilyOptions = [
  "Arial, Helvetica, sans-serif",
  "Georgia, serif",
  "Tahoma, Geneva, sans-serif",
  "Times New Roman, Times, serif",
  "Verdana, Geneva, sans-serif",
];
export const MinZoom = 50;
export const MaxZoom = 150;
export const ZoomStep = 10;
export const DefaultTableColumns: CustomizeReportTableColumn[] = [
  { key: "itemCode", label: "Item Code", width: 116, visible: true, align: "left" },
  { key: "description", label: "Description", width: 144, visible: true, align: "left" },
  { key: "qty", label: "Qty", width: 48, visible: true, align: "right" },
  { key: "uom", label: "UOM", width: 58, visible: true, align: "left" },
  { key: "unitCost", label: "Unit Cost", width: 84, visible: true, align: "right" },
  { key: "amount", label: "Amount", width: 96, visible: true, align: "right" },
];
export const DefaultTableSetup: CustomizeReportTableSetup = {
  x: 42,
  y: 238,
  width: 686,
  fontSize: 11,
  previewRows: 2,
  rowHeight: 26,
  showBorders: true,
  columns: DefaultTableColumns,
};
export const DefaultMarginSetup: CustomizeReportMarginSetup = {
  visible: true,
  top: 36,
  right: 36,
  bottom: 36,
  left: 36,
};

export const InspectorNumberInputClassName =
  "h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

export const ToolbarButtonClassName =
  "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-700";

export const PrimaryButtonClassName =
  "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-orange-500 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60";

export const ReportToolbarSelectClassName =
  "h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

export const DefaultCustomizeReportModuleId = "inventory-receiving-report";

export const CustomizeReportModuleCategories = [
  "Cash Receipt",
  "Cash Disbursement",
  "Sales",
  "Purchasing",
  "Inventory",
];

