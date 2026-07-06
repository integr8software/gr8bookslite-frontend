"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
	AlertTriangle,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	LoaderCircle,
	Trash2,
	Upload,
} from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleImportMode = "all-rows" | "all-valid" | "selected-valid";

export type ModuleImportProgress = {
	imported: number;
	total: number;
};

export function ModuleImportProgressPanel({
	label = "Importing queued data",
	progress,
}: {
	label?: string;
	progress: ModuleImportProgress;
}) {
	const progressPercent =
		progress.total > 0
			? Math.round((progress.imported / progress.total) * 100)
			: 0;

	return (
		<div className="rounded-lg border border-skyblue/20 bg-skyblue/8 p-3">
			<div className="flex items-center justify-between gap-3 text-sm font-semibold text-darknavy">
				<span>{label}</span>
				<span>{progressPercent}%</span>
			</div>
			<div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
				<div
					className="h-full rounded-full bg-skyblue transition-all"
					style={{ width: `${progressPercent}%` }}
				/>
			</div>
			<p className="mt-2 text-xs font-medium text-darknavy/55">
				{progress.imported} of {progress.total} rows imported
			</p>
		</div>
	);
}

export function ModuleImportSelectionHeader({
	checked,
	disabled,
	isOpen,
	onClearSelection,
	onSelectAll,
	onSelectPage,
	onToggleOpen,
}: {
	checked: boolean;
	disabled?: boolean;
	isOpen: boolean;
	onClearSelection: () => void;
	onSelectAll: () => void;
	onSelectPage: () => void;
	onToggleOpen: () => void;
}) {
	const menuRef = useCloseOnOutsidePointer<HTMLTableCellElement>(
		isOpen,
		onToggleOpen,
	);

	return (
		<th
			ref={menuRef}
			className="module-import-preview-header sticky left-0 top-0 z-40 w-16 px-2 py-2"
		>
			<input
				type="checkbox"
				checked={checked}
				readOnly
				disabled={disabled}
				onClick={(event) => {
					event.preventDefault();
					onToggleOpen();
				}}
				aria-label="Choose rows to select"
				title="Choose rows to select"
				className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20 disabled:opacity-45"
			/>
			{isOpen ? (
				<div
					role="menu"
					className="absolute left-2 top-full z-50 mt-1 w-48 overflow-hidden rounded-md border border-darknavy/10 bg-white py-1 text-left text-xs font-semibold normal-case text-darknavy shadow-lg"
				>
					<button
						type="button"
						role="menuitem"
						onClick={onSelectPage}
						className="block w-full px-3 py-2 text-left hover:bg-skyblue/8"
					>
						Select current page
					</button>
					<button
						type="button"
						role="menuitem"
						onClick={onSelectAll}
						className="block w-full px-3 py-2 text-left hover:bg-skyblue/8"
					>
						Select all records
					</button>
					{checked ? (
						<button
							type="button"
							role="menuitem"
							onClick={onClearSelection}
							className="block w-full border-t border-darknavy/8 px-3 py-2 text-left text-coralpink hover:bg-coralpink/8"
						>
							Clear selection
						</button>
					) : null}
				</div>
			) : null}
		</th>
	);
}

export function ModuleImportFooter({
	canImport,
	canImportAllRows,
	canImportAllValid,
	canImportSelectedValid,
	importMode,
	isBusy,
	isImportMenuOpen,
	selectedValidRowsCount,
	totalRowsCount,
	validRowsCount,
	onCancel,
	onImport,
	onReset,
	onSetImportMode,
	onToggleImportMenu,
}: {
	canImport: boolean;
	canImportAllRows: boolean;
	canImportAllValid: boolean;
	canImportSelectedValid: boolean;
	importMode: ModuleImportMode;
	isBusy?: boolean;
	isImportMenuOpen: boolean;
	selectedValidRowsCount: number;
	totalRowsCount: number;
	validRowsCount: number;
	onCancel: () => void;
	onImport: (mode: ModuleImportMode) => void;
	onReset: () => void;
	onSetImportMode: (mode: ModuleImportMode) => void;
	onToggleImportMenu: () => void;
}) {
	const menuRef = useCloseOnOutsidePointer<HTMLDivElement>(
		isImportMenuOpen,
		onToggleImportMenu,
	);

	return (
		<div className="grid grid-cols-2 gap-2 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto] lg:items-center">
			<button
				type="button"
				onClick={onReset}
				disabled={isBusy}
				className="order-2 inline-flex h-10 w-full items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-55 lg:order-none lg:w-auto"
			>
				Reset
			</button>
			<div className="hidden lg:block" aria-hidden="true" />
			<button
				type="button"
				onClick={onCancel}
				disabled={isBusy}
				className="order-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-55 lg:order-none lg:w-auto"
			>
				Cancel
			</button>
			<div
				ref={menuRef}
				className="order-1 col-span-2 relative flex w-full lg:order-none lg:col-span-1 lg:w-auto"
			>
				<button
					type="button"
					onClick={() => onImport(importMode)}
					disabled={!canImport}
					className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-l-md bg-skyblue px-4 text-sm font-semibold text-white transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-55 lg:h-10 lg:w-auto"
				>
					{isBusy ? (
						<LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
					) : (
						<Upload className="h-4 w-4" aria-hidden="true" />
					)}
					{importMode === "selected-valid"
						? "Import Selected"
						: importMode === "all-valid"
							? "Import Valid"
							: "Import Data"}
				</button>
				<button
					type="button"
					onClick={onToggleImportMenu}
					disabled={!canImportAllRows && !canImportSelectedValid}
					className="inline-flex h-11 w-11 items-center justify-center rounded-r-md border-l border-white/25 bg-skyblue text-white transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-55 lg:h-10"
					aria-label="Choose import type"
					aria-expanded={isImportMenuOpen}
				>
					<ChevronDown className="h-4 w-4" aria-hidden="true" />
				</button>
				{isImportMenuOpen ? (
					<div
						role="menu"
						className="absolute bottom-full right-0 z-50 mb-1 w-64 overflow-hidden rounded-md border border-darknavy/10 bg-white py-1 text-left text-xs font-semibold text-darknavy shadow-lg"
					>
						<ImportModeMenuItem
							count={totalRowsCount}
							disabled={!canImportAllRows}
							label="Import all rows"
							onClick={() => onSetImportMode("all-rows")}
						/>
						<ImportModeMenuItem
							count={validRowsCount}
							disabled={!canImportAllValid}
							label="Import all valid rows"
							onClick={() => onSetImportMode("all-valid")}
						/>
						<ImportModeMenuItem
							count={selectedValidRowsCount}
							disabled={!canImportSelectedValid}
							label="Import selected valid rows"
							onClick={() => onSetImportMode("selected-valid")}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
}

function ImportModeMenuItem({
	count,
	disabled,
	label,
	onClick,
}: {
	count: number;
	disabled: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			role="menuitem"
			onClick={onClick}
			disabled={disabled}
			className="block w-full border-t border-darknavy/8 px-3 py-2 text-left first:border-t-0 hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-45"
		>
			{label} ({count})
		</button>
	);
}

export function ModuleImportPaginationBar({
	currentPage,
	removeLabel,
	selectedCount,
	selectedSummary,
	totalPages,
	onNextPage,
	onPreviousPage,
	onRemoveSelected,
}: {
	currentPage: number;
	removeLabel?: string;
	selectedCount: number;
	selectedSummary?: ReactNode;
	totalPages: number;
	onNextPage: () => void;
	onPreviousPage: () => void;
	onRemoveSelected: () => void;
}) {
	return (
		<div className="grid grid-cols-2 items-center gap-2 border-t border-darknavy/10 px-3 py-2 sm:grid-cols-[1fr_auto_1fr]">
			<span className="text-xs font-semibold text-darknavy/55">
				Page {currentPage} of {totalPages}
			</span>
			{selectedSummary ? (
				<span className="col-span-2 row-start-2 justify-self-center text-xs font-semibold text-skyblue sm:col-span-1 sm:row-auto">
					{selectedSummary}
				</span>
			) : (
				<span className="hidden sm:block" />
			)}
			<div className="flex flex-wrap justify-self-end gap-2">
				<button
					type="button"
					disabled={selectedCount === 0}
					onClick={onRemoveSelected}
					className="inline-flex h-8 items-center gap-1 rounded-md border border-coralpink/25 px-2 text-xs font-semibold text-coralpink transition hover:bg-coralpink/8 disabled:cursor-not-allowed disabled:opacity-45"
				>
					<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
					{removeLabel ??
						(selectedCount > 0
							? `Remove ${selectedCount} ${selectedCount === 1 ? "Row" : "Rows"}`
							: "Remove Row")}
				</button>
				<button
					type="button"
					disabled={currentPage <= 1}
					onClick={onPreviousPage}
					className="inline-flex h-8 items-center gap-1 rounded-md border border-darknavy/10 px-2 text-xs font-semibold text-darknavy disabled:cursor-not-allowed disabled:opacity-45"
				>
					<ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
					Prev
				</button>
				<button
					type="button"
					disabled={currentPage >= totalPages}
					onClick={onNextPage}
					className="inline-flex h-8 items-center gap-1 rounded-md border border-darknavy/10 px-2 text-xs font-semibold text-darknavy disabled:cursor-not-allowed disabled:opacity-45"
				>
					Next
					<ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
				</button>
			</div>
		</div>
	);
}

export function ModuleImportEditableCell({
	errors,
	warnings,
	type = "text",
	value,
	onChange,
	onPaste,
}: {
	errors?: string[];
	warnings?: string[];
	type?: "number" | "text";
	value: string;
	onChange: (value: string) => void;
	onPaste?: (text: string) => void;
}) {
	const messages = [...(errors ?? []), ...(warnings ?? [])];

	return (
		<label className="relative block">
			<input
				type={type}
				min={type === "number" ? 0 : undefined}
				value={value}
				onChange={(event) => {
					const nextValue = event.target.value;

					if (type === "number" && nextValue.trim() && Number(nextValue) < 0) {
						return;
					}

					onChange(nextValue);
				}}
				onKeyDown={(event) => {
					if (
						type === "number" &&
						["-", "+", ".", "e", "E"].includes(event.key)
					) {
						event.preventDefault();
					}
				}}
				onPaste={(event) => {
					const text = event.clipboardData.getData("text");

					if (
						type === "number" &&
						!isModuleImportTabularPaste(text) &&
						!/^\d+$/.test(text.trim())
					) {
						event.preventDefault();
						return;
					}

					if (onPaste && isModuleImportTabularPaste(text)) {
						event.preventDefault();
						onPaste(text);
					}
				}}
				onWheel={(event) => {
					if (type === "number") {
						event.currentTarget.blur();
					}
				}}
				title={messages.join(" ")}
				className={joinClasses(
					"h-10 w-full rounded-md border bg-white px-2 text-sm font-medium text-darknavy outline-none transition focus:ring-2",
					messages.length ? "pr-9" : "",
					errors?.length
						? "border-coralpink/45 focus:border-coralpink focus:ring-coralpink/15"
						: warnings?.length
							? "border-amber-400/70 focus:border-amber-500 focus:ring-amber-500/15"
							: "border-darknavy/12 focus:border-skyblue focus:ring-skyblue/15",
				)}
			/>
			<ModuleImportCellIssueIcon errors={errors} warnings={warnings} />
		</label>
	);
}

export function ModuleImportEditableSelect<TOption extends string>({
	errors,
	warnings,
	options,
	value,
	onChange,
	onPaste,
}: {
	errors?: string[];
	warnings?: string[];
	options: readonly TOption[];
	value: string;
	onChange: (value: TOption) => void;
	onPaste?: (text: string) => void;
}) {
	const messages = [...(errors ?? []), ...(warnings ?? [])];

	return (
		<label className="relative block">
			<select
				value={value}
				onChange={(event) => onChange(event.target.value as TOption)}
				onPaste={(event) => {
					const text = event.clipboardData.getData("text");

					if (onPaste && text.trim()) {
						event.preventDefault();
						onPaste(text);
					}
				}}
				title={messages.join(" ")}
				className={joinClasses(
					"h-10 w-full rounded-md border bg-white px-2 text-sm font-medium text-darknavy outline-none transition focus:ring-2",
					messages.length ? "pr-9" : "",
					errors?.length
						? "border-coralpink/45 focus:border-coralpink focus:ring-coralpink/15"
						: warnings?.length
							? "border-amber-400/70 focus:border-amber-500 focus:ring-amber-500/15"
							: "border-darknavy/12 focus:border-skyblue focus:ring-skyblue/15",
				)}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
			<ModuleImportCellIssueIcon errors={errors} warnings={warnings} />
		</label>
	);
}

export function ModuleImportCellIssueIcon({
	errors,
	warnings,
}: {
	errors?: string[];
	warnings?: string[];
}) {
	const messages = [...(errors ?? []), ...(warnings ?? [])];

	if (messages.length === 0) {
		return null;
	}

	const hasErrors = Boolean(errors?.length);

	return (
		<span
			className={joinClasses(
				"absolute right-2 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border bg-white",
				hasErrors
					? "border-coralpink/45 text-coralpink"
					: "border-amber-400/70 text-amber-600",
			)}
			title={messages.join(" ")}
			aria-label={messages.join(" ")}
		>
			<AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
		</span>
	);
}

export function isModuleImportTabularPaste(text: string) {
	return text.includes("\t") || text.includes("\n") || text.includes("\r");
}

function useCloseOnOutsidePointer<TElement extends HTMLElement>(
	isOpen: boolean,
	onClose: () => void,
) {
	const ref = useRef<TElement>(null);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function closeMenu(event: PointerEvent) {
			if (
				event.target instanceof Node &&
				!ref.current?.contains(event.target)
			) {
				onClose();
			}
		}

		function closeMenuOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onClose();
			}
		}

		document.addEventListener("pointerdown", closeMenu);
		document.addEventListener("keydown", closeMenuOnEscape);

		return () => {
			document.removeEventListener("pointerdown", closeMenu);
			document.removeEventListener("keydown", closeMenuOnEscape);
		};
	}, [isOpen, onClose]);

	return ref;
}
