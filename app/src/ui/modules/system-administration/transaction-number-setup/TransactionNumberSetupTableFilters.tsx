import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type TransactionNumberSetupTableFiltersProps = {
	query: string;
	scopeFilter: "all" | "any" | "branch";
	onQueryChange: (value: string) => void;
	onScopeFilterChange: (value: "all" | "any" | "branch") => void;
};

export function TransactionNumberSetupTableFilters({
	onQueryChange,
	onScopeFilterChange,
	query,
	scopeFilter,
}: TransactionNumberSetupTableFiltersProps) {
	return (
		<ModuleTableToolbar className="rounded-none border-x-0 border-t-0 shadow-none lg:grid-cols-[minmax(24rem,2.5fr)_minmax(14rem,1fr)_minmax(11rem,1fr)]">
			<ModuleTableSearch
				label="Search transaction number setups"
				value={query}
				onChange={onQueryChange}
				placeholder="Search module, prefix, branch, or next number"
			/>
			<ModuleTableFilterSelect
				label="Mode"
				value={scopeFilter}
				options={[
					{ label: "All", value: "any" },
					{ label: "All Branches", value: "all" },
					{ label: "Per Branch", value: "branch" },
				]}
				onChange={(value) =>
					onScopeFilterChange(
						value as "all" | "any" | "branch",
					)
				}
			/>
			<ModuleTableResetButton
				onClick={() => {
					onQueryChange("");
					onScopeFilterChange("any");
				}}
			>
				Reset
			</ModuleTableResetButton>
		</ModuleTableToolbar>
	);
}
