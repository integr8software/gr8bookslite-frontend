import type { ReactNode } from "react";
import type { Row, Table } from "@tanstack/react-table";

export type ModuleTableProps<TData> = {
	emptyDescription?: string;
	emptyIcon?: ReactNode;
	emptyTitle?: string;
	isLoading?: boolean;
	isSyncing?: boolean;
	lastSyncedAt?: number | string | Date | null;
	maxHeightClassName?: string;
	minWidthClassName?: string;
	paginationLabel?: string;
	paginationPageLimit?: number;
	paginationStorageKey?: string;
	paginationTotalRows?: number;
	pageSizeOptions?: number[];
	renderRow: (row: Row<TData>) => ReactNode;
	skeletonRowCount?: number;
	table: Table<TData>;
	tableTitle?: ReactNode;
	toolbar?: ReactNode;
	variant?: "embedded" | "standalone";
};

export type ModuleTableBodyProps<TData> = {
	emptyDescription: string;
	emptyIcon?: ReactNode;
	emptyTitle: string;
	isLoading: boolean;
	renderRow: (row: Row<TData>) => ReactNode;
	rows: Row<TData>[];
	skeletonRowCount: number;
	visibleColumnCount: number;
};

export type ModuleTablePaginationProps = {
	firstRow: number;
	label: string;
	lastRow: number;
	page: number;
	pageLimit: number;
	pageSize: number;
	pageSizeOptions: number[];
	totalRows: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
};
