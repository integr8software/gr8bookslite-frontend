"use client";

import { ChevronDown, Download, Plus, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type CSSProperties,
	type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import type {
	ModuleDataEntryAddButtonProps,
	ModuleDataEntryAddColumnButtonProps,
	ModuleDataEntryClearAction,
	ModuleDataEntryClearButtonProps,
	ModuleDataEntryExportButtonProps,
} from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export function ModuleDataEntryToolbarButton({
	disabled = false,
	icon: Icon,
	label,
	onClick,
}: {
	disabled?: boolean;
	icon: LucideIcon;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-skyblue/20 bg-white px-3 text-xs font-semibold text-skyblue shadow-sm transition hover:border-skyblue/35 hover:bg-skyblue/8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-45"
		>
			<Icon className="h-4 w-4" aria-hidden="true" />
			{label}
		</button>
	);
}

export function ModuleDataEntryExportButton({
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

export function ModuleDataEntryAddColumnButton({
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
						<h2 className="text-base font-semibold text-darknavy">Add Rows</h2>
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
