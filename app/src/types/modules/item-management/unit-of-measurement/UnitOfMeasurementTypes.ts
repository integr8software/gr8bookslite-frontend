import type { ChangeEventHandler } from "react";
import type { Row, Table } from "@tanstack/react-table";

export type UnitOfMeasurementStatus = "Active" | "Inactive";
export type UnitOfMeasurementQuantityMode = "Integer" | "Float";
export type ApiUnitOfMeasurementStatus = "ACTIVE" | "INACTIVE";
export type ApiUnitOfMeasurementQuantityMode = "INTEGER" | "FLOAT";
export type UnitOfMeasurementQuantityModeFilter =
	| "All"
	| UnitOfMeasurementQuantityMode;
export type UnitOfMeasurementDrawerMode = "add" | "edit" | "view";

export type UnitOfMeasurementRecord = {
	createdAt?: string;
	createdBy?: string | null;
	id: string;
	name: string;
	symbol: string;
	quantityMode: UnitOfMeasurementQuantityMode;
	status: UnitOfMeasurementStatus;
	updatedAt?: string;
	updatedBy?: string | null;
};

export type ApiUnitOfMeasurement = {
	createdAt: string;
	createdBy: string | null;
	id: string;
	name: string;
	symbol: string;
	quantityMode: ApiUnitOfMeasurementQuantityMode;
	status: ApiUnitOfMeasurementStatus;
	updatedAt: string;
	updatedBy: string | null;
};

export type UnitOfMeasurementPermissions = {
	canView: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canExport: boolean;
	canImport: boolean;
};

export type UnitOfMeasurementStatistics = {
	totalUnits: number;
	activeUnits: number;
	inactiveUnits: number;
	decimalUnits: number;
};

export type UnitOfMeasurementListResponse = {
	permissions: UnitOfMeasurementPermissions;
	records: UnitOfMeasurementRecord[];
	statistics: UnitOfMeasurementStatistics;
};

export type ApiUnitOfMeasurementListResponse = {
	permissions: UnitOfMeasurementPermissions;
	statistics: UnitOfMeasurementStatistics;
	units: ApiUnitOfMeasurement[];
};

export type ApiUnitOfMeasurementSaveResponse = {
	unit: ApiUnitOfMeasurement;
};

export type ApiUnitOfMeasurementImportResponse = {
	units: ApiUnitOfMeasurement[];
};

export type UnitOfMeasurementFormValues = Pick<
	UnitOfMeasurementRecord,
	"name" | "quantityMode" | "status" | "symbol"
>;

export type UnitOfMeasurementFormErrors = Partial<
	Record<keyof UnitOfMeasurementFormValues, string>
>;

export type UnitOfMeasurementTableColumnKey =
	| "createdAt"
	| "createdBy"
	| "name"
	| "symbol"
	| "quantityMode"
	| "status"
	| "updatedAt"
	| "updatedBy";

export type UnitOfMeasurementDrawerState = {
	mode: UnitOfMeasurementDrawerMode;
	initialValues?: UnitOfMeasurementFormValues;
	record?: UnitOfMeasurementRecord;
} | null;

export type UnitOfMeasurementListPageState = {
	activeCount: number;
	decimalCount: number;
	drawer: UnitOfMeasurementDrawerState;
	filteredRecords: UnitOfMeasurementRecord[];
	isLoading: boolean;
	isMutating: boolean;
	isRefreshing: boolean;
	lastSyncedAt: number;
	pendingStatusRecord: UnitOfMeasurementRecord | null;
	permissions: UnitOfMeasurementPermissions;
	quantityModeFilter: UnitOfMeasurementQuantityModeFilter;
	query: string;
	records: UnitOfMeasurementRecord[];
	statusFilter: string;
	table: Table<UnitOfMeasurementRecord>;
	closeDrawer: () => void;
	confirmStatusChange: () => void;
	openAddDrawer: () => void;
	openEditDrawer: (record: UnitOfMeasurementRecord) => void;
	openViewDrawer: (record: UnitOfMeasurementRecord) => void;
	importRecords: (
		records: UnitOfMeasurementRecord[],
	) => Promise<UnitOfMeasurementRecord[]>;
	refreshRecords: () => void;
	saveRecord: (values: UnitOfMeasurementFormValues) => Promise<void>;
	setQuantityModeFilter: (value: UnitOfMeasurementQuantityModeFilter) => void;
	setQuery: (value: string) => void;
	setPendingStatusRecord: (record: UnitOfMeasurementRecord | null) => void;
	setStatusFilter: (value: string) => void;
};

export type UnitOfMeasurementDrawerProps = {
	initialValues?: UnitOfMeasurementFormValues;
	isOpen: boolean;
	isSaving: boolean;
	mode: UnitOfMeasurementDrawerMode;
	onClose: () => void;
	onSave: (values: UnitOfMeasurementFormValues) => Promise<void>;
	record?: UnitOfMeasurementRecord;
};

export type UnitOfMeasurementFieldsProps = {
	errors: UnitOfMeasurementFormErrors;
	isReadonly: boolean;
	values: UnitOfMeasurementFormValues;
	onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
	onStatusChange: (value: UnitOfMeasurementFormValues["status"]) => void;
};

export type UnitOfMeasurementStatisticCardsProps = {
	isLoading?: boolean;
	statistics: UnitOfMeasurementStatistics;
};

export type UnitOfMeasurementTableProps = {
	filteredRecords: UnitOfMeasurementRecord[];
	hasActiveFilters: boolean;
	isLoading: boolean;
	isRefreshing: boolean;
	isSyncing: boolean;
	lastSyncedAt?: number | string | Date | null;
	permissions: UnitOfMeasurementPermissions;
	quantityModeFilter: UnitOfMeasurementQuantityModeFilter;
	query: string;
	records: UnitOfMeasurementRecord[];
	statusFilter: string;
	table: Table<UnitOfMeasurementRecord>;
	onEditRecord: (record: UnitOfMeasurementRecord) => void;
	onQuantityModeFilterChange: (value: UnitOfMeasurementQuantityModeFilter) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: string) => void;
	onToggleStatus: (record: UnitOfMeasurementRecord) => void;
	onViewRecord: (record: UnitOfMeasurementRecord) => void;
};

export type UnitOfMeasurementTableFiltersProps = {
	exportAllRows: UnitOfMeasurementRecord[];
	exportFilteredRows: UnitOfMeasurementRecord[];
	hasActiveFilters: boolean;
	isRefreshing: boolean;
	permissions: UnitOfMeasurementPermissions;
	quantityModeFilter: UnitOfMeasurementQuantityModeFilter;
	query: string;
	statusFilter: string;
	table: Table<UnitOfMeasurementRecord>;
	onQuantityModeFilterChange: (value: UnitOfMeasurementQuantityModeFilter) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: string) => void;
};

export type UnitOfMeasurementTableRowProps = {
	row: Row<UnitOfMeasurementRecord>;
	permissions: UnitOfMeasurementPermissions;
	onEdit: (record: UnitOfMeasurementRecord) => void;
	onToggleStatus: (record: UnitOfMeasurementRecord) => void;
	onView: (record: UnitOfMeasurementRecord) => void;
};

export type UnitOfMeasurementImportColumnId =
	| "name"
	| "symbol"
	| "quantityMode";

export type UnitOfMeasurementImportColumnHeader = {
	className: string;
	id: UnitOfMeasurementImportColumnId;
	label: string;
	stickyLeft?: number;
};

export type UnitOfMeasurementImportColumnWidths = Record<
	UnitOfMeasurementImportColumnId,
	number
>;

export type UnitOfMeasurementImportCellErrors = Partial<
	Record<UnitOfMeasurementImportColumnId, string[]>
>;

export type UnitOfMeasurementImportCellWarnings = Partial<
	Record<UnitOfMeasurementImportColumnId, string[]>
>;

export type UnitOfMeasurementImportPreviewRow = {
	cellErrors: UnitOfMeasurementImportCellErrors;
	cellWarnings: UnitOfMeasurementImportCellWarnings;
	id: string;
	rowErrors: string[];
	rowNumber: number;
	record: Omit<UnitOfMeasurementRecord, "id">;
};

export type UnitOfMeasurementImportProgress = {
	imported: number;
	total: number;
};

export type UnitOfMeasurementImportMode =
	| "all-rows"
	| "all-valid"
	| "selected-valid";

export type UnitOfMeasurementImportDialogProps = {
	existingRecords: UnitOfMeasurementRecord[];
	isOpen: boolean;
	onClose: () => void;
	onImportRecords: (
		records: UnitOfMeasurementRecord[],
	) => Promise<UnitOfMeasurementRecord[]>;
};
