import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";
import { ModuleImportFixedColumnsWidth } from "@/app/src/constants/shared/module/ModuleImportConstants";
import type {
  PaymentTypeClassification,
  PaymentTypeImportColumnHeader,
  PaymentTypeImportColumnId,
  PaymentTypeImportColumnWidths,
  PaymentTypeRecord,
  PaymentTypeStatus,
} from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const PaymentTypeHref = getModuleRoute("PT");

export const PaymentTypeApiPath = "/maintenance/payment-type-maintenance";

export const PaymentTypeParentLabel = "Accounting master data";

export const PaymentTypeTitle = "Payment Type";

export const PaymentTypeDescription = "Maintain payment type names, categories, and active status for cash disbursement workflows.";

export const PaymentTypeDrawerFormId = "payment-type-drawer-form";

export const PaymentTypeFieldClassName =
  "h-11 w-full rounded-lg border border-darknavy/12 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/15 disabled:bg-darknavy/5 read-only:bg-darknavy/5";

export const PaymentTypeTablePaginationStorageKey = "maintenance:financial-management:payment-type";

export const PaymentTypeTableColumns = [
  { key: "paymentType", label: "Payment Type Name", className: "w-[22%]" },
  { key: "description", label: "Description", className: "w-[28%]" },
  { key: "type", label: "Category", className: "w-[16%]" },
  { key: "createdBy", label: "Created By", className: "w-[14%]" },
  { key: "createdAt", label: "Date Created", className: "w-[16%]" },
  { key: "updatedBy", label: "Updated By", className: "w-[14%]" },
  { key: "updatedAt", label: "Date Modified", className: "w-[16%]" },
  { key: "status", label: "Status", className: "w-[12%] text-center" },
  { label: "Action", className: "w-[16%] text-center" },
] as const;

export const PaymentTypeTablePreferencesStorageKey = "gr8booksneo:payment-type:table-preferences";
export const PaymentTypeTablePreferencesModuleKey = "maintenance:payment-type";
export const PaymentTypeDefaultColumnOrder = PaymentTypeTableColumns.map((column) => ("key" in column ? column.key : "actions"));
export const PaymentTypeDefaultColumnVisibility: VisibilityState = {
  description: false,
  createdBy: false,
  createdAt: false,
  updatedBy: false,
  updatedAt: false,
};
export const PaymentTypeDefaultSorting: SortingState = [];

export const PaymentTypeExportColumns: ModuleTableExportColumn<PaymentTypeRecord>[] = PaymentTypeTableColumns.flatMap((column) =>
  "key" in column ? [{ header: column.label, id: column.key, value: column.key }] : [],
);

export const PaymentTypeClassificationOptions = [
  "Bank Transfer",
  "Check",
  "Digital Wallet",
] as const satisfies readonly PaymentTypeClassification[];

export const PaymentTypeStatusOptions = ["Active", "Inactive"] as const satisfies readonly PaymentTypeStatus[];

export const PaymentTypeImportTemplateHeaders = ["Payment Type Name", "Description", "Category"];

export const PaymentTypeImportAcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";

export const PaymentTypeImportAcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";

export const PaymentTypeImportDefaultColumnIndexes: Record<PaymentTypeImportColumnId, number> = {
  paymentType: 0,
  description: 1,
  type: 2,
};

export const PaymentTypeImportFieldOrder: PaymentTypeImportColumnId[] = ["paymentType", "description", "type"];

export const PaymentTypeImportSelectionColumnWidth = ModuleImportFixedColumnsWidth;

export const PaymentTypeImportDefaultColumnWidths: PaymentTypeImportColumnWidths = {
  paymentType: 224,
  description: 280,
  type: 176,
};

export const PaymentTypeImportColumnHeaders: PaymentTypeImportColumnHeader[] = [
  {
    className: "z-40 px-3",
    id: "paymentType",
    label: "Payment Type Name",
    stickyLeft: PaymentTypeImportSelectionColumnWidth,
  },
  { className: "px-3", id: "description", label: "Description" },
  { className: "px-3", id: "type", label: "Category" },
];

export const PaymentTypeImportPreviewColumnCount = PaymentTypeImportFieldOrder.length + 1;

export const PaymentTypeImportPreviewGridLabel = "Import preview grid. Paste copied Excel rows here.";

export const PaymentTypeImportPreviewEmptyMessage = "Upload a file, or focus here and paste copied Excel rows.";

export const PaymentTypeImportPreviewPageSize = 20;
export const PaymentTypeImportBatchSize = 25;
export const PaymentTypeImportMinFileSizeBytes = 1;
export const PaymentTypeImportMaxFileSizeBytes = AppMaxFileUploadSizeBytes;

export const ImportFieldOrder = PaymentTypeImportFieldOrder;
export const SelectionColumnWidth = PaymentTypeImportSelectionColumnWidth;
export const DefaultColumnWidths = PaymentTypeImportDefaultColumnWidths;
export const PreviewPageSize = PaymentTypeImportPreviewPageSize;
export const ImportBatchSize = PaymentTypeImportBatchSize;
export const MinImportFileSizeBytes = PaymentTypeImportMinFileSizeBytes;
export const MaxImportFileSizeBytes = PaymentTypeImportMaxFileSizeBytes;
