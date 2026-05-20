import { Search } from "lucide-react";
import type { UserStatus } from "@/app/src/data/modules/system-administration/user-management/UserManagementData";

type UserListTableFiltersProps = {
	groupFilter: string;
	groupOptions: string[];
	query: string;
	statusFilter: UserStatus | "All";
	statusOptions: readonly UserStatus[];
	typeFilter: string;
	typeOptions: string[];
	onGroupFilterChange: (value: string) => void;
	onQueryChange: (value: string) => void;
	onResetFilters: () => void;
	onStatusFilterChange: (value: UserStatus | "All") => void;
	onTypeFilterChange: (value: string) => void;
};

export function UserListTableFilters({
	groupFilter,
	groupOptions,
	query,
	statusFilter,
	statusOptions,
	typeFilter,
	typeOptions,
	onGroupFilterChange,
	onQueryChange,
	onResetFilters,
	onStatusFilterChange,
	onTypeFilterChange,
}: UserListTableFiltersProps) {
	return (
		<div
			className="flex flex-wrap items-center gap-3 border-b border-darknavy/10 px-4 py-3"
			data-spotlight-id="user-list-filters"
		>
			<div className="relative w-full sm:w-72">
				<Search
					className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/38"
					aria-hidden="true"
				/>
				<input
					type="search"
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					placeholder="Search users..."
					className="h-9 w-full rounded border border-darknavy/10 bg-white pl-9 pr-3 text-xs text-darknavy outline-none transition placeholder:text-darknavy/38 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
				/>
			</div>
			<div className="grid min-w-full flex-1 gap-3 sm:min-w-0 sm:grid-cols-2 xl:grid-cols-3">
				<ToolbarSelect
					label="Status"
					value={statusFilter}
					options={["All", ...statusOptions]}
					onChange={(value) =>
						onStatusFilterChange(value as UserStatus | "All")
					}
				/>
				<ToolbarSelect
					label="User Role"
					value={typeFilter}
					options={["All", ...typeOptions]}
					onChange={onTypeFilterChange}
				/>
				<ToolbarSelect
					label="Department"
					value={groupFilter}
					options={["All", ...groupOptions]}
					onChange={onGroupFilterChange}
				/>
			</div>
			<button
				type="button"
				onClick={onResetFilters}
				className="inline-flex h-9 items-center justify-center rounded border border-darknavy/10 bg-white px-4 text-xs font-semibold text-darknavy/50 transition hover:border-skyblue/45 hover:text-darknavy"
			>
				Reset
			</button>
		</div>
	);
}

function ToolbarSelect({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	options: readonly string[];
	value: string;
}) {
	return (
		<label className="flex min-w-0 items-center gap-2 text-xs font-semibold text-darknavy/48">
			<span className="whitespace-nowrap">{label}</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="h-9 min-w-0 flex-1 rounded border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</label>
	);
}
