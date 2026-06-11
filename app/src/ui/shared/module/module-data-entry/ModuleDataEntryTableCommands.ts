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
		return null;
	}

	nextCell.focus({ preventScroll: true });
	scrollModuleDataEntryCellIntoView(nextCell, tableElement);
	return nextCell;
}

export function focusModuleDataEntryCellEditor(
	cell: HTMLElement,
	tableElement?: HTMLDivElement | null,
	options: { shouldSelect?: boolean } = {},
) {
	const editor = getModuleDataEntryCellEditor(cell);

	if (!editor) {
		return false;
	}

	editor.focus();
	editor.scrollIntoView({ block: "nearest", inline: "nearest" });
	scrollModuleDataEntryCellIntoView(cell, tableElement ?? null);

	if (
		editor instanceof HTMLInputElement ||
		editor instanceof HTMLTextAreaElement
	) {
		if (options.shouldSelect ?? true) {
			editor.select();
		} else {
			moveTextEditorCaretToEnd(editor);
		}
	}

	return true;
}

export function startModuleDataEntryCellEditorWithText({
	cell,
	tableElement,
	text,
}: {
	cell: HTMLElement;
	tableElement: HTMLDivElement | null;
	text: string;
}) {
	const editor = getModuleDataEntryCellEditor(cell);

	if (!editor) {
		return false;
	}

	editor.focus();
	scrollModuleDataEntryCellIntoView(cell, tableElement);

	if (editor instanceof HTMLInputElement) {
		replaceInputValue(editor, text);
		return true;
	}

	if (editor instanceof HTMLTextAreaElement) {
		replaceTextAreaValue(editor, text);
		return true;
	}

	if (editor instanceof HTMLSelectElement) {
		selectOptionByTypedText(editor, text);
		return true;
	}

	if (editor.isContentEditable) {
		editor.textContent = text;
		editor.dispatchEvent(createInputEvent(text));
		return true;
	}

	return true;
}

function getModuleDataEntryCellEditor(cell: HTMLElement) {
	return cell.querySelector<HTMLElement>(
		"input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable='true']",
	);
}

function moveTextEditorCaretToEnd(
	editor: HTMLInputElement | HTMLTextAreaElement,
) {
	const valueLength = editor.value.length;

	try {
		editor.setSelectionRange(valueLength, valueLength);
	} catch {
		// Some input types, such as number, do not support text selection ranges.
	}
}

function replaceInputValue(input: HTMLInputElement, text: string) {
	if (input.type === "number" && !isValidNumberInputStart(text)) {
		input.select();
		return;
	}

	const valueSetter = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;

	if (valueSetter) {
		valueSetter.call(input, text);
	} else {
		input.value = text;
	}

	input.dispatchEvent(createInputEvent(text));

	if (input.type !== "number") {
		input.setSelectionRange(text.length, text.length);
	}
}

function replaceTextAreaValue(textArea: HTMLTextAreaElement, text: string) {
	const valueSetter = Object.getOwnPropertyDescriptor(
		HTMLTextAreaElement.prototype,
		"value",
	)?.set;

	if (valueSetter) {
		valueSetter.call(textArea, text);
	} else {
		textArea.value = text;
	}

	textArea.dispatchEvent(createInputEvent(text));
	textArea.setSelectionRange(text.length, text.length);
}

function selectOptionByTypedText(select: HTMLSelectElement, text: string) {
	const normalizedText = text.trim().toLowerCase();

	if (!normalizedText) {
		select.focus();
		return;
	}

	const matchingOption = Array.from(select.options).find((option) =>
		option.text.trim().toLowerCase().startsWith(normalizedText),
	);

	if (!matchingOption) {
		select.focus();
		return;
	}

	const valueSetter = Object.getOwnPropertyDescriptor(
		HTMLSelectElement.prototype,
		"value",
	)?.set;

	if (valueSetter) {
		valueSetter.call(select, matchingOption.value);
	} else {
		select.value = matchingOption.value;
	}

	select.dispatchEvent(new Event("change", { bubbles: true }));
}

function createInputEvent(text: string) {
	if (typeof InputEvent === "undefined") {
		return new Event("input", { bubbles: true });
	}

	return new InputEvent("input", {
		bubbles: true,
		data: text,
		inputType: "insertText",
	});
}

function isValidNumberInputStart(text: string) {
	return /^[0-9.+-]$/.test(text);
}

function scrollModuleDataEntryCellIntoView(
	cell: HTMLElement,
	tableElement: HTMLDivElement | null,
) {
	cell.scrollIntoView({ block: "nearest", inline: "nearest" });

	if (!tableElement) {
		return;
	}

	const stickyLeftOffset = getStickyRowNumberColumnWidth(tableElement);

	if (stickyLeftOffset <= 0) {
		return;
	}

	const containerRect = tableElement.getBoundingClientRect();
	const cellRect = cell.getBoundingClientRect();
	const visibleLeft = containerRect.left + stickyLeftOffset;
	const visibleRight = containerRect.right;

	if (cellRect.left < visibleLeft) {
		tableElement.scrollLeft -= visibleLeft - cellRect.left;
		return;
	}

	if (cellRect.right > visibleRight) {
		tableElement.scrollLeft += cellRect.right - visibleRight;
	}
}

function getStickyRowNumberColumnWidth(tableElement: HTMLDivElement) {
	const header = tableElement.querySelector<HTMLElement>(
		"[data-row-number-header]",
	);

	if (!header || typeof window === "undefined") {
		return 0;
	}

	const style = window.getComputedStyle(header);

	if (style.position !== "sticky" || style.left === "auto") {
		return 0;
	}

	return header.getBoundingClientRect().width;
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
