import {
	UnitOfMeasurementExportColumns,
} from "@/app/src/constants/modules/item-management/unit-of-measurement/UnitOfMeasurementConstants";
import type {
	UnitOfMeasurementQuantityModeFilter,
	UnitOfMeasurementTableFiltersProps,
} from "@/app/src/types/modules/item-management/unit-of-measurement/UnitOfMeasurementTypes";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function UnitOfMeasurementTableFilters({
	exportAllRows,
	exportFilteredRows,
	hasActiveFilters,
	isRefreshing,
	permissions,
	quantityModeFilter,
	query,
	statusFilter,
	table,
	onQuantityModeFilterChange,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
}: UnitOfMeasurementTableFiltersProps) {
	return (
		<ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
			<div
				data-spotlight-id="maintenance-table-filters"
				className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(11rem,1.2fr)_minmax(7rem,0.8fr)_minmax(7rem,0.8fr)]"
			>
				<ModuleTableSearch
					label="Search units"
					placeholder="Search by unit, symbol, or quantity type"
					value={query}
					onChange={onQueryChange}
				/>
				<ModuleTableFilterSelect
					label="Quantity Type"
					value={quantityModeFilter}
					options={[
						{ label: "All", value: "All" },
						{ label: "Whole number", value: "Integer" },
						{ label: "Decimal", value: "Float" },
					]}
					onChange={(value) =>
						onQuantityModeFilterChange(value as UnitOfMeasurementQuantityModeFilter)
					}
				/>
				<ModuleTableFilterSelect
					label="Status"
					value={statusFilter}
					options={[
						{ label: "All", value: "All" },
						{ label: "Active", value: "Active" },
						{ label: "Inactive", value: "Inactive" },
					]}
					onChange={onStatusFilterChange}
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
						columns={UnitOfMeasurementExportColumns}
						fileName="unit-of-measurement"
						filteredRows={exportFilteredRows}
						isFiltered={hasActiveFilters}
						table={table}
						title="Unit of Measurement"
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
