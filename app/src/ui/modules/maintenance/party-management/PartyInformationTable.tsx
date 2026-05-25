import { Search } from "lucide-react";
import { PartyManagementTablePaginationStorageKey } from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import { usePartyManagementTable } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import type { PartyInformationRecord } from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { PartyInformationTableFilters } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationTableFilters";
import { PartyInformationTableRow } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationTableRow";

export function PartyInformationTable({
	isLoading,
	records,
}: {
	isLoading: boolean;
	records: PartyInformationRecord[];
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
				minWidthClassName="min-w-[52rem]"
				paginationStorageKey={PartyManagementTablePaginationStorageKey}
				table={partyTable.table}
				toolbar={
					<PartyInformationTableFilters
						classificationFilter={partyTable.classificationFilter}
						classificationOptions={partyTable.classificationOptions}
						partyTypeFilter={partyTable.partyTypeFilter}
						partyTypeOptions={partyTable.partyTypeOptions}
						query={partyTable.query}
						onClassificationFilterChange={partyTable.setClassificationFilter}
						onPartyTypeFilterChange={partyTable.setPartyTypeFilter}
						onQueryChange={partyTable.setQuery}
						onResetFilters={partyTable.resetFilters}
					/>
				}
				renderRow={({ id, original }) => (
					<PartyInformationTableRow key={id} record={original} />
				)}
			/>
		</div>
	);
}
