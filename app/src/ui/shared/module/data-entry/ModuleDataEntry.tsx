"use client";

import {
	AlertCircle,
	Asterisk,
	ChevronDown,
	Copy,
	Download,
	Eye,
	EyeOff,
	GripVertical,
	MoreVertical,
	Pencil,
	Plus,
	Ruler,
	Settings2,
	StretchHorizontal,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type CSSProperties,
	type FormEvent,
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleDataEntryColumn<TRow> = {
	header: string;
	id: string;
	isRemovable?: boolean;
	width?: number;
	widthClassName: string;
	widthMode?: "auto" | "fixed";
	renderCell: (row: TRow, index: number) => ReactNode;
};

export type ModuleDataEntryColumnOption = {
	id: string;
	isHideable?: boolean;
	isRequired?: boolean;
	isRequirementConfigurable?: boolean;
	isVisible: boolean;
	label: string;
	width?: number;
	widthMode?: "auto" | "fixed";
};

export type ModuleDataEntryAddColumnOption = {
	id: string;
	label: string;
};

export type ModuleDataEntryExportOption = {
	id: string;
	label: string;
	onSelect: () => void;
};

export type ModuleDataEntryClearAction =
	| "all"
	| "with-data"
	| "incomplete"
	| "no-data";

type ModuleDataEntryProps<TRow extends { id: string }> = {
	columns: ModuleDataEntryColumn<TRow>[];
	description: string;
	emptyRowLabel?: string;
	error?: string;
	exportOptions?: ModuleDataEntryExportOption[];
	isDraggable?: boolean;
	isReadonly: boolean;
	rows: TRow[];
	title: string;
	addColumnOptions?: ModuleDataEntryAddColumnOption[];
	columnOptions?: ModuleDataEntryColumnOption[];
	onAddColumn?: (columnId: string) => void;
	onAddRows: (count: number) => void;
	onAutoColumnWidth?: (columnId: string) => void;
	onClearRows?: (action: ModuleDataEntryClearAction) => void;
	onDuplicateRow: (rowId: string) => void;
	onExport?: () => void;
	onImport?: () => void;
	onInsertRow: (rowId: string, position: "above" | "below") => void;
	onMoveColumn?: (fromColumnId: string, toColumnId: string) => void;
	onMoveRow: (fromRowId: string, toRowId: string) => void;
	onRemoveColumn?: (columnId: string) => void;
	onRemoveRow: (rowId: string) => void;
	onToggleColumnRequired?: (columnId: string, isRequired: boolean) => void;
	onToggleColumnVisibility?: (columnId: string, isVisible: boolean) => void;
	onUpdateColumnHeader?: (columnId: string, header: string) => void;
	onUpdateColumnWidth?: (columnId: string, width: number) => void;
};

export type ModuleDataEntryAddButtonProps = {
	align?: "left" | "right";
	isOpen: boolean;
	label?: string;
	onAddRows: (count: number) => void;
	onOpenChange: (isOpen: boolean) => void;
};

export type ModuleDataEntryClearButtonProps = {
	align?: "left" | "right";
	isOpen: boolean;
	onClearRows: (action: ModuleDataEntryClearAction) => void;
	onOpenChange: (isOpen: boolean) => void;
};

type ModuleDataEntryAddColumnButtonProps = {
	align?: "left" | "right";
	options: ModuleDataEntryAddColumnOption[];
	onAddColumn: (columnId: string) => void;
};

type ModuleDataEntryColumnSettingsButtonProps = {
	align?: "left" | "right";
	columns: ModuleDataEntryColumnOption[];
	onMoveColumn?: (fromColumnId: string, toColumnId: string) => void;
	onAutoColumnWidth?: (columnId: string) => void;
	onToggleColumnRequired?: (columnId: string, isRequired: boolean) => void;
	onToggleColumnVisibility?: (columnId: string, isVisible: boolean) => void;
	onUpdateColumnHeader?: (columnId: string, header: string) => void;
	onUpdateColumnWidth?: (columnId: string, width: number) => void;
};

type ModuleDataEntryExportButtonProps = {
	align?: "left" | "right";
	options: ModuleDataEntryExportOption[];
};

export function ModuleDataEntry<TRow extends { id: string }>({
	addColumnOptions = [],
	columnOptions = [],
	columns,
	description,
	emptyRowLabel = "line",
	error,
	exportOptions = [],
	isDraggable = false,
	isReadonly,
	rows,
	title,
	onAddColumn,
	onAddRows,
	onAutoColumnWidth,
	onClearRows,
	onDuplicateRow,
	onExport,
	onImport,
	onInsertRow,
	onMoveColumn,
	onMoveRow,
	onRemoveColumn,
	onRemoveRow,
	onToggleColumnRequired,
	onToggleColumnVisibility,
	onUpdateColumnHeader,
	onUpdateColumnWidth,
}: ModuleDataEntryProps<TRow>) {
	const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);
	const [openAddMenu, setOpenAddMenu] = useState<"footer" | "header" | null>(
		null,
	);
	const [openClearMenu, setOpenClearMenu] = useState<
		"footer" | "header" | null
	>(null);
	const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
	const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
	const [rowDropTargetId, setRowDropTargetId] = useState<string | null>(null);
	const [columnDropTargetId, setColumnDropTargetId] = useState<string | null>(
		null,
	);
	const [rowMenuStyle, setRowMenuStyle] = useState<CSSProperties>({});
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const rowMenuTriggerRefs = useRef(new Map<string, HTMLButtonElement>());
	const shouldScrollToBottomAfterAddRef = useRef(false);
	const canEditRows = !isReadonly;
	const canEditColumns =
		canEditRows &&
		Boolean(onMoveColumn || onRemoveColumn || onUpdateColumnHeader);
	const canConfigureColumns =
		canEditRows &&
		columnOptions.length > 0 &&
		Boolean(
			onMoveColumn ||
				onToggleColumnRequired ||
				onToggleColumnVisibility ||
				onUpdateColumnHeader ||
				onUpdateColumnWidth ||
				onAutoColumnWidth,
		);
	const hasHeaderActions = canEditRows || Boolean(onExport);
	const hasExportActions = Boolean(onExport) || exportOptions.length > 0;

	function updateRowMenuPosition(rowId: string) {
		const trigger = rowMenuTriggerRefs.current.get(rowId);

		if (!trigger) {
			return;
		}

		const rect = trigger.getBoundingClientRect();
		const menuWidth = 176;
		const menuHeight = 180;
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

		setRowMenuStyle({ left, top });
	}

	function isNearScrollBottom() {
		const scrollContainer = scrollContainerRef.current;

		if (!scrollContainer) {
			return false;
		}

		const bottomDistance =
			scrollContainer.scrollHeight -
			scrollContainer.scrollTop -
			scrollContainer.clientHeight;

		return bottomDistance <= 64;
	}

	function handleAddRows(count: number) {
		shouldScrollToBottomAfterAddRef.current = isNearScrollBottom();
		onAddRows(count);
	}

	useLayoutEffect(() => {
		if (!openMenuRowId) {
			return;
		}

		updateRowMenuPosition(openMenuRowId);
	}, [openMenuRowId]);

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

	useLayoutEffect(() => {
		if (!shouldScrollToBottomAfterAddRef.current) {
			return;
		}

		const scrollContainer = scrollContainerRef.current;

		if (!scrollContainer) {
			shouldScrollToBottomAfterAddRef.current = false;
			return;
		}

		scrollContainer.scrollTop = scrollContainer.scrollHeight;
		shouldScrollToBottomAfterAddRef.current = false;
	}, [rows.length]);

	const entryCountLabel = formatEntryCountLabel(rows.length, emptyRowLabel);

	return (
		<section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<div className="relative z-50 flex shrink-0 flex-col gap-3 rounded-t-lg border-b border-darknavy/10 bg-white px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
				<div>
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="text-base font-semibold text-darknavy">{title}</h2>
						<span className="inline-flex h-6 items-center rounded-full border border-darknavy/10 bg-offwhite px-2.5 text-[11px] font-semibold text-darknavy/60">
							{entryCountLabel}
						</span>
					</div>
					<p className="mt-1 text-sm text-darknavy/60">{description}</p>
				</div>
				{hasHeaderActions || hasExportActions ? (
					<div className="flex w-full flex-wrap items-center gap-1.5 xl:w-auto xl:justify-end">
						{canEditRows && onImport ? (
							<ModuleDataEntryToolbarButton
								icon={Upload}
								label="Import"
								onClick={onImport}
							/>
						) : null}
						{exportOptions.length > 0 ? (
							<ModuleDataEntryExportButton options={exportOptions} />
						) : onExport ? (
							<ModuleDataEntryToolbarButton
								icon={Download}
								label="Export"
								onClick={onExport}
							/>
						) : null}
						{canConfigureColumns ? (
							<ModuleDataEntryColumnSettingsButton
								columns={columnOptions}
								onAutoColumnWidth={onAutoColumnWidth}
								onMoveColumn={onMoveColumn}
								onToggleColumnRequired={onToggleColumnRequired}
								onToggleColumnVisibility={onToggleColumnVisibility}
								onUpdateColumnHeader={onUpdateColumnHeader}
								onUpdateColumnWidth={onUpdateColumnWidth}
							/>
						) : canEditRows && onAddColumn && addColumnOptions.length > 0 ? (
							<ModuleDataEntryAddColumnButton
								options={addColumnOptions}
								onAddColumn={onAddColumn}
							/>
						) : null}
						{canEditRows && onClearRows ? (
							<ModuleDataEntryClearButton
								isOpen={openClearMenu === "header"}
								onClearRows={onClearRows}
								onOpenChange={(isOpen) => {
									setOpenClearMenu(isOpen ? "header" : null);
									if (isOpen) {
										setOpenAddMenu(null);
									}
								}}
							/>
						) : null}
						{canEditRows ? (
							<ModuleDataEntryAddButton
								isOpen={openAddMenu === "header"}
								onAddRows={handleAddRows}
								onOpenChange={(isOpen) => {
									setOpenAddMenu(isOpen ? "header" : null);
									if (isOpen) {
										setOpenClearMenu(null);
									}
								}}
							/>
						) : null}
					</div>
				) : null}
			</div>
			<div ref={scrollContainerRef} className="max-h-[30rem] overflow-auto">
				<table className="w-max table-fixed border-separate border-spacing-0 text-left text-sm text-darknavy">
					<thead>
						<tr className="bg-skyblue text-xs font-semibold text-white">
							<th className="sticky top-0 z-40 w-[4.5rem] border border-skyblue/70 bg-skyblue px-2 py-2 text-center shadow-sm">
								No.
							</th>
							{columns.map((column) => (
								<th
									key={column.id}
									onDragEnd={() => {
										setDraggedColumnId(null);
										setColumnDropTargetId(null);
									}}
									onDragOver={(event) => {
										if (draggedColumnId && draggedColumnId !== column.id) {
											event.preventDefault();
											setColumnDropTargetId(column.id);
										}
									}}
									onDrop={() => {
										if (
											draggedColumnId &&
											draggedColumnId !== column.id &&
											onMoveColumn
										) {
											onMoveColumn(draggedColumnId, column.id);
										}

										setDraggedColumnId(null);
										setColumnDropTargetId(null);
									}}
									className={joinClasses(
										column.widthClassName,
										"sticky top-0 z-40 border border-skyblue/70 bg-skyblue px-3 py-2 shadow-sm transition",
										draggedColumnId === column.id && "opacity-60",
										columnDropTargetId === column.id &&
											(isDropAfter(
												draggedColumnId,
												column.id,
												columns.map((item) => item.id),
											)
												? "border-r-4 border-r-coralpink"
												: "border-l-4 border-l-coralpink"),
									)}
									style={createColumnWidthStyle(column.width)}
								>
									{canEditColumns ? (
										<EditableColumnHeader
											canRemove={
												columns.length > 1 && column.isRemovable !== false
											}
											column={column}
											onMoveColumn={onMoveColumn}
											onAutoColumnWidth={onAutoColumnWidth}
											onRemoveColumn={onRemoveColumn}
											onStartColumnDrag={setDraggedColumnId}
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
					<tbody>
						{rows.map((row, index) => (
							<tr
								key={row.id}
								onDragEnd={() => {
									setDraggedRowId(null);
									setRowDropTargetId(null);
								}}
								onDragOver={(event) => {
									if (draggedRowId && draggedRowId !== row.id) {
										event.preventDefault();
										setRowDropTargetId(row.id);
									}
								}}
								onDrop={() => {
									if (draggedRowId && draggedRowId !== row.id) {
										onMoveRow(draggedRowId, row.id);
									}

									setDraggedRowId(null);
									setRowDropTargetId(null);
								}}
								className={joinClasses(
									"bg-white",
									draggedRowId === row.id && "opacity-50",
								)}
							>
								<td
									className={joinClasses(
										rowHeaderClassName,
										"relative transition",
										rowDropTargetId === row.id &&
											(isDropAfter(
												draggedRowId,
												row.id,
												rows.map((item) => item.id),
											)
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
											setOpenMenuRowId((current) =>
												current === row.id ? null : row.id,
											)
										}
										className="absolute left-1 top-1/2 inline-flex h-6 w-4 -translate-y-1/2 items-center justify-center bg-transparent text-darknavy/45 transition hover:text-darknavy disabled:cursor-not-allowed disabled:opacity-30"
										aria-label={`Open ${emptyRowLabel} ${index + 1} actions`}
									>
										<MoreVertical className="h-4 w-4" aria-hidden="true" />
									</button>
									<div className="flex items-center justify-center">
										<span
											draggable={canEditRows && isDraggable}
											onDragStart={() => setDraggedRowId(row.id)}
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
												<RowActionMenu
													canRemove={rows.length > 1}
													rowLabel={`${emptyRowLabel} ${index + 1}`}
													style={rowMenuStyle}
													onAddAbove={() => {
														onInsertRow(row.id, "above");
														setOpenMenuRowId(null);
													}}
													onAddBelow={() => {
														onInsertRow(row.id, "below");
														setOpenMenuRowId(null);
													}}
													onDuplicate={() => {
														onDuplicateRow(row.id);
														setOpenMenuRowId(null);
													}}
													onRemove={() => {
														onRemoveRow(row.id);
														setOpenMenuRowId(null);
													}}
												/>,
												document.body,
											)
										: null}
								</td>
								{columns.map((column) => (
									<td
										key={column.id}
										className={joinClasses(
											cellClassName,
											"transition",
											rowDropTargetId === row.id &&
												(isDropAfter(
													draggedRowId,
													row.id,
													rows.map((item) => item.id),
												)
													? "border-b-4 border-b-skyblue"
													: "border-t-4 border-t-skyblue"),
											draggedColumnId === column.id && "opacity-60",
											columnDropTargetId === column.id &&
												(isDropAfter(
													draggedColumnId,
													column.id,
													columns.map((item) => item.id),
												)
													? "border-r-4 border-r-coralpink"
													: "border-l-4 border-l-coralpink"),
										)}
										style={createColumnWidthStyle(column.width)}
									>
										{column.renderCell(row, index)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="relative z-50 flex shrink-0 flex-col gap-3 rounded-b-lg border-t border-darknavy/10 bg-offwhite/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm font-medium text-darknavy/60">
					{entryCountLabel}
				</p>
				{hasHeaderActions || hasExportActions ? (
					<div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
						{canEditRows && onImport ? (
							<ModuleDataEntryToolbarButton
								icon={Upload}
								label="Import"
								onClick={onImport}
							/>
						) : null}
						{exportOptions.length > 0 ? (
							<ModuleDataEntryExportButton
								align="right"
								options={exportOptions}
							/>
						) : onExport ? (
							<ModuleDataEntryToolbarButton
								icon={Download}
								label="Export"
								onClick={onExport}
							/>
						) : null}
						{canConfigureColumns ? (
							<ModuleDataEntryColumnSettingsButton
								align="right"
								columns={columnOptions}
								onAutoColumnWidth={onAutoColumnWidth}
								onMoveColumn={onMoveColumn}
								onToggleColumnRequired={onToggleColumnRequired}
								onToggleColumnVisibility={onToggleColumnVisibility}
								onUpdateColumnHeader={onUpdateColumnHeader}
								onUpdateColumnWidth={onUpdateColumnWidth}
							/>
						) : canEditRows && onAddColumn && addColumnOptions.length > 0 ? (
							<ModuleDataEntryAddColumnButton
								align="right"
								options={addColumnOptions}
								onAddColumn={onAddColumn}
							/>
						) : null}
						{canEditRows && onClearRows ? (
							<ModuleDataEntryClearButton
								align="right"
								isOpen={openClearMenu === "footer"}
								onClearRows={onClearRows}
								onOpenChange={(isOpen) => {
									setOpenClearMenu(isOpen ? "footer" : null);
									if (isOpen) {
										setOpenAddMenu(null);
									}
								}}
							/>
						) : null}
						{canEditRows ? (
							<ModuleDataEntryAddButton
								align="right"
								isOpen={openAddMenu === "footer"}
								onAddRows={handleAddRows}
								onOpenChange={(isOpen) => {
									setOpenAddMenu(isOpen ? "footer" : null);
									if (isOpen) {
										setOpenClearMenu(null);
									}
								}}
							/>
						) : null}
					</div>
				) : null}
			</div>
			{error ? (
				<div className="border-t border-coralpink/20 bg-coralpink/8 px-5 py-3 text-sm font-semibold text-coralpink">
					<div className="flex items-start gap-2">
						<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
						<div className="grid gap-0.5">
							<span>is-valid: false</span>
							<span>Reason: {error}</span>
						</div>
					</div>
				</div>
			) : null}
		</section>
	);
}

function ModuleDataEntryToolbarButton({
	icon: Icon,
	label,
	onClick,
}: {
	icon: typeof Upload;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-skyblue/20 bg-white px-3 text-xs font-semibold text-skyblue shadow-sm transition hover:border-skyblue/35 hover:bg-skyblue/8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
		>
			<Icon className="h-4 w-4" aria-hidden="true" />
			{label}
		</button>
	);
}

function formatEntryCountLabel(count: number, label: string) {
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

function ModuleDataEntryExportButton({
	align = "left",
	options,
}: ModuleDataEntryExportButtonProps) {
	const triggerRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

	useLayoutEffect(() => {
		if (!isOpen || !triggerRef.current) {
			return;
		}

		const rect = triggerRef.current.getBoundingClientRect();
		const menuWidth = 176;
		const menuHeight = Math.min(220, 24 + options.length * 38);
		const viewportPadding = 8;
		const left =
			align === "right"
				? Math.min(
						Math.max(viewportPadding, rect.right - menuWidth),
						window.innerWidth - menuWidth - viewportPadding,
					)
				: Math.min(
						Math.max(viewportPadding, rect.left),
						window.innerWidth - menuWidth - viewportPadding,
					);
		const belowTop = rect.bottom + 6;
		const top =
			belowTop + menuHeight <= window.innerHeight - viewportPadding
				? belowTop
				: Math.max(viewportPadding, rect.top - menuHeight - 6);

		setMenuStyle({ left, top });
	}, [align, isOpen, options.length]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function closeMenu() {
			setIsOpen(false);
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node;

			if (
				triggerRef.current?.contains(target) ||
				(target instanceof Element && target.closest("[data-export-menu]"))
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
	}, [isOpen]);

	return (
		<div ref={triggerRef} className="relative inline-flex">
			<button
				type="button"
				onClick={() => setIsOpen((current) => !current)}
				className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-skyblue/20 bg-white px-3 text-xs font-semibold text-skyblue shadow-sm transition hover:border-skyblue/35 hover:bg-skyblue/8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
				aria-expanded={isOpen}
				aria-haspopup="menu"
			>
				<Download className="h-4 w-4" aria-hidden="true" />
				Export
				<ChevronDown
					className={joinClasses("h-4 w-4 transition", isOpen && "rotate-180")}
					aria-hidden="true"
				/>
			</button>
			{isOpen && typeof document !== "undefined"
				? createPortal(
						<div
							data-export-menu
							role="menu"
							style={menuStyle}
							className="fixed z-130 grid w-44 gap-1 rounded-lg border border-darknavy/10 bg-white p-1.5 text-left shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
						>
							{options.map((option) => (
								<button
									key={option.id}
									type="button"
									role="menuitem"
									onClick={() => {
										option.onSelect();
										setIsOpen(false);
									}}
									className="flex min-h-9 w-full items-center rounded-md px-3 text-sm font-semibold text-darknavy/72 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20"
								>
									{option.label}
								</button>
							))}
						</div>,
						document.body,
					)
				: null}
		</div>
	);
}

function ModuleDataEntryColumnSettingsButton({
	align = "left",
	columns,
	onAutoColumnWidth,
	onMoveColumn,
	onToggleColumnRequired,
	onToggleColumnVisibility,
	onUpdateColumnHeader,
	onUpdateColumnWidth,
}: ModuleDataEntryColumnSettingsButtonProps) {
	const triggerRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
	const [dropTargetColumnId, setDropTargetColumnId] = useState<string | null>(
		null,
	);
	const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
	const visibleColumnCount = columns.filter((column) => column.isVisible).length;

	useLayoutEffect(() => {
		if (!isOpen || !triggerRef.current) {
			return;
		}

		const rect = triggerRef.current.getBoundingClientRect();
		const menuWidth = 360;
		const viewportPadding = 8;
		const preferredHeight = Math.min(440, 84 + columns.length * 58);
		const left =
			align === "right"
				? Math.min(
						Math.max(viewportPadding, rect.right - menuWidth),
						window.innerWidth - menuWidth - viewportPadding,
					)
				: Math.min(
						Math.max(viewportPadding, rect.left),
						window.innerWidth - menuWidth - viewportPadding,
					);
		const belowTop = rect.bottom + 6;
		const availableBelow = window.innerHeight - belowTop - viewportPadding;
		const availableAbove = rect.top - viewportPadding - 6;
		const opensBelow = availableBelow >= 260 || availableBelow >= availableAbove;
		const availableHeight = Math.max(
			160,
			opensBelow ? availableBelow : availableAbove,
		);
		const maxHeight = Math.min(preferredHeight, availableHeight);
		const top = opensBelow
			? belowTop
			: Math.max(viewportPadding, rect.top - maxHeight - 6);

		setMenuStyle({ left, maxHeight, top });
	}, [align, columns.length, isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function closeMenu() {
			setIsOpen(false);
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node;

			if (
				triggerRef.current?.contains(target) ||
				(target instanceof Element &&
					target.closest("[data-column-settings-menu]"))
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

		function handleScroll(event: Event) {
			const target = event.target as Node;

			if (
				triggerRef.current?.contains(target) ||
				(target instanceof Element &&
					target.closest("[data-column-settings-menu]"))
			) {
				return;
			}

			closeMenu();
		}

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		window.addEventListener("resize", closeMenu);
		window.addEventListener("scroll", handleScroll, true);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("resize", closeMenu);
			window.removeEventListener("scroll", handleScroll, true);
		};
	}, [isOpen]);

	return (
		<div ref={triggerRef} className="relative inline-flex">
			<button
				type="button"
				onClick={() => setIsOpen((current) => !current)}
				className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-skyblue/20 bg-white px-3 text-xs font-semibold text-skyblue shadow-sm transition hover:border-skyblue/35 hover:bg-skyblue/8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
				aria-expanded={isOpen}
				aria-haspopup="menu"
			>
				<Settings2 className="h-4 w-4" aria-hidden="true" />
				Columns
				<ChevronDown
					className={joinClasses("h-4 w-4 transition", isOpen && "rotate-180")}
					aria-hidden="true"
				/>
			</button>
			{isOpen && typeof document !== "undefined"
				? createPortal(
						<div
							data-column-settings-menu
							role="menu"
							style={menuStyle}
							className="fixed z-130 flex w-[22.5rem] flex-col overflow-hidden rounded-lg border border-darknavy/10 bg-white p-2 text-left shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
						>
							<div className="shrink-0 px-2 pb-2 pt-1">
								<p className="text-xs font-semibold uppercase tracking-[0.16em] text-darknavy/45">
									Column Settings
								</p>
								<p className="mt-1 text-xs leading-5 text-darknavy/55">
									Show, rename, and drag columns into the order you need.
								</p>
							</div>
							<div className="grid min-h-0 gap-2 overflow-y-auto pr-1">
								{columns.map((column) => {
									const canHide =
										Boolean(onToggleColumnVisibility) &&
										column.isHideable !== false &&
										(!column.isVisible || visibleColumnCount > 1);
									const isRequiredColumn = Boolean(
										column.isRequired && column.isVisible,
									);
									const canToggleRequired =
										Boolean(onToggleColumnRequired) &&
										column.isVisible &&
										column.isRequirementConfigurable !== false;
									const isAutoWidth = column.widthMode === "auto";
									const canEditWidth =
										Boolean(onUpdateColumnWidth) && !isAutoWidth;
									return (
										<div
											key={column.id}
											onDragEnd={() => {
												setDraggedColumnId(null);
												setDropTargetColumnId(null);
											}}
											onDragOver={(event) => {
												if (
													draggedColumnId &&
													draggedColumnId !== column.id
												) {
													event.preventDefault();
													setDropTargetColumnId(column.id);
												}
											}}
											onDrop={() => {
												if (
													draggedColumnId &&
													draggedColumnId !== column.id &&
													onMoveColumn
												) {
													onMoveColumn(draggedColumnId, column.id);
												}

												setDraggedColumnId(null);
												setDropTargetColumnId(null);
											}}
											className={joinClasses(
												"app-theme-field-readonly grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border px-2 py-2 transition",
												draggedColumnId === column.id && "opacity-60",
												dropTargetColumnId === column.id &&
													(isDropAfter(
														draggedColumnId,
														column.id,
														columns.map((item) => item.id),
													)
														? "border-b-4 border-b-coralpink"
														: "border-t-4 border-t-coralpink"),
											)}
										>
											<span
												draggable={Boolean(onMoveColumn)}
												onDragStart={() => setDraggedColumnId(column.id)}
												title={`Drag ${column.label} column`}
												className={joinClasses(
													"inline-flex h-8 w-5 items-center justify-center text-darknavy/45",
													onMoveColumn &&
														"cursor-grab transition hover:text-darknavy active:cursor-grabbing",
												)}
											>
												<GripVertical className="h-4 w-4" aria-hidden="true" />
											</span>
											<InlineColumnName
												label={column.label}
												onRename={
													onUpdateColumnHeader
														? (nextLabel) =>
																onUpdateColumnHeader(column.id, nextLabel)
														: undefined
												}
											/>
											<div className="flex items-center gap-1">
												<button
													type="button"
													disabled={!canHide}
													onClick={() =>
														onToggleColumnVisibility?.(
															column.id,
															!column.isVisible,
														)
													}
													className={joinClasses(
														"inline-flex h-8 w-8 items-center justify-center rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-40",
														column.isVisible
															? "border-skyblue/25 bg-skyblue/10 text-skyblue"
															: "border-darknavy/10 bg-white text-darknavy/55 hover:bg-offwhite",
													)}
													aria-pressed={column.isVisible}
													aria-label={`Toggle ${column.label} column visibility`}
													title={column.isVisible ? "Hide column" : "Show column"}
												>
													{column.isVisible ? (
														<Eye className="h-3.5 w-3.5" aria-hidden="true" />
													) : (
														<EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
													)}
												</button>
												{canToggleRequired ? (
													<button
														type="button"
														onClick={() =>
															onToggleColumnRequired?.(
																column.id,
																!isRequiredColumn,
															)
														}
														className={joinClasses(
															"inline-flex h-8 w-8 items-center justify-center rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20",
															isRequiredColumn
																? "border-skyblue/25 bg-skyblue/10 text-skyblue"
																: "border-darknavy/10 bg-white text-darknavy/55 hover:bg-offwhite",
														)}
														aria-pressed={isRequiredColumn}
														aria-label={`Toggle ${column.label} required`}
														title={
															isRequiredColumn
																? "Make optional"
																: "Make required"
														}
													>
														<Asterisk className="h-3.5 w-3.5" aria-hidden="true" />
													</button>
												) : null}
											</div>
											{onUpdateColumnWidth || onAutoColumnWidth ? (
												<label className="col-span-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-t border-darknavy/8 pt-2 text-[11px] font-semibold text-darknavy/50">
													Width
													<div className="grid grid-cols-[minmax(0,1fr)_auto] gap-1">
													<div className="relative">
													<input
														type="number"
														min="50"
														max="800"
														step="1"
														value={column.width ?? 160}
														disabled={!canEditWidth}
														onChange={(event) =>
															onUpdateColumnWidth?.(
																column.id,
																clampColumnWidth(Number(event.target.value)),
															)
														}
														className="app-theme-field app-disabled-control h-8 w-full min-w-0 rounded-md border px-2 pr-7 text-xs font-semibold text-darknavy outline-none transition focus:border-skyblue/40 focus:ring-2 focus:ring-skyblue/15 disabled:cursor-not-allowed"
														aria-label={`Set ${column.label} column width`}
													/>
													<span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-darknavy/40">
														px
													</span>
													</div>
													{isAutoWidth && onUpdateColumnWidth ? (
														<button
															type="button"
															onClick={() =>
																onUpdateColumnWidth(
																	column.id,
																	clampColumnWidth(column.width ?? 160),
																)
															}
															className="inline-flex h-8 items-center gap-1 rounded-md border border-darknavy/10 bg-white px-2 text-[11px] font-semibold text-darknavy/60 transition hover:border-skyblue/25 hover:bg-skyblue/10 hover:text-skyblue"
															title="Switch back to manual width"
														>
															<Ruler className="h-3.5 w-3.5" aria-hidden="true" />
															Manual
														</button>
													) : onAutoColumnWidth ? (
														<button
															type="button"
															onClick={() => onAutoColumnWidth(column.id)}
															className="inline-flex h-8 items-center gap-1 rounded-md border border-darknavy/10 bg-white px-2 text-[11px] font-semibold text-darknavy/60 transition hover:border-skyblue/25 hover:bg-skyblue/10 hover:text-skyblue"
															title="Fit width automatically from the header and cell values"
														>
															<StretchHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
															Auto
														</button>
													) : null}
													</div>
												</label>
											) : null}
										</div>
									);
								})}
							</div>
						</div>,
						document.body,
					)
				: null}
		</div>
	);
}

export function ModuleDataEntryClearButton({
	align = "left",
	isOpen,
	onClearRows,
	onOpenChange,
}: ModuleDataEntryClearButtonProps) {
	const triggerRef = useRef<HTMLDivElement>(null);
	const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

	useLayoutEffect(() => {
		if (!isOpen || !triggerRef.current) {
			return;
		}

		const rect = triggerRef.current.getBoundingClientRect();
		const menuWidth = 204;
		const menuHeight = 188;
		const viewportPadding = 8;
		const left =
			align === "right"
				? Math.min(
						Math.max(viewportPadding, rect.right - menuWidth),
						window.innerWidth - menuWidth - viewportPadding,
					)
				: Math.min(
						Math.max(viewportPadding, rect.left),
						window.innerWidth - menuWidth - viewportPadding,
					);
		const belowTop = rect.bottom + 6;
		const top =
			belowTop + menuHeight <= window.innerHeight - viewportPadding
				? belowTop
				: Math.max(viewportPadding, rect.top - menuHeight - 6);

		setMenuStyle({ left, top });
	}, [align, isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function closeMenu() {
			onOpenChange(false);
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node;

			if (
				triggerRef.current?.contains(target) ||
				(target instanceof Element && target.closest("[data-clear-rows-menu]"))
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
	}, [isOpen, onOpenChange]);

	return (
		<div ref={triggerRef} className="relative inline-flex">
			<button
				type="button"
				onClick={() => {
					onClearRows("no-data");
					onOpenChange(false);
				}}
				className="inline-flex h-9 items-center justify-center rounded-l-md rounded-r-none border border-r-0 border-skyblue/20 bg-white px-3 text-xs font-semibold text-skyblue shadow-sm transition hover:border-skyblue/35 hover:bg-skyblue/8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
			>
				Clear
			</button>
			<button
				type="button"
				onClick={() => onOpenChange(!isOpen)}
				className="inline-flex h-9 w-9 items-center justify-center rounded-l-none rounded-r-md border border-skyblue/20 bg-white text-skyblue shadow-sm transition hover:border-skyblue/35 hover:bg-skyblue/8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
				aria-expanded={isOpen}
				aria-haspopup="menu"
				aria-label="Choose clear option"
			>
				<ChevronDown
					className={joinClasses("h-4 w-4 transition", isOpen && "rotate-180")}
					aria-hidden="true"
				/>
			</button>
			{isOpen && typeof document !== "undefined"
				? createPortal(
						<div
							data-clear-rows-menu
							role="menu"
							style={menuStyle}
							className="fixed z-130 grid w-[12.75rem] gap-1 rounded-lg border border-darknavy/10 bg-white p-1.5 text-left shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
						>
							{ClearRowActions.map((action) => (
								<button
									key={action.value}
									type="button"
									role="menuitem"
									onClick={() => {
										onClearRows(action.value);
										onOpenChange(false);
									}}
									className="flex min-h-9 w-full items-center rounded-md px-3 text-sm font-semibold text-darknavy/72 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20"
								>
									{action.label}
								</button>
							))}
						</div>,
						document.body,
					)
				: null}
		</div>
	);
}

export function ModuleDataEntryAddButton({
	align = "left",
	isOpen,
	label = "Add Item",
	onAddRows,
	onOpenChange,
}: ModuleDataEntryAddButtonProps) {
	const triggerRef = useRef<HTMLDivElement>(null);
	const [isCustomAddDialogOpen, setIsCustomAddDialogOpen] = useState(false);
	const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

	useLayoutEffect(() => {
		if (!isOpen || !triggerRef.current) {
			return;
		}

		const rect = triggerRef.current.getBoundingClientRect();
		const menuWidth = 152;
		const menuHeight = 188;
		const viewportPadding = 8;
		const left =
			align === "right"
				? Math.min(
						Math.max(viewportPadding, rect.right - menuWidth),
						window.innerWidth - menuWidth - viewportPadding,
					)
				: Math.min(
						Math.max(viewportPadding, rect.left),
						window.innerWidth - menuWidth - viewportPadding,
					);
		const belowTop = rect.bottom + 6;
		const top =
			belowTop + menuHeight <= window.innerHeight - viewportPadding
				? belowTop
				: Math.max(viewportPadding, rect.top - menuHeight - 6);

		setMenuStyle({ left, top });
	}, [align, isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function closeMenu() {
			onOpenChange(false);
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node;

			if (
				triggerRef.current?.contains(target) ||
				(target instanceof Element && target.closest("[data-add-rows-menu]"))
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
	}, [isOpen, onOpenChange]);

	function openCustomAddDialog() {
		onOpenChange(false);
		setIsCustomAddDialogOpen(true);
	}

	return (
		<div ref={triggerRef} className="relative inline-flex">
			<button
				type="button"
				onClick={() => {
					onAddRows(1);
					onOpenChange(false);
				}}
				className="inline-flex h-9 items-center justify-center gap-1.5 rounded-l-md rounded-r-none bg-skyblue px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				{label}
			</button>
			<button
				type="button"
				onClick={() => onOpenChange(!isOpen)}
				className="inline-flex h-9 w-9 items-center justify-center rounded-l-none rounded-r-md border-l border-white/25 bg-skyblue text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
				aria-expanded={isOpen}
				aria-haspopup="menu"
				aria-label="Choose number of lines to add"
			>
				<ChevronDown
					className={joinClasses("h-4 w-4 transition", isOpen && "rotate-180")}
					aria-hidden="true"
				/>
			</button>
			{isOpen && typeof document !== "undefined" ? (
				createPortal(
					<div
						data-add-rows-menu
						role="menu"
						style={menuStyle}
						className="fixed z-130 grid w-[9.5rem] gap-1 rounded-lg border border-darknavy/10 bg-white p-1.5 text-left shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
					>
						{AddLineCounts.map((count) => (
							<button
								key={count}
								type="button"
								role="menuitem"
								onClick={() => {
									onAddRows(count);
									onOpenChange(false);
								}}
								className="flex min-h-9 w-full items-center rounded-md px-3 text-sm font-semibold text-darknavy/72 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20"
							>
								Add {count}
							</button>
						))}
						<button
							type="button"
							role="menuitem"
							onClick={openCustomAddDialog}
							className="flex min-h-9 w-full items-center gap-2 rounded-md px-3 text-sm font-semibold text-skyblue transition hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20"
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add
						</button>
					</div>,
					document.body,
				)
			) : null}
			{isCustomAddDialogOpen && typeof document !== "undefined"
				? createPortal(
						<CustomAddRowsDialog
							onAddRows={(count) => {
								onAddRows(count);
								setIsCustomAddDialogOpen(false);
							}}
							onClose={() => setIsCustomAddDialogOpen(false)}
						/>,
						document.body,
					)
				: null}
		</div>
	);
}

function CustomAddRowsDialog({
	onAddRows,
	onClose,
}: {
	onAddRows: (count: number) => void;
	onClose: () => void;
}) {
	const [rowCount, setRowCount] = useState("10");
	const parsedCount = Number(rowCount);
	const rowsToAdd =
		Number.isFinite(parsedCount) && parsedCount > 0
			? Math.floor(parsedCount)
			: 0;
	const canAddRows = rowsToAdd >= 1 && rowsToAdd <= 100;

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!canAddRows) {
			return;
		}

		onAddRows(rowsToAdd);
	}

	return (
		<div
			role="presentation"
			className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}
		>
			<form
				onSubmit={handleSubmit}
				className="w-full max-w-sm rounded-lg border border-darknavy/10 bg-white p-5 shadow-[0_18px_60px_rgba(33,39,56,0.18)]"
			>
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="text-base font-semibold text-darknavy">
							Add Rows
						</h2>
						<p className="mt-1 text-sm text-darknavy/58">
							Maximum of 100 rows.
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-8 w-8 items-center justify-center rounded-md text-darknavy/55 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20"
						aria-label="Close add rows dialog"
					>
						<X className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
				<label className="mt-5 grid gap-2 text-sm font-semibold text-darknavy">
					Rows
					<input
						type="number"
						min="1"
						max="100"
						step="1"
						value={rowCount}
						onChange={(event) => setRowCount(event.target.value)}
						className="app-theme-field h-11 rounded-md border px-3 text-sm outline-none transition focus:border-skyblue/40 focus:ring-2 focus:ring-skyblue/15"
					/>
				</label>
				<div className="mt-5 flex justify-end gap-2">
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 transition hover:bg-skyblue/8 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={!canAddRows}
						className="inline-flex h-10 items-center justify-center rounded-md bg-skyblue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-45"
					>
						Add Rows
					</button>
				</div>
			</form>
		</div>
	);
}

function ModuleDataEntryAddColumnButton({
	align = "left",
	options,
	onAddColumn,
}: ModuleDataEntryAddColumnButtonProps) {
	const triggerRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

	useLayoutEffect(() => {
		if (!isOpen || !triggerRef.current) {
			return;
		}

		const rect = triggerRef.current.getBoundingClientRect();
		const menuWidth = 176;
		const menuHeight = Math.min(260, 44 + options.length * 38);
		const viewportPadding = 8;
		const left =
			align === "right"
				? Math.min(
						Math.max(viewportPadding, rect.right - menuWidth),
						window.innerWidth - menuWidth - viewportPadding,
					)
				: Math.min(
						Math.max(viewportPadding, rect.left),
						window.innerWidth - menuWidth - viewportPadding,
					);
		const belowTop = rect.bottom + 6;
		const top =
			belowTop + menuHeight <= window.innerHeight - viewportPadding
				? belowTop
				: Math.max(viewportPadding, rect.top - menuHeight - 6);

		setMenuStyle({ left, top });
	}, [align, isOpen, options.length]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function closeMenu() {
			setIsOpen(false);
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node;

			if (
				triggerRef.current?.contains(target) ||
				(target instanceof Element && target.closest("[data-add-column-menu]"))
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
	}, [isOpen]);

	return (
		<div ref={triggerRef} className="relative inline-flex">
			<button
				type="button"
				onClick={() => setIsOpen((current) => !current)}
				className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-skyblue px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
				aria-expanded={isOpen}
				aria-haspopup="menu"
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Add Column
				<ChevronDown
					className={joinClasses("h-4 w-4 transition", isOpen && "rotate-180")}
					aria-hidden="true"
				/>
			</button>
			{isOpen && typeof document !== "undefined"
				? createPortal(
						<div
							data-add-column-menu
							role="menu"
							style={menuStyle}
							className="fixed z-130 grid max-h-64 w-44 gap-1 overflow-auto rounded-lg border border-darknavy/10 bg-white p-1.5 text-left shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
						>
							{options.map((option) => (
								<button
									key={option.id}
									type="button"
									role="menuitem"
									onClick={() => {
										onAddColumn(option.id);
										setIsOpen(false);
									}}
									className="flex min-h-9 w-full items-center rounded-md px-3 text-sm font-semibold text-darknavy/72 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20"
								>
									{option.label}
								</button>
							))}
						</div>,
						document.body,
					)
				: null}
		</div>
	);
}

function RowActionMenu({
	canRemove,
	rowLabel,
	style,
	onAddAbove,
	onAddBelow,
	onDuplicate,
	onRemove,
}: {
	canRemove: boolean;
	rowLabel: string;
	style: CSSProperties;
	onAddAbove: () => void;
	onAddBelow: () => void;
	onDuplicate: () => void;
	onRemove: () => void;
}) {
	return (
		<div
			data-row-action-menu
			style={style}
			className="fixed z-130 grid w-44 gap-1 rounded-lg border border-darknavy/10 bg-white p-1.5 text-left shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
		>
			<RowMenuButton icon={Plus} label="Add Above" onClick={onAddAbove} />
			<RowMenuButton icon={Plus} label="Add Below" onClick={onAddBelow} />
			<RowMenuButton icon={Copy} label="Duplicate Item" onClick={onDuplicate} />
			<RowMenuButton
				disabled={!canRemove}
				icon={Trash2}
				label="Remove Item"
				tone="danger"
				onClick={onRemove}
				ariaLabel={`Remove ${rowLabel}`}
			/>
		</div>
	);
}

function EditableColumnHeader<TRow>({
	canRemove,
	column,
	onAutoColumnWidth,
	onMoveColumn,
	onRemoveColumn,
	onStartColumnDrag,
	onUpdateColumnHeader,
	onUpdateColumnWidth,
}: {
	canRemove: boolean;
	column: ModuleDataEntryColumn<TRow>;
	onAutoColumnWidth?: (columnId: string) => void;
	onMoveColumn?: (fromColumnId: string, toColumnId: string) => void;
	onRemoveColumn?: (columnId: string) => void;
	onStartColumnDrag: (columnId: string) => void;
	onUpdateColumnHeader?: (columnId: string, header: string) => void;
	onUpdateColumnWidth?: (columnId: string, width: number) => void;
}) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);
	const menuTriggerRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
	const isAutoWidth = column.widthMode === "auto";

	useLayoutEffect(() => {
		if (!isMenuOpen || !menuTriggerRef.current) {
			return;
		}

		const rect = menuTriggerRef.current.getBoundingClientRect();
		const menuWidth = 144;
		const menuHeight = 112;
		const viewportPadding = 8;
		const left = Math.min(
			Math.max(viewportPadding, rect.right - menuWidth),
			window.innerWidth - menuWidth - viewportPadding,
		);
		const belowTop = rect.bottom + 6;
		const top =
			belowTop + menuHeight <= window.innerHeight - viewportPadding
				? belowTop
				: Math.max(viewportPadding, rect.top - menuHeight - 6);

		setMenuStyle({ left, top });
	}, [isMenuOpen]);

	useEffect(() => {
		if (!isMenuOpen) {
			return;
		}

		function closeMenu() {
			setIsMenuOpen(false);
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node;

			if (
				menuTriggerRef.current?.contains(target) ||
				menuRef.current?.contains(target)
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
	}, [isMenuOpen]);

	return (
		<div
			className={joinClasses(
				"relative flex min-h-9 w-full items-center",
				isRenaming ? "gap-0" : "gap-1.5",
			)}
		>
			{onMoveColumn && !isRenaming ? (
				<span
					draggable
					onDragStart={() => onStartColumnDrag(column.id)}
					title={`Drag ${column.header} column`}
					className="inline-flex h-8 w-5 shrink-0 cursor-grab items-center justify-center text-white/80 transition hover:text-white active:cursor-grabbing"
					aria-label={`Drag ${column.header} column`}
				>
					<GripVertical className="h-4 w-4" aria-hidden="true" />
				</span>
			) : null}
			{isRenaming && onUpdateColumnHeader ? (
				<InlineRenameInput
					label={column.header}
					variant="header"
					onCancel={() => setIsRenaming(false)}
					onRename={(nextHeader) => {
						onUpdateColumnHeader(column.id, nextHeader);
						setIsRenaming(false);
					}}
				/>
			) : (
				<span className="min-w-0 flex-1 truncate">{column.header}</span>
			)}
			{isRenaming ? null : (
				<button
					ref={menuTriggerRef}
					type="button"
					onClick={() => setIsMenuOpen((current) => !current)}
					className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
					aria-label={`Open ${column.header} column options`}
					aria-expanded={isMenuOpen}
				>
					<MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
				</button>
			)}
			{!isRenaming && isMenuOpen && typeof document !== "undefined"
				? createPortal(
				<div
					ref={menuRef}
					style={menuStyle}
					className="fixed z-130 grid w-36 gap-1 rounded-md border border-darknavy/10 bg-white p-1 text-darknavy shadow-lg"
				>
					{onUpdateColumnHeader ? (
						<button
							type="button"
							onClick={() => {
								setIsRenaming(true);
								setIsMenuOpen(false);
							}}
							className="flex h-8 w-full items-center gap-2 rounded px-2 text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy"
						>
							<Pencil className="h-3.5 w-3.5" aria-hidden="true" />
							Rename
						</button>
					) : null}
					{isAutoWidth && onUpdateColumnWidth ? (
						<button
							type="button"
							onClick={() => {
								onUpdateColumnWidth(
									column.id,
									clampColumnWidth(column.width ?? 160),
								);
								setIsMenuOpen(false);
							}}
							className="flex h-8 items-center gap-2 rounded px-2 text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy"
						>
							<Ruler className="h-3.5 w-3.5" aria-hidden="true" />
							Manual Width
						</button>
					) : onAutoColumnWidth ? (
						<button
							type="button"
							onClick={() => {
								onAutoColumnWidth(column.id);
								setIsMenuOpen(false);
							}}
							className="flex h-8 items-center gap-2 rounded px-2 text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy"
						>
							<StretchHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
							Auto Width
						</button>
					) : null}
					{onRemoveColumn ? (
						<button
							type="button"
							disabled={!canRemove}
							onClick={() => {
								onRemoveColumn(column.id);
								setIsMenuOpen(false);
							}}
							className="flex h-8 items-center gap-2 rounded px-2 text-xs font-semibold text-coralpink transition hover:bg-coralpink/10 disabled:cursor-not-allowed disabled:opacity-40"
						>
							<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
							Remove
						</button>
					) : null}
				</div>,
				document.body,
			)
				: null}
			{!isRenaming && onUpdateColumnWidth && !isAutoWidth ? (
				<span
					role="separator"
					aria-orientation="vertical"
					aria-label={`Resize ${column.header} column`}
					title={`Drag to resize ${column.header}`}
					onPointerDown={(event) => {
						event.preventDefault();
						event.stopPropagation();
						const startX = event.clientX;
						const startWidth =
							event.currentTarget.closest("th")?.getBoundingClientRect()
								.width ??
							column.width ??
							160;

						function handlePointerMove(moveEvent: PointerEvent) {
							onUpdateColumnWidth?.(
								column.id,
								clampColumnWidth(startWidth + moveEvent.clientX - startX),
							);
						}

						function handlePointerUp() {
							document.removeEventListener("pointermove", handlePointerMove);
							document.removeEventListener("pointerup", handlePointerUp);
						}

						document.addEventListener("pointermove", handlePointerMove);
						document.addEventListener("pointerup", handlePointerUp);
					}}
					className="absolute -right-3 inset-y-[-0.5rem] z-70 w-2 cursor-col-resize touch-none transition hover:bg-citron/80"
				/>
			) : null}
		</div>
	);
}

function InlineColumnName({
	label,
	onRename,
}: {
	label: string;
	onRename?: (label: string) => void;
}) {
	const [isRenaming, setIsRenaming] = useState(false);

	return (
		<div className="flex min-w-0 items-center gap-1">
			{isRenaming && onRename ? (
				<InlineRenameInput
					label={label}
					onCancel={() => setIsRenaming(false)}
					onRename={(nextLabel) => {
						onRename(nextLabel);
						setIsRenaming(false);
					}}
				/>
			) : (
				<span className="min-w-0 flex-1 truncate text-sm font-semibold text-darknavy">
					{label}
				</span>
			)}
			{onRename && !isRenaming ? (
			<button
				type="button"
				onClick={() => setIsRenaming(true)}
				className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/55 transition hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20"
				aria-label={`Rename ${label} column`}
				title={`Rename ${label} column`}
			>
				<Pencil className="h-3.5 w-3.5" aria-hidden="true" />
			</button>
			) : null}
		</div>
	);
}

function InlineRenameInput({
	label,
	onCancel,
	onRename,
	variant = "default",
}: {
	label: string;
	onCancel: () => void;
	onRename: (label: string) => void;
	variant?: "default" | "header";
}) {
	const [value, setValue] = useState(label);

	function handleSave() {
		const nextLabel = value.trim();

		if (nextLabel) {
			onRename(nextLabel);
			return;
		}

		onCancel();
	}

	return (
		<input
			autoFocus
			type="text"
			value={value}
			onBlur={onCancel}
			onChange={(event) => setValue(event.target.value)}
			onKeyDown={(event) => {
				if (event.key === "Enter") {
					event.preventDefault();
					handleSave();
				}

				if (event.key === "Escape") {
					event.preventDefault();
					onCancel();
				}
			}}
			className={joinClasses(
				"app-theme-field min-w-0 flex-1 border text-xs font-semibold text-darknavy outline-none transition focus:border-skyblue/40 focus:ring-2 focus:ring-skyblue/15",
				variant === "header"
					? "-mx-2 h-9 w-[calc(100%+1rem)] rounded-none px-2"
					: "h-8 rounded-md px-2",
			)}
			aria-label={`Rename ${label} column`}
		/>
	);
}

function RowMenuButton({
	ariaLabel,
	disabled = false,
	icon: Icon,
	label,
	tone = "default",
	onClick,
}: {
	ariaLabel?: string;
	disabled?: boolean;
	icon: typeof Plus;
	label: string;
	tone?: "danger" | "default";
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			aria-label={ariaLabel}
			className={joinClasses(
				"flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-45",
				tone === "danger"
					? "text-coralpink hover:bg-coralpink/10"
					: "text-darknavy/72 hover:bg-skyblue/10 hover:text-darknavy",
			)}
		>
			<Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
			{label}
		</button>
	);
}

const AddLineCounts = [10, 25, 50] as const;

const ClearRowActions: {
	label: string;
	value: ModuleDataEntryClearAction;
}[] = [
	{ label: "All rows", value: "all" },
	{ label: "Rows with data", value: "with-data" },
	{ label: "Incomplete rows", value: "incomplete" },
	{ label: "Empty rows", value: "no-data" },
];

const rowHeaderClassName =
	"border border-darknavy/10 bg-offwhite/70 px-2 py-1 text-center text-xs font-semibold text-darknavy/65";

const cellClassName = "border border-darknavy/10 bg-white p-0 align-middle";

function clampColumnWidth(width: number) {
	return Math.min(800, Math.max(50, Math.round(width || 50)));
}

function createColumnWidthStyle(width?: number): CSSProperties | undefined {
	if (!width) {
		return undefined;
	}

	const pixelWidth = `${clampColumnWidth(width)}px`;
	return { maxWidth: pixelWidth, minWidth: pixelWidth, width: pixelWidth };
}

function isDropAfter(
	draggedId: string | null,
	targetId: string,
	orderedIds: string[],
) {
	if (!draggedId) {
		return false;
	}

	return orderedIds.indexOf(draggedId) < orderedIds.indexOf(targetId);
}
