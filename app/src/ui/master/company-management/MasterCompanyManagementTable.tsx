"use client";

import { Fragment } from "react";
import { Search, X } from "lucide-react";
import {
	MasterCompanyManagementPaginationStorageKey,
} from "@/app/src/constants/master/company-management/MasterCompanyManagementConstants";
import type {
	MasterCompanyManagementGroupBy,
	MasterCompanyManagementRecord,
	MasterCompanyManagementSortBy,
} from "@/app/src/types/master/company-management/MasterCompanyManagementTypes";
import type { useMasterCompanyManagementPage } from "@/app/src/hooks/master/company-management/useMasterCompanyManagementPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	MasterCompanyManagementGroupRow,
	MasterCompanyManagementTableRow,
} from "@/app/src/ui/master/company-management/MasterCompanyManagementTableRow";

type MasterCompanyManagementTableProps = Pick<
	ReturnType<typeof useMasterCompanyManagementPage>,
	| "groupBy"
	| "groupOptions"
	| "query"
	| "resetFilters"
	| "setGroupBy"
	| "setQuery"
	| "setSortBy"
	| "sortBy"
	| "sortOptions"
	| "table"
>;

export function MasterCompanyManagementTable({
	groupBy,
	groupOptions,
	query,
	resetFilters,
	setGroupBy,
	setQuery,
	setSortBy,
	sortBy,
	sortOptions,
	table,
}: MasterCompanyManagementTableProps) {
	const visibleColumnCount = table.getVisibleLeafColumns().length;
	const pageRows = table.getRowModel().rows;
	const groupStarts = new Map<string, string>();
	const groupCounts = new Map<string, number>();

	if (groupBy !== "none") {
		table.getPrePaginationRowModel().rows.forEach((row) => {
			const groupValue = getMasterCompanyGroupValue(row.original, groupBy);

			groupCounts.set(groupValue, (groupCounts.get(groupValue) ?? 0) + 1);
		});

		pageRows.forEach((row, index) => {
			const groupValue = getMasterCompanyGroupValue(row.original, groupBy);
			const previousRow = pageRows[index - 1];
			const previousGroupValue = previousRow
				? getMasterCompanyGroupValue(previousRow.original, groupBy)
				: null;

			if (groupValue !== previousGroupValue) {
				groupStarts.set(row.id, groupValue);
			}
		});
	}

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="grid gap-3 border-b border-darknavy/10 p-4 lg:grid-cols-[1fr_13rem_13rem_auto]">
				<label className="relative block">
					<span className="sr-only">Search companies</span>
					<Search
						className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/40"
						aria-hidden="true"
					/>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search subscribed companies"
						className="h-11 w-full rounded-lg border border-darknavy/10 bg-white pl-11 pr-4 text-sm text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15"
					/>
				</label>
				<MasterCompanyManagementSelect
					label="Group"
					value={groupBy}
					options={groupOptions}
					onChange={(value) =>
						setGroupBy(value as MasterCompanyManagementGroupBy)
					}
				/>
				<MasterCompanyManagementSelect
					label="Sort"
					value={sortBy}
					options={sortOptions}
					onChange={(value) =>
						setSortBy(value as MasterCompanyManagementSortBy)
					}
				/>
				<button
					type="button"
					onClick={resetFilters}
					className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/65 shadow-sm transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Reset
				</button>
			</div>
			<ModuleTable<MasterCompanyManagementRecord>
				variant="embedded"
				emptyDescription="Try a different company, plan, status, or billing cycle."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No subscribed companies found"
				minWidthClassName="min-w-[88rem]"
				paginationStorageKey={MasterCompanyManagementPaginationStorageKey}
				table={table}
				renderRow={(row) => {
					const groupValue = groupStarts.get(row.id);

					return (
						<Fragment key={row.id}>
							{groupValue ? (
								<MasterCompanyManagementGroupRow
									colSpan={visibleColumnCount}
									count={groupCounts.get(groupValue) ?? 0}
									label={getMasterCompanyGroupLabel(groupBy)}
									value={groupValue}
								/>
							) : null}
							<MasterCompanyManagementTableRow
								company={row.original}
							/>
						</Fragment>
					);
				}}
			/>
		</div>
	);
}

function MasterCompanyManagementSelect({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: readonly { label: string; value: string }[];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className="flex items-center gap-3 text-sm font-semibold text-darknavy/55">
			<span>{label}</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="h-11 min-w-0 flex-1 rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15"
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}

function getMasterCompanyGroupLabel(
	groupBy: Exclude<MasterCompanyManagementGroupBy, "none"> | "none",
) {
	switch (groupBy) {
		case "plan":
			return "Plan";
		case "status":
			return "Status";
		case "billingCycle":
			return "Billing cycle";
		default:
			return "Group";
	}
}

function getMasterCompanyGroupValue(
	company: MasterCompanyManagementRecord,
	groupBy: Exclude<MasterCompanyManagementGroupBy, "none">,
) {
	return String(company[groupBy]);
}
