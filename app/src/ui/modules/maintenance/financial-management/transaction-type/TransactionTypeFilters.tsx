import { TransactionTypeStatusOptions } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import {
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type TransactionTypeFiltersProps = {
	searchTerm: string;
	statusFilter: "" | (typeof TransactionTypeStatusOptions)[number];
	onSearchTermChange: (value: string) => void;
	onStatusFilterChange: (
		value: "" | (typeof TransactionTypeStatusOptions)[number],
	) => void;
};

export function TransactionTypeFilters({
	searchTerm,
	statusFilter,
	onSearchTermChange,
	onStatusFilterChange,
}: TransactionTypeFiltersProps) {
	return (
		<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,3fr)_minmax(14rem,1fr)]">
			<ModuleTableSearch
				label="Search transaction types"
				value={searchTerm}
				onChange={onSearchTermChange}
				placeholder="Search by type, description, or account"
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
