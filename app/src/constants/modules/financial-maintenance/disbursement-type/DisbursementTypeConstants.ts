import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
  DisbursementType,
  DisbursementTypeImportColumnHeader,
  DisbursementTypeImportColumnId,
  DisbursementTypeImportColumnWidths,
  DisbursementTypeStatus,
  DisbursementTypeType,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";
import { ModuleImportFixedColumnsWidth } from "@/app/src/constants/shared/module/ModuleImportConstants";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const DisbursementTypeHref = getModuleRoute("DTM");

export const DisbursementTypeParentLabel = "Accounting master data";
export const DisbursementTypeTitle = "Disbursement Type Maintenance";
export const DisbursementTypeDescription = "Maintain reusable account templates that automatically create linked Chart of Accounts records.";

export const DisbursementTypeDrawerFormId = "disbursement-type-drawer-form";

export const DisbursementTypeTablePaginationStorageKey = "maintenance:financial-management:disbursement-type";

export const DisbursementTypeTableColumns = [
  {
    key: "disbursementTypeName",
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

export const DisbursementTypeTablePreferencesStorageKey = "gr8booksneo:disbursement-type:table-preferences";
export const DisbursementTypeTablePreferencesModuleKey = "maintenance:disbursement-type";
export const DisbursementTypeDefaultColumnOrder = DisbursementTypeTableColumns.map((column) => ("key" in column ? column.key : "actions"));
export const DisbursementTypeDefaultColumnVisibility: VisibilityState = {
  description: false,
  accountCode: false,
  createdBy: false,
  createdAt: false,
  updatedBy: false,
  updatedAt: false,
};
export const DisbursementTypeDefaultSorting: SortingState = [{ id: "disbursementTypeName", desc: false }];

export const DisbursementTypeTypeOptions = [
  { value: "EXPENSE", label: "Expenses" },
  { value: "COLLECTION", label: "Collections" },
] as const satisfies readonly { value: DisbursementTypeType; label: string }[];

export const DisbursementTypeAccountSetupModeOptions = ["Existing", "Auto"] as const;

export const DisbursementTypeTypeLabels: Record<DisbursementTypeType, string> = {
  EXPENSE: "Expenses",
  COLLECTION: "Collections",
  FIXED_ASSET: "Fixed Asset",
};

export const DisbursementTypeTypeFilterOptions = [
  { value: "", label: "All Accounts" },
  ...DisbursementTypeTypeOptions,
] as const satisfies readonly { value: "" | DisbursementTypeType; label: string }[];

export const DisbursementTypeStatuses = {
  Active: "Active",
  Inactive: "Inactive",
} as const satisfies Record<string, DisbursementTypeStatus>;

export const DisbursementTypeStatusOptions = [
  DisbursementTypeStatuses.Active,
  DisbursementTypeStatuses.Inactive,
] as const satisfies readonly DisbursementTypeStatus[];

export const DisbursementTypeImportTemplateHeaders = ["Disbursement Type Name", "Description"];

export const DisbursementTypeImportAcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";
export const DisbursementTypeImportAcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";

export const DisbursementTypeImportDefaultColumnIndexes: Record<DisbursementTypeImportColumnId, number> = {
  disbursementTypeName: 0,
  description: 1,
};

export const DisbursementTypeImportFieldOrder: DisbursementTypeImportColumnId[] = ["disbursementTypeName", "description"];

export const DisbursementTypeImportSelectionColumnWidth = ModuleImportFixedColumnsWidth;

export const DisbursementTypeImportDefaultColumnWidths: DisbursementTypeImportColumnWidths = {
  disbursementTypeName: 240,
  description: 280,
};

export const DisbursementTypeImportColumnHeaders: DisbursementTypeImportColumnHeader[] = [
  {
    className: "z-40 px-3",
    id: "disbursementTypeName",
    label: "Disbursement Type Name",
    stickyLeft: DisbursementTypeImportSelectionColumnWidth,
  },
  { className: "px-3", id: "description", label: "Description" },
];

export const DisbursementTypeImportPreviewColumnCount = DisbursementTypeImportFieldOrder.length + 1;
export const DisbursementTypeImportPreviewGridLabel = "Disbursement type import preview grid. Paste copied Excel rows here.";
export const DisbursementTypeImportPreviewPageSize = 20;
export const DisbursementTypeImportBatchSize = 25;
export const DisbursementTypeImportMinFileSizeBytes = 1;
export const DisbursementTypeImportMaxFileSizeBytes = AppMaxFileUploadSizeBytes;

export const DisbursementTypeActionCopy = {
  add: {
    title: "Add Disbursement Type",
    description: "Create a reusable template and generate its linked Chart of Accounts records.",
  },
  edit: {
    title: "Edit Disbursement Type",
    description: "Update the template and keep generated Chart of Accounts titles synchronized.",
  },
  view: {
    title: "View Disbursement Type",
    description: "Review the generated accounts linked to this template.",
  },
} as const;

export const DisbursementTypeExportColumns: ModuleTableExportColumn<DisbursementType>[] = [
  {
    header: "Default Name",
    id: "disbursementTypeName",
    value: "disbursementTypeName",
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
