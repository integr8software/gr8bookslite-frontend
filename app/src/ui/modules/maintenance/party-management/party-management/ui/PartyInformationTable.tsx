import { Search } from "lucide-react";
import { PartyManagementTablePaginationStorageKey } from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import { usePartyManagementTable } from "@/app/src/hooks/modules/maintenance/party-management/party-management/usePartyManagement";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { PartyInformationTableFilters } from "./PartyInformationTableFilters";
import { PartyInformationTableRow } from "./PartyInformationTableRow";

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
			<ModuleTable
				emptyDescription="Try adjusting the search or filters, or add a new party record."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No party records found"
				isLoading={isLoading}
				minWidthClassName="min-w-[76rem]"
				paginationStorageKey={PartyManagementTablePaginationStorageKey}
				table={partyTable.table}
				renderRow={({ id, original }) => (
					<PartyInformationTableRow key={id} record={original} />
				)}
			/>
		</div>
	);
}
