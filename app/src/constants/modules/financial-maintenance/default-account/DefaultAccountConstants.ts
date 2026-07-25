import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
	DefaultAccount,
	DefaultAccountStatus,
	DefaultAccountType,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const DefaultAccountHref = MODULE_ROUTE_MAP.DA;

export const DefaultAccountApiPath =
	"/maintenance/financial-management/default-accounts";

export const DefaultAccountParentLabel = "Accounting master data";
export const DefaultAccountTitle = "Default Accounts";
export const DefaultAccountDescription =
	"Maintain reusable account templates that automatically create linked Chart of Accounts records.";

export const DefaultAccountDrawerFormId = "default-account-drawer-form";

export const DefaultAccountTablePaginationStorageKey =
	"maintenance:financial-management:default-account";

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
	{
		key: "status",
		label: "Status",
		className: "w-[11%] text-center",
	},
	{ key: "createdBy", label: "Created By", className: "w-[14%]" },
	{ key: "createdAt", label: "Date Created", className: "w-[16%]" },
	{ key: "updatedBy", label: "Updated By", className: "w-[14%]" },
	{ key: "updatedAt", label: "Date Modified", className: "w-[16%]" },
	{
		label: "Action",
		className: "w-[18%] text-center",
	},
] as const;

export const DefaultAccountTablePreferencesStorageKey =
	"gr8booksneo:default-account:table-preferences";
export const DefaultAccountTablePreferencesModuleKey =
	"maintenance:default-account";
export const DefaultAccountDefaultColumnOrder = DefaultAccountTableColumns.map(
	(column) => ("key" in column ? column.key : "actions"),
);
export const DefaultAccountDefaultColumnVisibility: VisibilityState = {
	description: false,
	accountCode: false,
	createdBy: false,
	createdAt: false,
	updatedBy: false,
	updatedAt: false,
};
export const DefaultAccountDefaultSorting: SortingState = [
	{ id: "defaultAccountName", desc: false },
];

export const DefaultAccountTypeOptions = [
	{ value: "EXPENSE", label: "Expense Type" },
	{ value: "COLLECTION", label: "Collection Type" },
	{ value: "FIXED_ASSET", label: "Fixed Asset Type" },
] as const satisfies readonly { value: DefaultAccountType; label: string }[];

export const DefaultAccountStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly DefaultAccountStatus[];

export const DefaultAccountActionCopy = {
	add: {
		title: "Add Default Account",
		description:
			"Create a reusable template and generate its linked Chart of Accounts records.",
	},
	edit: {
		title: "Edit Default Account",
		description:
			"Update the template and keep generated Chart of Accounts titles synchronized.",
	},
	view: {
		title: "View Default Account",
		description: "Review the generated accounts linked to this template.",
	},
} as const;

export const DefaultAccountExportColumns: ModuleTableExportColumn<DefaultAccount>[] =
	[
		{
			header: "Default Name",
			id: "defaultAccountName",
			value: "defaultAccountName",
		},
		{ header: "Description", id: "description", value: "description" },
		{
			header: "Type",
			id: "type",
			value: (row) => getDefaultAccountTypeLabel(row.type),
		},
		{ header: "Status", id: "status", value: "status" },
		{
			header: "Account Code",
			id: "accountCode",
			value: (row) =>
				row.generatedAccounts.map((account) => account.accountCode).join("; "),
		},
		{
			header: "Account Name",
			id: "accountName",
			value: (row) =>
				row.generatedAccounts
					.map((account) => account.accountTitle)
					.join("; "),
		},
	];

export function getDefaultAccountTypeLabel(type: DefaultAccountType) {
	return (
		DefaultAccountTypeOptions.find((option) => option.value === type)?.label ??
		type
	);
}
