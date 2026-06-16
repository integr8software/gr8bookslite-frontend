"use client";

import {
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Search,
	X,
} from "lucide-react";
import {
	AmountRangePicker,
	type AmountRangeValue,
} from "@/app/src/ui/shared/amount-range-picker/AmountRangePicker";
import {
	DateRangePicker,
	type DateRangeValue,
} from "@/app/src/ui/shared/date-range-picker/DateRangePicker";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type AppCopyFromRecord = {
	amount?: string;
	documentDate?: string;
	id: string;
	partyName?: string;
	remarks?: string;
	source: string;
	sourceNo: string;
};

export type AppCopyFromFiltersValue = {
	amountRange: AmountRangeValue;
	dateRange: DateRangeValue;
	query: string;
};

const EmptyCopyFromFilters: AppCopyFromFiltersValue = {
	amountRange: { from: "", to: "" },
	dateRange: { from: "", to: "" },
	query: "",
};

const CopyFromPageSize = 5;

export function AppCopyFromDropdown({
	disabled = false,
	records,
	selectionMode = "multiple",
	sources,
	onApply,
}: {
	disabled?: boolean;
	records: AppCopyFromRecord[];
	selectionMode?: "multiple" | "single";
	sources: string[];
	onApply: (recordIds: string[]) => void;
}) {
	const availableSources = useMemo(
		() => sources.filter((source) => source.trim() !== ""),
		[sources],
	);
	const menuRef = useRef<HTMLDivElement>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [activeSource, setActiveSource] = useState("");
	const [filters, setFilters] = useState<AppCopyFromFiltersValue>(
		EmptyCopyFromFilters,
	);
	const [pageIndex, setPageIndex] = useState(0);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const availableSourceSet = useMemo(
		() => new Set(availableSources),
		[availableSources],
	);
	const isDialogOpen = activeSource !== "";
	const sourceRecords = useMemo(
		() =>
			records.filter(
				(record) =>
					availableSourceSet.has(record.source) &&
					record.source === activeSource,
			),
		[activeSource, availableSourceSet, records],
	);
	const filteredRecords = useMemo(
		() => filterCopyFromRecords(sourceRecords, filters),
		[filters, sourceRecords],
	);
	const totalPages = Math.max(
		1,
		Math.ceil(filteredRecords.length / CopyFromPageSize),
	);
	const currentPageIndex = Math.min(pageIndex, totalPages - 1);
	const paginatedRecords = useMemo(
		() =>
			filteredRecords.slice(
				currentPageIndex * CopyFromPageSize,
				currentPageIndex * CopyFromPageSize + CopyFromPageSize,
			),
		[currentPageIndex, filteredRecords],
	);
	const visibleRecordIds = useMemo(
		() => paginatedRecords.map((record) => record.id),
		[paginatedRecords],
	);
	const selectedRecords = useMemo(
		() => sourceRecords.filter((record) => selectedIds.includes(record.id)),
		[selectedIds, sourceRecords],
	);
	const selectedTotalAmount = selectedRecords.reduce(
		(total, record) => total + parseCopyFromAmount(record.amount),
		0,
	);
	const hasSelectableRows = paginatedRecords.length > 0;
	const isAllVisibleSelected =
		hasSelectableRows &&
		visibleRecordIds.every((recordId) => selectedIds.includes(recordId));
	const isPartiallySelected =
		visibleRecordIds.some((recordId) => selectedIds.includes(recordId)) &&
		!isAllVisibleSelected;
	const pageStart =
		filteredRecords.length === 0 ? 0 : currentPageIndex * CopyFromPageSize + 1;
	const pageEnd = Math.min(
		filteredRecords.length,
		currentPageIndex * CopyFromPageSize + paginatedRecords.length,
	);

	useEffect(() => {
		if (!isMenuOpen && !isDialogOpen) {
			return;
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				closeDialog();
				setIsMenuOpen(false);
			}
		}

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isDialogOpen, isMenuOpen]);

	useEffect(() => {
		if (!isMenuOpen) {
			return;
		}

		function handlePointerDown(event: PointerEvent) {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setIsMenuOpen(false);
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [isMenuOpen]);

	function openSource(source: string) {
		setActiveSource(source);
		setSelectedIds([]);
		setFilters(EmptyCopyFromFilters);
		setPageIndex(0);
		setIsMenuOpen(false);
	}

	function updateFilters(nextFilters: AppCopyFromFiltersValue) {
		setFilters(nextFilters);
		setPageIndex(0);
	}

	function closeDialog() {
		setActiveSource("");
		setSelectedIds([]);
		setFilters(EmptyCopyFromFilters);
		setPageIndex(0);
	}

	function toggleRecord(recordId: string) {
		setSelectedIds((currentIds) => {
			if (selectionMode === "single") {
				return currentIds.includes(recordId) ? [] : [recordId];
			}

			return currentIds.includes(recordId)
				? currentIds.filter((currentId) => currentId !== recordId)
				: [...currentIds, recordId];
		});
	}

	function toggleVisibleRecords() {
		if (!hasSelectableRows) {
			return;
		}

		if (selectionMode === "single") {
			setSelectedIds((currentIds) =>
				currentIds.includes(visibleRecordIds[0]) ? [] : [visibleRecordIds[0]],
			);
			return;
		}

		setSelectedIds((currentIds) => {
			if (isAllVisibleSelected) {
				return currentIds.filter(
					(recordId) => !visibleRecordIds.includes(recordId),
				);
			}

			return Array.from(new Set([...currentIds, ...visibleRecordIds]));
		});
	}

	function applySelection() {
		if (selectedIds.length === 0) {
			return;
		}

		onApply(selectedIds);
		closeDialog();
	}

	return (
		<div className="relative" ref={menuRef}>
			<button
				type="button"
				disabled={disabled || availableSources.length === 0}
				onClick={() => setIsMenuOpen((current) => !current)}
				className="theme-accent-contrast-text inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-45"
				aria-expanded={isMenuOpen}
				aria-haspopup="menu"
			>
				Copy From
				<ChevronDown className="h-4 w-4" aria-hidden="true" />
			</button>
			{isMenuOpen ? (
				<div
					role="menu"
					className="absolute right-0 z-[120] mt-2 grid w-72 gap-1 rounded-lg border border-darknavy/10 bg-white p-1.5 text-sm shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
				>
					{availableSources.map((source) => (
						<button
							key={source}
							type="button"
							role="menuitem"
							onClick={() => openSource(source)}
							className="flex min-h-10 items-center justify-between gap-3 rounded-md px-3 text-left font-semibold text-darknavy transition hover:bg-skyblue/10 hover:text-darknavy"
						>
							<span className="min-w-0 truncate">{source}</span>
						</button>
					))}
				</div>
			) : null}
			<AppCopyFromSourceDialog
				activeSource={activeSource}
				filters={filters}
				filteredRecords={filteredRecords}
				isAllVisibleSelected={isAllVisibleSelected}
				isOpen={isDialogOpen}
				isPartiallySelected={isPartiallySelected}
				pageEnd={pageEnd}
				pageIndex={currentPageIndex}
				pageStart={pageStart}
				paginatedRecords={paginatedRecords}
				selectedIds={selectedIds}
				selectedTotalAmount={selectedTotalAmount}
				totalPages={totalPages}
				onApply={applySelection}
				onClose={closeDialog}
				onFiltersChange={updateFilters}
				onPageChange={setPageIndex}
				onToggleRecord={toggleRecord}
				onToggleVisibleRecords={toggleVisibleRecords}
			/>
		</div>
	);
}

export function AppCopyFromSourceDialog({
	activeSource,
	filters,
	filteredRecords,
	isAllVisibleSelected,
	isOpen,
	isPartiallySelected,
	pageEnd,
	pageIndex,
	pageStart,
	paginatedRecords,
	selectedIds,
	selectedTotalAmount,
	totalPages,
	onApply,
	onClose,
	onFiltersChange,
	onPageChange,
	onToggleRecord,
	onToggleVisibleRecords,
}: {
	activeSource: string;
	filters: AppCopyFromFiltersValue;
	filteredRecords: AppCopyFromRecord[];
	isAllVisibleSelected: boolean;
	isOpen: boolean;
	isPartiallySelected: boolean;
	pageEnd: number;
	pageIndex: number;
	pageStart: number;
	paginatedRecords: AppCopyFromRecord[];
	selectedIds: string[];
	selectedTotalAmount: number;
	totalPages: number;
	onApply: () => void;
	onClose: () => void;
	onFiltersChange: (value: AppCopyFromFiltersValue) => void;
	onPageChange: (value: number | ((current: number) => number)) => void;
	onToggleRecord: (recordId: string) => void;
	onToggleVisibleRecords: () => void;
}) {
	if (!isOpen || typeof document === "undefined") {
		return null;
	}

	return createPortal(
		<div
			role="presentation"
			className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}
		>
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby="copy-from-dialog-title"
				className="flex max-h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-white/20 bg-white shadow-[0_28px_90px_rgba(33,39,56,0.28)]"
			>
				<div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-5 py-4">
					<div className="min-w-0">
						<h2
							id="copy-from-dialog-title"
							className="text-lg font-semibold text-darknavy"
						>
							Copy From {activeSource}
						</h2>
						<p className="mt-1 text-sm text-darknavy/55">
							Select source transactions to copy into this voucher.
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy/60 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25"
						aria-label="Close copy from dialog"
					>
						<X className="h-5 w-5" aria-hidden="true" />
					</button>
				</div>
				<AppCopyFromFilters value={filters} onChange={onFiltersChange} />
				<div className="min-h-0 overflow-auto px-5 pb-4">
					<table className="min-w-full border-separate border-spacing-0 text-left text-sm">
						<thead className="sticky top-0 z-10 bg-offwhite text-xs font-semibold uppercase tracking-[0.12em] text-darknavy/50">
							<tr>
								<th className="w-12 border-b border-darknavy/10 px-3 py-3">
									<input
										type="checkbox"
										checked={isAllVisibleSelected}
										ref={(input) => {
											if (input) {
												input.indeterminate = isPartiallySelected;
											}
										}}
										disabled={paginatedRecords.length === 0}
										onChange={onToggleVisibleRecords}
										className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:opacity-40"
										aria-label="Select visible copy from rows"
									/>
								</th>
								<th className="border-b border-darknavy/10 px-3 py-3">
									Transaction No
								</th>
								<th className="border-b border-darknavy/10 px-3 py-3">
									Transaction Date
								</th>
								<th className="border-b border-darknavy/10 px-3 py-3">
									Party Name
								</th>
								<th className="border-b border-darknavy/10 px-3 py-3 text-right">
									Amount
								</th>
								<th className="border-b border-darknavy/10 px-3 py-3">
									Remarks
								</th>
							</tr>
						</thead>
						<tbody>
							{paginatedRecords.length > 0 ? (
								paginatedRecords.map((record) => {
									const isSelected = selectedIds.includes(record.id);

									return (
										<tr
											key={record.id}
											className={joinClasses(
												"transition hover:bg-skyblue/8",
												isSelected && "bg-skyblue/10",
											)}
										>
											<td className="border-b border-darknavy/8 px-3 py-3 align-top">
												<input
													type="checkbox"
													checked={isSelected}
													onChange={() => onToggleRecord(record.id)}
													className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/35"
													aria-label={`Select ${record.sourceNo}`}
												/>
											</td>
											<td className="border-b border-darknavy/8 px-3 py-3 align-top font-semibold text-darknavy">
												{record.sourceNo}
											</td>
											<td className="border-b border-darknavy/8 px-3 py-3 align-top text-darknavy/70">
												{formatCopyFromDate(record.documentDate)}
											</td>
											<td className="border-b border-darknavy/8 px-3 py-3 align-top text-darknavy/80">
												{record.partyName || "-"}
											</td>
											<td className="border-b border-darknavy/8 px-3 py-3 align-top text-right font-semibold text-darknavy">
												{formatCopyFromAmount(record.amount)}
											</td>
											<td className="max-w-md border-b border-darknavy/8 px-3 py-3 align-top text-darknavy/65">
												<span className="line-clamp-2">
													{record.remarks || "-"}
												</span>
											</td>
										</tr>
									);
								})
							) : (
								<tr>
									<td
										colSpan={6}
										className="px-3 py-12 text-center text-sm font-medium text-darknavy/45"
									>
										No transactions found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				<div className="flex flex-col gap-3 border-t border-darknavy/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="text-sm font-semibold text-darknavy/65">
						{selectedIds.length} selected
						<span className="mx-2 text-darknavy/25">|</span>
						Total Amount:{" "}
						<span className="text-darknavy">
							{formatCopyFromAmount(selectedTotalAmount)}
						</span>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div className="flex items-center justify-between gap-3 rounded-md border border-darknavy/10 bg-offwhite/60 px-2 py-1.5 text-sm font-semibold text-darknavy/65">
							<span className="px-2">
								{pageStart}-{pageEnd} of {filteredRecords.length}
							</span>
							<div className="flex items-center gap-1">
								<button
									type="button"
									disabled={pageIndex === 0}
									onClick={() =>
										onPageChange((current) => Math.max(0, current - 1))
									}
									className="inline-flex h-8 w-8 items-center justify-center rounded-md text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy disabled:cursor-not-allowed disabled:opacity-35"
									aria-label="Previous copy from page"
								>
									<ChevronLeft className="h-4 w-4" aria-hidden="true" />
								</button>
								<span className="min-w-16 text-center text-xs uppercase tracking-[0.12em] text-darknavy/45">
									{pageIndex + 1} / {totalPages}
								</span>
								<button
									type="button"
									disabled={pageIndex >= totalPages - 1}
									onClick={() =>
										onPageChange((current) =>
											Math.min(totalPages - 1, current + 1),
										)
									}
									className="inline-flex h-8 w-8 items-center justify-center rounded-md text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy disabled:cursor-not-allowed disabled:opacity-35"
									aria-label="Next copy from page"
								>
									<ChevronRight className="h-4 w-4" aria-hidden="true" />
								</button>
							</div>
						</div>
						<button
							type="button"
							disabled={selectedIds.length === 0}
							onClick={onApply}
							className="theme-accent-contrast-text inline-flex h-10 items-center justify-center rounded-md bg-skyblue px-5 text-sm font-semibold transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-45"
						>
							Apply
						</button>
					</div>
				</div>
			</section>
		</div>,
		document.body,
	);
}

export function AppCopyFromFilters({
	value,
	onChange,
}: {
	value: AppCopyFromFiltersValue;
	onChange: (value: AppCopyFromFiltersValue) => void;
}) {
	function updateField<TKey extends keyof AppCopyFromFiltersValue>(
		field: TKey,
		nextValue: AppCopyFromFiltersValue[TKey],
	) {
		onChange({
			...value,
			[field]: nextValue,
		});
	}

	return (
		<div className="grid gap-3 border-b border-darknavy/10 px-5 py-4 lg:grid-cols-[minmax(16rem,1fr)_minmax(18rem,22rem)_minmax(18rem,22rem)]">
			<label className="relative min-w-0">
				<span className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-semibold text-darknavy/70">
					Search
				</span>
				<span className="flex h-12 items-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 shadow-sm shadow-darknavy/5 transition focus-within:border-skyblue/45 focus-within:ring-4 focus-within:ring-skyblue/15">
					<Search className="h-4 w-4 text-darknavy/35" aria-hidden="true" />
					<input
						value={value.query}
						onChange={(event) => updateField("query", event.target.value)}
						placeholder="Search transaction"
						className="min-w-0 flex-1 bg-transparent text-sm font-medium text-darknavy outline-none placeholder:text-darknavy/35"
					/>
				</span>
			</label>
			<DateRangePicker
				label="Date Range"
				panelClassName="z-[150]"
				value={value.dateRange}
				onChange={(dateRange) => updateField("dateRange", dateRange)}
			/>
			<AmountRangePicker
				label="Amount Range"
				panelClassName="z-[150]"
				value={value.amountRange}
				onChange={(amountRange) => updateField("amountRange", amountRange)}
			/>
		</div>
	);
}

function filterCopyFromRecords(
	records: AppCopyFromRecord[],
	filters: AppCopyFromFiltersValue,
) {
	const normalizedQuery = filters.query.trim().toLowerCase();
	const dateFrom = filters.dateRange.from;
	const dateTo = filters.dateRange.to;
	const amountFrom = parseOptionalCopyFromAmount(filters.amountRange.from) ?? 0;
	const amountTo =
		parseOptionalCopyFromAmount(filters.amountRange.to) ?? Number.MAX_SAFE_INTEGER;

	return records.filter((record) => {
		const amount = parseCopyFromAmount(record.amount);
		const documentDate = record.documentDate ?? "";
		const matchesQuery =
			!normalizedQuery ||
			[
				record.sourceNo,
				record.partyName,
				record.documentDate,
				record.amount,
				record.remarks,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		const matchesDateFrom = !dateFrom || documentDate >= dateFrom;
		const matchesDateTo = !dateTo || documentDate <= dateTo;
		const matchesAmountFrom = amount >= amountFrom;
		const matchesAmountTo = amount <= amountTo;

		return (
			matchesQuery &&
			matchesDateFrom &&
			matchesDateTo &&
			matchesAmountFrom &&
			matchesAmountTo
		);
	});
}

function parseOptionalCopyFromAmount(value: string) {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		return null;
	}

	return parseCopyFromAmount(trimmedValue);
}

function parseCopyFromAmount(value: number | string | undefined) {
	return parseMoneyNumberInput(value);
}

function formatCopyFromAmount(value: number | string | undefined) {
	return new Intl.NumberFormat("en-PH", {
		currency: "PHP",
		style: "currency",
	}).format(parseCopyFromAmount(value));
}

function formatCopyFromDate(value: string | undefined) {
	if (!value) {
		return "-";
	}

	return value;
}
