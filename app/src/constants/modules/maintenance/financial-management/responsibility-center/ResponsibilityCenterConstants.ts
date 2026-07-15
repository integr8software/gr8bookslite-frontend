import type {
	ResponsibilityCenterCategory,
	ResponsibilityCenterTypeDefinition,
	ResponsibilityCenterFinancialType,
	ResponsibilityCenter,
	ResponsibilityCenterStatus,
} from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const ResponsibilityCenterHref =
	"/maintenance/responsibility-center";

export const ResponsibilityCenterApiPath =
	"/maintenance/financial-management/responsibility-centers";

export const ResponsibilityCenterTablePaginationStorageKey =
	"maintenance:financial-management:responsibility-center";

export const ResponsibilityCenterDrawerFormId =
	"responsibility-center-drawer-form";

export const ResponsibilityCenterFieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";

export const ResponsibilityCenterTableColumns = [
	{
		key: "code",
		label: "Code",
		className: "w-[9rem]",
	},
	{
		key: "name",
		label: "Name",
		className: "w-[18rem]",
	},
	{
		key: "description",
		label: "Description",
		className: "w-[20rem]",
	},
	{
		key: "financialType",
		label: "Classification",
		className: "w-[12rem] text-center",
	},
	{
		key: "category",
		label: "Type",
		className: "w-[11rem] text-center",
	},
	{
		key: "parentId",
		label: "Parent Center",
		className: "w-[14rem]",
	},
	{
		key: "manager",
		label: "Manager",
		className: "w-[12rem]",
	},
	{
		key: "status",
		label: "Status",
		className: "w-[9rem] text-center",
	},
	{
		key: "createdBy",
		label: "Created By",
		className: "w-[12rem]",
	},
	{
		key: "createdAt",
		label: "Created At",
		className: "w-[12rem]",
	},
	{
		key: "updatedBy",
		label: "Updated By",
		className: "w-[12rem]",
	},
	{
		key: "updatedAt",
		label: "Updated At",
		className: "w-[12rem]",
	},
	{
		label: "Actions",
		className: "w-[9rem] text-center",
	},
] as const;

export const ResponsibilityCenterDefaultColumnOrder =
	ResponsibilityCenterTableColumns.map((column) =>
		"key" in column ? column.key : "actions",
	);

export const ResponsibilityCenterTreeColumnOrder =
	ResponsibilityCenterDefaultColumnOrder.filter(
		(columnId) => columnId !== "parentId",
	);

export const ResponsibilityCenterAuditColumnOrder = [
	"createdBy",
	"createdAt",
	"updatedBy",
	"updatedAt",
];

export const ResponsibilityCenterDefaultColumnVisibility = {
	code: false,
	description: false,
	createdBy: false,
	createdAt: false,
	updatedBy: false,
	updatedAt: false,
};

export const ResponsibilityCenterTreeColumnVisibility = {
	...ResponsibilityCenterDefaultColumnVisibility,
	parentId: false,
};

export const ResponsibilityCenterExportColumns: ModuleTableExportColumn<ResponsibilityCenter>[] =
	[
		{ id: "code", header: "Code", value: "code" },
		{ id: "name", header: "Name", value: "name" },
		{
			id: "description",
			header: "Description",
			value: (center) => center.description ?? "",
		},
		{
			id: "financialType",
			header: "Classification",
			value: "financialType",
		},
		{ id: "category", header: "Type", value: "category" },
		{ id: "manager", header: "Manager", value: "manager" },
		{ id: "status", header: "Status", value: "status" },
		{
			id: "createdBy",
			header: "Created By",
			value: (center) => center.createdBy ?? "",
		},
		{
			id: "createdAt",
			header: "Created At",
			value: "createdAt",
		},
		{
			id: "updatedBy",
			header: "Updated By",
			value: (center) => center.updatedBy ?? "",
		},
		{
			id: "updatedAt",
			header: "Updated At",
			value: "updatedAt",
		},
	];

export const ResponsibilityCenterCategoryOptions: ResponsibilityCenterCategory[] =
	[
		"Department",
		"Branch",
		"Project",
		"Business Unit",
		"Salesman",
		"Warehouse",
		"Division",
		"Region",
		"Corporate",
		"Section",
		"Team",
		"Building",
		"Outlet",
		"Sales Territory",
		"Fleet",
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

export const ResponsibilityCenterTypeDefinitions: ResponsibilityCenterTypeDefinition[] =
	[
		{
			type: "Department",
			origin: "User-defined",
			financialType: "Cost Center",
			sortOrder: 10,
			description: "Functional teams such as HR, Accounting, Sales, and IT.",
			reportExamples: [
				"Trial Balance by Department",
				"Budget vs Actual by Department",
			],
		},
		{
			type: "Branch",
			origin: "User-defined",
			financialType: "Profit Center",
			sortOrder: 20,
			description: "Locations or branches such as Cavite, Laguna, and Cebu.",
			reportExamples: [
				"Income Statement by Branch",
				"Profit and Loss per Branch",
			],
		},
		{
			type: "Project",
			origin: "User-defined",
			financialType: "Cost Center",
			sortOrder: 30,
			description: "Projects used for expense, revenue, and budget analysis.",
			reportExamples: ["Expenses by Project", "Project Budget vs Actual"],
		},
		{
			type: "Business Unit",
			origin: "User-defined",
			financialType: "Profit Center",
			sortOrder: 40,
			description: "Operating units such as Retail, Wholesale, and Export.",
			reportExamples: [
				"Profit by Business Unit",
				"Gross Profit Analysis",
			],
		},
		{
			type: "Salesman",
			origin: "User-defined",
			financialType: "Revenue Center",
			sortOrder: 90,
			description: "Salespeople used for sales and commission reporting.",
			reportExamples: ["Sales by Salesman", "Commission Reports"],
		},
		{
			type: "Warehouse",
			origin: "User-defined",
			financialType: "Cost Center",
			sortOrder: 100,
			description: "Warehouses for stock and operating cost accountability.",
			reportExamples: [
				"Warehouse Expense Analysis",
				"Inventory Movement by Warehouse",
			],
		},
		{
			type: "Division",
			origin: "User-defined",
			financialType: "Profit Center",
			sortOrder: 110,
			description: "High-level business divisions for rollup reporting.",
			reportExamples: ["Profit by Division", "Sales by Division"],
		},
		{
			type: "Region",
			origin: "User-defined",
			financialType: "Profit Center",
			sortOrder: 120,
			description: "Geographic responsibility groups such as NCR or Visayas.",
			reportExamples: ["Sales by Region", "Profit by Region"],
		},
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

export const ResponsibilityCenterTitle = "Responsibility Centers";
export const ResponsibilityCenterParentLabel = "Financial Maintenance";
export const ResponsibilityCenterDescription =
	"Manage responsibility center dimensions for accountability, reporting, and transaction tagging.";
