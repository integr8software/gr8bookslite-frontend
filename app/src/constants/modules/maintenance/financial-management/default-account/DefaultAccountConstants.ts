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
		key: "description",
		label: "Description",
		className: "w-[24%]",
	},
	{
		key: "type",
		label: "Type",
		className: "w-[15%]",
	},
	{
		key: "generatedAccounts",
		label: "Generated Accounts",
		className: "w-[34%]",
	},
	{
		key: "status",
		label: "Status",
		className: "w-[11%]",
	},
	{
		key: "createdAt",
		label: "Date Created",
		className: "w-[16%]",
	},
	{
		key: "updatedAt",
		label: "Date Modified",
		className: "w-[16%]",
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
		{ header: "Description", id: "description", value: "description" },
		{
			header: "Type",
			id: "type",
			value: (row) => getDefaultAccountTypeLabel(row.type),
		},
		{ header: "Status", id: "status", value: "status" },
		{
			header: "Generated Accounts",
			id: "generated",
			value: (row) =>
				row.generatedAccounts
					.map((account) => `${account.accountCode} ${account.accountTitle}`)
					.join("; "),
		},
	];

export function getDefaultAccountTypeLabel(type: DefaultAccountType) {
	return (
		DefaultAccountTypeOptions.find((option) => option.value === type)?.label ??
		type
	);
}
