import type {
	ResponsibilityCenter,
	ResponsibilityCenterFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";

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
		createdAt: "2026-01-08T08:00:00.000Z",
		updatedAt: "2026-01-08T08:00:00.000Z",
	},
	{
		id: "rc-1002",
		code: "ADMIN",
		name: "Administration",
		category: "Department",
		financialType: "Cost Center",
		manager: "",
		parentId: "rc-1001",
		status: "Active",
		description: "Administrative expense accountability.",
		allowBudgetAllocation: true,
		allowExpensePosting: true,
		allowRevenuePosting: false,
		allowProjectAssignment: false,
		createdAt: "2026-01-10T08:00:00.000Z",
		updatedAt: "2026-01-10T08:00:00.000Z",
	},
	{
		id: "rc-1003",
		code: "SALES",
		name: "Sales",
		category: "Department",
		financialType: "Revenue Center",
		manager: "",
		parentId: "rc-1001",
		status: "Active",
		description: "Sales revenue accountability.",
		allowBudgetAllocation: true,
		allowExpensePosting: false,
		allowRevenuePosting: true,
		allowProjectAssignment: false,
		createdAt: "2026-01-12T08:00:00.000Z",
		updatedAt: "2026-01-12T08:00:00.000Z",
	},
	{
		id: "rc-1004",
		code: "OPS",
		name: "Operations",
		category: "Department",
		financialType: "Cost Center",
		manager: "",
		parentId: "rc-1001",
		status: "Active",
		description: "Operations expense accountability.",
		allowBudgetAllocation: true,
		allowExpensePosting: true,
		allowRevenuePosting: false,
		allowProjectAssignment: false,
		createdAt: "2026-01-14T08:00:00.000Z",
		updatedAt: "2026-01-14T08:00:00.000Z",
	},
	{
		id: "rc-1005",
		code: "WHSE",
		name: "Warehouse",
		category: "Department",
		financialType: "Cost Center",
		manager: "",
		parentId: "rc-1001",
		status: "Active",
		description: "Warehouse expense accountability.",
		allowBudgetAllocation: true,
		allowExpensePosting: true,
		allowRevenuePosting: false,
		allowProjectAssignment: false,
		createdAt: "2026-01-16T08:00:00.000Z",
		updatedAt: "2026-01-16T08:00:00.000Z",
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
	};
}

export function createResponsibilityCenterFromForm(
	values: ResponsibilityCenterFormValues,
): ResponsibilityCenter {
	const now = new Date().toISOString();

	return {
		id: `rc-${Date.now()}`,
		code: normalizeCode(values.code),
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
		createdAt: now,
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
		createdAt: center.createdAt,
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
