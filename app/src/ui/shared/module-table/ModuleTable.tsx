"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ModuleTableBody } from "@/app/src/ui/shared/module-table/ModuleTableBody";
import { ModuleTableHeader } from "@/app/src/ui/shared/module-table/ModuleTableHeader";
import { ModuleTablePagination } from "@/app/src/ui/shared/module-table/ModuleTablePagination";
import type { ModuleTableProps } from "@/app/src/types/shared/ModuleTable.types";
import { joinClasses } from "@/app/src/ui/shared/module-table/utils";

const DefaultPageSizeOptions = [5, 10, 15, 20, 25, 50];

export function ModuleTable<TData>({
	emptyDescription = "Try adjusting your filters or add a new record.",
	emptyIcon,
	emptyTitle = "No records found",
	isLoading = false,
	maxHeightClassName = "max-h-[58vh]",
	minWidthClassName = "min-w-[78rem]",
	paginationPageLimit = 3,
	paginationStorageKey,
	pageSizeOptions = DefaultPageSizeOptions,
	renderRow,
	skeletonRowCount = 5,
	table,
}: ModuleTableProps<TData>) {
	const pathname = usePathname();
	const [hasLoadedPagination, setHasLoadedPagination] = useState(false);
	const rows = table.getRowModel().rows;
	const visibleColumnCount = table.getVisibleLeafColumns().length;
	const pagination = table.getState().pagination;
	const fallbackPageSize = pageSizeOptions[0];
	const totalPages = table.getPageCount();
	const safeTotalPages = Math.max(1, totalPages);
	const pageSizeOptionsKey = pageSizeOptions.join(",");
	const storageKey = useMemo(
		() =>
			`gr8booksneo:module-table:${paginationStorageKey ?? pathname}:pagination`,
		[paginationStorageKey, pathname],
	);

	useEffect(() => {
		if (hasLoadedPagination) {
			return;
		}

		if (!fallbackPageSize) {
			return;
		}

		try {
			const savedPagination = window.localStorage.getItem(storageKey);

			if (savedPagination) {
				const parsed = JSON.parse(savedPagination) as {
					pageIndex?: unknown;
					pageSize?: unknown;
				};
				const nextPageSize =
					typeof parsed.pageSize === "number" &&
					pageSizeOptions.includes(parsed.pageSize)
						? parsed.pageSize
						: fallbackPageSize;
				const nextPageIndex =
					typeof parsed.pageIndex === "number" &&
					parsed.pageIndex >= 0
						? parsed.pageIndex
						: 0;

				table.setPageSize(nextPageSize);
				table.setPageIndex(nextPageIndex);
			} else if (!pageSizeOptions.includes(pagination.pageSize)) {
				table.setPageSize(fallbackPageSize);
			}
		} catch {
			if (!pageSizeOptions.includes(pagination.pageSize)) {
				table.setPageSize(fallbackPageSize);
			}
		} finally {
			setHasLoadedPagination(true);
		}
	}, [
		fallbackPageSize,
		hasLoadedPagination,
		pageSizeOptions,
		pageSizeOptionsKey,
		pagination.pageSize,
		storageKey,
		table,
	]);

	useEffect(() => {
		if (!hasLoadedPagination) {
			return;
		}

		window.localStorage.setItem(
			storageKey,
			JSON.stringify({
				pageIndex: pagination.pageIndex,
				pageSize: pagination.pageSize,
			}),
		);
	}, [
		hasLoadedPagination,
		pagination.pageIndex,
		pagination.pageSize,
		storageKey,
	]);

	useEffect(() => {
		if (pagination.pageIndex <= safeTotalPages - 1) {
			return;
		}

		table.setPageIndex(safeTotalPages - 1);
	}, [pagination.pageIndex, safeTotalPages, table]);

	return (
		<div>
			<div className={joinClasses(maxHeightClassName, "overflow-auto")}>
				<table
					className={joinClasses(
						"w-full border-collapse text-left",
						minWidthClassName,
					)}
				>
					<ModuleTableHeader table={table} />
					<ModuleTableBody
						emptyDescription={emptyDescription}
						emptyIcon={emptyIcon}
						emptyTitle={emptyTitle}
						isLoading={isLoading}
						renderRow={renderRow}
						rows={rows}
						skeletonRowCount={skeletonRowCount}
						visibleColumnCount={visibleColumnCount}
					/>
				</table>
			</div>

			<ModuleTablePagination
				page={pagination.pageIndex + 1}
				pageLimit={paginationPageLimit}
				pageSize={pagination.pageSize}
				pageSizeOptions={pageSizeOptions}
				totalPages={totalPages}
				onPageChange={(page) => table.setPageIndex(page - 1)}
				onPageSizeChange={(pageSize) => table.setPageSize(pageSize)}
			/>
		</div>
	);
}
