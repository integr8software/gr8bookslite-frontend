import type { ComponentProps } from "react";
import { ChevronDown, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { ModuleTablePaginationProps } from "@/app/src/types/shared/ModuleTable.types";
import {
	getVisiblePaginationPages,
	joinClasses,
} from "@/app/src/ui/shared/module/module-table/utils";

export function ModuleTablePagination({
	page,
	pageLimit,
	pageSize,
	pageSizeOptions,
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
		<div className="grid gap-3 border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm shadow-slate-200/70 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
			<div className="flex items-center justify-center gap-2 sm:col-start-2">
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
					size="compact"
					onClick={() => onPageChange(Math.max(1, page - 1))}
				>
					Prev
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
					size="compact"
					onClick={() =>
						onPageChange(Math.min(safeTotalPages, page + 1))
					}
				>
					Next
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

			<label className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 sm:col-start-3 sm:justify-self-end">
				Rows
				<span className="relative">
					<select
						value={pageSize}
						onChange={(event) =>
							onPageSizeChange(Number(event.target.value))
						}
						className="h-10 appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-9 text-sm font-semibold text-slate-950 shadow-sm shadow-slate-200/60 outline-none transition hover:border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
					>
						{pageSizeOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					<ChevronDown
						className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
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
				"inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:bg-white disabled:text-slate-400 disabled:opacity-70 disabled:shadow-none",
				size === "icon" && "w-10 px-0",
				size === "compact" && "px-3",
				size === "default" && "px-4",
				active
					? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20 focus-visible:ring-blue-500/20"
					: "border-slate-200 bg-white text-slate-950 shadow-slate-200/60 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-500/15",
			)}
			{...props}
		>
			{children}
		</button>
	);
}
