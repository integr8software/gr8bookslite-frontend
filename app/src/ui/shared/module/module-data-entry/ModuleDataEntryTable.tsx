"use client";

import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ClipboardEvent as ReactClipboardEvent,
	type CSSProperties,
	type KeyboardEvent as ReactKeyboardEvent,
	type RefObject,
} from "react";
import { ModuleDataEntryTableBody } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTableBody";
import {
	createModuleDataEntrySelectionClipboardText,
	exitModuleDataEntryCellEditor,
	focusModuleDataEntryCell,
	focusModuleDataEntryCellEditor,
	getModuleDataEntryCellTarget,
	getModuleDataEntryEventCell,
	startModuleDataEntryCellEditorWithText,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTableCommands";
import { ModuleDataEntryTableHeader } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryTableHeader";
import {
	clampIndex,
	isCellEditorElement,
	isMinusKey,
	isPlusKey,
	isTabularPaste,
	parseClipboardRows,
} from "@/app/src/ui/shared/module/module-data-entry/utils";
import type {
	ModuleDataEntryCellTarget,
	ModuleDataEntryColumn,
	ModuleDataEntrySelection,
} from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export type ModuleDataEntryTableProps<TRow extends { id: string }> = {
	columns: ModuleDataEntryColumn<TRow>[];
	emptyRowLabel: string;
	getCellValue?: (row: TRow, columnId: string) => string;
	isDraggable: boolean;
	isReadonly: boolean;
	isRowNumberColumnFixed: boolean;
	rows: TRow[];
	scrollContainerRef: RefObject<HTMLDivElement | null>;
	onAutoColumnWidth?: (columnId: string) => void;
	onClearCell?: (rowId: string, columnId: string) => void;
	onClearRow?: (rowId: string) => void;
	onDuplicateRow: (rowId: string) => void;
	onFitColumnWidth?: (columnId: string) => void;
	onInsertRow: (rowId: string, position: "above" | "below") => void;
	onMoveColumn?: (fromColumnId: string, toColumnId: string) => void;
	onMoveRow: (fromRowId: string, toRowId: string) => void;
	onPasteCells?: (
		target: ModuleDataEntryCellTarget,
		rows: string[][],
	) => void;
	onRemoveColumn?: (columnId: string) => void;
	onRemoveRow: (rowId: string) => void;
	onUpdateColumnHeader?: (columnId: string, header: string) => void;
	onUpdateColumnWidth?: (columnId: string, width: number) => void;
};

export function ModuleDataEntryTable<TRow extends { id: string }>({
	columns,
	emptyRowLabel,
	getCellValue,
	isDraggable,
	isReadonly,
	isRowNumberColumnFixed,
	rows,
	scrollContainerRef,
	onAutoColumnWidth,
	onClearCell,
	onClearRow,
	onDuplicateRow,
	onFitColumnWidth,
	onInsertRow,
	onMoveColumn,
	onMoveRow,
	onPasteCells,
	onRemoveColumn,
	onRemoveRow,
	onUpdateColumnHeader,
	onUpdateColumnWidth,
}: ModuleDataEntryTableProps<TRow>) {
	const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
	const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
	const [rowDropTargetId, setRowDropTargetId] = useState<string | null>(null);
	const [columnDropTargetId, setColumnDropTargetId] = useState<string | null>(
		null,
	);
	const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);
	const [rowMenuStyle, setRowMenuStyle] = useState<CSSProperties>({});
	const [selection, setSelection] = useState<ModuleDataEntrySelection | null>(
		null,
	);
	const tableRef = useRef<HTMLDivElement>(null);
	const rowMenuTriggerRefs = useRef(new Map<string, HTMLButtonElement>());
	const pendingFocusTargetRef = useRef<{
		columnIndex: number;
		rowIndex: number;
	} | null>(null);
	const canEditRows = !isReadonly;
	const canEditColumns =
		canEditRows &&
		Boolean(onMoveColumn || onRemoveColumn || onUpdateColumnHeader);
	const hasClearRowAction = Boolean(onClearRow);

	const updateRowMenuPosition = useCallback((rowId: string) => {
		const trigger = rowMenuTriggerRefs.current.get(rowId);

		if (!trigger) {
			return;
		}

		const rect = trigger.getBoundingClientRect();
		const menuWidth = 176;
		const menuHeight = hasClearRowAction ? 220 : 180;
		const viewportPadding = 8;
		const left = Math.min(
			Math.max(viewportPadding, rect.left),
			window.innerWidth - menuWidth - viewportPadding,
		);
		const belowTop = rect.bottom + 6;
		const top =
			belowTop + menuHeight <= window.innerHeight - viewportPadding
				? belowTop
				: Math.max(viewportPadding, rect.top - menuHeight - 6);

		setRowMenuStyle((currentStyle) => {
			if (currentStyle.left === left && currentStyle.top === top) {
				return currentStyle;
			}

			return { left, top };
		});
	}, [hasClearRowAction]);

	function getCellTarget(cell: HTMLElement): ModuleDataEntryCellTarget | null {
		return getModuleDataEntryCellTarget(cell);
	}

	function getEventCellTarget(target: EventTarget | null) {
		return getModuleDataEntryEventCell(target);
	}

	function focusCell(rowIndex: number, columnIndex: number) {
		const nextCell = focusModuleDataEntryCell({
			columnIndex,
			rowIndex,
			tableElement: tableRef.current,
		});

		if (nextCell) {
			updateSelectionFromCell(nextCell);
		}

		return nextCell;
	}

	function focusRelativeCell(
		currentCell: HTMLElement,
		rowOffset: number,
		columnOffset: number,
	) {
		const target = getCellTarget(currentCell);

		if (!target) {
			return;
		}

		focusCell(
			clampIndex(target.rowIndex + rowOffset, rows.length),
			clampIndex(target.columnIndex + columnOffset, columns.length),
		);
	}

	function focusLinearCell(currentCell: HTMLElement, offset: number) {
		const target = getCellTarget(currentCell);

		if (!target) {
			return;
		}

		const cellCount = rows.length * columns.length;
		const linearIndex = target.rowIndex * columns.length + target.columnIndex;
		const nextLinearIndex = clampIndex(linearIndex + offset, cellCount);
		const nextRowIndex = Math.floor(nextLinearIndex / columns.length);
		const nextColumnIndex = nextLinearIndex % columns.length;

		focusCell(nextRowIndex, nextColumnIndex);
	}

	function focusCellEditor(cell: HTMLElement) {
		updateSelectionFromCell(cell);
		focusModuleDataEntryCellEditor(cell, tableRef.current);
	}

	function exitCellEditor(target: EventTarget | null) {
		exitModuleDataEntryCellEditor(target);
	}

	function updateSelectionFromCell(cell: HTMLElement) {
		const target = getCellTarget(cell);

		if (target) {
			setSelection({
				columnId: target.columnId,
				rowId: target.rowId,
				type: "cell",
			});
		}
	}

	function copySelection(focusedCell: HTMLElement) {
		const text = createModuleDataEntrySelectionClipboardText({
			columns,
			focusedCell,
			getCellValue,
			rows,
			selection,
			tableElement: tableRef.current,
		});

		if (!text || typeof navigator === "undefined" || !navigator.clipboard) {
			return;
		}

		void navigator.clipboard.writeText(text);
	}
	function handleGridPaste(event: ReactClipboardEvent<HTMLElement>) {
		const target = event.target as HTMLElement;
		const text = event.clipboardData.getData("text");

		if (!onPasteCells || (isCellEditorElement(target) && !isTabularPaste(text))) {
			return;
		}

		const cell = getEventCellTarget(event.target);

		if (!cell) {
			return;
		}

		const cellTarget = getCellTarget(cell);

		if (!cellTarget || !text.trim()) {
			return;
		}

		event.preventDefault();
		onPasteCells(cellTarget, parseClipboardRows(text));
	}

	function handleGridKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
		const target = event.target as HTMLElement;
		const cell = getEventCellTarget(event.target);
		const isEditing = isCellEditorElement(target);

		if (event.key === "Escape") {
			setOpenMenuRowId(null);
			if (cell) {
				updateSelectionFromCell(cell);
			}
			exitCellEditor(event.target);
			return;
		}

		if (!cell) {
			return;
		}

		const cellTarget = getCellTarget(cell);

		if (!cellTarget) {
			return;
		}

		if (event.key === "Control") {
			updateSelectionFromCell(cell);
			return;
		}

		if (event.key === "Tab") {
			event.preventDefault();
			focusLinearCell(cell, event.shiftKey ? -1 : 1);
			return;
		}

		if (event.key === "F2") {
			event.preventDefault();
			focusCellEditor(cell);
			return;
		}

		if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === "a") {
			event.preventDefault();
			setSelection({ type: "all" });
			exitCellEditor(event.target);
			return;
		}

		if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === "c") {
			event.preventDefault();
			copySelection(cell);
			return;
		}

		if (event.shiftKey && event.key === " ") {
			event.preventDefault();
			setSelection({ rowId: cellTarget.rowId, type: "row" });
			exitCellEditor(event.target);
			return;
		}

		if (event.ctrlKey && event.key === " ") {
			event.preventDefault();
			setSelection({ columnId: cellTarget.columnId, type: "column" });
			exitCellEditor(event.target);
			return;
		}

		if (event.ctrlKey && isPlusKey(event.key, event.code)) {
			event.preventDefault();

			if (!canEditRows) {
				return;
			}

			exitCellEditor(event.target);
			pendingFocusTargetRef.current = {
				columnIndex: cellTarget.columnIndex,
				rowIndex: cellTarget.rowIndex + 1,
			};
			onInsertRow(cellTarget.rowId, "below");
			return;
		}

		if (event.ctrlKey && isMinusKey(event.key, event.code)) {
			event.preventDefault();

			if (!canEditRows || rows.length <= 1) {
				return;
			}

			exitCellEditor(event.target);
			pendingFocusTargetRef.current = {
				columnIndex: cellTarget.columnIndex,
				rowIndex: cellTarget.rowIndex,
			};
			onRemoveRow(cellTarget.rowId);
			return;
		}

		if (
			!isEditing &&
			(event.key === "Backspace" || event.key === "Delete") &&
			onClearCell
		) {
			event.preventDefault();
			onClearCell(cellTarget.rowId, cellTarget.columnId);
			return;
		}

		if (!isEditing) {
			if (isDataEntryTypingKey(event)) {
				event.preventDefault();
				updateSelectionFromCell(cell);
				startModuleDataEntryCellEditorWithText({
					cell,
					tableElement: tableRef.current,
					text: event.key,
				});
				return;
			}

			if (event.key === "ArrowUp") {
				event.preventDefault();
				focusRelativeCell(cell, -1, 0);
			} else if (event.key === "ArrowDown") {
				event.preventDefault();
				focusRelativeCell(cell, 1, 0);
			} else if (event.key === "ArrowLeft") {
				event.preventDefault();
				focusRelativeCell(cell, 0, -1);
			} else if (event.key === "ArrowRight") {
				event.preventDefault();
				focusRelativeCell(cell, 0, 1);
			}
		}
	}

	useLayoutEffect(() => {
		if (!openMenuRowId) {
			return;
		}

		updateRowMenuPosition(openMenuRowId);
	}, [openMenuRowId, updateRowMenuPosition]);

	useLayoutEffect(() => {
		const target = pendingFocusTargetRef.current;

		if (!target) {
			return;
		}

		pendingFocusTargetRef.current = null;
		const rowIndex = clampIndex(target.rowIndex, rows.length);
		const columnIndex = clampIndex(target.columnIndex, columns.length);
		const row = rows[rowIndex];
		const column = columns[columnIndex];

		if (row && column) {
			setSelection({
				columnId: column.id,
				rowId: row.id,
				type: "cell",
			});
		}

		const nextCell = focusModuleDataEntryCell({
			columnIndex,
			rowIndex,
			tableElement: tableRef.current,
		});

		if (!nextCell) {
			return;
		}

		focusModuleDataEntryCellEditor(nextCell, tableRef.current);
	}, [columns, rows]);

	useEffect(() => {
		if (!openMenuRowId) {
			return;
		}

		const rowId = openMenuRowId;

		function closeMenu() {
			setOpenMenuRowId(null);
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node;
			const trigger = rowMenuTriggerRefs.current.get(rowId);

			if (
				trigger?.contains(target) ||
				(target instanceof Element && target.closest("[data-row-action-menu]"))
			) {
				return;
			}

			closeMenu();
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				closeMenu();
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		window.addEventListener("resize", closeMenu);
		window.addEventListener("scroll", closeMenu, true);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("resize", closeMenu);
			window.removeEventListener("scroll", closeMenu, true);
		};
	}, [openMenuRowId]);

	return (
		<div
			ref={(node) => {
				tableRef.current = node;
				scrollContainerRef.current = node;
			}}
			className="max-h-[30rem] overflow-auto"
			data-module-data-entry-table
			onKeyDown={handleGridKeyDown}
			onPaste={handleGridPaste}
		>
			<table className="w-max table-fixed border-separate border-spacing-0 text-left text-sm text-darknavy">
				<ModuleDataEntryTableHeader
					canEditColumns={canEditColumns}
					columnDropTargetId={columnDropTargetId}
					columns={columns}
					draggedColumnId={draggedColumnId}
					isRowNumberColumnFixed={isRowNumberColumnFixed}
					selection={selection}
					onAutoColumnWidth={onAutoColumnWidth}
					onColumnDragEnd={() => {
						setDraggedColumnId(null);
						setColumnDropTargetId(null);
					}}
					onColumnDragOver={setColumnDropTargetId}
					onColumnDrop={(columnId) => {
						if (
							draggedColumnId &&
							draggedColumnId !== columnId &&
							onMoveColumn
						) {
							onMoveColumn(draggedColumnId, columnId);
						}

						setDraggedColumnId(null);
						setColumnDropTargetId(null);
					}}
					onFitColumnWidth={onFitColumnWidth}
					onMoveColumn={onMoveColumn}
					onRemoveColumn={onRemoveColumn}
					onStartColumnDrag={setDraggedColumnId}
					onUpdateColumnHeader={onUpdateColumnHeader}
					onUpdateColumnWidth={onUpdateColumnWidth}
				/>
				<ModuleDataEntryTableBody
					canEditRows={canEditRows}
					columnDropTargetId={columnDropTargetId}
					columns={columns}
					draggedColumnId={draggedColumnId}
					draggedRowId={draggedRowId}
					emptyRowLabel={emptyRowLabel}
					isDraggable={isDraggable}
					isRowNumberColumnFixed={isRowNumberColumnFixed}
					openMenuRowId={openMenuRowId}
					rowDropTargetId={rowDropTargetId}
					rowMenuStyle={rowMenuStyle}
					rowMenuTriggerRefs={rowMenuTriggerRefs}
					rows={rows}
					selection={selection}
					onClearRow={onClearRow}
					onDuplicateRow={onDuplicateRow}
					onInsertRow={onInsertRow}
					onOpenMenuRowChange={setOpenMenuRowId}
					onRemoveRow={onRemoveRow}
					onRowDragEnd={() => {
						setDraggedRowId(null);
						setRowDropTargetId(null);
					}}
					onRowDragOver={setRowDropTargetId}
					onRowDrop={(rowId) => {
						if (draggedRowId && draggedRowId !== rowId) {
							onMoveRow(draggedRowId, rowId);
						}

						setDraggedRowId(null);
						setRowDropTargetId(null);
					}}
					onSelectionChange={updateSelectionFromCell}
					onStartRowDrag={setDraggedRowId}
				/>
			</table>
		</div>
	);
}

function isDataEntryTypingKey(event: ReactKeyboardEvent<HTMLElement>) {
	return (
		event.key.length === 1 &&
		!event.altKey &&
		!event.ctrlKey &&
		!event.metaKey &&
		!event.nativeEvent.isComposing
	);
}
