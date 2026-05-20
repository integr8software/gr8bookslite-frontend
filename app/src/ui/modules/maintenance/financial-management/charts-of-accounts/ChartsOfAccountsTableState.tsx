"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls.tsx";

export function ChartsOfAccountsTablePagination({
	page,
	rowCount,
	totalPages,
	totalRows,
	onPageChange,
}: {
	page: number;
	rowCount: number;
	totalPages: number;
	totalRows: number;
	onPageChange: (page: number) => void;
}) {
	return (
		<div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
			<span>
				Showing {rowCount} of {totalRows} accounts
			</span>
			<div className="flex items-center gap-2">
				<Button
					variant="secondary"
					disabled={page === 1}
					onClick={() => onPageChange(Math.max(1, page - 1))}
				>
					<ChevronLeft className="h-4 w-4" aria-hidden="true" />
					Previous
				</Button>
				<span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
					Page {page} of {totalPages}
				</span>
				<Button
					variant="secondary"
					disabled={page === totalPages}
					onClick={() => onPageChange(Math.min(totalPages, page + 1))}
				>
					Next
					<ChevronRight className="h-4 w-4" aria-hidden="true" />
				</Button>
			</div>
		</div>
	);
}

export function ChartsOfAccountsSkeletonRows() {
	return Array.from({ length: 8 }).map((_, index) => (
		<tr key={index} className="animate-pulse">
			{Array.from({ length: 8 }).map((__, cellIndex) => (
				<td key={cellIndex} className="px-4 py-4">
					<div className="h-4 rounded bg-slate-100" />
				</td>
			))}
		</tr>
	));
}

export function ChartsOfAccountsEmptyRow() {
	return (
		<tr>
			<td colSpan={8} className="px-4 py-16 text-center">
				<div className="mx-auto flex max-w-sm flex-col items-center">
					<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
						<Search className="h-5 w-5" aria-hidden="true" />
					</span>
					<p className="mt-4 text-sm font-semibold text-slate-950">
						No accounts found
					</p>
					<p className="mt-1 text-sm text-slate-500">
						Adjust the filters or add a new ledger account.
					</p>
				</div>
			</td>
		</tr>
	);
}
