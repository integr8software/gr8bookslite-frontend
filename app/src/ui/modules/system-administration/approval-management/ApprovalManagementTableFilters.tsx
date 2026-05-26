import type { ApprovalManagementStatus } from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";

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
		<ModuleTableToolbar className="rounded-none border-x-0 border-t-0 shadow-none lg:grid-cols-[minmax(24rem,2.5fr)_minmax(14rem,1fr)_minmax(11rem,1fr)]">
			<ModuleTableSearch
				label="Search approval workflows"
				value={query}
				onChange={onQueryChange}
				placeholder="Search module, approver, or condition"
			/>
			<ModuleTableFilterSelect
				label="Status"
				value={statusFilter}
				options={[
					{ label: "All statuses", value: "any" },
					{ label: "Active", value: "Active" },
					{ label: "Inactive", value: "Inactive" },
				]}
				onChange={(value) =>
					onStatusFilterChange(value as ApprovalManagementStatus | "any")
				}
			/>
			<ModuleTableResetButton
				onClick={() => {
					onQueryChange("");
					onStatusFilterChange("any");
				}}
			>
				Reset
			</ModuleTableResetButton>
		</ModuleTableToolbar>
	);
}

