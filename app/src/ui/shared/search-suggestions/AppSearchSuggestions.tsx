"use client";

import {
	ChevronRight,
	Search,
	X,
	type LucideIcon,
} from "lucide-react";
import {
	useEffect,
	useId,
	useRef,
	useState,
	type KeyboardEvent,
	type ReactNode,
} from "react";

export type AppSearchSuggestionsProps<TItem> = {
	className?: string;
	compact?: boolean;
	emptyMessage?: string;
	footerActionLabel?: string;
	getDescription?: (item: TItem) => string;
	getKey: (item: TItem) => string;
	getTitle: (item: TItem) => string;
	id?: string;
	inputLabel?: string;
	isLoading?: boolean;
	isResultsOpen?: boolean;
	items: TItem[];
	maxVisibleItems?: number;
	minQueryLength?: number;
	placeholder?: string;
	query: string;
	renderIcon?: (item: TItem, isActive: boolean) => ReactNode;
	resultIcon?: LucideIcon;
	showFooter?: boolean;
	totalCount?: number;
	floatingResults?: boolean;
	onFooterAction?: () => void;
	onInputFocus?: () => void;
	onQueryChange: (value: string) => void;
	onResultsClose?: () => void;
	onSelect: (item: TItem) => void;
};

export function AppSearchSuggestions<TItem>({
	className,
	compact = false,
	emptyMessage = "No records found.",
	footerActionLabel,
	getDescription,
	getKey,
	getTitle,
	id,
	inputLabel = "Search",
	isLoading = false,
	isResultsOpen = true,
	items,
	maxVisibleItems = 10,
	minQueryLength = 1,
	floatingResults = false,
	onFooterAction,
	onInputFocus,
	onQueryChange,
	onResultsClose,
	onSelect,
	placeholder = "Search",
	query,
	renderIcon,
	resultIcon: ResultIcon,
	showFooter = true,
	totalCount,
}: AppSearchSuggestionsProps<TItem>) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const listboxId = `${inputId}-results`;
	const visibleItems = items.slice(0, maxVisibleItems);
	const resultCount = totalCount ?? items.length;
	const [activeIndex, setActiveIndex] = useState(0);
	const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const hasEnoughQuery = query.trim().length >= minQueryLength;
	const activeItemIndex = visibleItems.length
		? Math.min(activeIndex, visibleItems.length - 1)
		: 0;
	const activeItem = visibleItems[activeItemIndex];
	const hasResultIcon = Boolean(renderIcon || ResultIcon);

	useEffect(() => {
		itemRefs.current[activeItemIndex]?.scrollIntoView({ block: "nearest" });
	}, [activeItemIndex]);

	useEffect(() => {
		if (!isResultsOpen || !onResultsClose) {
			return;
		}

		function handlePointerDown(event: MouseEvent) {
			if (
				event.target instanceof Node &&
				!rootRef.current?.contains(event.target)
			) {
				onResultsClose?.();
			}
		}

		document.addEventListener("mousedown", handlePointerDown);
		return () => document.removeEventListener("mousedown", handlePointerDown);
	}, [isResultsOpen, onResultsClose]);

	useEffect(() => {
		if (!isResultsOpen || !onResultsClose) {
			return;
		}

		function handleFocusIn(event: FocusEvent) {
			if (
				event.target instanceof Node &&
				!rootRef.current?.contains(event.target)
			) {
				onResultsClose?.();
			}
		}

		document.addEventListener("focusin", handleFocusIn);

		return () => {
			document.removeEventListener("focusin", handleFocusIn);
		};
	}, [isResultsOpen, onResultsClose]);

	function selectActiveItem() {
		if (activeItem) {
			onSelect(activeItem);
		}
	}

	function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === "ArrowDown" && visibleItems.length > 0) {
			event.preventDefault();
			setActiveIndex((current) => (current + 1) % visibleItems.length);
			return;
		}

		if (event.key === "ArrowUp" && visibleItems.length > 0) {
			event.preventDefault();
			setActiveIndex(
				(current) => (current - 1 + visibleItems.length) % visibleItems.length,
			);
			return;
		}

		if (event.key === "Enter") {
			event.preventDefault();
			selectActiveItem();
			return;
		}

		if (event.key === "Escape") {
			event.preventDefault();
			onResultsClose?.();
		}

		if (event.key === "Tab") {
			onResultsClose?.();
		}
	}

	function handleQueryChange(value: string) {
		setActiveIndex(0);
		onQueryChange(value);
	}

	return (
		<div
			ref={rootRef}
			className={joinClasses(
				"grid gap-2",
				floatingResults && "relative",
				className,
			)}
		>
			<label className="sr-only" htmlFor={inputId}>
				{inputLabel}
			</label>
			<div
				className={joinClasses(
					"flex items-center rounded-lg border border-darknavy/12 bg-white shadow-sm transition focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100",
					compact ? "h-11 gap-2 px-3" : "h-14 gap-3 px-4",
				)}
			>
				<Search
					className={joinClasses(
						"shrink-0 text-darknavy/45",
						compact ? "h-4 w-4" : "h-5 w-5",
					)}
					aria-hidden="true"
				/>
				<input
					id={inputId}
					value={query}
					onChange={(event) => handleQueryChange(event.target.value)}
					onFocus={onInputFocus}
					onKeyDown={handleInputKeyDown}
					placeholder={placeholder}
					role="combobox"
					aria-expanded={isResultsOpen}
					aria-controls={listboxId}
					aria-activedescendant={
						activeItem ? `${listboxId}-${getKey(activeItem)}` : undefined
					}
					className={joinClasses(
						"min-w-0 flex-1 bg-transparent text-darknavy outline-none placeholder:text-darknavy/35",
						compact ? "text-sm font-normal" : "text-base font-semibold",
					)}
				/>
				{query ? (
					<button
						type="button"
						aria-label="Clear search"
						className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-darknavy/5 text-darknavy/55 transition hover:bg-darknavy/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
						onClick={() => handleQueryChange("")}
					>
						<X className="h-4 w-4" aria-hidden="true" />
					</button>
				) : null}
			</div>

			{isResultsOpen ? (
				<div
					className={joinClasses(
						"overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_18px_50px_rgba(33,39,56,0.12)]",
						floatingResults &&
						"absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50",
					)}
				>
					<div
						id={listboxId}
						role="listbox"
						className="max-h-96 overflow-y-auto p-2"
					>
						{visibleItems.length > 0 ? (
							visibleItems.map((item, index) => {
								const isActive = index === activeItemIndex;
								const title = getTitle(item);
								const description = getDescription?.(item);
								const key = getKey(item);

								return (
									<button
										key={key}
										id={`${listboxId}-${key}`}
										ref={(element) => {
											itemRefs.current[index] = element;
										}}
										type="button"
										role="option"
										aria-selected={isActive}
										className={joinClasses(
											"grid w-full items-center rounded-md text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
											hasResultIcon
												? compact
													? "grid-cols-[2rem_minmax(0,1fr)] gap-2 px-2 py-1.5"
													: "grid-cols-[3rem_minmax(0,1fr)] gap-3 px-3 py-2.5"
												: compact
													? "grid-cols-1 px-3 py-2"
													: "grid-cols-1 px-3 py-2.5",
											isActive ? "bg-blue-50" : "hover:bg-blue-50/80",
										)}
										onClick={() => onSelect(item)}
										onFocus={() => setActiveIndex(index)}
										onMouseEnter={() => setActiveIndex(index)}
									>
										{hasResultIcon ? (
											<span className={joinClasses(
												"flex items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100",
												compact ? "h-7 w-7" : "h-10 w-10",
											)}>
												{renderIcon ? (
													renderIcon(item, isActive)
												) : ResultIcon ? (
													<ResultIcon
														className={compact ? "h-4 w-4" : "h-5 w-5"}
														aria-hidden="true"
													/>
												) : null}
											</span>
										) : null}
										<span className="min-w-0">
											<span
												className={joinClasses(
													"block truncate",
													compact
														? "text-sm font-medium"
														: "text-base font-semibold",
													isActive
														? "text-blue-700"
														: compact
															? "text-darknavy/65"
															: "text-darknavy",
												)}
											>
												{title}
											</span>
											{description ? (
												<span className="mt-0.5 block truncate text-sm text-darknavy/55">
													{description}
												</span>
											) : null}
										</span>
									</button>
								);
							})
						) : (
							<div className="px-2 py-2 text-center text-sm text-darknavy/55">
								{isLoading
									? "Loading..."
									: hasEnoughQuery
										? emptyMessage
										: `Type at least ${minQueryLength} characters.`}
							</div>
						)}
					</div>

					{showFooter ? (
						<div className="flex items-center justify-between gap-3 border-t border-darknavy/10 px-4 py-3 text-sm">
							<div className="flex min-w-0 items-center gap-2 text-darknavy/65">
								<Search className="h-4 w-4 shrink-0" aria-hidden="true" />
								<span className="truncate">
									Showing {visibleItems.length} of {resultCount} results
								</span>
							</div>
							{footerActionLabel && onFooterAction ? (
								<button
									type="button"
									className="inline-flex shrink-0 items-center gap-1 font-semibold text-blue-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
									onClick={onFooterAction}
								>
									{footerActionLabel}
									<ChevronRight className="h-4 w-4" aria-hidden="true" />
								</button>
							) : null}
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}

function joinClasses(...classes: Array<string | false | undefined>) {
	return classes.filter(Boolean).join(" ");
}
