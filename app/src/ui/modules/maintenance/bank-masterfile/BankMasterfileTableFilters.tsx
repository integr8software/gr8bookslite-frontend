import {
	BankMasterfileExportColumns,
	BankMasterfileStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/bank-masterfile/BankMasterfileConstants";
import type {
	BankMasterfileStatusFilter,
	BankMasterfileTableFiltersProps,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function BankMasterfileTableFilters({
	exportAllRows,
	exportFilteredRows,
	hasActiveFilters,
	isRefreshing,
	permissions,
	query,
	statusFilter,
	table,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
}: BankMasterfileTableFiltersProps) {
	return (
		<ModuleTableToolbar className="!grid-cols-2 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(14rem,1.4fr)_minmax(8rem,0.8fr)_3.25rem_3.25rem_3.25rem]">
			<ModuleTableSearch
				label="Search banks"
				value={query}
				onChange={onQueryChange}
				placeholder="Search by bank, account number, account code, or account title"
			/>
			<ModuleTableFilterSelect
				label="Status"
				value={statusFilter}
				options={[
					{ label: "All", value: "" },
					...BankMasterfileStatusOptions.map((status) => ({
						label: status,
						value: status,
					})),
				]}
				onChange={(value) =>
					onStatusFilterChange(value as BankMasterfileStatusFilter)
				}
			/>
			<ModuleTableColumnVisibilityButton table={table} />
			{permissions.canExport ? (
				<ModuleTableExportButton
					allRows={exportAllRows}
					columns={BankMasterfileExportColumns}
					fileName="bank-masterfile"
					filteredRows={exportFilteredRows}
					isFiltered={hasActiveFilters}
					table={table}
					title="Bank Masterfile"
				/>
			) : (
				<span aria-hidden="true" />
			)}
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

