"use client";

import { Search } from "lucide-react";
import {
	MasterTenantAccessEntityLabels,
	MasterTenantAccessPaginationStorageKey,
} from "@/app/src/constants/master/tenant-access/MasterTenantAccessConstants";
import type { useMasterTenantAccessListPage } from "@/app/src/hooks/master/tenant-access/useMasterTenantAccessListPage";
import type {
	MasterTenantAccessEntity,
	MasterTenantAccessStatus,
} from "@/app/src/types/master/tenant-access/MasterTenantAccessTypes";
import { MasterTenantAccessTableRow } from "@/app/src/ui/master/tenant-access/MasterTenantAccessTableRow";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";

type MasterTenantAccessTableProps = Pick<
	ReturnType<typeof useMasterTenantAccessListPage>,
	| "query"
	| "resetFilters"
	| "setQuery"
	| "setStatusFilter"
	| "statusFilter"
	| "statusOptions"
	| "table"
> & {
	entity: MasterTenantAccessEntity;
};

export function MasterTenantAccessTable({
	entity,
	query,
	resetFilters,
	setQuery,
	setStatusFilter,
	statusFilter,
	statusOptions,
	table,
}: MasterTenantAccessTableProps) {
	const labels = MasterTenantAccessEntityLabels[entity];

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription={labels.emptyDescription}
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle={labels.emptyTitle}
				minWidthClassName={getMinWidthClassName(entity)}
				paginationStorageKey={MasterTenantAccessPaginationStorageKey[entity]}
				table={table}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.5fr)_minmax(11rem,1fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label={`Search ${labels.recordLabel}s`}
							onChange={setQuery}
							placeholder={`Search ${labels.recordLabel}s`}
							value={query}
						/>
						<ModuleTableFilterSelect
							label="Status"
							onChange={(value) =>
								setStatusFilter(value as MasterTenantAccessStatus | "All")
							}
							options={[
								{ label: "All", value: "All" },
								...statusOptions.map((status) => ({
									label: status,
									value: status,
								})),
							]}
							value={statusFilter}
						/>
						<ModuleTableResetButton onClick={resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
				renderRow={(row) => (
					<MasterTenantAccessTableRow
						key={row.id}
						record={row.original}
					/>
				)}
			/>
		</div>
	);
}

function getMinWidthClassName(entity: MasterTenantAccessEntity) {
	switch (entity) {
		case "subscriber":
			return "min-w-[82rem]";
		case "company":
			return "min-w-[84rem]";
		case "branch":
			return "min-w-[84rem]";
		case "user":
			return "min-w-[92rem]";
	}
}
