import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type UserListTableFiltersProps = {
	query: string;
	typeFilter: string;
	typeOptions: string[];
	onQueryChange: (value: string) => void;
	onResetFilters: () => void;
	onTypeFilterChange: (value: string) => void;
};

export function UserListTableFilters({
	query,
	typeFilter,
	typeOptions,
	onQueryChange,
	onResetFilters,
	onTypeFilterChange,
}: UserListTableFiltersProps) {
	return (
		<ModuleTableToolbar
			className="rounded-none border-x-0 border-t-0 shadow-none lg:grid-cols-[minmax(24rem,2.5fr)_minmax(15rem,1fr)_minmax(11rem,1fr)]"
			data-spotlight-id="users-filters"
		>
			<ModuleTableSearch
				label="Search users"
				value={query}
				onChange={onQueryChange}
				placeholder="Search users..."
			/>
			<ModuleTableFilterSelect
				label="User Role"
				value={typeFilter}
				options={["All", ...typeOptions].map((option) => ({
					label: option,
					value: option,
				}))}
				onChange={onTypeFilterChange}
			/>
			<ModuleTableResetButton onClick={onResetFilters}>
				Reset
			</ModuleTableResetButton>
		</ModuleTableToolbar>
	);
}
