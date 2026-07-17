import type { ColumnDef, Table } from "@tanstack/react-table";

export type UnitOfMeasurementStatus = "Active" | "Inactive";
export type UnitOfMeasurementQuantityMode = "Integer" | "Float";
export type UnitOfMeasurementDrawerMode = "add" | "edit" | "view";

export type UnitOfMeasurementRecord = {
	id: string;
	name: string;
	symbol: string;
	quantityMode: UnitOfMeasurementQuantityMode;
	status: UnitOfMeasurementStatus;
};

export type UnitOfMeasurementFormValues = Omit<UnitOfMeasurementRecord, "id">;

export type UnitOfMeasurementDrawerState = {
	mode: UnitOfMeasurementDrawerMode;
	record?: UnitOfMeasurementRecord;
} | null;

export type UnitOfMeasurementListPageState = {
	activeCount: number;
	decimalCount: number;
	drawer: UnitOfMeasurementDrawerState;
	filteredRecords: UnitOfMeasurementRecord[];
	query: string;
	records: UnitOfMeasurementRecord[];
	statusFilter: string;
	table: Table<UnitOfMeasurementRecord>;
	tableColumns: ColumnDef<UnitOfMeasurementRecord>[];
	closeDrawer: () => void;
	openAddDrawer: () => void;
	openEditDrawer: (record: UnitOfMeasurementRecord) => void;
	openViewDrawer: (record: UnitOfMeasurementRecord) => void;
	saveRecord: (values: UnitOfMeasurementFormValues) => void;
	setQuery: (value: string) => void;
	setStatusFilter: (value: string) => void;
	toggleStatus: (record: UnitOfMeasurementRecord) => void;
};
