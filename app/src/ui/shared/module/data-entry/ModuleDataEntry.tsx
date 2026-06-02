"use client";

import {
	ChevronDown,
	Copy,
	MoreVertical,
	Plus,
	Trash2,
} from "lucide-react";
import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type CSSProperties,
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleDataEntryColumn<TRow> = {
	header: string;
	id: string;
	widthClassName: string;
	renderCell: (row: TRow, index: number) => ReactNode;
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
	isDraggable?: boolean;
	isReadonly: boolean;
	rows: TRow[];
	title: string;
	onAddRows: (count: number) => void;
	onClearRows?: (action: ModuleDataEntryClearAction) => void;
	onDuplicateRow: (rowId: string) => void;
	onInsertRow: (rowId: string, position: "above" | "below") => void;
	onMoveRow: (fromRowId: string, toRowId: string) => void;
	onRemoveRow: (rowId: string) => void;
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

export function ModuleDataEntry<TRow extends { id: string }>({
	columns,
	description,
	emptyRowLabel = "line",
	error,
	isDraggable = false,
	isReadonly,
	rows,
	title,
	onAddRows,
	onClearRows,
	onDuplicateRow,
	onInsertRow,
	onMoveRow,
	onRemoveRow,
}: ModuleDataEntryProps<TRow>) {
	const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);
	const [openAddMenu, setOpenAddMenu] = useState<"footer" | "header" | null>(
		null,
	);
	const [openClearMenu, setOpenClearMenu] = useState<
		"footer" | "header" | null
	>(null);
	const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
	const [rowMenuStyle, setRowMenuStyle] = useState<CSSProperties>({});
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const rowMenuTriggerRefs = useRef(new Map<string, HTMLButtonElement>());
	const shouldScrollToBottomAfterAddRef = useRef(false);
	const canEditRows = !isReadonly;

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

	return (
		<section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<div className="relative z-50 flex shrink-0 flex-col gap-3 rounded-t-lg border-b border-darknavy/10 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h2 className="text-base font-semibold text-darknavy">{title}</h2>
					<p className="mt-1 text-sm text-darknavy/60">{description}</p>
				</div>
				{canEditRows ? (
					<div className="flex flex-wrap items-center gap-2">
						{onClearRows ? (
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
					</div>
				) : null}
			</div>
			<div ref={scrollContainerRef} className="max-h-[30rem] overflow-auto">
				<table className="w-max min-w-[96rem] table-fixed border-separate border-spacing-0 text-left text-sm text-darknavy">
					<thead>
						<tr className="bg-skyblue text-xs font-semibold text-white">
							<th className="sticky top-0 z-40 w-[4.5rem] border border-skyblue/70 bg-skyblue px-2 py-2 text-center shadow-sm">
								No.
							</th>
							{columns.map((column) => (
								<th
									key={column.id}
									className={joinClasses(
										column.widthClassName,
										"sticky top-0 z-40 border border-skyblue/70 bg-skyblue px-3 py-2 shadow-sm",
									)}
								>
									{column.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map((row, index) => (
							<tr
								key={row.id}
								onDragEnd={() => setDraggedRowId(null)}
								onDragOver={(event) => event.preventDefault()}
								onDrop={() => {
									if (draggedRowId && draggedRowId !== row.id) {
										onMoveRow(draggedRowId, row.id);
									}

									setDraggedRowId(null);
								}}
								className={joinClasses(
									"bg-white",
									draggedRowId === row.id && "opacity-50",
								)}
							>
								<td className={joinClasses(rowHeaderClassName, "relative")}>
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
									<td key={column.id} className={cellClassName}>
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
					{rows.length} {rows.length === 1 ? "line" : "lines"}
				</p>
				{canEditRows ? (
					<div className="flex flex-wrap items-center gap-2 sm:justify-end">
						{onClearRows ? (
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
					</div>
				) : null}
			</div>
			{error ? (
				<p className="border-t border-darknavy/10 px-5 py-3 text-sm font-semibold text-coralpink">
					{error}
				</p>
			) : null}
		</section>
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
				className="inline-flex h-10 items-center justify-center rounded-l-md rounded-r-none bg-skyblue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
			>
				Clear
			</button>
			<button
				type="button"
				onClick={() => onOpenChange(!isOpen)}
				className="inline-flex h-10 w-10 items-center justify-center rounded-l-none rounded-r-md border-l border-white/25 bg-skyblue text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
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
	const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

	useLayoutEffect(() => {
		if (!isOpen || !triggerRef.current) {
			return;
		}

		const rect = triggerRef.current.getBoundingClientRect();
		const menuWidth = 144;
		const menuHeight = 236;
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

	return (
		<div ref={triggerRef} className="relative inline-flex">
			<button
				type="button"
				onClick={() => {
					onAddRows(1);
					onOpenChange(false);
				}}
				className="inline-flex h-10 items-center justify-center gap-2 rounded-l-md rounded-r-none bg-skyblue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				{label}
			</button>
			<button
				type="button"
				onClick={() => onOpenChange(!isOpen)}
				className="inline-flex h-10 w-10 items-center justify-center rounded-l-none rounded-r-md border-l border-white/25 bg-skyblue text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
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
					className="fixed z-130 grid w-36 gap-1 rounded-lg border border-darknavy/10 bg-white p-1.5 text-left shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
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
				</div>,
				document.body,
				)
			) : null}
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

const AddLineCounts = [5, 10, 15, 20, 25, 50] as const;

const ClearRowActions: {
	label: string;
	value: ModuleDataEntryClearAction;
}[] = [
	{ label: "Clear All", value: "all" },
	{ label: "Clear With Data", value: "with-data" },
	{ label: "Clear Incomplete", value: "incomplete" },
	{ label: "Clear No Data", value: "no-data" },
];

const rowHeaderClassName =
	"border border-darknavy/10 bg-offwhite/70 px-2 py-1 text-center text-xs font-semibold text-darknavy/65";

const cellClassName = "border border-darknavy/10 bg-white p-0 align-middle";
