import type {
	ModuleTableExportColumn,
	ModuleTableExportColumnResolver,
	ModuleTableExportColumnScope,
	ModuleTableExportRows,
	ModuleTableExportScope,
} from "@/app/src/ui/shared/module/module-table/ModuleTableExportTypes";

export function getExportColumns<TData>({
	columns,
	columnScope,
	table,
}: ModuleTableExportColumnResolver<TData>) {
	if (!table) {
		return columns;
	}

	const columnById = new Map(
		columns.map((column) => [column.id ?? String(column.value), column]),
	);
	const tableColumns =
		columnScope === "all"
			? table.getAllLeafColumns()
			: table.getVisibleLeafColumns();

	const exportColumns = tableColumns
		.map((column) => columnById.get(column.id))
		.filter((column): column is ModuleTableExportColumn<TData> =>
			Boolean(column),
		);

	return exportColumns;
}

export function createExportRows<TData>(
	rows: TData[],
	columns: ModuleTableExportColumn<TData>[],
): ModuleTableExportRows {
	return [
		columns.map((column) => column.header),
		...rows.map((row) =>
			columns.map((column) => formatExportValue(getColumnValue(row, column))),
		),
	];
}

export function createExportFileName({
	columnScope,
	fileName,
	recordScope,
}: {
	columnScope: ModuleTableExportColumnScope;
	fileName: string;
	recordScope: ModuleTableExportScope;
}) {
	const recordSuffix = recordScope === "all" ? "all" : "filtered";
	const columnSuffix = columnScope === "all" ? "all-columns" : "current-columns";

	return `${fileName}-${recordSuffix}-${columnSuffix}`
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function getColumnValue<TData>(
	row: TData,
	column: ModuleTableExportColumn<TData>,
) {
	return typeof column.value === "function" ? column.value(row) : row[column.value];
}

function formatExportValue(value: unknown): string {
	if (value == null || typeof value === "boolean") {
		return value == null ? "" : value ? "Yes" : "No";
	}

	if (value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}

	if (Array.isArray(value)) {
		return value.map(formatExportValue).filter(Boolean).join(", ");
	}

	return String(value).replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
}
