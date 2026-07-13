import type {
	ResponsibilityCenter,
	ResponsibilityCenterFormValues,
} from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";

export const ResponsibilityCenterInitialFormValues: ResponsibilityCenterFormValues =
	{
		code: "",
		name: "",
		category: "Department",
		financialType: "Cost Center",
		manager: "",
		parentId: "",
		status: "Active",
		description: "",
		allowBudgetAllocation: true,
		allowExpensePosting: true,
		allowRevenuePosting: false,
		allowProjectAssignment: false,
		isRequiredInTransactions: false,
		allowLineLevelAssignment: true,
	};

export const MockResponsibilityCenters: ResponsibilityCenter[] = [
	{
		id: "rc-1001",
		code: "MYCO",
		name: "My Company",
		category: "Corporate",
		financialType: "Investment Center",
		manager: "",
		status: "Active",
		description: "Top-level company accountability and reporting oversight.",
		allowBudgetAllocation: true,
		allowExpensePosting: true,
		allowRevenuePosting: true,
		allowProjectAssignment: true,
		isRequiredInTransactions: false,
		allowLineLevelAssignment: false,
		createdBy: "System",
		createdAt: "2026-01-08T08:00:00.000Z",
		updatedBy: "System",
		updatedAt: "2026-01-08T08:00:00.000Z",
	},
	{
		id: "rc-1002",
		code: "OPS",
		name: "Operations",
		category: "Department",
		financialType: "Cost Center",
		manager: "Juan Dela Cruz",
		parentId: "rc-1001",
		status: "Active",
		description: "Operating expense accountability and department rollups.",
		allowBudgetAllocation: true,
		allowExpensePosting: true,
		allowRevenuePosting: false,
		allowProjectAssignment: false,
		isRequiredInTransactions: false,
		allowLineLevelAssignment: true,
		createdBy: "System",
		createdAt: "2026-01-10T08:00:00.000Z",
		updatedBy: "Juan Dela Cruz",
		updatedAt: "2026-01-10T08:00:00.000Z",
	},
	{
		id: "rc-1003",
		code: "SALES",
		name: "Sales Department",
		category: "Department",
		financialType: "Revenue Center",
		manager: "Maria Santos",
		parentId: "rc-1002",
		status: "Active",
		description: "Sales revenue accountability.",
		allowBudgetAllocation: true,
		allowExpensePosting: false,
		allowRevenuePosting: true,
		allowProjectAssignment: false,
		isRequiredInTransactions: false,
		allowLineLevelAssignment: true,
		createdBy: "System",
		createdAt: "2026-01-12T08:00:00.000Z",
		updatedBy: "Maria Santos",
		updatedAt: "2026-01-12T08:00:00.000Z",
	},
	{
		id: "rc-1004",
		code: "CAVITE",
		name: "Cavite Branch",
		category: "Branch",
		financialType: "Profit Center",
		manager: "Ana Reyes",
		parentId: "rc-1001",
		status: "Active",
		description: "Branch-level profit center for Cavite operations.",
		allowBudgetAllocation: true,
		allowExpensePosting: true,
		allowRevenuePosting: true,
		allowProjectAssignment: true,
		isRequiredInTransactions: true,
		allowLineLevelAssignment: true,
		createdBy: "System",
		createdAt: "2026-01-14T08:00:00.000Z",
		updatedBy: "Ana Reyes",
		updatedAt: "2026-01-14T08:00:00.000Z",
	},
	{
		id: "rc-1005",
		code: "MAIN-WHSE",
		name: "Main Warehouse",
		category: "Warehouse",
		financialType: "Cost Center",
		manager: "Leo Garcia",
		parentId: "rc-1002",
		status: "Active",
		description: "Warehouse expense accountability.",
		allowBudgetAllocation: true,
		allowExpensePosting: true,
		allowRevenuePosting: false,
		allowProjectAssignment: false,
		isRequiredInTransactions: false,
		allowLineLevelAssignment: true,
		createdBy: "System",
		createdAt: "2026-01-16T08:00:00.000Z",
		updatedBy: "Leo Garcia",
		updatedAt: "2026-01-16T08:00:00.000Z",
	},
	{
		id: "rc-1006",
		code: "RETAIL",
		name: "Retail Business Unit",
		category: "Business Unit",
		financialType: "Profit Center",
		manager: "Liza Lim",
		parentId: "rc-1001",
		status: "Active",
		description: "Retail sales and margin accountability.",
		allowBudgetAllocation: true,
		allowExpensePosting: true,
		allowRevenuePosting: true,
		allowProjectAssignment: true,
		isRequiredInTransactions: false,
		allowLineLevelAssignment: true,
		createdBy: "System",
		createdAt: "2026-01-18T08:00:00.000Z",
		updatedBy: "Liza Lim",
		updatedAt: "2026-01-18T08:00:00.000Z",
	},
	{
		id: "rc-1007",
		code: "MALL-RENO",
		name: "Mall Renovation",
		category: "Project",
		financialType: "Cost Center",
		manager: "Carlo Cruz",
		parentId: "rc-1002",
		status: "Active",
		description: "Project-level cost tracking for mall renovation work.",
		allowBudgetAllocation: true,
		allowExpensePosting: true,
		allowRevenuePosting: false,
		allowProjectAssignment: true,
		isRequiredInTransactions: false,
		allowLineLevelAssignment: true,
		createdBy: "System",
		createdAt: "2026-01-20T08:00:00.000Z",
		updatedBy: "Carlo Cruz",
		updatedAt: "2026-01-20T08:00:00.000Z",
	},
	{
		id: "rc-1008",
		code: "PEDRO",
		name: "Pedro Salesman",
		category: "Salesman",
		financialType: "Revenue Center",
		manager: "Maria Santos",
		parentId: "rc-1003",
		status: "Active",
		description: "Salesperson dimension for revenue and commission reports.",
		allowBudgetAllocation: false,
		allowExpensePosting: false,
		allowRevenuePosting: true,
		allowProjectAssignment: false,
		isRequiredInTransactions: false,
		allowLineLevelAssignment: true,
		createdBy: "System",
		createdAt: "2026-01-22T08:00:00.000Z",
		updatedBy: "Maria Santos",
		updatedAt: "2026-01-22T08:00:00.000Z",
	},
];

export function createResponsibilityCenterFormValues(
	center: ResponsibilityCenter,
): ResponsibilityCenterFormValues {
	return {
		code: center.code,
		name: center.name,
		category: center.category,
		financialType: center.financialType,
		manager: center.manager,
		parentId: center.parentId ?? "",
		status: center.status,
		description: center.description ?? "",
		allowBudgetAllocation: center.allowBudgetAllocation,
		allowExpensePosting: center.allowExpensePosting,
		allowRevenuePosting: center.allowRevenuePosting,
		allowProjectAssignment: center.allowProjectAssignment,
		isRequiredInTransactions: center.isRequiredInTransactions,
		allowLineLevelAssignment: center.allowLineLevelAssignment,
	};
}

export function createResponsibilityCenterFromForm(
	values: ResponsibilityCenterFormValues,
): ResponsibilityCenter {
	const now = new Date().toISOString();

	return {
		id: `rc-${Date.now()}`,
		code: normalizeCode(values.code || values.name),
		name: values.name.trim(),
		category: values.category,
		financialType: values.financialType,
		manager: values.manager.trim(),
		parentId: optionalTrim(values.parentId),
		status: values.status,
		description: optionalTrim(values.description),
		allowBudgetAllocation: values.allowBudgetAllocation,
		allowExpensePosting: values.allowExpensePosting,
		allowRevenuePosting: values.allowRevenuePosting,
		allowProjectAssignment: values.allowProjectAssignment,
		isRequiredInTransactions: values.isRequiredInTransactions,
		allowLineLevelAssignment: values.allowLineLevelAssignment,
		createdBy: "Current User",
		createdAt: now,
		updatedBy: "Current User",
		updatedAt: now,
	};
}

export function updateResponsibilityCenterFromForm(
	center: ResponsibilityCenter,
	values: ResponsibilityCenterFormValues,
): ResponsibilityCenter {
	return {
		...createResponsibilityCenterFromForm(values),
		id: center.id,
		createdBy: center.createdBy,
		createdAt: center.createdAt,
		updatedBy: "Current User",
		updatedAt: new Date().toISOString(),
	};
}

function normalizeCode(value: string) {
	return value.trim().replace(/\s+/g, "-").toUpperCase();
}

function optionalTrim(value: string) {
	const trimmedValue = value.trim();

	return trimmedValue || undefined;
}

export function getResponsibilityCenterTableMinWidthClassName(
	visibleColumnCount: number,
) {
	if (visibleColumnCount >= 13) return "min-w-[168rem]";
	if (visibleColumnCount === 12) return "min-w-[156rem]";
	if (visibleColumnCount === 11) return "min-w-[144rem]";
	if (visibleColumnCount === 10) return "min-w-[132rem]";
	if (visibleColumnCount === 9) return "min-w-[120rem]";
	if (visibleColumnCount === 8) return "min-w-[108rem]";
	if (visibleColumnCount === 7) return "min-w-[96rem]";
	return "min-w-[82rem]";
}
