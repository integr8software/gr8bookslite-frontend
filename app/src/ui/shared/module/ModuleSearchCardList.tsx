"use client";

import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ModuleSearchCardListProps<TItem> = {
	getItemKey: (item: TItem) => string;
	getSearchText: (item: TItem) => string;
	itemLabel: string;
	items: TItem[];
	renderCard: (item: TItem, index: number, isSelected: boolean) => ReactNode;
	searchPlaceholder: string;
	title: ReactNode;
	bodyClassName?: string;
	className?: string;
	emptyMessage?: string;
	itemsClassName?: string;
	pageSize?: number;
	selectedItemKey?: string;
	onSelectItem?: (item: TItem) => void;
};

export function ModuleSearchCardList<TItem>({
	bodyClassName,
	className,
	emptyMessage = "No records found.",
	getItemKey,
	getSearchText,
	itemLabel,
	items,
	itemsClassName,
	pageSize = 5,
	renderCard,
	searchPlaceholder,
	selectedItemKey,
	title,
	onSelectItem,
}: ModuleSearchCardListProps<TItem>) {
	const [pageIndex, setPageIndex] = useState(0);
	const [query, setQuery] = useState("");
	const filteredItems = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			return items;
		}

		return items.filter((item) =>
			getSearchText(item).toLowerCase().includes(normalizedQuery),
		);
	}, [getSearchText, items, query]);
	const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
	const safePageIndex = Math.min(pageIndex, pageCount - 1);
	const firstItemIndex = safePageIndex * pageSize;
	const visibleItems = filteredItems.slice(
		firstItemIndex,
		firstItemIndex + pageSize,
	);
	const showingFrom = filteredItems.length > 0 ? firstItemIndex + 1 : 0;
	const showingTo = firstItemIndex + visibleItems.length;
	const firstVisibleItem = visibleItems[0];

	function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key !== "Enter" || !firstVisibleItem || !onSelectItem) {
			return;
		}

		event.preventDefault();
		onSelectItem(firstVisibleItem);
	}

	return (
		<aside
			className={joinClasses(
				"flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5",
				className,
			)}
		>
			<div className="shrink-0 p-4 pb-3">
				<h2 className="text-lg font-semibold text-darknavy">{title}</h2>
				<label className="relative mt-4 block">
					<span className="sr-only">{searchPlaceholder}</span>
					<Search
						className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/45"
						aria-hidden="true"
					/>
					<input
						type="search"
						className="h-11 w-full rounded-lg border border-darknavy/10 bg-white pl-11 pr-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-[rgb(var(--skyblue-rgb)/0.45)] focus:ring-4 focus:ring-[rgb(var(--skyblue-rgb)/0.16)]"
						onChange={(event) => {
							setQuery(event.target.value);
							setPageIndex(0);
						}}
						onKeyDown={handleSearchKeyDown}
						placeholder={searchPlaceholder}
						value={query}
					/>
				</label>
			</div>
			<div
				className={joinClasses(
					"min-h-0 flex-1 overflow-auto px-4 pb-4",
					bodyClassName,
				)}
			>
				<div className={joinClasses("grid gap-3", itemsClassName)}>
					{visibleItems.map((item, index) =>
						renderCard(
							item,
							firstItemIndex + index,
							getItemKey(item) === selectedItemKey,
						),
					)}
					{visibleItems.length === 0 ? (
						<div className="rounded-lg border border-dashed border-darknavy/15 p-4 text-sm font-semibold text-darknavy/55">
							{emptyMessage}
						</div>
					) : null}
				</div>
			</div>
			<div className="flex shrink-0 flex-col gap-3 border-t border-darknavy/10 p-4 text-xs font-semibold text-darknavy/65 sm:flex-row sm:items-center sm:justify-between">
				<span>
					Showing {showingFrom} to {showingTo} of {filteredItems.length}{" "}
					{itemLabel}
				</span>
				<div className="flex gap-2">
					<PageButton
						disabled={safePageIndex === 0}
						label={`Previous ${itemLabel} page`}
						onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
					>
						<ChevronLeft className="h-4 w-4" aria-hidden="true" />
					</PageButton>
					<span className="flex h-9 min-w-9 items-center justify-center rounded-md border border-[var(--skyblue)] bg-skyblue/10 px-2 text-[var(--skyblue)]">
						{safePageIndex + 1}
					</span>
					<PageButton
						disabled={safePageIndex >= pageCount - 1}
						label={`Next ${itemLabel} page`}
						onClick={() =>
							setPageIndex((current) => Math.min(pageCount - 1, current + 1))
						}
					>
						<ChevronRight className="h-4 w-4" aria-hidden="true" />
					</PageButton>
				</div>
			</div>
		</aside>
	);
}

function PageButton({
	children,
	disabled,
	label,
	onClick,
}: {
	children: ReactNode;
	disabled: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			disabled={disabled}
			onClick={onClick}
			className="flex h-9 w-9 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/55 transition hover:bg-skyblue/10 disabled:cursor-not-allowed disabled:opacity-35"
		>
			{children}
		</button>
	);
}
