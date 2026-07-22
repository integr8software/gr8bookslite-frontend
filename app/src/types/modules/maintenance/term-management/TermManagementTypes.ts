import type { ChangeEventHandler } from "react";
import type { Row, Table } from "@tanstack/react-table";

export type TermManagementDatemode = "Day" | "Month" | "Year";

export type TermManagementStatus = "Active" | "Inactive";

export type TermManagementDatemodeFilter = "All" | TermManagementDatemode;

export type TermManagementStatusFilter = "" | TermManagementStatus;

export type ApiTermDateMode = "DAY" | "MONTH" | "YEAR";
export type ApiTermStatus = "ACTIVE" | "INACTIVE";

export type ApiTerm = {
	id: string;
	name: string;
	description: string | null;
	dateMode: ApiTermDateMode;
	period: number;
	status: ApiTermStatus;
	createdBy: string | null;
	createdAt: string;
	updatedBy: string | null;
	updatedAt: string;
};

export type TermManagement = {
	id: string;
	name: string;
	description: string;
	datemode: TermManagementDatemode;
	period: string;
	status: TermManagementStatus;
	createdBy?: string;
	createdAt?: string;
	updatedBy?: string | null;
	updatedAt?: string;
};

export type TermManagementFormValues = {
	name: string;
	description: string;
	datemode: TermManagementDatemode;
	period: string;
	status: TermManagementStatus;
};

export type TermManagementFormErrors = Partial<
	Record<keyof TermManagementFormValues, string>
>;

export type TermManagementActionMode = "add" | "edit" | "view";

export type TermManagementDrawerState =
	| {
			initialValues?: TermManagementFormValues;
			mode: TermManagementActionMode;
			term?: TermManagement;
	  }
	| null;

export type TermManagementDrawerProps = {
	initialValues?: TermManagementFormValues;
	isOpen: boolean;
	mode: TermManagementActionMode;
	onClose: () => void;
	term?: TermManagement;
};

export type TermManagementFieldsProps = {
	errors: TermManagementFormErrors;
	isReadonly: boolean;
	values: TermManagementFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
	onStatusChange: (value: TermManagementFormValues["status"]) => void;
};

export type TermManagementTableColumnKey =
	| "name"
	| "description"
	| "datemode"
	| "period"
	| "status"
	| "createdBy"
	| "createdAt"
	| "updatedBy"
	| "updatedAt";

export type TermManagementPermissions = {
	canView: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canExport: boolean;
	canImport: boolean;
};

export type TermManagementStatistics = {
	totalTerms: number;
	activeTerms: number;
	inactiveTerms: number;
	dayTerms: number;
	monthTerms: number;
	yearTerms: number;
};

export type TermManagementListResponse = {
	terms: TermManagement[];
	statistics: TermManagementStatistics;
	permissions: TermManagementPermissions;
};

export type TermManagementStatisticCardsProps = {
	statistics: TermManagementStatistics;
	isLoading?: boolean;
};

export type ApiTermListResponse = {
	terms: ApiTerm[];
	statistics: TermManagementStatistics;
	permissions: TermManagementPermissions;
};

export type ApiTermSaveResponse = {
	term: ApiTerm;
};

export type ApiTermImportResponse = {
	terms: ApiTerm[];
};

export type TermManagementTableProps = {
	datemodeFilter: TermManagementDatemodeFilter;
	filteredTerms: TermManagement[];
	hasActiveFilters: boolean;
	isLoading: boolean;
	isRefreshing: boolean;
	lastSyncedAt?: number | string | Date | null;
	query: string;
	statusFilter: TermManagementStatusFilter;
	terms: TermManagement[];
	permissions: TermManagementPermissions;
	onDatemodeFilterChange: (value: TermManagementDatemodeFilter) => void;
	onEditTerm: (term: TermManagement) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: TermManagementStatusFilter) => void;
	onToggleStatus: (term: TermManagement) => void;
	onViewTerm: (term: TermManagement) => void;
};

export type TermManagementTableRowProps = {
	row: Row<TermManagement>;
	permissions: TermManagementPermissions;
	onEditTerm: (term: TermManagement) => void;
	onToggleStatus: (term: TermManagement) => void;
	onViewTerm: (term: TermManagement) => void;
};

export type TermManagementTableFiltersProps = {
	datemodeFilter: TermManagementDatemodeFilter;
	exportAllRows: TermManagement[];
	exportFilteredRows: TermManagement[];
	hasActiveFilters: boolean;
	isRefreshing: boolean;
	permissions: TermManagementPermissions;
	query: string;
	statusFilter: TermManagementStatusFilter;
	table: Table<TermManagement>;
	onDatemodeFilterChange: (value: TermManagementDatemodeFilter) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: TermManagementStatusFilter) => void;
};

export type TermImportColumnId = "name" | "datemode" | "period";

export type TermImportColumnHeader = {
	className: string;
	id: TermImportColumnId;
	label: string;
	stickyLeft?: number;
};

export type TermImportColumnWidths = Record<TermImportColumnId, number>;

export type TermImportCellErrors = Partial<
	Record<TermImportColumnId, string[]>
>;

export type TermImportCellWarnings = Partial<
	Record<TermImportColumnId, string[]>
>;

export type TermImportPreviewRow = {
	cellErrors: TermImportCellErrors;
	cellWarnings: TermImportCellWarnings;
	id: string;
	rowErrors: string[];
	rowNumber: number;
	term: Omit<TermManagement, "id">;
};

export type TermImportProgress = {
	imported: number;
	total: number;
};

export type TermImportMode = "all-rows" | "all-valid" | "selected-valid";

export type ImportProgress = TermImportProgress;

export type TermManagementImportDialogProps = {
	existingTerms: TermManagement[];
	isOpen: boolean;
	onClose: () => void;
	onImportTerms: (terms: TermManagement[]) => Promise<TermManagement[]>;
};
