import type { ReactNode } from "react";
import type { Row, Table } from "@tanstack/react-table";

export type ResponsibilityCenterStatus = "Active" | "Inactive";
export type ResponsibilityCenterStatusFilter = "" | ResponsibilityCenterStatus;
export type ResponsibilityCenterViewMode = "tree" | "list";

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

export type ResponsibilityCenterTypeDefinition = {
	type: ResponsibilityCenterCategory;
	origin: ResponsibilityCenterTypeOrigin;
	financialType: ResponsibilityCenterFinancialType;
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
	createdBy?: string;
	createdAt: string;
	updatedBy?: string | null;
	updatedAt: string;
};

export type ResponsibilityCenterTreeNode = ResponsibilityCenter & {
	children: ResponsibilityCenterTreeNode[];
};

export type FlattenedResponsibilityCenterTreeNode = {
	center: ResponsibilityCenter;
	childrenCount: number;
	level: number;
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

export type ApiResponsibilityCenterCategory =
	| "CORPORATE"
	| "DIVISION"
	| "DEPARTMENT"
	| "SECTION"
	| "TEAM"
	| "BRANCH"
	| "BUILDING"
	| "PROJECT"
	| "BUSINESS_UNIT"
	| "REGION"
	| "SALESMAN"
	| "WAREHOUSE"
	| "OUTLET"
	| "SALES_TERRITORY"
	| "FLEET";

export type ApiResponsibilityCenterFinancialType =
	| "COST_CENTER"
	| "PROFIT_CENTER"
	| "REVENUE_CENTER"
	| "INVESTMENT_CENTER";

export type ApiResponsibilityCenterStatus = "ACTIVE" | "INACTIVE";

export type ApiResponsibilityCenter = {
	id: string;
	code: string;
	name: string;
	category: ApiResponsibilityCenterCategory;
	financialType: ApiResponsibilityCenterFinancialType;
	manager: string | null;
	parentId: string | null;
	parentName: string | null;
	status: ApiResponsibilityCenterStatus;
	description: string | null;
	createdBy: string | null;
	createdAt: string;
	updatedBy: string | null;
	updatedAt: string;
};

export type ApiResponsibilityCenterListResponse = {
	centers: ApiResponsibilityCenter[];
	statistics: ResponsibilityCenterStatistics;
	permissions: ResponsibilityCenterPermissions;
};

export type ApiResponsibilityCenterSaveResponse = {
	message: string;
	center: ApiResponsibilityCenter;
};

export type ResponsibilityCenterListResponse = {
	centers: ResponsibilityCenter[];
	statistics: ResponsibilityCenterStatistics;
	permissions: ResponsibilityCenterPermissions;
};

export type ResponsibilityCenterTableProps = {
	categoryFilter: string;
	filteredCenters: ResponsibilityCenter[];
	financialTypeFilter: string;
	hasActiveFilters: boolean;
	expandedTreeIds: Set<string>;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt?: number | string | Date | null;
	permissions: ResponsibilityCenterPermissions;
	query: string;
	statusFilter: ResponsibilityCenterStatusFilter;
	treeTable: Table<FlattenedResponsibilityCenterTreeNode>;
	viewMode: ResponsibilityCenterViewMode;
	centers: ResponsibilityCenter[];
	onCategoryFilterChange: (value: string) => void;
	onEditCenter: (center: ResponsibilityCenter) => void;
	onFinancialTypeFilterChange: (value: string) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: ResponsibilityCenterStatusFilter) => void;
	onToggleStatus: (center: ResponsibilityCenter) => void;
	onToggleTreeNode: (centerId: string) => void;
	onViewCenter: (center: ResponsibilityCenter) => void;
	onViewModeChange: (viewMode: ResponsibilityCenterViewMode) => void;
};

export type ResponsibilityCenterTreeProps = {
	expandedIds: Set<string>;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt?: number | string | Date | null;
	permissions: ResponsibilityCenterPermissions;
	table: Table<FlattenedResponsibilityCenterTreeNode>;
	toolbar: ReactNode;
	onEditCenter: (center: ResponsibilityCenter) => void;
	onToggleStatus: (center: ResponsibilityCenter) => void;
	onToggleTreeNode: (centerId: string) => void;
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
	table: Table<ResponsibilityCenter> | Table<FlattenedResponsibilityCenterTreeNode>;
	viewMode: ResponsibilityCenterViewMode;
	onCategoryFilterChange: (value: string) => void;
	onFinancialTypeFilterChange: (value: string) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: ResponsibilityCenterStatusFilter) => void;
	onViewModeChange: (viewMode: ResponsibilityCenterViewMode) => void;
};

export type ResponsibilityCenterTableRowProps = {
	allCenters: ResponsibilityCenter[];
	permissions: ResponsibilityCenterPermissions;
	row: Row<ResponsibilityCenter>;
	onEditCenter: (center: ResponsibilityCenter) => void;
	onToggleStatus: (center: ResponsibilityCenter) => void;
	onViewCenter: (center: ResponsibilityCenter) => void;
};
