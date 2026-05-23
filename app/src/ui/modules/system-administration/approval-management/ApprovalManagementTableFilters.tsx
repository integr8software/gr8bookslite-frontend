import { Search, X } from "lucide-react";
import type { ApprovalManagementStatus } from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";

type ApprovalManagementTableFiltersProps = {
	query: string;
	statusFilter: ApprovalManagementStatus | "any";
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (value: ApprovalManagementStatus | "any") => void;
};

export function ApprovalManagementTableFilters({
	onQueryChange,
	onStatusFilterChange,
	query,
	statusFilter,
}: ApprovalManagementTableFiltersProps) {
	return (
		<div className="flex flex-col gap-3 border-b border-darknavy/10 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
			<label className="relative min-w-0 flex-1">
				<span className="sr-only">Search approval workflows</span>
				<Search
					className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/35"
					aria-hidden="true"
				/>
				<input
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					placeholder="Search module, approver, or condition"
					className="h-11 w-full rounded-md border border-darknavy/10 bg-offwhite/55 pl-9 pr-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
				/>
			</label>
			<div className="flex flex-wrap gap-2">
				<select
					value={statusFilter}
					onChange={(event) =>
						onStatusFilterChange(
							event.target.value as ApprovalManagementStatus | "any",
						)
					}
					className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
					aria-label="Filter by workflow status"
				>
					<option value="any">All statuses</option>
					<option value="Active">Active</option>
					<option value="Inactive">Inactive</option>
				</select>
				<button
					type="button"
					onClick={() => {
						onQueryChange("");
						onStatusFilterChange("any");
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
