import type { ChangeEventHandler } from "react";
import type { Row, Table } from "@tanstack/react-table";

export type ResponsibilityCenterStatus = "Active" | "Inactive";
export type ResponsibilityCenterStatusFilter = "" | ResponsibilityCenterStatus;

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
	| "Region"
	| "Salesman"
	| "Warehouse"
	| "Outlet"
	| "Sales Territory"
	| "Fleet";

export type ResponsibilityCenterFinancialType =
	| "Cost Center"
	| "Profit Center"
	| "Revenue Center"
	| "Investment Center";

export type ResponsibilityCenterTypeOrigin = "Standard" | "User-defined";

export type ResponsibilityCenterAssignmentLevel =
	| "Header Only"
	| "Header and Line";

export type ResponsibilityCenterTypeDefinition = {
	type: ResponsibilityCenterCategory;
	origin: ResponsibilityCenterTypeOrigin;
	financialType: ResponsibilityCenterFinancialType;
	isEnabled: boolean;
	isRequiredInTransactions: boolean;
	assignmentLevel: ResponsibilityCenterAssignmentLevel;
	sortOrder: number;
	description: string;
	reportExamples: string[];
};

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
	isRequiredInTransactions: boolean;
	allowLineLevelAssignment: boolean;
	createdBy?: string;
	createdAt: string;
	updatedBy?: string | null;
	updatedAt: string;
};

export type ResponsibilityCenterActionMode = "add" | "edit" | "view";

export type ResponsibilityCenterDrawerState =
	| {
			center?: ResponsibilityCenter;
			initialValues?: ResponsibilityCenterFormValues;
			mode: ResponsibilityCenterActionMode;
	  }
	| null;

export type ResponsibilityCenterDrawerProps = {
	center?: ResponsibilityCenter;
	isOpen: boolean;
	mode: ResponsibilityCenterActionMode;
	onClose: () => void;
};

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
	isRequiredInTransactions: boolean;
	allowLineLevelAssignment: boolean;
};

export type ResponsibilityCenterFormErrors = Partial<
	Record<keyof ResponsibilityCenterFormValues, string>
>;

export type ResponsibilityCenterTableColumnKey =
	| "name"
	| "code"
	| "description"
	| "category"
	| "parentId"
	| "financialType"
	| "manager"
	| "status"
	| "createdBy"
	| "createdAt"
	| "updatedBy"
	| "updatedAt";

export type ResponsibilityCenterPermissions = {
	canView: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canExport: boolean;
};

export type ResponsibilityCenterStatistics = {
	totalCenters: number;
	activeCenters: number;
	inactiveCenters: number;
	departmentCenters: number;
	branchCenters: number;
	projectCenters: number;
};

export type ResponsibilityCenterFieldsProps = {
	errors: ResponsibilityCenterFormErrors;
	isReadonly: boolean;
	parentOptions: ResponsibilityCenter[];
	values: ResponsibilityCenterFormValues;
	onFieldChange: (
		field: keyof ResponsibilityCenterFormValues,
		value: ResponsibilityCenterFormValues[keyof ResponsibilityCenterFormValues],
	) => void;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
};

export type ResponsibilityCenterTableProps = {
	categoryFilter: string;
	filteredCenters: ResponsibilityCenter[];
	financialTypeFilter: string;
	hasActiveFilters: boolean;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt?: number | string | Date | null;
	permissions: ResponsibilityCenterPermissions;
	query: string;
	statusFilter: ResponsibilityCenterStatusFilter;
	centers: ResponsibilityCenter[];
	onCategoryFilterChange: (value: string) => void;
	onEditCenter: (center: ResponsibilityCenter) => void;
	onFinancialTypeFilterChange: (value: string) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: ResponsibilityCenterStatusFilter) => void;
	onToggleStatus: (center: ResponsibilityCenter) => void;
	onViewCenter: (center: ResponsibilityCenter) => void;
};

export type ResponsibilityCenterTableFiltersProps = {
	categoryFilter: string;
	exportAllRows: ResponsibilityCenter[];
	exportFilteredRows: ResponsibilityCenter[];
	financialTypeFilter: string;
	hasActiveFilters: boolean;
	isRefreshing: boolean;
	permissions: ResponsibilityCenterPermissions;
	query: string;
	statusFilter: ResponsibilityCenterStatusFilter;
	table: Table<ResponsibilityCenter>;
	onCategoryFilterChange: (value: string) => void;
	onFinancialTypeFilterChange: (value: string) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: ResponsibilityCenterStatusFilter) => void;
};

export type ResponsibilityCenterTableRowProps = {
	allCenters: ResponsibilityCenter[];
	permissions: ResponsibilityCenterPermissions;
	row: Row<ResponsibilityCenter>;
	onEditCenter: (center: ResponsibilityCenter) => void;
	onToggleStatus: (center: ResponsibilityCenter) => void;
	onViewCenter: (center: ResponsibilityCenter) => void;
};
