import { Search } from "lucide-react";
import { PartyManagementTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import { usePartyManagementTable } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import type { PartyInformationRecord } from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { PartyInformationTableFilters } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationTableFilters";
import { PartyInformationTableRow } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationTableRow";

export function PartyInformationTable({
	isLoading,
	isRefreshing,
	records,
	onRefresh,
}: {
	isLoading: boolean;
	isRefreshing: boolean;
	records: PartyInformationRecord[];
	onRefresh: () => void;
}) {
	const partyTable = usePartyManagementTable(records);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Try adjusting the search or filters, or add a new party record."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No party records found"
				isLoading={isLoading}
				minWidthClassName="min-w-[64rem]"
				paginationStorageKey={PartyManagementTablePaginationStorageKey}
				paginationTotalRows={partyTable.totalRows}
				table={partyTable.table}
				toolbar={
					<PartyInformationTableFilters
						exportAllRows={partyTable.exportAllRows}
						exportFilteredRows={partyTable.exportFilteredRows}
						hasActiveFilters={partyTable.hasActiveFilters}
						classificationFilter={partyTable.classificationFilter}
						classificationOptions={partyTable.classificationOptions}
						partyTypeFilter={partyTable.partyTypeFilter}
						partyTypeOptions={partyTable.partyTypeOptions}
						query={partyTable.query}
						statusFilter={partyTable.statusFilter}
						statusOptions={partyTable.statusOptions}
						table={partyTable.table}
						onClassificationFilterChange={partyTable.setClassificationFilter}
						onPartyTypeFilterChange={partyTable.setPartyTypeFilter}
						onQueryChange={partyTable.setQuery}
						onRefresh={onRefresh}
						isRefreshing={isRefreshing}
						onStatusFilterChange={partyTable.setStatusFilter}
					/>
				}
				renderRow={(row) => (
					<PartyInformationTableRow key={row.id} row={row} />
				)}
			/>
		</div>
	);
}
