import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
  CollectionType,
  CollectionTypeImportColumnHeader,
  CollectionTypeImportColumnId,
  CollectionTypeImportColumnWidths,
  CollectionTypeStatus,
  CollectionTypeAccountSetupMode,
  CollectionTypeType,
} from "@/app/src/types/modules/financial-maintenance/collection-type/CollectionTypeTypes";
import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";
import { ModuleImportFixedColumnsWidth } from "@/app/src/constants/shared/module/ModuleImportConstants";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const CollectionTypeHref = getModuleRoute("CTM");

export const CollectionTypeParentLabel = "Accounting master data";
export const CollectionTypeTitle = "Collection Type Maintenance";
export const CollectionTypeDescription = "Maintain collection classifications and their linked revenue Chart of Accounts records.";

export const CollectionTypeDrawerFormId = "collection-type-drawer-form";

export const CollectionTypeTablePaginationStorageKey = "maintenance:financial-management:collection-type";

export const CollectionTypeTableColumns = [
  {
    key: "collectionTypeName",
    label: "Default Name",
    className: "w-[24%]",
  },
  {
    key: "description",
    label: "Description",
    className: "w-[24%]",
  },
  {
    key: "accountCode",
    label: "Account Code",
    className: "w-[16%]",
  },
  {
    key: "accountName",
    label: "Account Name",
    className: "w-[30%]",
  },
  { key: "createdBy", label: "Created By", className: "w-[14%]" },
  { key: "createdAt", label: "Date Created", className: "w-[16%]" },
  { key: "updatedBy", label: "Updated By", className: "w-[14%]" },
  { key: "updatedAt", label: "Date Modified", className: "w-[16%]" },
  {
    key: "status",
    label: "Status",
    className: "w-[11%] text-center",
  },
  {
    label: "Action",
    className: "w-[18%] text-center",
  },
] as const;

export const CollectionTypeTablePreferencesStorageKey = "gr8booksneo:collection-type:table-preferences";
export const CollectionTypeTablePreferencesModuleKey = "maintenance:collection-type";
export const CollectionTypeDefaultColumnOrder = CollectionTypeTableColumns.map((column) => ("key" in column ? column.key : "actions"));
export const CollectionTypeDefaultColumnVisibility: VisibilityState = {
  description: false,
  accountCode: false,
  createdBy: false,
  createdAt: false,
  updatedBy: false,
  updatedAt: false,
};
export const CollectionTypeDefaultSorting: SortingState = [{ id: "collectionTypeName", desc: false }];

export const CollectionTypeTypeOptions = [
  { value: "EXPENSE", label: "Expenses" },
  { value: "COLLECTION", label: "Collections" },
] as const satisfies readonly { value: CollectionTypeType; label: string }[];

export const CollectionTypeAccountSetupModeOptions = ["Existing", "Auto"] as const satisfies readonly CollectionTypeAccountSetupMode[];

export const CollectionTypeTypeLabels: Record<CollectionTypeType, string> = {
  EXPENSE: "Expenses",
  COLLECTION: "Collections",
  FIXED_ASSET: "Fixed Asset",
};

export const CollectionTypeTypeFilterOptions = [
  { value: "", label: "All Accounts" },
  ...CollectionTypeTypeOptions,
] as const satisfies readonly { value: "" | CollectionTypeType; label: string }[];

export const CollectionTypeStatuses = {
  Active: "Active",
  Inactive: "Inactive",
} as const satisfies Record<string, CollectionTypeStatus>;

export const CollectionTypeStatusOptions = [
  CollectionTypeStatuses.Active,
  CollectionTypeStatuses.Inactive,
] as const satisfies readonly CollectionTypeStatus[];

export const CollectionTypeImportTemplateHeaders = ["Collection Type Name", "Description", "Type"];

export const CollectionTypeImportAcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";
export const CollectionTypeImportAcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";

export const CollectionTypeImportDefaultColumnIndexes: Record<CollectionTypeImportColumnId, number> = {
  collectionTypeName: 0,
  description: 1,
  type: 2,
};

export const CollectionTypeImportFieldOrder: CollectionTypeImportColumnId[] = ["collectionTypeName", "description", "type"];

export const CollectionTypeImportSelectionColumnWidth = ModuleImportFixedColumnsWidth;

export const CollectionTypeImportDefaultColumnWidths: CollectionTypeImportColumnWidths = {
  collectionTypeName: 240,
  description: 280,
  type: 176,
};

export const CollectionTypeImportColumnHeaders: CollectionTypeImportColumnHeader[] = [
  {
    className: "z-40 px-3",
    id: "collectionTypeName",
    label: "Collection Type Name",
    stickyLeft: CollectionTypeImportSelectionColumnWidth,
  },
  { className: "px-3", id: "description", label: "Description" },
  { className: "px-3", id: "type", label: "Type" },
];

export const CollectionTypeImportPreviewColumnCount = CollectionTypeImportFieldOrder.length + 1;
export const CollectionTypeImportPreviewGridLabel = "Collection type import preview grid. Paste copied Excel rows here.";
export const CollectionTypeImportPreviewPageSize = 20;
export const CollectionTypeImportBatchSize = 25;
export const CollectionTypeImportMinFileSizeBytes = 1;
export const CollectionTypeImportMaxFileSizeBytes = AppMaxFileUploadSizeBytes;

export const CollectionTypeActionCopy = {
  add: {
    title: "Add Collection Type",
    description: "Create a reusable template and generate its linked Chart of Accounts records.",
  },
  edit: {
    title: "Edit Collection Type",
    description: "Update the template and keep generated Chart of Accounts titles synchronized.",
  },
  view: {
    title: "View Collection Type",
    description: "Review the generated accounts linked to this template.",
  },
} as const;

export const CollectionTypeExportColumns: ModuleTableExportColumn<CollectionType>[] = [
  {
    header: "Default Name",
    id: "collectionTypeName",
    value: "collectionTypeName",
  },
  { header: "Description", id: "description", value: "description" },
  { header: "Status", id: "status", value: "status" },
  {
    header: "Account Code",
    id: "accountCode",
    value: (row) => row.generatedAccounts.map((account) => account.accountCode).join("; "),
  },
  {
    header: "Account Name",
    id: "accountName",
    value: (row) => row.generatedAccounts.map((account) => account.accountTitle).join("; "),
  },
];
