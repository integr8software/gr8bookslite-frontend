import {
	ItemCategoryAccountingStatusOptions,
	ItemCategoryExportColumns,
	ItemStatusOptions,
} from "@/app/src/constants/modules/item-management/item-category/ItemCategoryConstants";
import type {
	ItemCategoryAccountingSetupStatusFilter,
	ItemCategoryStatusFilter,
	ItemCategoryTableFiltersProps,
} from "@/app/src/types/modules/item-management/item-category/ItemCategoryTypes";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function ItemCategoryTableFilters({
	accountingFilter,
	exportAllRows,
	exportFilteredRows,
	hasActiveFilters,
	isRefreshing,
	permissions,
	query,
	statusFilter,
	table,
	onAccountingFilterChange,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
}: ItemCategoryTableFiltersProps) {
	return (
		<ModuleTableToolbar
			className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]"
		>
			<div
				data-spotlight-id="maintenance-table-filters"
				className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(11rem,1.2fr)_minmax(7rem,0.8fr)_minmax(7rem,0.8fr)]"
			>
				<ModuleTableSearch
					label="Search item categories"
					value={query}
					onChange={onQueryChange}
					placeholder="Search category, parent, status, or accounting setup"
				/>
				<ModuleTableFilterSelect
					label="Accounting Setup"
					value={accountingFilter}
					options={[
						{ label: "All", value: "" },
						...ItemCategoryAccountingStatusOptions.map((status) => ({
							label: status,
							value: status,
						})),
					]}
					onChange={(value) =>
						onAccountingFilterChange(
							value as ItemCategoryAccountingSetupStatusFilter,
						)
					}
				/>
				<ModuleTableFilterSelect
					label="Status"
					value={statusFilter}
					options={[
						{ label: "All", value: "" },
						...ItemStatusOptions.map((status) => ({
							label: status,
							value: status,
						})),
					]}
					onChange={(value) =>
						onStatusFilterChange(value as ItemCategoryStatusFilter)
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
						columns={ItemCategoryExportColumns}
						fileName="item-category"
						filteredRows={exportFilteredRows}
						isFiltered={hasActiveFilters}
						table={table}
						title="Item Category"
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
