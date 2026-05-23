import { Search, X } from "lucide-react";

type TransactionNumberSetupTableFiltersProps = {
	query: string;
	scopeFilter: "all" | "any" | "branch" | "shared";
	onQueryChange: (value: string) => void;
	onScopeFilterChange: (value: "all" | "any" | "branch" | "shared") => void;
};

export function TransactionNumberSetupTableFilters({
	onQueryChange,
	onScopeFilterChange,
	query,
	scopeFilter,
}: TransactionNumberSetupTableFiltersProps) {
	return (
		<div className="flex flex-col gap-3 border-b border-darknavy/10 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
			<label className="relative min-w-0 flex-1">
				<span className="sr-only">Search transaction number setups</span>
				<Search
					className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/35"
					aria-hidden="true"
				/>
				<input
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					placeholder="Search module, prefix, branch, or next number"
					className="h-11 w-full rounded-md border border-darknavy/10 bg-offwhite/55 pl-9 pr-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
				/>
			</label>
			<div className="flex flex-wrap gap-2">
				<select
					value={scopeFilter}
					onChange={(event) =>
						onScopeFilterChange(
							event.target.value as "all" | "any" | "branch" | "shared",
						)
					}
					className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
					aria-label="Filter by numbering mode"
				>
					<option value="any">All modes</option>
					<option value="all">All branches</option>
					<option value="branch">Per branch</option>
					<option value="shared">Shared selected</option>
				</select>
				<button
					type="button"
					onClick={() => {
						onQueryChange("");
						onScopeFilterChange("any");
					}}
					className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/65 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/30"
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Reset
				</button>
			</div>
		</div>
	);
}
