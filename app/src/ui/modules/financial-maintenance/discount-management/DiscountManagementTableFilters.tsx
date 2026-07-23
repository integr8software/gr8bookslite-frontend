import {
	DiscountManagementExportColumns,
	DiscountManagementStatusOptions,
	DiscountManagementTypeOptions,
	DiscountManagementValueTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/discount-management/DiscountManagementConstants";
import type {
	DiscountStatusFilter,
	DiscountTypeFilter,
	DiscountManagementTableFiltersProps,
	DiscountValueTypeFilter,
} from "@/app/src/types/modules/financial-maintenance/discount-management/DiscountManagementTypes";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function DiscountManagementTableFilters({
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
}: DiscountManagementTableFiltersProps) {
	return (
		<ModuleTableToolbar
			className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]"
		>
			<div
				data-spotlight-id="maintenance-table-filters"
				className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1.2fr)_minmax(7rem,0.8fr)_minmax(8rem,0.8fr)_minmax(7rem,0.8fr)]"
			>
				<ModuleTableSearch
					label="Search discounts"
					value={query}
					onChange={onQueryChange}
					placeholder="Search by name, type, value, account, or status"
				/>
				<ModuleTableFilterSelect
					label="Type"
					value={typeFilter}
					options={[
						{ label: "All", value: "All" },
						...DiscountManagementTypeOptions.map((type) => ({
							label: type,
							value: type,
						})),
					]}
					onChange={(value) => onTypeFilterChange(value as DiscountTypeFilter)}
				/>
				<ModuleTableFilterSelect
					label="Discount Type"
					value={discountTypeFilter}
					options={[
						{ label: "All", value: "All" },
						...DiscountManagementValueTypeOptions.map((type) => ({
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
						...DiscountManagementStatusOptions.map((status) => ({
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
						columns={DiscountManagementExportColumns}
						fileName="discount-management"
						filteredRows={exportFilteredRows}
						isFiltered={hasActiveFilters}
						table={table}
						title="Discount Management"
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

