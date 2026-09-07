import type { SortingState, VisibilityState } from "@tanstack/react-table";
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
  "Debit Memo",
  "Digital Wallet",
] as const satisfies readonly PaymentTypeClassification[];

export const PaymentTypeStatuses = {
  Active: "Active",
  Inactive: "Inactive",
} as const satisfies Record<string, PaymentTypeStatus>;

export const PaymentTypeStatusOptions = [
  PaymentTypeStatuses.Active,
  PaymentTypeStatuses.Inactive,
] as const satisfies readonly PaymentTypeStatus[];

export const PaymentTypeImportTemplateHeaders = ["Payment Type Name", "Description", "Category"];

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
