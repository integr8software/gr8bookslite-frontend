import type { Table } from "@tanstack/react-table";

export type PriceListStatus = "Active" | "Inactive";

export type PriceListRecord = {
	id: string;
	code: string;
	name: string;
	customerGroup: string;
	currencyCode: string;
	status: PriceListStatus;
};

export type PriceListFormValues = Omit<PriceListRecord, "id">;

export type PriceListDrawerMode = "add" | "edit" | "view";

export type PriceListDrawerState = {
	mode: PriceListDrawerMode;
	record?: PriceListRecord;
} | null;

export type PriceListsTableProps = {
	table: Table<PriceListRecord>;
	onEdit: (record: PriceListRecord) => void;
	onToggleStatus: (record: PriceListRecord) => void;
	onView: (record: PriceListRecord) => void;
};
