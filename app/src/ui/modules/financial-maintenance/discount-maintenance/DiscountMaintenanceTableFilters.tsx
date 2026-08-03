import {
	DiscountMaintenanceExportColumns,
	DiscountMaintenanceStatusOptions,
	DiscountMaintenanceTypeOptions,
	DiscountMaintenanceValueTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceConstants";
import type {
	DiscountStatusFilter,
	DiscountTypeFilter,
	DiscountMaintenanceTableFiltersProps,
	DiscountValueTypeFilter,
} from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { Tabs } from "@/app/src/ui/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsControls";

export function DiscountMaintenanceTableFilters({
	discountTypeFilter,
	exportAllRows,
	exportFilteredRows,
	hasActiveFilters,
	isRefreshing,
	permissions,
	query,
	statusFilter,
	table,
	typeFilter,
	onDiscountTypeFilterChange,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
	onTypeFilterChange,
}: DiscountMaintenanceTableFiltersProps) {
	return (
		<div>
			<div className="grid gap-2 border-b border-darknavy/10 px-3 py-3 xl:flex xl:items-end xl:justify-between xl:pb-0 xl:pt-2">
				<div className="xl:hidden">
					<ModuleTableFilterSelect
						label="Type"
						value={typeFilter}
						options={[
							{ label: "All", value: "All" },
							...DiscountMaintenanceTypeOptions.map((type) => ({
								label: type,
								value: type,
							})),
						]}
						onChange={(value) =>
							onTypeFilterChange(value as DiscountTypeFilter)
						}
					/>
				</div>
				<div className="hidden xl:block">
					<DiscountMaintenanceTypeTabs
						value={typeFilter}
						onChange={onTypeFilterChange}
					/>
				</div>
			</div>
			<ModuleTableToolbar
				className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]"
			>
				<div
					data-spotlight-id="maintenance-table-filters"
					className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(13rem,1.35fr)_minmax(8rem,0.85fr)_minmax(7rem,0.7fr)]"
				>
					<ModuleTableSearch
						label="Search discounts"
						value={query}
						onChange={onQueryChange}
						placeholder="Search by name, type, value, account, or status"
					/>
					<ModuleTableFilterSelect
						label="Discount Type"
						value={discountTypeFilter}
						options={[
							{ label: "All", value: "All" },
							...DiscountMaintenanceValueTypeOptions.map((type) => ({
								label: type,
								value: type,
							})),
						]}
						onChange={(value) =>
							onDiscountTypeFilterChange(value as DiscountValueTypeFilter)
						}
					/>
					<ModuleTableFilterSelect
						label="Status"
						value={statusFilter}
						options={[
							{ label: "All", value: "" },
							...DiscountMaintenanceStatusOptions.map((status) => ({
								label: status,
								value: status,
							})),
						]}
						onChange={(value) =>
							onStatusFilterChange(value as DiscountStatusFilter)
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
							columns={DiscountMaintenanceExportColumns}
							fileName="discount-maintenance"
							filteredRows={exportFilteredRows}
							isFiltered={hasActiveFilters}
							table={table}
							title="Discount Maintenance"
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
		</div>
	);
}

function DiscountMaintenanceTypeTabs({
	value,
	onChange,
}: {
	value: DiscountTypeFilter;
	onChange: (value: DiscountTypeFilter) => void;
}) {
	return (
		<Tabs
			value={value}
			options={["All", ...DiscountMaintenanceTypeOptions]}
			onChange={onChange}
		/>
	);
}

