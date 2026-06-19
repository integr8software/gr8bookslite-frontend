import type { Table } from "@tanstack/react-table";

export type ModuleTableExportScope = "all" | "filtered";
export type ModuleTableExportColumnScope = "all" | "visible";
export type ModuleTableExportFormat = "csv" | "excel" | "pdf";

export type ModuleTableExportColumn<TData> = {
	header: string;
	id?: string;
	value: keyof TData | ((row: TData) => unknown);
};

export type ModuleTableExportRows = string[][];

export type ModuleTableExportColumnResolver<TData> = {
	columns: ModuleTableExportColumn<TData>[];
	columnScope: ModuleTableExportColumnScope;
	table?: Table<TData>;
};
