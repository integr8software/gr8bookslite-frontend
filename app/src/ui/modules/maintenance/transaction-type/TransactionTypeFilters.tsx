import { TransactionTypeStatusOptions } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import {
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type TransactionTypeFiltersProps = {
	moduleFilter: string;
	moduleFilterOptions: Array<{ label: string; value: string }>;
	searchTerm: string;
	statusFilter: "" | (typeof TransactionTypeStatusOptions)[number];
	onModuleFilterChange: (value: string) => void;
	onSearchTermChange: (value: string) => void;
	onStatusFilterChange: (
		value: "" | (typeof TransactionTypeStatusOptions)[number],
	) => void;
};

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
				label="Search transaction types"
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
						value as
							| ""
							| (typeof TransactionTypeStatusOptions)[number],
					)
				}
			/>
		</ModuleTableToolbar>
	);
}
