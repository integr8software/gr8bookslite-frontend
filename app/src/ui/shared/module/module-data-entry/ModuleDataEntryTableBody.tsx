"use client";

import { MoreVertical } from "lucide-react";
import type { CSSProperties, RefObject } from "react";
import { createPortal } from "react-dom";
import { ModuleDataEntryRowActions } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryRowActions";
import {
	createColumnWidthStyle,
	getColumnDisplayWidth,
	isCellSelected,
	isDropAfter,
	isRowSelected,
	moduleDataEntryCellClassName,
	moduleDataEntryRowHeaderClassName,
	type ModuleDataEntryDisplayColumn,
} from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import type { ModuleDataEntrySelection } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export function ModuleDataEntryTableBody<TRow extends { id: string }>({
	canEditRows,
	columnDropTargetId,
	columns,
	draggedColumnId,
	draggedRowId,
	emptyRowLabel,
	isDraggable,
	isRowNumberColumnFixed,
	openMenuRowId,
	rowDropTargetId,
	rowMenuStyle,
	rowMenuTriggerRefs,
	rows,
	selection,
	onClearRow,
	onDuplicateRow,
	onInsertRow,
	onOpenMenuRowChange,
	onRemoveRow,
	onRowDragEnd,
	onRowDragOver,
	onRowDrop,
	onSelectionChange,
	onStartRowDrag,
}: {
	canEditRows: boolean;
	columnDropTargetId: string | null;
	columns: ModuleDataEntryDisplayColumn<TRow>[];
	draggedColumnId: string | null;
	draggedRowId: string | null;
	emptyRowLabel: string;
	isDraggable: boolean;
	isRowNumberColumnFixed: boolean;
	openMenuRowId: string | null;
	rowDropTargetId: string | null;
	rowMenuStyle: CSSProperties;
	rowMenuTriggerRefs: RefObject<Map<string, HTMLButtonElement>>;
	rows: TRow[];
	selection: ModuleDataEntrySelection | null;
	onClearRow?: (rowId: string) => void;
	onDuplicateRow: (rowId: string) => void;
	onInsertRow: (rowId: string, position: "above" | "below") => void;
	onOpenMenuRowChange: (rowId: string | null) => void;
	onRemoveRow: (rowId: string) => void;
	onRowDragEnd: () => void;
	onRowDragOver: (rowId: string) => void;
	onRowDrop: (rowId: string) => void;
	onSelectionChange: (cell: HTMLElement) => void;
	onStartRowDrag: (rowId: string) => void;
}) {
	const orderedRowIds = rows.map((item) => item.id);
	const orderedColumnIds = columns.map((item) => item.id);
	const createFieldId = (rowId: string, columnId: string) =>
		`module-entry-${sanitizeFieldSegment(rowId)}-${sanitizeFieldSegment(columnId)}`;

	return (
		<tbody>
			{rows.map((row, index) => (
				<tr
					key={row.id}
					onDragEnd={onRowDragEnd}
					onDragOver={(event) => {
						if (draggedRowId && draggedRowId !== row.id) {
							event.preventDefault();
							onRowDragOver(row.id);
						}
					}}
					onDrop={() => onRowDrop(row.id)}
					className={joinClasses(
						"bg-white",
						draggedRowId === row.id && "opacity-50",
					)}
				>
					<td
						className={joinClasses(
							moduleDataEntryRowHeaderClassName,
							"relative isolate overflow-hidden transition",
							isRowSelected(selection, row.id) &&
								"bg-skyblue/10 ring-2 ring-inset ring-skyblue/35",
							isRowNumberColumnFixed &&
								"sticky left-0 z-40 w-[5rem] min-w-[5rem] bg-offwhite shadow-[6px_0_12px_rgba(33,39,56,0.08)]",
							rowDropTargetId === row.id &&
								(isDropAfter(draggedRowId, row.id, orderedRowIds)
									? "border-b-4 border-b-skyblue"
									: "border-t-4 border-t-skyblue"),
						)}
					>
						<button
							ref={(node) => {
								if (node) {
									rowMenuTriggerRefs.current.set(row.id, node);
								} else {
									rowMenuTriggerRefs.current.delete(row.id);
								}
							}}
							type="button"
							disabled={!canEditRows}
							onClick={() =>
								onOpenMenuRowChange(openMenuRowId === row.id ? null : row.id)
							}
							className="absolute left-1.5 top-1/2 inline-flex h-7 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-transparent text-darknavy/45 transition hover:bg-skyblue/10 hover:text-darknavy disabled:cursor-not-allowed disabled:opacity-30"
							aria-label={`Open ${emptyRowLabel} ${index + 1} actions`}
						>
							<MoreVertical className="h-4 w-4" aria-hidden="true" />
						</button>
						<div className="flex items-center justify-center">
							<span
								draggable={canEditRows && isDraggable}
								onDragStart={() => onStartRowDrag(row.id)}
								className={joinClasses(
									"inline-flex h-8 min-w-7 items-center justify-center rounded-md px-1 text-xs font-semibold text-darknavy/70",
									canEditRows &&
										isDraggable &&
										"cursor-grab hover:bg-skyblue/10 hover:text-darknavy active:cursor-grabbing",
								)}
								aria-label={`Drag ${emptyRowLabel} ${index + 1}`}
							>
								{index + 1}
							</span>
						</div>
						{openMenuRowId === row.id && typeof document !== "undefined"
							? createPortal(
									<ModuleDataEntryRowActions
										canRemove
										rowLabel={`${emptyRowLabel} ${index + 1}`}
										style={rowMenuStyle}
										onAddAbove={() => {
											onInsertRow(row.id, "above");
											onOpenMenuRowChange(null);
										}}
										onAddBelow={() => {
											onInsertRow(row.id, "below");
											onOpenMenuRowChange(null);
										}}
										onDuplicate={() => {
											onDuplicateRow(row.id);
											onOpenMenuRowChange(null);
										}}
										onClear={() => {
											if (onClearRow) {
												onClearRow(row.id);
											} else {
												onRemoveRow(row.id);
											}
											onOpenMenuRowChange(null);
										}}
										onRemove={() => {
											if (rows.length === 1) {
												if (onClearRow) {
													onClearRow(row.id);
												} else {
													onRemoveRow(row.id);
												}
											} else {
												onRemoveRow(row.id);
											}
											onOpenMenuRowChange(null);
										}}
									/>,
									document.body,
								)
							: null}
					</td>
					{columns.map((column, columnIndex) => {
						const isActiveCell =
							selection?.type === "cell" &&
							selection.rowId === row.id &&
							selection.columnId === column.id;
						const isSelectedCell = isCellSelected(selection, row.id, column.id);

						return (
							<td
								key={column.id}
								data-column-id={column.id}
								data-column-index={columnIndex}
								data-entry-cell
								data-row-id={row.id}
								data-row-index={index}
								onClick={(event) => {
									onSelectionChange(event.currentTarget);
								}}
								onFocus={(event) => {
									onSelectionChange(event.currentTarget);
								}}
								tabIndex={0}
								className={joinClasses(
									moduleDataEntryCellClassName,
									"transition focus-visible:relative focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-skyblue/45",
									isActiveCell
										? "relative z-30 bg-skyblue/18"
										: isSelectedCell &&
												"relative z-10 bg-skyblue/8 ring-2 ring-inset ring-skyblue/35",
									rowDropTargetId === row.id &&
										(isDropAfter(draggedRowId, row.id, orderedRowIds)
											? "border-b-4 border-b-skyblue"
											: "border-t-4 border-t-skyblue"),
									draggedColumnId === column.id && "opacity-60",
									columnDropTargetId === column.id &&
										(isDropAfter(
											draggedColumnId,
											column.id,
											orderedColumnIds,
										)
											? "border-r-4 border-r-coralpink"
											: "border-l-4 border-l-coralpink"),
								)}
								style={createColumnWidthStyle(getColumnDisplayWidth(column))}
							>
								{isActiveCell ? (
									<span
										aria-hidden="true"
										className="pointer-events-none absolute inset-0 z-30 rounded-[2px] outline outline-2 -outline-offset-2 outline-skyblue ring-2 ring-inset ring-skyblue shadow-[0_0_0_2px_rgb(var(--skyblue-rgb)/0.16)]"
									/>
								) : null}
								{column.renderCell(row, index, {
									fieldId: createFieldId(row.id, column.id),
									fieldName: `${row.id}.${column.id}`,
									focusableTabIndex: -1,
								})}
							</td>
						);
					})}
				</tr>
			))}
		</tbody>
	);
}

function sanitizeFieldSegment(value: string) {
	return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}
