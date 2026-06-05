import type {
	ModuleDataEntryCellTarget,
	ModuleDataEntryColumn,
	ModuleDataEntrySelection,
} from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export function getModuleDataEntryCellTarget(
	cell: HTMLElement,
): ModuleDataEntryCellTarget | null {
	const rowId = cell.dataset.rowId;
	const columnId = cell.dataset.columnId;
	const rowIndex = Number(cell.dataset.rowIndex);
	const columnIndex = Number(cell.dataset.columnIndex);

	if (
		!rowId ||
		!columnId ||
		!Number.isInteger(rowIndex) ||
		!Number.isInteger(columnIndex)
	) {
		return null;
	}

	return {
		columnId,
		columnIndex,
		rowId,
		rowIndex,
	};
}

export function getModuleDataEntryEventCell(target: EventTarget | null) {
	return target instanceof HTMLElement
		? target.closest<HTMLElement>("[data-entry-cell]")
		: null;
}

export function focusModuleDataEntryCell({
	columnIndex,
	rowIndex,
	tableElement,
}: {
	columnIndex: number;
	rowIndex: number;
	tableElement: HTMLDivElement | null;
}) {
	const nextCell = tableElement?.querySelector<HTMLElement>(
		`[data-entry-cell][data-row-index="${rowIndex}"][data-column-index="${columnIndex}"]`,
	);

	if (!nextCell) {
		return;
	}

	nextCell.focus({ preventScroll: true });
	nextCell.scrollIntoView({ block: "nearest", inline: "nearest" });
}

export function focusModuleDataEntryCellEditor(cell: HTMLElement) {
	const editor = cell.querySelector<HTMLElement>(
		"input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable='true']",
	);

	if (!editor) {
		return;
	}

	editor.focus();

	if (
		editor instanceof HTMLInputElement ||
		editor instanceof HTMLTextAreaElement
	) {
		editor.select();
	}
}

export function exitModuleDataEntryCellEditor(target: EventTarget | null) {
	const cell = getModuleDataEntryEventCell(target);

	if (cell) {
		cell.focus({ preventScroll: true });
	}
}

export function createModuleDataEntrySelectionClipboardText<
	TRow extends { id: string },
>({
	columns,
	focusedCell,
	getCellValue,
	rows,
	selection,
	tableElement,
}: {
	columns: ModuleDataEntryColumn<TRow>[];
	focusedCell: HTMLElement;
	getCellValue?: (row: TRow, columnId: string) => string;
	rows: TRow[];
	selection: ModuleDataEntrySelection | null;
	tableElement: HTMLDivElement | null;
}) {
	const target = getModuleDataEntryCellTarget(focusedCell);

	if (!target) {
		return "";
	}

	const activeSelection =
		selection ?? {
			columnId: target.columnId,
			rowId: target.rowId,
			type: "cell" as const,
		};
	const getCopyCellValue = (row: TRow, columnId: string) =>
		readModuleDataEntryCellValue({
			columnId,
			columns,
			getCellValue,
			row,
			rows,
			tableElement,
		});

	if (activeSelection.type === "all") {
		return [
			columns.map((column) => column.header).join("\t"),
			...rows.map((row) =>
				columns.map((column) => getCopyCellValue(row, column.id)).join("\t"),
			),
		].join("\n");
	}

	if (activeSelection.type === "row") {
		const row = rows.find((item) => item.id === activeSelection.rowId);

		return row
			? columns.map((column) => getCopyCellValue(row, column.id)).join("\t")
			: "";
	}

	if (activeSelection.type === "column") {
		const column = columns.find((item) => item.id === activeSelection.columnId);

		return column
			? [
					column.header,
					...rows.map((row) => getCopyCellValue(row, column.id)),
				].join("\n")
			: "";
	}

	const row = rows.find((item) => item.id === activeSelection.rowId);

	return row ? getCopyCellValue(row, activeSelection.columnId) : "";
}

function readModuleDataEntryCellValue<TRow extends { id: string }>({
	columnId,
	columns,
	getCellValue,
	row,
	rows,
	tableElement,
}: {
	columnId: string;
	columns: ModuleDataEntryColumn<TRow>[];
	getCellValue?: (row: TRow, columnId: string) => string;
	row: TRow;
	rows: TRow[];
	tableElement: HTMLDivElement | null;
}) {
	if (getCellValue) {
		return getCellValue(row, columnId);
	}

	const rowIndex = rows.findIndex((item) => item.id === row.id);
	const columnIndex = columns.findIndex((column) => column.id === columnId);
	const cell = tableElement?.querySelector<HTMLElement>(
		`[data-entry-cell][data-row-index="${rowIndex}"][data-column-index="${columnIndex}"]`,
	);
	const control = cell?.querySelector<
		HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
	>("input, select, textarea");

	return control ? control.value : (cell?.textContent ?? "").trim();
}
