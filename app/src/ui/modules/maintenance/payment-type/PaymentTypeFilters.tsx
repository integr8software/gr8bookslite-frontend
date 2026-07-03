import {
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import type {
	PaymentTypeClassification,
	PaymentTypeStatus,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";

type PaymentTypeFiltersProps = {
	searchTerm: string;
	statusFilter: "" | PaymentTypeStatus;
	typeFilter: "" | PaymentTypeClassification;
	typeFilterOptions: PaymentTypeClassification[];
	onSearchTermChange: (value: string) => void;
	onStatusFilterChange: (value: "" | PaymentTypeStatus) => void;
	onTypeFilterChange: (value: "" | PaymentTypeClassification) => void;
};

export function PaymentTypeFilters({
	searchTerm,
	statusFilter,
	typeFilter,
	typeFilterOptions,
	onSearchTermChange,
	onStatusFilterChange,
	onTypeFilterChange,
}: PaymentTypeFiltersProps) {
	return (
		<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,3fr)_minmax(14rem,1fr)_minmax(14rem,1fr)]">
			<ModuleTableSearch
				label="Search payment types"
				value={searchTerm}
				onChange={onSearchTermChange}
				placeholder="Search by name or category"
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
					{ label: "Active", value: "Active" },
					{ label: "Inactive", value: "Inactive" },
				]}
				onChange={(value) =>
					onStatusFilterChange(value as "" | PaymentTypeStatus)
				}
			/>
		</ModuleTableToolbar>
	);
}
