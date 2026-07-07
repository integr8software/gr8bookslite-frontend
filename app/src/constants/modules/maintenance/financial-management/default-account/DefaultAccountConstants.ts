import type {
	DefaultAccount,
	DefaultAccountStatus,
	DefaultAccountType,
} from "@/app/src/types/modules/maintenance/default-account/DefaultAccountTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const DefaultAccountHref = "/maintenance/default-account";

export const DefaultAccountApiPath =
	"/maintenance/financial-management/default-accounts";

export const DefaultAccountParentLabel = "Accounting master data";
export const DefaultAccountTitle = "Default Accounts";
export const DefaultAccountDescription =
	"Maintain reusable account templates that automatically create linked Chart of Accounts records.";

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
		className: "w-[14%]",
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
		className: "w-[11%]",
	},
	{
		label: "Action",
		className: "w-[18%] text-center",
	},
] as const;

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
