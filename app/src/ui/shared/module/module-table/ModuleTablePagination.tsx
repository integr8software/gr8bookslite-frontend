import type { ComponentProps } from "react";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import type { ModuleTablePaginationProps } from "@/app/src/types/shared/module/module-table/ModuleTable.types";
import {
	getVisiblePaginationPages,
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

export function ModuleTablePagination({
	firstRow,
	label,
	lastRow,
	page,
	pageLimit,
	pageSize,
	pageSizeOptions,
	totalRows,
	totalPages,
	onPageChange,
	onPageSizeChange,
}: ModuleTablePaginationProps) {
	const safeTotalPages = Math.max(1, totalPages);
	const visiblePages = getVisiblePaginationPages(
		page,
		safeTotalPages,
		pageLimit,
	);

	return (
		<div className="grid gap-4 border-t border-darknavy/10 bg-white px-4 py-4 text-sm text-darknavy/65 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:px-6 sm:py-5">
			<p className="text-center font-medium sm:text-left">
				Showing {firstRow} to {lastRow} of {totalRows} {label}
			</p>

			<div className="flex flex-wrap items-center justify-center gap-2 sm:col-start-2">
				<ModuleTablePageButton
					aria-label="First page"
					disabled={page === 1}
					size="icon"
					onClick={() => onPageChange(1)}
				>
					<ChevronsLeft className="h-4 w-4" aria-hidden="true" />
				</ModuleTablePageButton>
				<ModuleTablePageButton
					aria-label="Previous page"
					disabled={page === 1}
					size="icon"
					onClick={() => onPageChange(Math.max(1, page - 1))}
				>
					<ChevronLeft className="h-4 w-4" aria-hidden="true" />
				</ModuleTablePageButton>
				{visiblePages.map((pageNumber) => (
					<ModuleTablePageButton
						key={pageNumber}
						active={pageNumber === page}
						aria-current={pageNumber === page ? "page" : undefined}
						aria-label={`Page ${pageNumber}`}
						size="icon"
						onClick={() => onPageChange(pageNumber)}
					>
						{pageNumber}
					</ModuleTablePageButton>
				))}
				<ModuleTablePageButton
					aria-label="Next page"
					disabled={page >= safeTotalPages}
					size="icon"
					onClick={() =>
						onPageChange(Math.min(safeTotalPages, page + 1))
					}
				>
					<ChevronRight className="h-4 w-4" aria-hidden="true" />
				</ModuleTablePageButton>
				<ModuleTablePageButton
					aria-label="Last page"
					disabled={page >= safeTotalPages}
					size="icon"
					onClick={() => onPageChange(safeTotalPages)}
				>
					<ChevronsRight className="h-4 w-4" aria-hidden="true" />
				</ModuleTablePageButton>
			</div>

			<label className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-darknavy/65 sm:col-start-3 sm:justify-self-end">
				Rows per page
				<span className="relative">
					<select
						value={pageSize}
						onChange={(event) =>
							onPageSizeChange(Number(event.target.value))
						}
						className={joinClasses(
							"h-11 appearance-none rounded-lg border border-darknavy/10 bg-white px-4 pr-9 text-center text-sm font-semibold text-darknavy shadow-sm shadow-darknavy/5 outline-none transition [text-align-last:center] focus:ring-2",
							moduleAccentClassNames.hoverBorder,
							"focus:border-[var(--skyblue)]",
							moduleAccentClassNames.focusRing,
						)}
					>
						{pageSizeOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					<ChevronDown
						className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/55"
						aria-hidden="true"
					/>
				</span>
			</label>
		</div>
	);
}

function ModuleTablePageButton({
	active = false,
	children,
	size = "default",
	...props
}: ComponentProps<"button"> & {
	active?: boolean;
	size?: "compact" | "default" | "icon";
}) {
	return (
		<button
			type="button"
			className={joinClasses(
				"inline-flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:bg-white disabled:text-darknavy/35 disabled:opacity-70 disabled:shadow-none",
				size === "icon" && "w-11 px-0",
				size === "compact" && "px-3",
				size === "default" && "px-4",
				active
					? moduleAccentClassNames.button
					: joinClasses(
						"module-table-interactive-effect border-darknavy/10 bg-white text-darknavy shadow-darknavy/5 hover:text-darknavy",
						moduleAccentClassNames.hoverBorder,
						moduleAccentClassNames.hoverSoftBackground,
						moduleAccentClassNames.focusRing,
					),
			)}
			{...props}
		>
			{children}
		</button>
	);
}
