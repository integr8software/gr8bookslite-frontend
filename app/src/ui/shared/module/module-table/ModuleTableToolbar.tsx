"use client";

import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type ComponentPropsWithoutRef,
	type ReactNode,
} from "react";
import type { Table } from "@tanstack/react-table";
import {
	Check,
	Columns3,
	GripVertical,
	RefreshCw,
	Search,
} from "lucide-react";
import {
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleTableFilterOption = {
	label: ReactNode;
	value: string;
};

type ModuleTableToolbarProps = ComponentPropsWithoutRef<"div"> & {
	children: ReactNode;
};

type ModuleTableSearchProps = Omit<
	ComponentPropsWithoutRef<"input">,
	"onChange" | "type" | "value"
> & {
	label: string;
	onChange: (value: string) => void;
	value: string;
};

type ModuleTableFilterSelectProps = Omit<
	ComponentPropsWithoutRef<"select">,
	"children" | "onChange" | "value"
> & {
	label: string;
	onChange: (value: string) => void;
	options: readonly ModuleTableFilterOption[];
	value: string;
};

type ModuleTableResetButtonProps = ComponentPropsWithoutRef<"button"> & {
	children?: ReactNode;
	isRefreshing?: boolean;
};

type ModuleTableColumnVisibilityButtonProps<TData> =
	ComponentPropsWithoutRef<"div"> & {
		align?: "left" | "right";
		label?: string;
		table: Table<TData>;
	};

export function ModuleTableToolbar({
	children,
	className,
	...props
}: ModuleTableToolbarProps) {
	return (
		<div
			className={joinClasses(
				"grid gap-4 bg-white p-4 sm:gap-5 sm:p-5 lg:grid-cols-[minmax(24rem,2.5fr)_repeat(auto-fit,minmax(11rem,1fr))]",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export function ModuleTableSearch({
	className,
	label,
	onChange,
	placeholder,
	value,
	...props
}: ModuleTableSearchProps) {
	return (
		<label className="relative block min-w-0">
			<span className="sr-only">{label}</span>
			<Search
				className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/45"
				aria-hidden="true"
			/>
			<input
				type="search"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className={joinClasses(
					"h-12 w-full rounded-lg border border-darknavy/10 bg-white pl-11 pr-4 text-sm text-darknavy shadow-sm shadow-darknavy/5 outline-none transition placeholder:text-darknavy/35 focus:ring-4",
					moduleAccentClassNames.hoverBorder,
					"focus:border-[rgb(var(--skyblue-rgb)/0.45)]",
					moduleAccentClassNames.focusRing,
					className,
				)}
				{...props}
			/>
		</label>
	);
}

export function ModuleTableFilterSelect({
	className,
	label,
	onChange,
	options,
	value,
	...props
}: ModuleTableFilterSelectProps) {
	return (
		<label className="relative block min-w-0">
			<span className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-semibold text-darknavy/70">
				{label}
			</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={joinClasses(
					"h-12 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition focus:ring-4",
					moduleAccentClassNames.hoverBorder,
					"focus:border-[rgb(var(--skyblue-rgb)/0.45)]",
					moduleAccentClassNames.focusRing,
					className,
				)}
				{...props}
			>
				{options.map((option) => (
					<option key={String(option.value)} value={option.value}>
						{formatFilterOptionLabel(option.label)}
					</option>
				))}
			</select>
		</label>
	);
}

function formatFilterOptionLabel(label: ReactNode) {
	if (typeof label === "string" && /^All\s+\S/.test(label)) {
		return "All";
	}

	return label;
}

export function ModuleTableResetButton({
	children = "Refresh",
	className,
	isRefreshing = false,
	type = "button",
	...props
}: ModuleTableResetButtonProps) {
	return (
		<button
			type={type}
			className={joinClasses(
				"inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-4",
				moduleAccentClassNames.hoverBorder,
				moduleAccentClassNames.hoverSoftBackground,
				moduleAccentClassNames.focusRing,
				className,
			)}
			{...props}
		>
			<RefreshCw
				className={joinClasses("h-4 w-4", isRefreshing && "animate-spin")}
				aria-hidden="true"
			/>
			{children}
		</button>
	);
}

export function ModuleTableColumnVisibilityButton<TData>({
	align = "right",
	className,
	label = "Columns",
	table,
	...props
}: ModuleTableColumnVisibilityButtonProps<TData>) {
	const [isOpen, setIsOpen] = useState(false);
	const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const columns = table.getAllLeafColumns();
	const hideableColumns = columns.filter((column) => column.getCanHide());
	const visibleColumnCount = columns.filter((column) =>
		column.getIsVisible(),
	).length;
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

	function moveColumn(sourceColumnId: string, targetColumnId: string) {
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

		nextColumnOrder.splice(targetIndex, 0, sourceColumn);
		table.setColumnOrder(nextColumnOrder);
	}

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target;

			if (
				target instanceof Node &&
				!containerRef.current?.contains(target)
			) {
				setIsOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	return (
		<div
			ref={containerRef}
			className={joinClasses("relative min-w-0", className)}
			{...props}
		>
			<button
				type="button"
				aria-expanded={isOpen}
				aria-haspopup="menu"
				disabled={columns.length === 0}
				onClick={() => setIsOpen((current) => !current)}
				className={joinClasses(
					"inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white",
					moduleAccentClassNames.hoverBorder,
					moduleAccentClassNames.hoverSoftBackground,
					moduleAccentClassNames.focusRing,
				)}
			>
				<Columns3 className="h-4 w-4" aria-hidden="true" />
				<span>{label}</span>
				<span className="rounded-full bg-darknavy/8 px-2 py-0.5 text-xs font-bold text-darknavy/65">
					{visibleColumnCount}/{columns.length}
				</span>
			</button>

			{isOpen ? (
				<div
					role="menu"
					className={joinClasses(
						"absolute top-[calc(100%+0.5rem)] z-30 w-72 overflow-hidden rounded-lg border border-darknavy/10 bg-white text-darknavy shadow-[0_18px_50px_rgba(33,39,56,0.18)]",
						align === "right" ? "right-0" : "left-0",
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
					<div className="max-h-80 overflow-y-auto p-2">
						{columns.map((column) => {
							const isVisible = column.getIsVisible();
							const canHide = column.getCanHide();
							const canToggle = canHide && (!isVisible || visibleHideableColumnCount > 1);
							const columnLabel = columnLabelById.get(column.id) ?? column.id;

							return (
								<div
									key={column.id}
									draggable
									onDragStart={() => setDraggedColumnId(column.id)}
									onDragEnd={() => setDraggedColumnId(null)}
									onDragOver={(event) => {
										if (draggedColumnId && draggedColumnId !== column.id) {
											event.preventDefault();
										}
									}}
									onDrop={(event) => {
										event.preventDefault();

										if (draggedColumnId) {
											moveColumn(draggedColumnId, column.id);
										}

										setDraggedColumnId(null);
									}}
									className={joinClasses(
										"flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-sm font-semibold text-darknavy/75 transition",
										draggedColumnId === column.id && "opacity-55",
										Boolean(draggedColumnId) &&
											draggedColumnId !== column.id &&
											"outline outline-1 outline-skyblue/25",
									)}
								>
									<span className="inline-flex h-8 w-7 shrink-0 cursor-grab items-center justify-center rounded-md text-darknavy/35 active:cursor-grabbing">
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
				</div>
			) : null}
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

