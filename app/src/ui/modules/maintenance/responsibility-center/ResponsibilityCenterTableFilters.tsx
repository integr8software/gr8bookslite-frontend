import {
	ResponsibilityCenterCategoryOptions,
	ResponsibilityCenterExportColumns,
	ResponsibilityCenterFinancialTypeOptions,
	ResponsibilityCenterStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import type {
	ResponsibilityCenterStatusFilter,
	ResponsibilityCenterTableFiltersProps,
} from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function ResponsibilityCenterTableFilters({
	categoryFilter,
	exportAllRows,
	exportFilteredRows,
	financialTypeFilter,
	hasActiveFilters,
	isRefreshing,
	permissions,
	query,
	statusFilter,
	table,
	onCategoryFilterChange,
	onFinancialTypeFilterChange,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
}: ResponsibilityCenterTableFiltersProps) {
	return (
		<ModuleTableToolbar
			className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]"
		>
			<div
				data-spotlight-id="maintenance-table-filters"
				className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(13rem,1.4fr)_minmax(8rem,0.9fr)_minmax(9rem,0.9fr)_minmax(7rem,0.75fr)]"
			>
				<ModuleTableSearch
					label="Search responsibility centers"
					value={query}
					onChange={onQueryChange}
					placeholder="Search by code, name, type, parent, or status"
				/>
				<ModuleTableFilterSelect
					label="Type"
					value={categoryFilter}
					options={[
						{ label: "All", value: "All" },
						...ResponsibilityCenterCategoryOptions.map((category) => ({
							label: category,
							value: category,
						})),
					]}
					onChange={onCategoryFilterChange}
				/>
				<ModuleTableFilterSelect
					label="Classification"
					value={financialTypeFilter}
					options={[
						{ label: "All", value: "All" },
						...ResponsibilityCenterFinancialTypeOptions.map((type) => ({
							label: type,
							value: type,
						})),
					]}
					onChange={onFinancialTypeFilterChange}
				/>
				<ModuleTableFilterSelect
					label="Status"
					value={statusFilter}
					options={[
						{ label: "All", value: "" },
						...ResponsibilityCenterStatusOptions.map((status) => ({
							label: status,
							value: status,
						})),
					]}
					onChange={(value) =>
						onStatusFilterChange(value as ResponsibilityCenterStatusFilter)
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
						columns={ResponsibilityCenterExportColumns}
						fileName="responsibility-center"
						filteredRows={exportFilteredRows}
						isFiltered={hasActiveFilters}
						table={table}
						title="Responsibility Centers"
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
