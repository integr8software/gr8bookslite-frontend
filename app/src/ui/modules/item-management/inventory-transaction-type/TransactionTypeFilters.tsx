import {
	TransactionTypeExportColumns,
	TransactionTypeStatusOptions,
} from "@/app/src/constants/modules/item-management/inventory-transaction-type/TransactionTypeConstants";
import type { TransactionTypeFiltersProps } from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function TransactionTypeFilters({
	exportAllRows,
	exportFilteredRows,
	hasActiveFilters,
	isRefreshing,
	moduleFilter,
	moduleFilterOptions,
	searchTerm,
	statusFilter,
	table,
	onModuleFilterChange,
	onRefresh,
	onSearchTermChange,
	onStatusFilterChange,
}: TransactionTypeFiltersProps) {
	return (
		<ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
			<div
				data-spotlight-id="maintenance-table-filters"
				className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1.4fr)_minmax(8rem,0.8fr)_minmax(8rem,0.8fr)]"
			>
				<ModuleTableSearch
					label="Search inventory transaction types"
					value={searchTerm}
					onChange={onSearchTermChange}
					placeholder="Search by name, description, module, or account"
				/>
				<ModuleTableFilterSelect
					label="Module"
					value={moduleFilter}
					options={[
						{ label: "All", value: "" },
						...moduleFilterOptions,
					]}
					onChange={onModuleFilterChange}
				/>
				<ModuleTableFilterSelect
					label="Status"
					value={statusFilter}
					options={[
						{ label: "All", value: "" },
						...TransactionTypeStatusOptions.map((statusOption) => ({
							label: statusOption,
							value: statusOption,
						})),
					]}
					onChange={(value) =>
						onStatusFilterChange(
							value as TransactionTypeFiltersProps["statusFilter"],
						)
					}
				/>
			</div>
			<div
				data-spotlight-id="maintenance-table-options"
				className="grid grid-cols-3 gap-2 md:w-[10.75rem]"
			>
				<ModuleTableColumnVisibilityButton table={table} />
				<ModuleTableExportButton
					allRows={exportAllRows}
					columns={TransactionTypeExportColumns}
					fileName="inventory-transaction-type"
					filteredRows={exportFilteredRows}
					isFiltered={hasActiveFilters}
					table={table}
					title="Inventory Transaction Type"
				/>
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
