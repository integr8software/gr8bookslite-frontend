import {
	PaymentTypeExportColumns,
	PaymentTypeStatusOptions,
} from "@/app/src/constants/modules/maintenance/payment-type/PaymentTypeConstants";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import type {
	PaymentTypeClassification,
	PaymentTypeStatusFilter,
	PaymentTypeTableFiltersProps,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";

export function PaymentTypeFilters({
	exportAllRows,
	exportFilteredRows,
	hasActiveFilters,
	isRefreshing,
	permissions,
	searchTerm,
	statusFilter,
	table,
	typeFilter,
	typeFilterOptions,
	onRefresh,
	onSearchTermChange,
	onStatusFilterChange,
	onTypeFilterChange,
}: PaymentTypeTableFiltersProps) {
	return (
		<ModuleTableToolbar className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]">
			<div
				data-spotlight-id="maintenance-table-filters"
				className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(11rem,1.2fr)_minmax(7rem,0.8fr)_minmax(7rem,0.8fr)]"
			>
				<ModuleTableSearch
					label="Search payment types"
					value={searchTerm}
					onChange={onSearchTermChange}
					placeholder="Search by name, category, description, or status"
				/>
				<ModuleTableFilterSelect
					label="Category"
					value={typeFilter}
					options={[
						{ label: "All", value: "" },
						...typeFilterOptions.map((typeOption) => ({
							label: typeOption,
							value: typeOption,
						})),
					]}
					onChange={(value) =>
						onTypeFilterChange(value as "" | PaymentTypeClassification)
					}
				/>
				<ModuleTableFilterSelect
					label="Status"
					value={statusFilter}
					options={[
						{ label: "All", value: "" },
						...PaymentTypeStatusOptions.map((status) => ({
							label: status,
							value: status,
						})),
					]}
					onChange={(value) =>
						onStatusFilterChange(value as PaymentTypeStatusFilter)
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
						columns={PaymentTypeExportColumns}
						fileName="payment-type"
						filteredRows={exportFilteredRows}
						isFiltered={hasActiveFilters}
						table={table}
						title="Payment Type"
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

