import type { CSSProperties } from "react";
import type { ModuleDataEntrySelection } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export const moduleDataEntryRowHeaderClassName =
	"app-theme-field-readonly w-[5rem] min-w-[5rem] border px-2 py-1 text-center text-xs font-semibold";

export const moduleDataEntryCellClassName =
	"app-theme-field border p-0 align-middle";

export function clampIndex(index: number, length: number) {
	if (length <= 0) {
		return 0;
	}

	return Math.min(length - 1, Math.max(0, index));
}

export function isCellEditorElement(target: HTMLElement) {
	return (
		target instanceof HTMLInputElement ||
		target instanceof HTMLSelectElement ||
		target instanceof HTMLTextAreaElement ||
		target.isContentEditable
	);
}

export function isPlusKey(key: string, code?: string) {
	return key === "+" || key === "=" || code === "NumpadAdd";
}

export function isMinusKey(key: string, code?: string) {
	return (
		key === "-" ||
		key === "_" ||
		code === "Minus" ||
		code === "NumpadSubtract"
	);
}

export function isCellSelected(
	selection: ModuleDataEntrySelection | null,
	rowId: string,
	columnId: string,
) {
	if (!selection) {
		return false;
	}

	if (selection.type === "all") {
		return true;
	}

	if (selection.type === "row") {
		return selection.rowId === rowId;
	}

	if (selection.type === "column") {
		return selection.columnId === columnId;
	}

	return selection.rowId === rowId && selection.columnId === columnId;
}

export function isRowSelected(
	selection: ModuleDataEntrySelection | null,
	rowId: string,
) {
	return (
		selection?.type === "all" ||
		(selection?.type === "row" && selection.rowId === rowId)
	);
}

export function isColumnSelected(
	selection: ModuleDataEntrySelection | null,
	columnId: string,
) {
	return (
		selection?.type === "all" ||
		(selection?.type === "column" && selection.columnId === columnId)
	);
}

export function parseClipboardRows(text: string) {
	const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

	return normalizedText.includes("\t")
		? normalizedText
				.split("\n")
				.map((line) => line.split("\t").map((cell) => cell.trim()))
				.filter((row) => row.some((cell) => cell !== ""))
		: parseClipboardCsvRows(normalizedText);
}

export function isTabularPaste(text: string) {
	return text.includes("\t") || /\r|\n/.test(text);
}

function parseClipboardCsvRows(text: string) {
	const rows: string[][] = [];
	let cell = "";
	let row: string[] = [];
	let isQuoted = false;

	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		const nextChar = text[index + 1];

		if (char === '"' && isQuoted && nextChar === '"') {
			cell += '"';
			index += 1;
			continue;
		}

		if (char === '"') {
			isQuoted = !isQuoted;
			continue;
		}

		if (char === "," && !isQuoted) {
			row.push(cell.trim());
			cell = "";
			continue;
		}

		if (char === "\n" && !isQuoted) {
			row.push(cell.trim());
			rows.push(row);
			row = [];
			cell = "";
			continue;
		}

		cell += char;
	}

	row.push(cell.trim());
	rows.push(row);

	return rows.filter((currentRow) =>
		currentRow.some((currentCell) => currentCell !== ""),
	);
}

export function clampColumnWidth(width: number) {
	return Math.min(800, Math.max(50, Math.round(width || 50)));
}

export function createColumnWidthStyle(
	width?: number,
): CSSProperties | undefined {
	if (!width) {
		return undefined;
	}

	const pixelWidth = `${clampColumnWidth(width)}px`;

	return {
		maxWidth: pixelWidth,
		minWidth: pixelWidth,
		width: pixelWidth,
	};
}

export function isDropAfter<TItemId extends string | null>(
	draggedId: TItemId,
	targetId: string,
	orderedIds: string[],
) {
	if (!draggedId) {
		return false;
	}

	return orderedIds.indexOf(draggedId) < orderedIds.indexOf(targetId);
}

export function formatEntryCountLabel(count: number, label: string) {
	const normalizedLabel = label.trim() || "row";
	const displayLabel =
		count === 1 ? normalizedLabel : pluralizeEntryLabel(normalizedLabel);

	return `${count} ${toTitleCase(displayLabel)}`;
}

function pluralizeEntryLabel(label: string) {
	if (label.endsWith("y")) {
		return `${label.slice(0, -1)}ies`;
	}

	if (label.endsWith("s")) {
		return label;
	}

	return `${label}s`;
}

function toTitleCase(value: string) {
	return value.slice(0, 1).toUpperCase() + value.slice(1);
}
