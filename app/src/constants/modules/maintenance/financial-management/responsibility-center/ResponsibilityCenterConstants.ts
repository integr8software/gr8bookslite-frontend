import type {
	ResponsibilityCenterCategory,
	ResponsibilityCenterFinancialType,
	ResponsibilityCenterStatus,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";

export const ResponsibilityCenterHref =
	"/maintenance/responsibility-center";

export const ResponsibilityCenterTablePaginationStorageKey =
	"maintenance:financial-management:responsibility-center";

export const ResponsibilityCenterTableColumns = [
	{
		key: "name",
		label: "Name",
		className: "w-[36%] text-center",
	},
	{
		key: "category",
		label: "Category",
		className: "w-[11%]",
	},
	{
		key: "parentId",
		label: "Parent Center",
		className: "w-[14%]",
	},
	{
		key: "financialType",
		label: "Financial Type",
		className: "w-[13%]",
	},
	{
		key: "manager",
		label: "Manager",
		className: "w-[11%]",
	},
	{
		key: "status",
		label: "Status",
		className: "w-[7%]",
	},
	{
		label: "Actions",
		className: "w-[7%] text-center",
	},
] as const;

export const ResponsibilityCenterCategoryOptions: ResponsibilityCenterCategory[] =
	[
		"Corporate",
		"Division",
		"Department",
		"Section",
		"Team",
		"Branch",
		"Building",
		"Project",
		"Business Unit",
		"Region",
	];

export const ResponsibilityCenterFinancialTypeOptions: ResponsibilityCenterFinancialType[] = [
	"Cost Center",
	"Revenue Center",
	"Profit Center",
	"Investment Center",
];

export const ResponsibilityCenterStatusOptions: ResponsibilityCenterStatus[] = [
	"Active",
	"Inactive",
];

export const ResponsibilityCenterActionCopy = {
	add: {
		title: "Add Responsibility Center",
		description:
			"Create an organizational unit for accountability, budgeting, and financial reporting.",
	},
	edit: {
		title: "Edit Responsibility Center",
		description:
			"Update center ownership, hierarchy, and reporting status.",
	},
	view: {
		title: "View Responsibility Center",
		description:
			"Review organizational hierarchy and financial accountability settings.",
	},
} as const;
