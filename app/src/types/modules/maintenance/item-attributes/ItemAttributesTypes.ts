import type { ReactNode } from "react";
import type { ColumnDef, Table } from "@tanstack/react-table";

export type ItemAttributeStatus = "Active" | "Inactive";

export type ItemAttributeRecord = {
	id: string;
	name: string;
	values: string[];
	status: ItemAttributeStatus;
};

export type ItemAttributeFormValues = Omit<ItemAttributeRecord, "id">;

export type ItemAttributeDrawerMode = "add" | "edit" | "view";

export type ItemAttributeDrawerState = {
	mode: ItemAttributeDrawerMode;
	record?: ItemAttributeRecord;
} | null;

export type ItemAttributesTableProps = {
	table: Table<ItemAttributeRecord>;
	toolbar?: ReactNode;
	onEdit: (record: ItemAttributeRecord) => void;
	onToggleStatus: (record: ItemAttributeRecord) => void;
	onView: (record: ItemAttributeRecord) => void;
};

export type ItemAttributesListPageState = {
	activeCount: number;
	drawer: ItemAttributeDrawerState;
	filteredRecords: ItemAttributeRecord[];
	query: string;
	records: ItemAttributeRecord[];
	statusFilter: string;
	table: Table<ItemAttributeRecord>;
	tableColumns: ColumnDef<ItemAttributeRecord>[];
	closeDrawer: () => void;
	openAddDrawer: () => void;
	openEditDrawer: (record: ItemAttributeRecord) => void;
	openViewDrawer: (record: ItemAttributeRecord) => void;
	saveRecord: (values: ItemAttributeFormValues) => void;
	setQuery: (value: string) => void;
	setStatusFilter: (value: string) => void;
	toggleStatus: (record: ItemAttributeRecord) => void;
};
