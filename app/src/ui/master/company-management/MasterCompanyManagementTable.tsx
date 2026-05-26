"use client";

import { Fragment } from "react";
import { Search } from "lucide-react";
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
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";
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
			<ModuleTable<MasterCompanyManagementRecord>
				variant="embedded"
				emptyDescription="Try a different company, plan, status, or billing cycle."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No subscribed companies found"
				minWidthClassName="min-w-[88rem]"
				paginationStorageKey={MasterCompanyManagementPaginationStorageKey}
				table={table}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.5fr)_minmax(13rem,1fr)_minmax(13rem,1fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search companies"
							value={query}
							onChange={setQuery}
							placeholder="Search subscribed companies"
						/>
						<ModuleTableFilterSelect
							label="Group"
							value={groupBy}
							options={groupOptions}
							onChange={(value) =>
								setGroupBy(value as MasterCompanyManagementGroupBy)
							}
						/>
						<ModuleTableFilterSelect
							label="Sort"
							value={sortBy}
							options={sortOptions}
							onChange={(value) =>
								setSortBy(value as MasterCompanyManagementSortBy)
							}
						/>
						<ModuleTableResetButton onClick={resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
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

