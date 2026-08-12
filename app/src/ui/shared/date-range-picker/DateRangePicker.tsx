"use client";

import {
	CalendarDays,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Clock3,
	type LucideIcon,
} from "lucide-react";
import {
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import {
	addDays,
	addMonths,
	coerceDate,
	endOfMonth,
	endOfWeek,
	endOfYear,
	parseIsoDate,
	startOfDay,
	startOfMonth,
	startOfWeek,
	startOfYear,
	toIsoDate,
} from "@/app/src/utils/date.util";
import {
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

export type DateRangeValue = {
	from: string;
	to: string;
};

export type DateRangePreset = {
	dividerBefore?: boolean;
	icon?: LucideIcon;
	label: string;
	getRange: (referenceDate: Date) => DateRangeValue;
};

type DateRangePickerProps = {
	className?: string;
	label: string;
	panelClassName?: string;
	placeholder?: string;
	presets?: readonly DateRangePreset[];
	referenceDate?: Date | string;
	startMonth?: Date | string;
	value: DateRangeValue;
	onChange: (value: DateRangeValue) => void;
};

type CalendarCell = {
	date: Date;
	isoDate: string;
	isCurrentMonth: boolean;
};

type VisibleMonths = {
	left: Date;
	right: Date;
};

const WeekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const EmptyDateRange: DateRangeValue = { from: "", to: "" };
const PanelViewportPadding = 16;
const PanelGap = 8;
const PanelMaxWidth = 760;
const PanelMinWidth = 300;
const PanelPreferredHeight = 420;
const PanelDefaultMaxHeight = "calc(100vh - 2rem)";
const PanelSheetBreakpoint = 768;
const InitialPanelStyle: CSSProperties = {
	left: 0,
	maxHeight: PanelDefaultMaxHeight,
	opacity: 0,
	pointerEvents: "none",
	top: 0,
};

const DateFormatter = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "short",
	year: "numeric",
});

const MonthFormatter = new Intl.DateTimeFormat("en-US", {
	month: "long",
	year: "numeric",
});

export const DefaultDateRangePresets: readonly DateRangePreset[] = [
	{
		icon: CalendarDays,
		label: "Today",
		getRange: (referenceDate) => {
			const today = startOfDay(referenceDate);

			return toDateRange(today, today);
		},
	},
	{
		icon: CalendarDays,
		label: "This Week",
		getRange: (referenceDate) =>
			toDateRange(startOfWeek(referenceDate), endOfWeek(referenceDate)),
	},
	{
		icon: CalendarDays,
		label: "This Month",
		getRange: (referenceDate) =>
			toDateRange(startOfMonth(referenceDate), endOfMonth(referenceDate)),
	},
	{
		icon: CalendarDays,
		label: "This Year",
		getRange: (referenceDate) =>
			toDateRange(startOfYear(referenceDate), endOfYear(referenceDate)),
	},
	{
		dividerBefore: true,
		icon: CalendarDays,
		label: "Yesterday",
		getRange: (referenceDate) => {
			const yesterday = addDays(referenceDate, -1);

			return toDateRange(yesterday, yesterday);
		},
	},
	{
		icon: Clock3,
		label: "Last 7 Days",
		getRange: (referenceDate) =>
			toDateRange(addDays(referenceDate, -6), referenceDate),
	},
	{
		icon: Clock3,
		label: "Last 30 Days",
		getRange: (referenceDate) =>
			toDateRange(addDays(referenceDate, -29), referenceDate),
	},
	{
		icon: Clock3,
		label: "Last 90 Days",
		getRange: (referenceDate) =>
			toDateRange(addDays(referenceDate, -89), referenceDate),
	},
	{
		icon: CalendarDays,
		label: "Last Year",
		getRange: (referenceDate) => {
			const year = referenceDate.getFullYear() - 1;

			return toDateRange(new Date(year, 0, 1), new Date(year, 11, 31));
		},
	},
];

export function DateRangePicker({
	className,
	label,
	onChange,
	panelClassName,
	placeholder = "Select date range",
	presets = DefaultDateRangePresets,
	referenceDate,
	startMonth,
	value,
}: DateRangePickerProps) {
	const labelId = useId();
	const triggerId = useId();
	const panelId = useId();
	const normalizedValue = useMemo(() => normalizeDateRange(value), [value]);
	const resolvedReferenceDate = useMemo(
		() => coerceDate(referenceDate) ?? startOfDay(new Date()),
		[referenceDate],
	);
	const rootRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [draftRange, setDraftRange] =
		useState<DateRangeValue>(normalizedValue);
	const [visibleMonths, setVisibleMonths] = useState(() =>
		createVisibleMonthsForRange(
			normalizedValue,
			getInitialVisibleDate(normalizedValue, startMonth, resolvedReferenceDate),
		),
	);
	const [panelStyle, setPanelStyle] =
		useState<CSSProperties>(InitialPanelStyle);
	const panelScrollStyle = useMemo<CSSProperties>(
		() => ({ maxHeight: panelStyle.maxHeight ?? PanelDefaultMaxHeight }),
		[panelStyle.maxHeight],
	);
	const displayLabel = formatDateRangeLabel(normalizedValue, placeholder);
	const isEmpty = isDateRangeEmpty(normalizedValue);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handlePointerDown(event: MouseEvent) {
			const target = event.target as Node;

			if (
				!rootRef.current?.contains(target) &&
				!panelRef.current?.contains(target)
			) {
				setIsOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function updatePanelStyle() {
			const nextStyle = getPanelStyle(rootRef.current);

			if (nextStyle) {
				setPanelStyle(nextStyle);
			}
		}

		updatePanelStyle();
		window.addEventListener("resize", updatePanelStyle);
		window.addEventListener("scroll", updatePanelStyle, true);

		return () => {
			window.removeEventListener("resize", updatePanelStyle);
			window.removeEventListener("scroll", updatePanelStyle, true);
		};
	}, [isOpen]);

	function togglePanel() {
		if (isOpen) {
			setIsOpen(false);
			return;
		}

		setDraftRange(normalizedValue);
		setVisibleMonths(
			createVisibleMonthsForRange(
				normalizedValue,
				getInitialVisibleDate(
					normalizedValue,
					startMonth,
					resolvedReferenceDate,
				),
			),
		);
		setPanelStyle(getPanelStyle(rootRef.current) ?? InitialPanelStyle);
		setIsOpen(true);
	}

	function applyDraftRange() {
		onChange(normalizeDateRange(draftRange));
		setIsOpen(false);
	}

	function clearRange() {
		setDraftRange(EmptyDateRange);
		onChange(EmptyDateRange);
		setIsOpen(false);
	}

	function cancelSelection() {
		setDraftRange(normalizedValue);
		setIsOpen(false);
	}

	function selectPreset(preset: DateRangePreset) {
		const nextRange = normalizeDateRange(preset.getRange(resolvedReferenceDate));

		setDraftRange(nextRange);
		setVisibleMonths(createVisibleMonthsForRange(nextRange, resolvedReferenceDate));
	}

	function selectDate(date: Date) {
		const selectedDate = toIsoDate(date);
		const fromDate = parseIsoDate(draftRange.from);
		const toDate = parseIsoDate(draftRange.to);

		if (!fromDate || toDate) {
			const nextRange = { from: selectedDate, to: "" };

			setDraftRange(nextRange);
			setVisibleMonths(createVisibleMonthsForRange(nextRange, date));
			return;
		}

		if (date.getTime() < fromDate.getTime()) {
			const nextRange = { from: selectedDate, to: draftRange.from };

			setDraftRange(nextRange);
			setVisibleMonths(createVisibleMonthsForRange(nextRange, date));
			return;
		}

		const nextRange = { from: draftRange.from, to: selectedDate };

		setDraftRange(nextRange);
		setVisibleMonths(createVisibleMonthsForRange(nextRange, date));
	}

	return (
		<>
			<div ref={rootRef} className={joinClasses("relative min-w-0", className)}>
				<span
					id={labelId}
					className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-semibold text-darknavy/70"
				>
					{label}
				</span>
				<button
					id={triggerId}
					type="button"
					aria-controls={isOpen ? panelId : undefined}
					aria-expanded={isOpen}
					aria-haspopup="dialog"
					aria-labelledby={`${labelId} ${triggerId}`}
					onClick={togglePanel}
					className={joinClasses(
						"flex h-12 w-full min-w-0 items-center gap-3 rounded-lg border border-darknavy/10 bg-white px-3 text-left text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition focus-visible:ring-4",
						moduleAccentClassNames.hoverBorder,
						"focus-visible:border-[rgb(var(--skyblue-rgb)/0.45)]",
						moduleAccentClassNames.focusRing,
					)}
				>
					<CalendarDays
						className={joinClasses(
							"h-4 w-4 shrink-0",
							isEmpty ? "text-darknavy/45" : moduleAccentClassNames.iconText,
						)}
						aria-hidden="true"
					/>
					<span
						className={joinClasses(
							"min-w-0 flex-1 truncate",
							isEmpty && "font-medium text-darknavy/45",
						)}
					>
						{displayLabel}
					</span>
					<ChevronDown
						className={joinClasses(
							"h-4 w-4 shrink-0 text-darknavy/55 transition",
							isOpen && "rotate-180",
						)}
						aria-hidden="true"
					/>
				</button>
			</div>
			{isOpen && typeof document !== "undefined"
				? createPortal(
						<div
							ref={panelRef}
							id={panelId}
							role="dialog"
							aria-label={`${label} date range`}
							style={panelStyle}
							className={joinClasses(
								"fixed z-50 overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_20px_56px_rgba(33,39,56,0.14)]",
								panelClassName,
							)}
						>
							<DateRangePanelContent
								draftRange={draftRange}
								presets={presets}
								referenceDate={resolvedReferenceDate}
								scrollStyle={panelScrollStyle}
								visibleMonths={visibleMonths}
								onApply={applyDraftRange}
								onCancel={cancelSelection}
								onClear={clearRange}
								onSelectDate={selectDate}
								onSelectPreset={selectPreset}
								onVisibleMonthsChange={setVisibleMonths}
							/>
						</div>,
						document.body,
					)
				: null}
		</>
	);
}

function DateRangePanelContent({
	draftRange,
	onApply,
	onCancel,
	onClear,
	onSelectDate,
	onSelectPreset,
	onVisibleMonthsChange,
	presets,
	referenceDate,
	scrollStyle,
	visibleMonths,
}: {
	draftRange: DateRangeValue;
	onApply: () => void;
	onCancel: () => void;
	onClear: () => void;
	onSelectDate: (date: Date) => void;
	onSelectPreset: (preset: DateRangePreset) => void;
	onVisibleMonthsChange: Dispatch<SetStateAction<VisibleMonths>>;
	presets: readonly DateRangePreset[];
	referenceDate: Date;
	scrollStyle: CSSProperties;
	visibleMonths: VisibleMonths;
}) {
	return (
		<div className="overflow-auto" style={scrollStyle}>
			<div className="grid xl:grid-cols-[13.5rem_1fr]">
				<PresetList
					draftRange={draftRange}
					presets={presets}
					referenceDate={referenceDate}
					onSelectPreset={onSelectPreset}
				/>
				<div className="grid gap-3 p-3 sm:gap-4 sm:p-4">
					<div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
						<RangeDisplayField label="From" value={draftRange.from} />
						<span className="hidden h-10 items-center justify-center text-darknavy/55 sm:flex">
							&rarr;
						</span>
						<RangeDisplayField label="To" value={draftRange.to} />
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<CalendarMonth
							month={visibleMonths.left}
							range={draftRange}
							onNextMonth={() =>
								onVisibleMonthsChange((current) => ({
									...current,
									left: addMonths(current.left, 1),
								}))
							}
							onPreviousMonth={() =>
								onVisibleMonthsChange((current) => ({
									...current,
									left: addMonths(current.left, -1),
								}))
							}
							onSelectDate={onSelectDate}
						/>
						<CalendarMonth
							month={visibleMonths.right}
							range={draftRange}
							onNextMonth={() =>
								onVisibleMonthsChange((current) => ({
									...current,
									right: addMonths(current.right, 1),
								}))
							}
							onPreviousMonth={() =>
								onVisibleMonthsChange((current) => ({
									...current,
									right: addMonths(current.right, -1),
								}))
							}
							onSelectDate={onSelectDate}
						/>
					</div>
				</div>
			</div>
			<div className="sticky bottom-0 flex flex-col gap-3 border-t border-darknavy/10 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
				<button
					type="button"
					onClick={onClear}
					className={joinClasses(
						"order-2 inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold text-[var(--skyblue)] transition focus-visible:outline-none focus-visible:ring-4 sm:order-none",
						moduleAccentClassNames.hoverSoftBackground,
						moduleAccentClassNames.focusRing,
					)}
				>
					Clear
				</button>
				<div className="contents sm:flex sm:justify-end sm:gap-3">
					<button
						type="button"
						onClick={onCancel}
						className={joinClasses(
							"order-3 inline-flex h-10 items-center justify-center rounded-lg border border-darknavy/10 bg-white px-5 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 transition focus-visible:outline-none focus-visible:ring-4 sm:order-1",
							moduleAccentClassNames.hoverBorder,
							moduleAccentClassNames.hoverSoftBackground,
							moduleAccentClassNames.focusRing,
						)}
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={onApply}
						className={joinClasses(
							"order-1 inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 sm:order-2",
							moduleAccentClassNames.button,
						)}
					>
						Apply
					</button>
				</div>
			</div>
		</div>
	);
}

function PresetList({
	draftRange,
	onSelectPreset,
	presets,
	referenceDate,
}: {
	draftRange: DateRangeValue;
	onSelectPreset: (preset: DateRangePreset) => void;
	presets: readonly DateRangePreset[];
	referenceDate: Date;
}) {
	return (
		<div className="border-b border-darknavy/10 p-2.5 xl:border-b-0 xl:border-r xl:p-3">
			<div className="grid grid-cols-2 gap-1 pb-1 xl:grid-cols-1 xl:overflow-visible xl:pb-0">
				{presets.map((preset) => {
					const Icon = preset.icon ?? CalendarDays;
					const presetRange = normalizeDateRange(preset.getRange(referenceDate));
					const isSelected = areDateRangesEqual(presetRange, draftRange);

					return (
						<div
							key={preset.label}
							className={joinClasses(
								"min-w-0",
								preset.dividerBefore &&
									"xl:mt-2 xl:border-t xl:border-darknavy/10 xl:pt-2",
							)}
						>
							<button
								type="button"
								onClick={() => onSelectPreset(preset)}
								className={joinClasses(
									"flex h-8 w-full min-w-0 items-center gap-2 rounded-lg px-2.5 text-left text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-4 xl:h-9",
									isSelected
										? "bg-[rgb(var(--skyblue-rgb)/0.12)] text-[var(--skyblue)]"
										: "text-darknavy hover:bg-[rgb(var(--skyblue-rgb)/0.08)]",
									moduleAccentClassNames.focusRing,
								)}
							>
								<Icon
									className={joinClasses(
										"h-3.5 w-3.5 shrink-0",
										isSelected ? "text-[var(--skyblue)]" : "text-darknavy/55",
									)}
									aria-hidden="true"
								/>
								<span className="min-w-0 truncate">{preset.label}</span>
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function RangeDisplayField({
	label,
	value,
}: {
	label: string;
	value: string;
}) {
	return (
		<div className="grid gap-2">
			<span className="text-xs font-semibold text-darknavy">{label}</span>
			<div className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy shadow-sm shadow-darknavy/5">
				<CalendarDays className="h-3.5 w-3.5 shrink-0 text-darknavy/55" aria-hidden="true" />
				<span
					className={joinClasses(
						"min-w-0 truncate",
						!value && "font-medium text-darknavy/40",
					)}
				>
					{value ? formatDate(value) : "Select date"}
				</span>
			</div>
		</div>
	);
}

function CalendarMonth({
	month,
	onNextMonth,
	onPreviousMonth,
	onSelectDate,
	range,
}: {
	month: Date;
	onNextMonth: () => void;
	onPreviousMonth: () => void;
	onSelectDate: (date: Date) => void;
	range: DateRangeValue;
}) {
	const cells = useMemo(() => createCalendarCells(month), [month]);

	return (
		<div className="mx-auto w-full min-w-0">
			<div className="mb-2 grid grid-cols-[2rem_1fr_2rem] items-center gap-2">
				<CalendarNavigationButton
					label={`Show ${MonthFormatter.format(addMonths(month, -1))}`}
					onClick={onPreviousMonth}
				>
					<ChevronLeft className="h-4 w-4" aria-hidden="true" />
				</CalendarNavigationButton>
				<h3 className="truncate text-center text-base font-bold text-darknavy">
					{MonthFormatter.format(month)}
				</h3>
				<CalendarNavigationButton
					label={`Show ${MonthFormatter.format(addMonths(month, 1))}`}
					onClick={onNextMonth}
				>
					<ChevronRight className="h-4 w-4" aria-hidden="true" />
				</CalendarNavigationButton>
			</div>
			<div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-darknavy/60">
				{WeekdayLabels.map((weekday) => (
					<span key={weekday} className="flex h-5 items-center justify-center">
						{weekday}
					</span>
				))}
			</div>
			<div className="mt-1 grid grid-cols-7 gap-0.5 sm:gap-1">
				{cells.map((cell) => (
					<CalendarDayButton
						key={cell.isoDate}
						cell={cell}
						range={range}
						onSelectDate={onSelectDate}
					/>
				))}
			</div>
		</div>
	);
}

function CalendarNavigationButton({
	children,
	label,
	onClick,
}: {
	children: ReactNode;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			onClick={onClick}
			className={joinClasses(
				"flex h-8 w-8 items-center justify-center rounded-lg text-darknavy transition focus-visible:outline-none focus-visible:ring-4",
				moduleAccentClassNames.hoverSoftBackground,
				moduleAccentClassNames.focusRing,
			)}
		>
			{children}
		</button>
	);
}

function CalendarDayButton({
	cell,
	onSelectDate,
	range,
}: {
	cell: CalendarCell;
	onSelectDate: (date: Date) => void;
	range: DateRangeValue;
}) {
	const fromDate = parseIsoDate(range.from);
	const toDate = parseIsoDate(range.to);
	const cellTime = cell.date.getTime();
	const isRangeStart = Boolean(fromDate && cellTime === fromDate.getTime());
	const isRangeEnd = Boolean(toDate && cellTime === toDate.getTime());
	const isInRange = Boolean(
		fromDate &&
			toDate &&
			cellTime > fromDate.getTime() &&
			cellTime < toDate.getTime(),
	);
	const isSelected = isRangeStart || isRangeEnd;

	return (
		<button
			type="button"
			onClick={() => onSelectDate(cell.date)}
			className={joinClasses(
				"flex h-8 w-full items-center justify-center rounded-md text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-4 sm:h-9",
				cell.isCurrentMonth ? "text-darknavy" : "text-darknavy/30",
				isInRange && "bg-[rgb(var(--skyblue-rgb)/0.12)]",
				isSelected &&
					"theme-accent-contrast-text bg-[var(--skyblue)] !text-[var(--skyblue-contrast)] shadow-[0_10px_22px_rgb(var(--skyblue-rgb)/0.22)]",
				!isSelected &&
					"hover:bg-[rgb(var(--skyblue-rgb)/0.1)] hover:text-darknavy",
				moduleAccentClassNames.focusRing,
			)}
			aria-pressed={isSelected}
		>
			{cell.date.getDate()}
		</button>
	);
}

function getPanelStyle(anchor: HTMLElement | null): CSSProperties | undefined {
	if (!anchor) {
		return undefined;
	}

	const rect = anchor.getBoundingClientRect();
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	if (viewportWidth < PanelSheetBreakpoint) {
		const width = Math.max(
			PanelMinWidth,
			viewportWidth - PanelViewportPadding * 2,
		);

		return {
			bottom: PanelViewportPadding,
			left: PanelViewportPadding,
			maxHeight: viewportHeight - PanelViewportPadding * 2,
			width,
		};
	}

	const panelMaxHeight = getPanelMaxHeight(rect, viewportHeight);
	const availableWidth = Math.max(
		PanelMinWidth,
		viewportWidth - PanelViewportPadding * 2,
	);
	const width = Math.min(PanelMaxWidth, availableWidth);
	const left = Math.min(
		Math.max(PanelViewportPadding, rect.left),
		viewportWidth - PanelViewportPadding - width,
	);
	const spaceBelow =
		viewportHeight - rect.bottom - PanelGap - PanelViewportPadding;
	const spaceAbove = rect.top - PanelGap - PanelViewportPadding;
	const openAbove =
		spaceBelow < PanelPreferredHeight && spaceAbove > spaceBelow;

	return {
		left,
		maxHeight: panelMaxHeight,
		width,
		...(openAbove
			? { bottom: viewportHeight - rect.top + PanelGap }
			: { top: rect.bottom + PanelGap }),
	};
}

function getPanelMaxHeight(rect: DOMRect, viewportHeight: number) {
	const spaceBelow =
		viewportHeight - rect.bottom - PanelGap - PanelViewportPadding;
	const spaceAbove = rect.top - PanelGap - PanelViewportPadding;
	const openAbove =
		spaceBelow < PanelPreferredHeight && spaceAbove > spaceBelow;
	const availableHeight = openAbove ? spaceAbove : spaceBelow;

	return Math.max(0, Math.floor(availableHeight));
}

function getInitialVisibleDate(
	value: DateRangeValue,
	startMonth: Date | string | undefined,
	referenceDate: Date,
) {
	return (
		parseIsoDate(value.from) ??
		parseIsoDate(value.to) ??
		coerceDate(startMonth) ??
		referenceDate
	);
}

function createVisibleMonthsForRange(range: DateRangeValue, fallbackDate: Date) {
	const fromDate = parseIsoDate(range.from);
	const toDate = parseIsoDate(range.to);
	const left = startOfMonth(fromDate ?? toDate ?? fallbackDate);

	return {
		left,
		right: startOfMonth(toDate ?? addMonths(left, 1)),
	};
}

function createCalendarCells(month: Date): CalendarCell[] {
	const firstDay = startOfMonth(month);
	const gridStart = addDays(firstDay, -firstDay.getDay());

	return Array.from({ length: 42 }, (_, index) => {
		const date = addDays(gridStart, index);

		return {
			date,
			isoDate: toIsoDate(date),
			isCurrentMonth: date.getMonth() === month.getMonth(),
		};
	});
}

function normalizeDateRange(value: DateRangeValue): DateRangeValue {
	const fromDate = parseIsoDate(value.from);
	const toDate = parseIsoDate(value.to);

	if (!fromDate && !toDate) {
		return EmptyDateRange;
	}

	if (fromDate && !toDate) {
		return { from: toIsoDate(fromDate), to: "" };
	}

	if (!fromDate && toDate) {
		return { from: "", to: toIsoDate(toDate) };
	}

	if (!fromDate || !toDate) {
		return EmptyDateRange;
	}

	if (fromDate.getTime() <= toDate.getTime()) {
		return { from: toIsoDate(fromDate), to: toIsoDate(toDate) };
	}

	return { from: toIsoDate(toDate), to: toIsoDate(fromDate) };
}

function areDateRangesEqual(first: DateRangeValue, second: DateRangeValue) {
	const normalizedFirst = normalizeDateRange(first);
	const normalizedSecond = normalizeDateRange(second);

	return (
		normalizedFirst.from === normalizedSecond.from &&
		normalizedFirst.to === normalizedSecond.to
	);
}

function isDateRangeEmpty(value: DateRangeValue) {
	return !value.from && !value.to;
}

function formatDateRangeLabel(value: DateRangeValue, placeholder: string) {
	if (value.from && value.to) {
		return `${formatDate(value.from)} - ${formatDate(value.to)}`;
	}

	if (value.from) {
		return `From ${formatDate(value.from)}`;
	}

	if (value.to) {
		return `Until ${formatDate(value.to)}`;
	}

	return placeholder;
}

function formatDate(value: string) {
	const date = parseIsoDate(value);

	return date ? DateFormatter.format(date) : value;
}

function toDateRange(from: Date, to: Date): DateRangeValue {
	return normalizeDateRange({
		from: toIsoDate(from),
		to: toIsoDate(to),
	});
}

