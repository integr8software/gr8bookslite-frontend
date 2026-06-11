export type ResponsibilityCenterStatus = "Active" | "Inactive";

export type ResponsibilityCenterCategory =
	| "Corporate"
	| "Division"
	| "Department"
	| "Section"
	| "Team"
	| "Branch"
	| "Building"
	| "Project"
	| "Business Unit"
	| "Region";

export type ResponsibilityCenterFinancialType =
	| "Cost Center"
	| "Profit Center"
	| "Revenue Center"
	| "Investment Center";

export type ResponsibilityCenter = {
	id: string;
	code: string;
	name: string;
	category: ResponsibilityCenterCategory;
	financialType: ResponsibilityCenterFinancialType;
	manager: string;
	parentId?: string;
	status: ResponsibilityCenterStatus;
	description?: string;
	allowBudgetAllocation: boolean;
	allowExpensePosting: boolean;
	allowRevenuePosting: boolean;
	allowProjectAssignment: boolean;
	createdAt: string;
	updatedAt: string;
};

export type ResponsibilityCenterActionMode = "add" | "edit" | "view";

export type ResponsibilityCenterFormValues = {
	code: string;
	name: string;
	category: ResponsibilityCenterCategory;
	financialType: ResponsibilityCenterFinancialType;
	manager: string;
	parentId: string;
	status: ResponsibilityCenterStatus;
	description: string;
	allowBudgetAllocation: boolean;
	allowExpensePosting: boolean;
	allowRevenuePosting: boolean;
	allowProjectAssignment: boolean;
};

export type ResponsibilityCenterFormErrors = Partial<
	Record<keyof ResponsibilityCenterFormValues, string>
>;

export type ResponsibilityCenterTableColumnKey =
	| "code"
	| "name"
	| "category"
	| "parentId"
	| "financialType"
	| "manager"
	| "status";
