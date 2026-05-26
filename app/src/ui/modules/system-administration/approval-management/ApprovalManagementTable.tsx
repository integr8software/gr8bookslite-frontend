"use client";

import { Search } from "lucide-react";
import { ApprovalManagementPaginationStorageKey } from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import type { useApprovalManagementListPage } from "@/app/src/hooks/modules/system-administration/approval-management/useApprovalManagementListPage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ApprovalManagementTableFilters } from "@/app/src/ui/modules/system-administration/approval-management/ApprovalManagementTableFilters";
import { ApprovalManagementTableRow } from "@/app/src/ui/modules/system-administration/approval-management/ApprovalManagementTableRow";

type ApprovalManagementTableProps = Pick<
	ReturnType<typeof useApprovalManagementListPage>,
	| "approverNameById"
	| "handleQueryChange"
	| "handleStatusFilterChange"
	| "isLoading"
	| "query"
	| "setPendingInactiveWorkflow"
	| "statusFilter"
	| "table"
>;

export function ApprovalManagementTable({
	approverNameById,
	handleQueryChange,
	handleStatusFilterChange,
	isLoading,
	query,
	setPendingInactiveWorkflow,
	statusFilter,
	table,
}: ApprovalManagementTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Add an approval workflow to control module approvals."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No approval workflows found"
				isLoading={isLoading}
				minWidthClassName="min-w-[92rem]"
				paginationStorageKey={ApprovalManagementPaginationStorageKey}
				table={table}
				toolbar={
					<ApprovalManagementTableFilters
						query={query}
						statusFilter={statusFilter}
						onQueryChange={handleQueryChange}
						onStatusFilterChange={handleStatusFilterChange}
					/>
				}
				renderRow={({ id, original }) => (
					<ApprovalManagementTableRow
						key={id}
						approverNameById={approverNameById}
						workflow={original}
						onSetInactive={setPendingInactiveWorkflow}
					/>
				)}
			/>
		</div>
	);
}
