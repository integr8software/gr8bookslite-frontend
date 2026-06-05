"use client";

import { ModuleDataEntryColumnHeader } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryColumnHeader";
import {
	createColumnWidthStyle,
	isColumnSelected,
	isDropAfter,
} from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import type {
	ModuleDataEntryColumn,
	ModuleDataEntrySelection,
} from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export function ModuleDataEntryTableHeader<TRow>({
	canEditColumns,
	columnDropTargetId,
	columns,
	draggedColumnId,
	isRowNumberColumnFixed,
	selection,
	onAutoColumnWidth,
	onColumnDragEnd,
	onColumnDragOver,
	onColumnDrop,
	onFitColumnWidth,
	onMoveColumn,
	onRemoveColumn,
	onStartColumnDrag,
	onUpdateColumnHeader,
	onUpdateColumnWidth,
}: {
	canEditColumns: boolean;
	columnDropTargetId: string | null;
	columns: ModuleDataEntryColumn<TRow>[];
	draggedColumnId: string | null;
	isRowNumberColumnFixed: boolean;
	selection: ModuleDataEntrySelection | null;
	onAutoColumnWidth?: (columnId: string) => void;
	onColumnDragEnd: () => void;
	onColumnDragOver: (columnId: string) => void;
	onColumnDrop: (columnId: string) => void;
	onFitColumnWidth?: (columnId: string) => void;
	onMoveColumn?: (fromColumnId: string, toColumnId: string) => void;
	onRemoveColumn?: (columnId: string) => void;
	onStartColumnDrag: (columnId: string) => void;
	onUpdateColumnHeader?: (columnId: string, header: string) => void;
	onUpdateColumnWidth?: (columnId: string, width: number) => void;
}) {
	const orderedColumnIds = columns.map((item) => item.id);

	return (
		<thead>
			<tr className="bg-skyblue text-xs font-semibold text-white">
				<th
					className={joinClasses(
						"sticky top-0 z-40 w-[5.25rem] min-w-[5.25rem] border border-skyblue/70 bg-skyblue px-2 py-2 text-center shadow-sm",
						isRowNumberColumnFixed && "left-0 z-50",
					)}
				>
					No.
				</th>
				{columns.map((column) => (
					<th
						key={column.id}
						onDragEnd={onColumnDragEnd}
						onDragOver={(event) => {
							if (draggedColumnId && draggedColumnId !== column.id) {
								event.preventDefault();
								onColumnDragOver(column.id);
							}
						}}
						onDrop={() => onColumnDrop(column.id)}
						className={joinClasses(
							column.widthClassName,
							"sticky top-0 z-40 border border-skyblue/70 bg-skyblue px-3 py-2 shadow-sm transition",
							isColumnSelected(selection, column.id) &&
								"bg-skyblue/90 ring-2 ring-inset ring-white/55",
							draggedColumnId === column.id && "opacity-60",
							columnDropTargetId === column.id &&
								(isDropAfter(draggedColumnId, column.id, orderedColumnIds)
									? "border-r-4 border-r-coralpink"
									: "border-l-4 border-l-coralpink"),
						)}
						style={createColumnWidthStyle(column.width)}
					>
						{canEditColumns ? (
							<ModuleDataEntryColumnHeader
								canRemove={columns.length > 1 && column.isRemovable !== false}
								column={column}
								onMoveColumn={onMoveColumn}
								onAutoColumnWidth={onAutoColumnWidth}
								onFitColumnWidth={onFitColumnWidth}
								onRemoveColumn={onRemoveColumn}
								onStartColumnDrag={onStartColumnDrag}
								onUpdateColumnHeader={onUpdateColumnHeader}
								onUpdateColumnWidth={onUpdateColumnWidth}
							/>
						) : (
							column.header
						)}
					</th>
				))}
			</tr>
		</thead>
	);
}
