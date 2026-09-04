import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
  BankImportColumnId,
  BankMasterfile,
  BankMasterfileStatus,
} from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";
import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const BankMasterfileHref = getModuleRoute("BM");

export const BankMasterfileApiPath = "/maintenance/financial-management/bank-masterfile";

export const BankMasterfileParentLabel = "Accounting master data";

export const BankMasterfileTitle = "Bank Masterfile";

export const BankMasterfileCashInBankAccountTitle = "Cash in Bank";

export const BankMasterfileDescription = "Maintain company bank accounts and their linked Cash in Bank chart accounts.";

export const BankMasterfileDrawerFormId = "bank-masterfile-drawer-form";

export const BankMasterfileTablePaginationStorageKey = "maintenance:financial-management:bank-masterfile";

export const BankMasterfileTableColumns = [
  { key: "bankName", label: "Bank Name", className: "w-[16%]" },
  { key: "branch", label: "Branch", className: "w-[16%]" },
  { key: "accountNumber", label: "Account Number", className: "w-[16%]" },
  { key: "accountCode", label: "Account Code", className: "w-[13%]" },
  { key: "accountTitle", label: "Account Title", className: "w-[26%]" },
  { key: "currencyCode", label: "Currency", className: "w-[10%]" },
  { key: "isDefault", label: "Default", className: "w-[10%] text-center" },
  { key: "createdBy", label: "Created By", className: "w-[14%]" },
  { key: "createdAt", label: "Date Created", className: "w-[16%]" },
  { key: "updatedBy", label: "Updated By", className: "w-[14%]" },
  { key: "updatedAt", label: "Date Modified", className: "w-[16%]" },
  { key: "status", label: "Status", className: "w-[11%] text-center" },
  { label: "Action", className: "w-[16%] text-center" },
] as const;

export const BankMasterfileTablePreferencesStorageKey = "gr8booksneo:bank-masterfile:table-preferences";
export const BankMasterfileTablePreferencesModuleKey = "maintenance:bank-masterfile";
export const BankMasterfileDefaultColumnOrder = BankMasterfileTableColumns.map((column) => ("key" in column ? column.key : "actions"));
export const BankMasterfileDefaultColumnVisibility: VisibilityState = {
  accountCode: false,
  currencyCode: false,
  createdBy: false,
  createdAt: false,
  isDefault: false,
  updatedBy: false,
  updatedAt: false,
};
export const BankMasterfileDefaultSorting: SortingState = [{ id: "bankName", desc: false }];

export const BankMasterfileStatuses = {
  Active: "Active",
  Inactive: "Inactive",
} as const satisfies Record<string, BankMasterfileStatus>;

export const BankMasterfileStatusOptions = [
  BankMasterfileStatuses.Active,
  BankMasterfileStatuses.Inactive,
] as const satisfies readonly BankMasterfileStatus[];

export const BankMasterfileDefaultBankSwitchOption = {
  label: "Yes",
  value: true,
} as const;

export const BankMasterfileNotDefaultBankSwitchOption = {
  label: "No",
  value: false,
} as const;

export const BankMasterfileAccountTypeOptions = ["Checking", "Savings", "Current", "Time Deposit", "Credit Card"] as const;

export const BankMasterfileExportColumns: ModuleTableExportColumn<BankMasterfile>[] = [
  ...BankMasterfileTableColumns.flatMap((column) =>
    "key" in column
      ? [
          {
            header: column.label,
            id: column.key,
            value: column.key,
          },
        ]
      : [],
  ),
];

export const BankMasterfileBankNamePlaceholder = "Bank name";

export const BankMasterfileActionCopy = {
  add: {
    title: "Add Bank",
    description: "Create a bank account and link it to Cash in Bank in the Chart of Accounts.",
  },
  edit: {
    title: "Edit Bank",
    description: "Update bank details and keep the linked Cash in Bank chart account synchronized.",
  },
  view: {
    title: "View Bank",
    description: "Review the bank account details before making changes.",
  },
} as const;

export const BankImportTemplateHeaders = [
  "Bank Name",
  "Branch",
  "Account Number",
  "Account Type",
  "Currency",
  "Series Start",
  "Series End",
  "Series Digits",
] as const;

export const BankImportTemplateSampleRow = [
  BankMasterfileBankNamePlaceholder,
  "Main Branch",
  "1234567890",
  "Checking",
  "PHP",
  "",
  "",
  "",
] as const;

export const BankImportFieldOrder: BankImportColumnId[] = [
  "bankName",
  "branch",
  "accountNumber",
  "accountType",
  "currencyCode",
  "seriesStart",
  "seriesEnd",
  "seriesDigits",
];
