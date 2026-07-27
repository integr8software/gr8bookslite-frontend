import {
	TermsMaintenanceDatemodeOptions,
	TermsMaintenanceExportColumns,
	TermsMaintenanceStatusOptions,
} from "@/app/src/constants/modules/financial-maintenance/terms-maintenance/TermsMaintenanceConstants";
import type {
	TermsMaintenanceDatemodeFilter,
	TermsMaintenanceTableFiltersProps,
	TermsMaintenanceStatusFilter,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function TermsMaintenanceTableFilters({
	datemodeFilter,
	exportAllRows,
	exportFilteredRows,
	hasActiveFilters,
	isRefreshing,
	permissions,
	query,
	statusFilter,
	table,
	onDatemodeFilterChange,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
}: TermsMaintenanceTableFiltersProps) {
	return (
		<ModuleTableToolbar
			className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]"
		>
			<div
				data-spotlight-id="maintenance-table-filters"
				className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(11rem,1.2fr)_minmax(7rem,0.8fr)_minmax(7rem,0.8fr)]"
			>
				<ModuleTableSearch
					label="Search terms"
					value={query}
					onChange={onQueryChange}
					placeholder="Search by name, datemode, period, or status"
				/>
				<ModuleTableFilterSelect
					label="Datemode"
					value={datemodeFilter}
					options={[
						{ label: "All", value: "All" },
						...TermsMaintenanceDatemodeOptions.map((datemode) => ({
							label: datemode,
							value: datemode,
						})),
					]}
					onChange={(value) =>
						onDatemodeFilterChange(value as TermsMaintenanceDatemodeFilter)
					}
				/>
				<ModuleTableFilterSelect
					label="Status"
					value={statusFilter}
					options={[
						{ label: "All", value: "" },
						...TermsMaintenanceStatusOptions.map((status) => ({
							label: status,
							value: status,
						})),
					]}
					onChange={(value) =>
						onStatusFilterChange(value as TermsMaintenanceStatusFilter)
					}
				/>
			</div>
			<div
				data-spotlight-id="maintenance-table-options"
				className="grid grid-cols-3 gap-2 md:w-[10.75rem]"
			>
				<ModuleTableColumnVisibilityButton table={table} />
				{permissions.canExport ? (
					<ModuleTableExportButton
						allRows={exportAllRows}
						columns={TermsMaintenanceExportColumns}
						fileName="terms-maintenance"
						filteredRows={exportFilteredRows}
						isFiltered={hasActiveFilters}
						table={table}
						title="Terms Maintenance"
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

