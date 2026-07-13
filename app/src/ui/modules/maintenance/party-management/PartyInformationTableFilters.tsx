import { PartyInformationExportColumns } from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import type {
	PartyClassification,
	PartyInformationStatus,
	PartyInformationTableFiltersProps,
	PartyType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function PartyInformationTableFilters({
	exportAllRows,
	exportFilteredRows,
	hasActiveFilters,
	classificationFilter,
	classificationOptions,
	partyTypeFilter,
	partyTypeOptions,
	query,
	statusFilter,
	statusOptions,
	table,
	isRefreshing,
	onClassificationFilterChange,
	onPartyTypeFilterChange,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
}: PartyInformationTableFiltersProps) {
	return (
		<ModuleTableToolbar
			className="!grid-cols-2 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(8rem,1fr)_minmax(8rem,1fr)_minmax(7rem,0.8fr)_minmax(7rem,0.8fr)_minmax(7rem,0.8fr)_3.25rem_3.25rem_3.25rem]"
		>
			<div className="col-span-2">
				<ModuleTableSearch
					label="Search parties"
					value={query}
					onChange={onQueryChange}
					placeholder="Search by name or address"
				/>
			</div>
			<ModuleTableFilterSelect
				label="Classification"
				value={classificationFilter}
				options={["All", ...classificationOptions].map((option) => ({
					label: option,
					value: option,
				}))}
				onChange={(value) =>
					onClassificationFilterChange(
						value as PartyClassification | "All",
					)
				}
			/>
			<ModuleTableFilterSelect
				label="Party Type"
				value={partyTypeFilter}
				options={["All", ...partyTypeOptions].map((option) => ({
					label: option,
					value: option,
				}))}
				onChange={(value) =>
					onPartyTypeFilterChange(value as PartyType | "All")
				}
			/>
			<ModuleTableFilterSelect
				label="Status"
				value={statusFilter}
				options={["All", ...statusOptions].map((option) => ({
					label: option,
					value: option,
				}))}
				onChange={(value) =>
					onStatusFilterChange(value as PartyInformationStatus | "All")
				}
			/>
			<ModuleTableColumnVisibilityButton table={table} />
			<ModuleTableExportButton
				allRows={exportAllRows}
				columns={PartyInformationExportColumns}
				fileName="party-information"
				filteredRows={exportFilteredRows}
				isFiltered={hasActiveFilters}
				table={table}
				title="Party Information"
			/>
			<ModuleTableResetButton
				className="px-2"
				isRefreshing={isRefreshing}
				onClick={onRefresh}
			>
				<span className="sr-only">Refresh</span>
			</ModuleTableResetButton>
		</ModuleTableToolbar>
	);
}

