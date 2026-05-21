import type { Header } from "@tanstack/react-table";

export function getColumnClassName<TData>(header: Header<TData, unknown>) {
	return (header.column.columnDef.meta as { className?: string } | undefined)
		?.className;
}

export function getVisiblePaginationPages(
	page: number,
	totalPages: number,
	pageLimit: number,
) {
	const pageCount = Math.min(totalPages, Math.max(1, pageLimit));
	const firstPage = Math.min(
		Math.max(1, page - Math.floor(pageCount / 2)),
		Math.max(1, totalPages - pageCount + 1),
	);

	return Array.from({ length: pageCount }, (_, index) => firstPage + index);
}

export function joinClasses(...classes: Array<string | undefined | false>) {
	return classes.filter(Boolean).join(" ");
}
