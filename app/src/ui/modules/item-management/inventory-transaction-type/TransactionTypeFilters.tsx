import { TransactionTypeStatusOptions } from "@/app/src/constants/modules/item-management/inventory-transaction-type/TransactionTypeConstants";
import type { TransactionTypeFiltersProps } from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";
import {
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export function TransactionTypeFilters({
	moduleFilter,
	moduleFilterOptions,
	searchTerm,
	statusFilter,
	onModuleFilterChange,
	onSearchTermChange,
	onStatusFilterChange,
}: TransactionTypeFiltersProps) {
	return (
		<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,3fr)_minmax(14rem,1fr)_minmax(14rem,1fr)]">
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
		</ModuleTableToolbar>
	);
}
