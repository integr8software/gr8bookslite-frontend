import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
  DefaultAccount,
  DefaultAccountImportColumnHeader,
  DefaultAccountImportColumnId,
  DefaultAccountImportColumnWidths,
  DefaultAccountStatus,
  DefaultAccountType,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { AppMaxFileUploadSizeBytes } from "@/app/src/constants/shared/app/AppConstants";
import { ModuleImportFixedColumnsWidth } from "@/app/src/constants/shared/module/ModuleImportConstants";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const DefaultAccountHref = getModuleRoute("DA");

export const DefaultAccountApiPath = "/maintenance/financial-management/default-accounts";

export const DefaultAccountParentLabel = "Accounting master data";
export const DefaultAccountTitle = "Default Accounts";
export const DefaultAccountDescription = "Maintain reusable account templates that automatically create linked Chart of Accounts records.";

export const DefaultAccountDrawerFormId = "default-account-drawer-form";

export const DefaultAccountTablePaginationStorageKey = "maintenance:financial-management:default-account";

export const DefaultAccountTableColumns = [
  {
    key: "defaultAccountName",
    label: "Default Name",
    className: "w-[24%]",
  },
  {
    key: "description",
    label: "Description",
    className: "w-[24%]",
  },
  {
    key: "type",
    label: "Type",
    className: "w-[14%] text-center",
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

export const DefaultAccountTablePreferencesStorageKey = "gr8booksneo:default-account:table-preferences";
export const DefaultAccountTablePreferencesModuleKey = "maintenance:default-account";
export const DefaultAccountDefaultColumnOrder = DefaultAccountTableColumns.map((column) => ("key" in column ? column.key : "actions"));
export const DefaultAccountDefaultColumnVisibility: VisibilityState = {
  description: false,
  accountCode: false,
  createdBy: false,
  createdAt: false,
  updatedBy: false,
  updatedAt: false,
};
export const DefaultAccountDefaultSorting: SortingState = [{ id: "defaultAccountName", desc: false }];

export const DefaultAccountTypeOptions = [
  { value: "EXPENSE", label: "Expenses" },
  { value: "COLLECTION", label: "Collections" },
] as const satisfies readonly { value: DefaultAccountType; label: string }[];

export const DefaultAccountTypeLabels: Record<DefaultAccountType, string> = {
  EXPENSE: "Expenses",
  COLLECTION: "Collections",
  FIXED_ASSET: "Fixed Asset",
};

export const DefaultAccountTypeFilterOptions = [
  { value: "", label: "All Accounts" },
  ...DefaultAccountTypeOptions,
] as const satisfies readonly { value: "" | DefaultAccountType; label: string }[];

export const DefaultAccountStatuses = {
  Active: "Active",
  Inactive: "Inactive",
} as const satisfies Record<string, DefaultAccountStatus>;

export const DefaultAccountStatusOptions = [
  DefaultAccountStatuses.Active,
  DefaultAccountStatuses.Inactive,
] as const satisfies readonly DefaultAccountStatus[];

export const DefaultAccountImportTemplateHeaders = ["Default Account Name", "Description", "Type"];

export const DefaultAccountImportAcceptedFileExtensions = ".xlsx,.csv,.tsv,.txt";
export const DefaultAccountImportAcceptedFileLabel = ".xlsx, .csv, .tsv, .txt";

export const DefaultAccountImportDefaultColumnIndexes: Record<DefaultAccountImportColumnId, number> = {
  defaultAccountName: 0,
  description: 1,
  type: 2,
};

export const DefaultAccountImportFieldOrder: DefaultAccountImportColumnId[] = ["defaultAccountName", "description", "type"];

export const DefaultAccountImportSelectionColumnWidth = ModuleImportFixedColumnsWidth;

export const DefaultAccountImportDefaultColumnWidths: DefaultAccountImportColumnWidths = {
  defaultAccountName: 240,
  description: 280,
  type: 176,
};

export const DefaultAccountImportColumnHeaders: DefaultAccountImportColumnHeader[] = [
  {
    className: "z-40 px-3",
    id: "defaultAccountName",
    label: "Default Account Name",
    stickyLeft: DefaultAccountImportSelectionColumnWidth,
  },
  { className: "px-3", id: "description", label: "Description" },
  { className: "px-3", id: "type", label: "Type" },
];

export const DefaultAccountImportPreviewColumnCount = DefaultAccountImportFieldOrder.length + 1;
export const DefaultAccountImportPreviewGridLabel = "Default account import preview grid. Paste copied Excel rows here.";
export const DefaultAccountImportPreviewPageSize = 20;
export const DefaultAccountImportBatchSize = 25;
export const DefaultAccountImportMinFileSizeBytes = 1;
export const DefaultAccountImportMaxFileSizeBytes = AppMaxFileUploadSizeBytes;

export const DefaultAccountActionCopy = {
  add: {
    title: "Add Default Account",
    description: "Create a reusable template and generate its linked Chart of Accounts records.",
  },
  edit: {
    title: "Edit Default Account",
    description: "Update the template and keep generated Chart of Accounts titles synchronized.",
  },
  view: {
    title: "View Default Account",
    description: "Review the generated accounts linked to this template.",
  },
} as const;

export const DefaultAccountExportColumns: ModuleTableExportColumn<DefaultAccount>[] = [
  {
    header: "Default Name",
    id: "defaultAccountName",
    value: "defaultAccountName",
  },
  { header: "Description", id: "description", value: "description" },
  {
    header: "Type",
    id: "type",
    value: (row) => DefaultAccountTypeLabels[row.type] ?? row.type,
  },
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
