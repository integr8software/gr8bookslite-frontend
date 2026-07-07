import type { ChangeEventHandler } from "react";
import type { Row, Table } from "@tanstack/react-table";
import type { TermManagementPermissions } from "@/app/src/services/modules/maintenance/term-management/TermManagementApi";

export type TermManagementDatemode = "Day" | "Month" | "Year";

export type TermManagementStatus = "Active" | "Inactive";

export type TermManagementDatemodeFilter = "All" | TermManagementDatemode;

export type TermManagementStatusFilter = "" | TermManagementStatus;

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
