import {
	DefaultAccountExportColumns,
	DefaultAccountStatusOptions,
	DefaultAccountTypeOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/default-account/DefaultAccountConstants";
import type {
	DefaultAccountStatusFilter,
	DefaultAccountTableFiltersProps,
	DefaultAccountTypeFilter,
} from "@/app/src/types/modules/maintenance/default-account/DefaultAccountTypes";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function DefaultAccountTableFilters({
	exportAllRows,
	exportFilteredRows,
	hasActiveFilters,
	isRefreshing,
	permissions,
	query,
	statusFilter,
	table,
	typeFilter,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
	onTypeFilterChange,
}: DefaultAccountTableFiltersProps) {
	return (
		<ModuleTableToolbar
			className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]"
		>
			<div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(11rem,1.2fr)_minmax(8rem,0.8fr)_minmax(7rem,0.8fr)]">
				<ModuleTableSearch
					label="Search default accounts"
					value={query}
					onChange={onQueryChange}
					placeholder="Search by description, type, status, or generated account"
				/>
				<ModuleTableFilterSelect
					label="Type"
					value={typeFilter}
					options={[
						{ label: "All Types", value: "" },
						...DefaultAccountTypeOptions.map((option) => ({
							label: option.label,
							value: option.value,
						})),
					]}
					onChange={(value) =>
						onTypeFilterChange(value as DefaultAccountTypeFilter)
					}
				/>
				<ModuleTableFilterSelect
					label="Status"
					value={statusFilter}
					options={[
						{ label: "All Status", value: "" },
						...DefaultAccountStatusOptions.map((status) => ({
							label: status,
							value: status,
						})),
					]}
					onChange={(value) =>
						onStatusFilterChange(value as DefaultAccountStatusFilter)
					}
				/>
			</div>
			<div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
				<ModuleTableColumnVisibilityButton table={table} />
				{permissions.canExport ? (
					<ModuleTableExportButton
						allRows={exportAllRows}
						columns={DefaultAccountExportColumns}
						fileName="default-account"
						filteredRows={exportFilteredRows}
						isFiltered={hasActiveFilters}
						table={table}
						title="Default Accounts"
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
			</div>
		</ModuleTableToolbar>
	);
}
