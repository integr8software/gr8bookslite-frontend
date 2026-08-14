export type CustomizeReportAlign = "left" | "center" | "right";

export type CustomizeReportFieldType = "text" | "currency" | "date" | "number" | "image";

export type CustomizeReportField = {
  id: string;
  label: string;
  binding: string;
  value?: string;
  src?: string;
  type: CustomizeReportFieldType;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily?: string;
  color?: string;
  align: CustomizeReportAlign;
  bold: boolean;
  italic?: boolean;
  underline?: boolean;
  visible: boolean;
  groupId?: string;
  locked?: boolean;
  zIndex?: number;
};

export type CustomizeReportLineOrientation = "horizontal" | "vertical";

export type CustomizeReportLine = {
  id: string;
  label: string;
  x: number;
  y: number;
  length: number;
  thickness: number;
  orientation: CustomizeReportLineOrientation;
  color: string;
  visible: boolean;
  groupId?: string;
  locked?: boolean;
  zIndex?: number;
};

export type CustomizeReportPaperFormat =
  | "A3"
  | "A4"
  | "A5"
  | "B4"
  | "B5"
  | "Executive"
  | "Folio"
  | "Legal"
  | "Letter"
  | "Statement"
  | "Tabloid"
  | "Custom";

export type CustomizeReportPageSetup = {
  format: CustomizeReportPaperFormat;
  orientation: "portrait" | "landscape";
  width: number;
  height: number;
  applyTo?: "whole-document" | "this-section";
  firstPageSource?: string;
  footerHeight?: number;
  headerHeight?: number;
  otherPagesSource?: string;
  showSectionGuides?: boolean;
};

export type CustomizeReportTableColumnKey = string;

export type CustomizeReportTableColumn = {
  key: CustomizeReportTableColumnKey;
  label: string;
  width: number;
  visible: boolean;
  align: CustomizeReportAlign;
};

export type CustomizeReportTableBorderSetup = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  insideHorizontal: boolean;
  insideVertical: boolean;
};

export type CustomizeReportTableSetup = {
  x: number;
  y: number;
  width: number;
  fontSize: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  previewRows: number;
  rowHeight: number;
  showBorders: boolean;
  showHeader: boolean;
  borderSetup: CustomizeReportTableBorderSetup;
  columns: CustomizeReportTableColumn[];
};

export type CustomizeReportMarginSetup = {
  visible: boolean;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type CustomizeReportLayout = {
  fields: CustomizeReportField[];
  lines: CustomizeReportLine[];
  pageSetup: CustomizeReportPageSetup;
  tableSetup?: CustomizeReportTableSetup;
  marginSetup?: CustomizeReportMarginSetup;
};

export type CustomizeReportPresetTemplate = {
  id: string;
  name: string;
  description: string;
  layout: CustomizeReportLayout;
};

export type CustomizeReportModuleOption = {
  id: string;
  label: string;
  moduleCode: string;
  category: string;
  reportTitle: string;
  documentPrefix: string;
};

export type CustomizeReportDataRow = {
  [key: string]: number | string;
};

export type CustomizeReportSampleData = {
  companyName: string;
  vatRegTin: string;
  companyAddress: string;
  telephoneNo: string;
  reportTitle: string;
  documentNo: string;
  documentDate: string;
  checkVoucherDate: string;
  checkDmNo: string;
  refNo: string;
  partyName: string;
  amountInWords: string;
  purpose: string;
  warehouse: string;
  preparedBy: string;
  verifiedBy: string;
  approvedBy: string;
  totalAmount: number;
  totalCredit: number;
  items: CustomizeReportDataRow[];
};
