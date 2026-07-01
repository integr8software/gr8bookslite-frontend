"use client";

import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type ComponentPropsWithoutRef,
	type CSSProperties,
	type DragEvent,
} from "react";
import { createPortal } from "react-dom";
import type { Table } from "@tanstack/react-table";
import { Check, Columns3, GripVertical } from "lucide-react";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import {
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

type ModuleTableColumnVisibilityButtonProps<TData> =
	ComponentPropsWithoutRef<"div"> & {
		align?: "left" | "right";
		label?: string;
		table: Table<TData>;
	};

type ColumnDropIndicator = {
	columnId: string;
	position: "after" | "before";
};

export function ModuleTableColumnVisibilityButton<TData>({
	align = "right",
	className,
	label = "Columns",
	table,
	...props
}: ModuleTableColumnVisibilityButtonProps<TData>) {
	const [isOpen, setIsOpen] = useState(false);
	const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
	const [dropIndicator, setDropIndicator] =
		useState<ColumnDropIndicator | null>(null);
	const [menuListMaxHeight, setMenuListMaxHeight] = useState(320);
	const [menuStyle, setMenuStyle] = useState<CSSProperties>({
		left: 0,
		position: "fixed",
		top: 0,
		visibility: "hidden",
		width: 288,
	});
	const containerRef = useRef<HTMLDivElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const portalElement =
		typeof document === "undefined" ? null : document.body;
	const columns = table.getAllLeafColumns();
	const hideableColumns = columns.filter((column) => column.getCanHide());
	const visibleHideableColumnCount = hideableColumns.filter((column) =>
		column.getIsVisible(),
	).length;
	const hasHideableColumns = hideableColumns.length > 0;
	const allHideableColumnsVisible =
		hasHideableColumns && visibleHideableColumnCount === hideableColumns.length;
	const columnLabelById = useMemo(() => {
		return new Map(
			columns.map((column) => [
				column.id,
				getColumnVisibilityLabel(
					(column.columnDef.meta as { label?: unknown } | undefined)?.label ??
						column.columnDef.header,
					column.id,
				),
			]),
		);
	}, [columns]);

	function moveColumn(
		sourceColumnId: string,
		targetColumnId: string,
		position: ColumnDropIndicator["position"] = "before",
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
		event: DragEvent<HTMLDivElement>,
		columnId: string,
	) {
		if (!draggedColumnId || draggedColumnId === columnId) {
			setDropIndicator(null);
			return;
		}

		const rect = event.currentTarget.getBoundingClientRect();
		const position = event.clientY > rect.top + rect.height / 2 ? "after" : "before";

		setDropIndicator((current) =>
			current?.columnId === columnId && current.position === position
				? current
				: { columnId, position },
		);
	}

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function updateMenuPosition() {
			const rect = containerRef.current?.getBoundingClientRect();

			if (!rect) {
				return;
			}

			const menuWidth = 288;
			const viewportPadding = 12;
			const menuHeaderHeight = 42;
			const preferredLeft =
				align === "right" ? rect.right - menuWidth : rect.left;
			const maxLeft = window.innerWidth - menuWidth - viewportPadding;
			const availableMenuHeight =
				window.innerHeight - rect.bottom - viewportPadding * 2;

			setMenuStyle({
				left: Math.max(viewportPadding, Math.min(preferredLeft, maxLeft)),
				position: "fixed",
				top: rect.bottom + 8,
				visibility: "visible",
				width: menuWidth,
			});
			setMenuListMaxHeight(
				Math.max(160, Math.min(320, availableMenuHeight - menuHeaderHeight)),
			);
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target;

			if (
				target instanceof Node &&
				!containerRef.current?.contains(target) &&
				!menuRef.current?.contains(target)
			) {
				setIsOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		updateMenuPosition();
		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		window.addEventListener("resize", updateMenuPosition);
		window.addEventListener("scroll", updateMenuPosition, true);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("resize", updateMenuPosition);
			window.removeEventListener("scroll", updateMenuPosition, true);
		};
	}, [align, isOpen]);

	return (
		<div
			ref={containerRef}
			className={joinClasses("relative min-w-0", isOpen && "z-70", className)}
			{...props}
		>
			<ModuleTooltip className="w-full" title={label} position="top">
				<button
					type="button"
					aria-expanded={isOpen}
					aria-haspopup="menu"
					aria-label={label}
					disabled={columns.length === 0}
					onClick={() => setIsOpen((current) => !current)}
					className={joinClasses(
						"inline-flex h-12 w-full items-center justify-center rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white",
						moduleAccentClassNames.hoverBorder,
						moduleAccentClassNames.hoverSoftBackground,
						moduleAccentClassNames.focusRing,
					)}
				>
					<Columns3 className="h-4 w-4" aria-hidden="true" />
				</button>
			</ModuleTooltip>

			{isOpen && portalElement
				? createPortal(
				<div
					ref={menuRef}
					role="menu"
					style={menuStyle}
					className={joinClasses(
						"z-[80] overflow-hidden rounded-lg border border-darknavy/10 bg-white text-darknavy shadow-[0_18px_50px_rgba(33,39,56,0.18)]",
					)}
				>
					<div className="flex items-center justify-between border-b border-darknavy/10 px-3 py-2">
						<span className="text-xs font-bold uppercase tracking-wide text-darknavy/55">
							Visible columns
						</span>
						<div className="flex items-center gap-1.5">
							<button
								type="button"
								onClick={() => {
									table.resetColumnOrder();
									table.resetColumnVisibility();
								}}
								className={joinClasses(
									"rounded-md px-2 py-1 text-xs font-semibold text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2",
									moduleAccentClassNames.focusRing,
								)}
							>
								Default
							</button>
							<button
								type="button"
								disabled={!hasHideableColumns || allHideableColumnsVisible}
								onClick={() => table.toggleAllColumnsVisible(true)}
								className={joinClasses(
									"rounded-md px-2 py-1 text-xs font-semibold text-skyblue transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:text-darknavy/35 disabled:hover:bg-transparent",
									moduleAccentClassNames.focusRing,
								)}
							>
								Show all
							</button>
						</div>
					</div>
					<div
						className="overflow-y-auto p-2"
						style={{ maxHeight: menuListMaxHeight }}
					>
						{columns.map((column) => {
							const isVisible = column.getIsVisible();
							const canHide = column.getCanHide();
							const canToggle =
								canHide && (!isVisible || visibleHideableColumnCount > 1);
							const columnLabel = columnLabelById.get(column.id) ?? column.id;

							return (
								<div
									key={column.id}
									onDragEnd={() => {
										setDraggedColumnId(null);
										setDropIndicator(null);
									}}
									onDragOver={(event) => {
										if (draggedColumnId && draggedColumnId !== column.id) {
											event.preventDefault();
											updateDropIndicator(event, column.id);
										}
									}}
									onDrop={(event) => {
										event.preventDefault();

										if (draggedColumnId) {
											moveColumn(
												draggedColumnId,
												column.id,
												dropIndicator?.columnId === column.id
													? dropIndicator.position
													: "before",
											);
										}

										setDraggedColumnId(null);
										setDropIndicator(null);
									}}
									className={joinClasses(
										"relative flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-sm font-semibold text-darknavy/75 transition",
										draggedColumnId === column.id &&
											"bg-skyblue/10 opacity-75",
										Boolean(draggedColumnId) &&
											draggedColumnId !== column.id &&
											"outline outline-1 outline-skyblue/25",
									)}
								>
									{dropIndicator?.columnId === column.id ? (
										<span
											aria-hidden="true"
											className={joinClasses(
												"pointer-events-none absolute left-2 right-2 z-10 h-1 rounded-full bg-skyblue shadow-[0_0_0_3px_rgba(33,39,56,0.16)]",
												dropIndicator.position === "before"
													? "top-0"
													: "bottom-0",
											)}
										/>
									) : null}
									<span
										draggable
										onDragStart={(event) => {
											event.dataTransfer.effectAllowed = "move";
											event.dataTransfer.setData("text/plain", column.id);
											setDraggedColumnId(column.id);
											setDropIndicator(null);
										}}
										className="inline-flex h-8 w-7 shrink-0 cursor-grab items-center justify-center rounded-md bg-darknavy/5 text-darknavy/65 transition hover:bg-skyblue/10 hover:text-darknavy active:cursor-grabbing"
										title="Drag column"
									>
										<GripVertical className="h-4 w-4" aria-hidden="true" />
									</span>
									<button
										type="button"
										role="menuitemcheckbox"
										aria-checked={isVisible}
										disabled={!canToggle}
										onClick={() => column.toggleVisibility(!isVisible)}
										className={joinClasses(
											"flex min-h-9 min-w-0 flex-1 items-center gap-3 rounded-md px-1.5 text-left transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent",
											moduleAccentClassNames.focusRing,
										)}
									>
										<span
											className={joinClasses(
												"inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border",
												isVisible
													? "border-skyblue bg-skyblue text-white"
													: "border-darknavy/15 bg-white text-transparent",
											)}
										>
											<Check className="h-3.5 w-3.5" aria-hidden="true" />
										</span>
										<span className="min-w-0 flex-1 truncate">{columnLabel}</span>
									</button>
								</div>
							);
						})}
					</div>
				</div>,
					portalElement,
				)
				: null}
		</div>
	);
}

function getColumnVisibilityLabel(header: unknown, fallback: string) {
	if (typeof header === "string") {
		return header;
	}

	if (typeof header === "number") {
		return String(header);
	}

	return fallback
		.replace(/[_-]+/g, " ")
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
