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
	emptyMessage?: string;
	footerActionLabel?: string;
	getDescription?: (item: TItem) => string;
	getKey: (item: TItem) => string;
	getTitle: (item: TItem) => string;
	id?: string;
	inputLabel?: string;
	isLoading?: boolean;
	items: TItem[];
	maxVisibleItems?: number;
	minQueryLength?: number;
	placeholder?: string;
	query: string;
	renderIcon?: (item: TItem, isActive: boolean) => ReactNode;
	resultIcon?: LucideIcon;
	totalCount?: number;
	onFooterAction?: () => void;
	onQueryChange: (value: string) => void;
	onSelect: (item: TItem) => void;
};

export function AppSearchSuggestions<TItem>({
	className,
	emptyMessage = "No records found.",
	footerActionLabel,
	getDescription,
	getKey,
	getTitle,
	id,
	inputLabel = "Search",
	isLoading = false,
	items,
	maxVisibleItems = 10,
	minQueryLength = 1,
	onFooterAction,
	onQueryChange,
	onSelect,
	placeholder = "Search",
	query,
	renderIcon,
	resultIcon: ResultIcon,
	totalCount,
}: AppSearchSuggestionsProps<TItem>) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const listboxId = `${inputId}-results`;
	const visibleItems = items.slice(0, maxVisibleItems);
	const resultCount = totalCount ?? items.length;
	const [activeIndex, setActiveIndex] = useState(0);
	const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const hasEnoughQuery = query.trim().length >= minQueryLength;
	const activeItemIndex = visibleItems.length
		? Math.min(activeIndex, visibleItems.length - 1)
		: 0;
	const activeItem = visibleItems[activeItemIndex];

	useEffect(() => {
		itemRefs.current[activeItemIndex]?.scrollIntoView({ block: "nearest" });
	}, [activeItemIndex]);

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
		}
	}

	function handleQueryChange(value: string) {
		setActiveIndex(0);
		onQueryChange(value);
	}

	return (
		<div className={joinClasses("grid gap-2", className)}>
			<label className="sr-only" htmlFor={inputId}>
				{inputLabel}
			</label>
			<div className="flex h-14 items-center gap-3 rounded-lg border border-darknavy/12 bg-white px-4 shadow-sm transition focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100">
				<Search className="h-5 w-5 shrink-0 text-darknavy/45" aria-hidden="true" />
				<input
					id={inputId}
					value={query}
					onChange={(event) => handleQueryChange(event.target.value)}
					onKeyDown={handleInputKeyDown}
					placeholder={placeholder}
					role="combobox"
					aria-expanded="true"
					aria-controls={listboxId}
					aria-activedescendant={
						activeItem ? `${listboxId}-${getKey(activeItem)}` : undefined
					}
					className="min-w-0 flex-1 bg-transparent text-base font-semibold text-darknavy outline-none placeholder:text-darknavy/35"
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

			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_18px_50px_rgba(33,39,56,0.12)]">
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
										"grid w-full grid-cols-[3rem_minmax(0,1fr)] items-center gap-3 rounded-md px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
										isActive ? "bg-blue-50" : "hover:bg-blue-50/80",
									)}
									onClick={() => onSelect(item)}
									onFocus={() => setActiveIndex(index)}
									onMouseEnter={() => setActiveIndex(index)}
								>
									<span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
										{renderIcon ? (
											renderIcon(item, isActive)
										) : ResultIcon ? (
											<ResultIcon className="h-5 w-5" aria-hidden="true" />
										) : null}
									</span>
									<span className="min-w-0">
										<span
											className={joinClasses(
												"block truncate text-base font-semibold",
												isActive ? "text-blue-700" : "text-darknavy",
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
						<div className="px-4 py-10 text-center text-sm text-darknavy/55">
							{isLoading
								? "Loading..."
								: hasEnoughQuery
									? emptyMessage
									: `Type at least ${minQueryLength} characters.`}
						</div>
					)}
				</div>

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
			</div>
		</div>
	);
}

function joinClasses(...classes: Array<string | false | undefined>) {
	return classes.filter(Boolean).join(" ");
}
