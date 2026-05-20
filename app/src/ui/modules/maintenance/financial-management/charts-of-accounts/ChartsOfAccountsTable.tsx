"use client";

import { ChevronsUpDown } from "lucide-react";
import { ChartsOfAccountsTableColumns } from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import type {
	AccountSortKey,
	ChartAccount,
	FlattenedChartAccount,
	SortDirection,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import { ChartsOfAccountsTableRow } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTableRow";
import {
	ChartsOfAccountsEmptyRow,
	ChartsOfAccountsSkeletonRows,
	ChartsOfAccountsTablePagination,
} from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTableState";
import { joinClasses } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls.tsx";

type ChartsOfAccountsTableProps = {
	expandedIds: Set<string>;
	isLoading: boolean;
	page: number;
	rows: FlattenedChartAccount[];
	sortDirection: SortDirection;
	sortKey: AccountSortKey;
	totalPages: number;
	totalRows: number;
	onDelete: (accountId: string) => void;
	onEdit: (account: ChartAccount) => void;
	onPageChange: (page: number) => void;
	onSort: (key: AccountSortKey) => void;
	onToggleExpanded: (accountId: string) => void;
};

export function ChartsOfAccountsTable(props: ChartsOfAccountsTableProps) {
	return (
		<div>
			<div className="max-h-[58vh] overflow-auto">
				<table className="w-full min-w-[78rem] border-collapse text-left">
					<TableHeader {...props} />
					<TableBody {...props} />
				</table>
			</div>

			<ChartsOfAccountsTablePagination
				page={props.page}
				rowCount={props.rows.length}
				totalPages={props.totalPages}
				totalRows={props.totalRows}
				onPageChange={props.onPageChange}
			/>
		</div>
	);
}

function TableHeader({
	sortDirection,
	sortKey,
	onSort,
}: Pick<ChartsOfAccountsTableProps, "sortDirection" | "sortKey" | "onSort">) {
	return (
		<thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
			<tr className="border-b border-slate-200">
				{ChartsOfAccountsTableColumns.map((column) => (
					<th
						key={column.label}
						className={joinClasses("px-4 py-3", column.className)}
					>
						{column.key ? (
							<SortButton
								columnKey={column.key}
								label={column.label}
								sortDirection={sortDirection}
								sortKey={sortKey}
								onSort={onSort}
							/>
						) : (
							column.label
						)}
					</th>
				))}
			</tr>
		</thead>
	);
}

function SortButton({
	columnKey,
	label,
	sortDirection,
	sortKey,
	onSort,
}: {
	columnKey: AccountSortKey;
	label: string;
	sortDirection: SortDirection;
	sortKey: AccountSortKey;
	onSort: (key: AccountSortKey) => void;
}) {
	return (
		<button
			type="button"
			onClick={() => onSort(columnKey)}
			className="flex items-center gap-1 rounded text-left transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
		>
			{label}
			<ChevronsUpDown
				className={joinClasses(
					"h-3.5 w-3.5",
					sortKey === columnKey && "text-blue-600",
					sortKey === columnKey &&
						sortDirection === "desc" &&
						"rotate-180",
				)}
				aria-hidden="true"
			/>
		</button>
	);
}

function TableBody(props: ChartsOfAccountsTableProps) {
	if (props.isLoading) {
		return (
			<tbody className="divide-y divide-slate-100 bg-white">
				<ChartsOfAccountsSkeletonRows />
			</tbody>
		);
	}

	if (props.rows.length === 0) {
		return (
			<tbody className="divide-y divide-slate-100 bg-white">
				<ChartsOfAccountsEmptyRow />
			</tbody>
		);
	}

	return (
		<tbody className="divide-y divide-slate-100 bg-white">
			{props.rows.map(({ account, level }) => (
				<ChartsOfAccountsTableRow
					key={account.id}
					account={account}
					expandedIds={props.expandedIds}
					level={level}
					onDelete={props.onDelete}
					onEdit={props.onEdit}
					onToggleExpanded={props.onToggleExpanded}
				/>
			))}
		</tbody>
	);
}
