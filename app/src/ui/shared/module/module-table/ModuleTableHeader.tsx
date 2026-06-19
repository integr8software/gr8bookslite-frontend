"use client";

import { useState, type DragEvent } from "react";
import { flexRender, type Header, type Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
	getColumnClassName,
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

type HeaderDropIndicator = {
	columnId: string;
	position: "after" | "before";
};

export function ModuleTableHeader<TData>({ table }: { table: Table<TData> }) {
	const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
	const [dropIndicator, setDropIndicator] =
		useState<HeaderDropIndicator | null>(null);

	function moveColumn(
		sourceColumnId: string,
		targetColumnId: string,
		position: HeaderDropIndicator["position"] = "before",
	) {
		if (sourceColumnId === targetColumnId) {
			return;
		}

		const orderedColumnIds = table.getAllLeafColumns().map((column) => column.id);
		const sourceIndex = orderedColumnIds.indexOf(sourceColumnId);
		const targetIndex = orderedColumnIds.indexOf(targetColumnId);

		if (sourceIndex < 0 || targetIndex < 0) {
			return;
		}

		const nextColumnOrder = [...orderedColumnIds];
		const [sourceColumn] = nextColumnOrder.splice(sourceIndex, 1);
		const nextTargetIndex = nextColumnOrder.indexOf(targetColumnId);

		if (nextTargetIndex < 0) {
			return;
		}

		nextColumnOrder.splice(
			position === "after" ? nextTargetIndex + 1 : nextTargetIndex,
			0,
			sourceColumn,
		);
		table.setColumnOrder(nextColumnOrder);
	}

	function updateDropIndicator(
		event: DragEvent<HTMLTableCellElement>,
		columnId: string,
	) {
		if (!draggedColumnId || draggedColumnId === columnId) {
			setDropIndicator(null);
			return;
		}

		const rect = event.currentTarget.getBoundingClientRect();
		const position = event.clientX > rect.left + rect.width / 2 ? "after" : "before";

		setDropIndicator((current) =>
			current?.columnId === columnId && current.position === position
				? current
				: { columnId, position },
		);
	}

	return (
		<thead className="module-table-header sticky top-0 z-10 bg-slate-50 text-xs font-bold text-darknavy/80">
			{table.getHeaderGroups().map((headerGroup) => (
				<tr key={headerGroup.id} className="border-b border-darknavy/10">
					{headerGroup.headers.map((header) => (
						<th
							key={header.id}
							colSpan={header.colSpan}
							draggable={!header.isPlaceholder}
							onDragStart={(event) => {
								if (header.isPlaceholder) {
									return;
								}

								event.dataTransfer.effectAllowed = "move";
								event.dataTransfer.setData("text/plain", header.column.id);
								setDraggedColumnId(header.column.id);
								setDropIndicator(null);
							}}
							onDragEnd={() => {
								setDraggedColumnId(null);
								setDropIndicator(null);
							}}
							onDragOver={(event) => {
								if (
									!header.isPlaceholder &&
									draggedColumnId &&
									draggedColumnId !== header.column.id
								) {
									event.preventDefault();
									event.dataTransfer.dropEffect = "move";
									updateDropIndicator(event, header.column.id);
								}
							}}
							onDrop={(event) => {
								event.preventDefault();

								if (draggedColumnId && !header.isPlaceholder) {
									moveColumn(
										draggedColumnId,
										header.column.id,
										dropIndicator?.columnId === header.column.id
											? dropIndicator.position
											: "before",
									);
								}

								setDraggedColumnId(null);
								setDropIndicator(null);
							}}
							className={joinClasses(
								"relative whitespace-nowrap px-5 py-3 first:pl-6 last:pr-6",
								!header.isPlaceholder && "cursor-grab active:cursor-grabbing",
								draggedColumnId === header.column.id && "opacity-55",
								getColumnClassName(header),
							)}
						>
							{dropIndicator?.columnId === header.column.id ? (
								<span
									aria-hidden="true"
									className={joinClasses(
										"pointer-events-none absolute bottom-2 top-2 z-20 w-0.5 rounded-full bg-skyblue shadow-[0_0_0_3px_rgba(79,172,254,0.14)]",
										dropIndicator.position === "before"
											? "left-1"
											: "right-1",
									)}
								/>
							) : null}
							{header.isPlaceholder ? null : header.column.getCanSort() ? (
								<ModuleTableSortButton header={header} />
							) : (
								flexRender(
									header.column.columnDef.header,
									header.getContext(),
								)
							)}
						</th>
					))}
				</tr>
			))}
		</thead>
	);
}

function ModuleTableSortButton<TData>({
	header,
}: {
	header: Header<TData, unknown>;
}) {
	const sortDirection = header.column.getIsSorted();
	const SortIcon =
		sortDirection === "asc"
			? ArrowUp
			: sortDirection === "desc"
				? ArrowDown
				: ArrowUpDown;
	const sortLabel =
		sortDirection === "asc"
			? "Sorted ascending"
			: sortDirection === "desc"
				? "Sorted descending"
				: "Sort column";

	return (
		<button
			type="button"
			onClick={header.column.getToggleSortingHandler()}
			aria-label={sortLabel}
			className={joinClasses(
				"inline-flex max-w-full items-center gap-2 rounded-md text-left transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2",
				moduleAccentClassNames.focusRing,
			)}
		>
			<span className="truncate">
				{flexRender(header.column.columnDef.header, header.getContext())}
			</span>
			<SortIcon
				className={joinClasses(
					"h-3.5 w-3.5 shrink-0",
					sortDirection
						? moduleAccentClassNames.iconText
						: "text-darknavy/45",
				)}
				aria-hidden="true"
			/>
		</button>
	);
}
