"use client";

import { useState, type DragEvent, type RefObject } from "react";
import { flexRender, type Header, type Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical } from "lucide-react";
import {
	getColumnClassName,
	isColumnHeaderCentered,
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

type HeaderDropIndicator = {
	columnId: string;
	position: "after" | "before";
};

type ModuleTableHeaderProps<TData> = {
	enableColumnReorder?: boolean;
	stickyTop?: number;
	scrollContainerRef?: RefObject<HTMLDivElement | null>;
	table: Table<TData>;
};

export function ModuleTableHeader<TData>({
	enableColumnReorder = true,
	stickyTop,
	scrollContainerRef,
	table,
}: ModuleTableHeaderProps<TData>) {
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

	function scrollDuringColumnDrag(event: DragEvent<HTMLElement>) {
		if (!draggedColumnId) {
			return;
		}

		const scrollContainer = scrollContainerRef?.current;

		if (!scrollContainer) {
			return;
		}

		const rect = scrollContainer.getBoundingClientRect();
		const edgeThreshold = 96;
		const maxStep = 28;
		const leftDistance = event.clientX - rect.left;
		const rightDistance = rect.right - event.clientX;
		const topDistance = event.clientY - rect.top;
		const bottomDistance = rect.bottom - event.clientY;
		let deltaX = 0;
		let deltaY = 0;

		if (leftDistance < edgeThreshold) {
			deltaX = -getAutoScrollStep(edgeThreshold - leftDistance, edgeThreshold, maxStep);
		} else if (rightDistance < edgeThreshold) {
			deltaX = getAutoScrollStep(edgeThreshold - rightDistance, edgeThreshold, maxStep);
		}

		if (topDistance < edgeThreshold) {
			deltaY = -getAutoScrollStep(edgeThreshold - topDistance, edgeThreshold, maxStep);
		} else if (bottomDistance < edgeThreshold) {
			deltaY = getAutoScrollStep(edgeThreshold - bottomDistance, edgeThreshold, maxStep);
		}

		if (deltaX !== 0 || deltaY !== 0) {
			scrollContainer.scrollBy({ left: deltaX, top: deltaY });
		}
	}

	return (
		<thead className="module-table-header sticky top-0 z-50 bg-slate-50 text-xs font-bold text-darknavy/80" style={stickyTop === undefined ? undefined : { top: stickyTop }}>
			{table.getHeaderGroups().map((headerGroup) => (
				<tr key={headerGroup.id} className="border-b border-darknavy/10">
					{headerGroup.headers.map((header) => (
						<th
							key={header.id}
							colSpan={header.colSpan}
							onDragEnd={() => {
								setDraggedColumnId(null);
								setDropIndicator(null);
							}}
							onDragOver={(event) => {
								if (enableColumnReorder && !header.isPlaceholder && draggedColumnId) {
									event.preventDefault();
									event.dataTransfer.dropEffect = "move";
									scrollDuringColumnDrag(event);

									if (draggedColumnId !== header.column.id) {
										updateDropIndicator(event, header.column.id);
									} else {
										setDropIndicator(null);
									}
								}
							}}
							onDrop={(event) => {
								event.preventDefault();

								if (enableColumnReorder && draggedColumnId && !header.isPlaceholder) {
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
								"group relative bg-slate-50 whitespace-nowrap px-5 py-3 first:pl-6 last:pr-6",
								isCenteredHeader(header) ? "text-center" : "text-left",
								draggedColumnId === header.column.id &&
									"bg-skyblue/10 opacity-75",
								getColumnClassName(header),
							)}
						>
							{dropIndicator?.columnId === header.column.id ? (
								<span
									aria-hidden="true"
									className={joinClasses(
										"pointer-events-none absolute bottom-2 top-2 z-20 w-1 rounded-full bg-skyblue shadow-[0_0_0_3px_rgba(33,39,56,0.16)]",
										dropIndicator.position === "before"
											? "left-1"
											: "right-1",
									)}
								/>
							) : null}
							{header.isPlaceholder ? null : (
								<div
									className={joinClasses(
										"flex min-w-0 items-center gap-1.5",
										isCenteredHeader(header)
											? "justify-center"
											: "justify-start",
									)}
								>
									{enableColumnReorder ? (
										<span
											draggable
											onDragStart={(event) => {
												event.dataTransfer.effectAllowed = "move";
												event.dataTransfer.setData("text/plain", header.column.id);
												setDraggedColumnId(header.column.id);
												setDropIndicator(null);
											}}
											className="inline-flex h-6 w-5 shrink-0 cursor-grab items-center justify-center rounded bg-darknavy/5 text-darknavy/65 transition hover:bg-skyblue/10 hover:text-darknavy active:cursor-grabbing group-hover:text-darknavy"
											title="Drag column"
										>
											<GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
										</span>
									) : null}
									{header.column.getCanSort() ? (
										<ModuleTableSortButton
											header={header}
											align={isCenteredHeader(header) ? "center" : "left"}
										/>
									) : (
										<span
											className={joinClasses(
												"truncate",
												isCenteredHeader(header) ? "text-center" : "text-left",
											)}
										>
											{flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
										</span>
									)}
								</div>
							)}
						</th>
					))}
				</tr>
			))}
		</thead>
	);
}

function getAutoScrollStep(
	overlap: number,
	edgeThreshold: number,
	maxStep: number,
) {
	const ratio = Math.max(0, Math.min(1, overlap / edgeThreshold));

	return Math.max(4, Math.round(maxStep * ratio));
}

function isCenteredHeader<TData>(header: Header<TData, unknown>) {
	return isColumnHeaderCentered(header);
}

function ModuleTableSortButton<TData>({
	align,
	header,
}: {
	align: "center" | "left";
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
				"inline-flex max-w-full items-center gap-2 rounded-md transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2",
				align === "center" ? "justify-center text-center" : "justify-start text-left",
				moduleAccentClassNames.focusRing,
			)}
		>
			<span
				className={joinClasses(
					"truncate",
					align === "center" ? "text-center" : "text-left",
				)}
			>
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
