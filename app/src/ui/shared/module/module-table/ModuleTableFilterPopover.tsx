"use client";

import {
	ChevronDown,
	Check,
	ListFilter,
} from "lucide-react";
import {
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleTableFilterPopoverOption = {
	label: ReactNode;
	value: string;
};

type ModuleTableFilterPopoverProps = {
	className?: string;
	disabled?: boolean;
	label: string;
	onChange: (value: string) => void;
	options: readonly ModuleTableFilterPopoverOption[];
	placeholder?: string;
	value: string;
};

const PanelGap = 8;
const PanelViewportPadding = 16;
const PanelWidth = 320;
const InitialPanelStyle: CSSProperties = {
	left: 0,
	opacity: 0,
	pointerEvents: "none",
	top: 0,
};

export function ModuleTableFilterPopover({
	className,
	disabled = false,
	label,
	onChange,
	options,
	placeholder = "Select option",
	value,
}: ModuleTableFilterPopoverProps) {
	const labelId = useId();
	const triggerId = useId();
	const panelId = useId();
	const rootRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [draftValue, setDraftValue] = useState(value);
	const [panelStyle, setPanelStyle] =
		useState<CSSProperties>(InitialPanelStyle);
	const emptyValue = useMemo(() => getEmptyFilterValue(options), [options]);
	const effectiveValue = value || emptyValue;
	const selectedOption = useMemo(
		() => options.find((option) => option.value === effectiveValue),
		[options, effectiveValue],
	);
	const isShowingPlaceholder = !selectedOption;
	const displayLabel = selectedOption
		? formatFilterOptionLabel(selectedOption.label)
		: placeholder;

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
		if (disabled) {
			return;
		}

		if (isOpen) {
			setIsOpen(false);
			return;
		}

		setDraftValue(effectiveValue);
		setPanelStyle(getPanelStyle(rootRef.current) ?? InitialPanelStyle);
		setIsOpen(true);
	}

	function clearSelection() {
		setDraftValue(emptyValue);
		onChange(emptyValue);
		setIsOpen(false);
	}

	function cancelSelection() {
		setDraftValue(value);
		setIsOpen(false);
	}

	function applySelection() {
		onChange(draftValue);
		setIsOpen(false);
	}

	return (
		<>
			<div ref={rootRef} className={joinClasses("relative min-w-0", className)}>
				<span
					id={labelId}
					title={label}
					className="absolute -top-2 left-3 z-10 max-w-[calc(100%_-_1.5rem)] truncate whitespace-nowrap bg-white px-1 text-xs font-semibold text-darknavy/70"
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
					disabled={disabled}
					onClick={togglePanel}
					className={joinClasses(
						"flex h-12 w-full min-w-0 items-center gap-3 rounded-lg border border-darknavy/10 bg-white px-3 text-left text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition focus-visible:ring-4",
						moduleAccentClassNames.hoverBorder,
						"focus-visible:border-[rgb(var(--skyblue-rgb)/0.45)]",
						moduleAccentClassNames.focusRing,
						disabled && "cursor-not-allowed opacity-60",
					)}
				>
					<ListFilter
						className={joinClasses(
							"h-4 w-4 shrink-0",
							isShowingPlaceholder
								? "text-darknavy/45"
								: moduleAccentClassNames.iconText,
						)}
						aria-hidden="true"
					/>
					<span
						className={joinClasses(
							"min-w-0 flex-1 truncate",
							isShowingPlaceholder && "font-medium text-darknavy/45",
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
							aria-label={`${label} filter`}
							style={panelStyle}
							className="fixed z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_20px_56px_rgba(33,39,56,0.14)]"
						>
							<div className="grid max-h-72 gap-1 overflow-y-auto p-2">
								{options.map((option) => {
									const isSelected = draftValue === option.value;

									return (
										<button
											key={option.value}
											type="button"
											onClick={() => setDraftValue(option.value)}
											className={joinClasses(
												"flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4",
												isSelected
													? "bg-skyblue/10 text-skyblue"
													: "text-darknavy hover:bg-offwhite",
												moduleAccentClassNames.focusRing,
											)}
										>
											<span
												className={joinClasses(
													"flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
													isSelected
														? "border-skyblue bg-skyblue text-white"
														: "border-darknavy/15 text-transparent",
												)}
											>
												<Check className="h-3.5 w-3.5" aria-hidden="true" />
											</span>
											<span className="min-w-0 truncate">
												{formatFilterOptionLabel(option.label)}
											</span>
										</button>
									);
								})}
							</div>
							<div className="flex flex-col gap-3 border-t border-darknavy/10 p-3 sm:flex-row sm:items-center sm:justify-between">
								<button
									type="button"
									onClick={clearSelection}
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
										onClick={applySelection}
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

function formatFilterOptionLabel(label: ReactNode) {
	if (typeof label === "string" && /^All\s+\S/.test(label)) {
		return "All";
	}

	return label;
}

function getEmptyFilterValue(options: readonly ModuleTableFilterPopoverOption[]) {
	return (
		options.find(
			(option) =>
				typeof option.label === "string" && /^All(\s|$)/i.test(option.label),
		)?.value ?? ""
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
	const openAbove = spaceBelow < 220 && spaceAbove > spaceBelow;

	return {
		left,
		...(openAbove
			? { bottom: viewportHeight - rect.top + PanelGap }
			: { top: rect.bottom + PanelGap }),
	};
}
