"use client";

import {
	Banknote,
	ChevronDown,
} from "lucide-react";
import {
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import {
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";
import {
	MoneyNumberField,
	parseMoneyNumberInput,
} from "@/app/src/ui/shared/money/MoneyNumberField";

export type AmountRangeValue = {
	from: string;
	to: string;
};

type AmountRangePickerProps = {
	className?: string;
	currency?: string;
	label: string;
	panelClassName?: string;
	placeholder?: string;
	value: AmountRangeValue;
	onChange: (value: AmountRangeValue) => void;
};

const EmptyAmountRange: AmountRangeValue = { from: "", to: "" };
const PanelViewportPadding = 16;
const PanelGap = 8;
const PanelWidth = 360;

export function AmountRangePicker({
	className,
	currency = "PHP",
	label,
	onChange,
	panelClassName,
	placeholder = "Select amount range",
	value,
}: AmountRangePickerProps) {
	const labelId = useId();
	const triggerId = useId();
	const panelId = useId();
	const normalizedValue = useMemo(() => normalizeAmountRange(value), [value]);
	const rootRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [draftRange, setDraftRange] =
		useState<AmountRangeValue>(normalizedValue);
	const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
	const displayLabel = formatAmountRangeLabel(
		normalizedValue,
		placeholder,
		currency,
	);
	const isEmpty = isAmountRangeEmpty(normalizedValue);

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
		setIsOpen(true);
	}

	function clearRange() {
		setDraftRange(EmptyAmountRange);
		onChange(EmptyAmountRange);
		setIsOpen(false);
	}

	function cancelSelection() {
		setDraftRange(normalizedValue);
		setIsOpen(false);
	}

	function applyDraftRange() {
		onChange(normalizeAmountRange(draftRange));
		setIsOpen(false);
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
					<Banknote
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
							aria-label={`${label} amount range`}
							style={panelStyle}
							className={joinClasses(
								"fixed z-50 w-[min(22.5rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_20px_56px_rgba(33,39,56,0.14)]",
								panelClassName,
							)}
						>
							<div className="grid gap-4 p-4">
								<div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
									<AmountInput
										label="From"
										value={draftRange.from}
										onChange={(nextValue) =>
											setDraftRange((currentRange) => ({
												...currentRange,
												from: nextValue,
											}))
										}
									/>
									<span className="hidden h-10 items-center justify-center text-darknavy/55 sm:flex">
										&rarr;
									</span>
									<AmountInput
										label="To"
										value={draftRange.to}
										onChange={(nextValue) =>
											setDraftRange((currentRange) => ({
												...currentRange,
												to: nextValue,
											}))
										}
									/>
								</div>
							</div>
							<div className="flex flex-col gap-3 border-t border-darknavy/10 p-3 sm:flex-row sm:items-center sm:justify-between">
								<button
									type="button"
									onClick={clearRange}
									className={joinClasses(
										"inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold text-[var(--skyblue)] transition focus-visible:outline-none focus-visible:ring-4",
										moduleAccentClassNames.hoverSoftBackground,
										moduleAccentClassNames.focusRing,
									)}
								>
									Clear
								</button>
								<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
									<button
										type="button"
										onClick={cancelSelection}
										className={joinClasses(
											"inline-flex h-10 items-center justify-center rounded-lg border border-darknavy/10 bg-white px-5 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 transition focus-visible:outline-none focus-visible:ring-4",
											moduleAccentClassNames.hoverBorder,
											moduleAccentClassNames.hoverSoftBackground,
											moduleAccentClassNames.focusRing,
										)}
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={applyDraftRange}
										className={joinClasses(
											"inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4",
											moduleAccentClassNames.button,
										)}
									>
										Apply
									</button>
								</div>
							</div>
						</div>,
						document.body,
					)
				: null}
		</>
	);
}

function AmountInput({
	label,
	onChange,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	value: string;
}) {
	return (
		<label className="grid gap-2">
			<span className="text-xs font-semibold text-darknavy">{label}</span>
			<MoneyNumberField
				value={value}
				onValueChange={onChange}
				placeholder="0.00"
				className="h-10 min-w-0 rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/15"
			/>
		</label>
	);
}

function getPanelStyle(anchor: HTMLElement | null): CSSProperties | undefined {
	if (!anchor) {
		return undefined;
	}

	const rect = anchor.getBoundingClientRect();
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const left = Math.min(
		Math.max(PanelViewportPadding, rect.left),
		viewportWidth - PanelViewportPadding - PanelWidth,
	);
	const spaceBelow =
		viewportHeight - rect.bottom - PanelGap - PanelViewportPadding;
	const spaceAbove = rect.top - PanelGap - PanelViewportPadding;
	const openAbove = spaceBelow < 240 && spaceAbove > spaceBelow;

	return {
		left,
		...(openAbove
			? { bottom: viewportHeight - rect.top + PanelGap }
			: { top: rect.bottom + PanelGap }),
	};
}

function normalizeAmountRange(value: AmountRangeValue): AmountRangeValue {
	const from = normalizeAmountValue(value.from);
	const to = normalizeAmountValue(value.to);
	const fromAmount = parseAmountValue(from);
	const toAmount = parseAmountValue(to);

	if (fromAmount != null && toAmount != null && fromAmount > toAmount) {
		return { from: to, to: from };
	}

	return { from, to };
}

function normalizeAmountValue(value: string) {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		return "";
	}

	const amount = parseAmountValue(trimmedValue);

	return amount == null ? "" : String(amount);
}

function parseAmountValue(value: string) {
	if (!value.trim()) {
		return null;
	}

	const amount = parseMoneyNumberInput(value);

	return Number.isFinite(amount) ? amount : null;
}

function isAmountRangeEmpty(value: AmountRangeValue) {
	return !value.from && !value.to;
}

function formatAmountRangeLabel(
	value: AmountRangeValue,
	placeholder: string,
	currency: string,
) {
	if (value.from && value.to) {
		return `${formatAmount(value.from, currency)} - ${formatAmount(value.to, currency)}`;
	}

	if (value.from) {
		return `Above or equal ${formatAmount(value.from, currency)}`;
	}

	if (value.to) {
		return `Until or equal ${formatAmount(value.to, currency)}`;
	}

	return placeholder;
}

function formatAmount(value: string, currency: string) {
	const amount = parseMoneyNumberInput(value);

	if (!Number.isFinite(amount)) {
		return value;
	}

	return new Intl.NumberFormat("en-PH", {
		currency,
		style: "currency",
	}).format(amount);
}
