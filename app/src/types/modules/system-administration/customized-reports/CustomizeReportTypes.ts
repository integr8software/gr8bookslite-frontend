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
  locked?: boolean;
  zIndex?: number;
};

export type CustomizeReportPaperFormat = "A4" | "Letter" | "Legal";

export type CustomizeReportPageSetup = {
  format: CustomizeReportPaperFormat;
  orientation: "portrait" | "landscape";
  width: number;
  height: number;
};

export type CustomizeReportTableColumnKey = string;

export type CustomizeReportTableColumn = {
  key: CustomizeReportTableColumnKey;
  label: string;
  width: number;
  visible: boolean;
  align: CustomizeReportAlign;
};

export type CustomizeReportTableSetup = {
  x: number;
  y: number;
  width: number;
  fontSize: number;
  previewRows: number;
  rowHeight: number;
  showBorders: boolean;
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
  itemCode: string;
  description: string;
  qty: number;
  uom: string;
  unitCost: number;
  amount: number;
};

export type CustomizeReportSampleData = {
  companyName: string;
  reportTitle: string;
  documentNo: string;
  documentDate: string;
  partyName: string;
  warehouse: string;
  preparedBy: string;
  approvedBy: string;
  totalAmount: number;
  items: CustomizeReportDataRow[];
};
