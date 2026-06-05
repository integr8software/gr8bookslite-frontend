import type {
	PartyClassification,
	PartyInformationStatus,
	PartyType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type PartyInformationTableFiltersProps = {
	classificationFilter: PartyClassification | "All";
	classificationOptions: readonly PartyClassification[];
	partyTypeFilter: PartyType | "All";
	partyTypeOptions: readonly PartyType[];
	query: string;
	statusFilter: PartyInformationStatus | "All";
	statusOptions: readonly PartyInformationStatus[];
	onClassificationFilterChange: (value: PartyClassification | "All") => void;
	onPartyTypeFilterChange: (value: PartyType | "All") => void;
	onQueryChange: (value: string) => void;
	onResetFilters: () => void;
	onStatusFilterChange: (value: PartyInformationStatus | "All") => void;
};

export function PartyInformationTableFilters({
	classificationFilter,
	classificationOptions,
	partyTypeFilter,
	partyTypeOptions,
	query,
	statusFilter,
	statusOptions,
	onClassificationFilterChange,
	onPartyTypeFilterChange,
	onQueryChange,
	onResetFilters,
	onStatusFilterChange,
}: PartyInformationTableFiltersProps) {
	return (
		<ModuleTableToolbar className="rounded-none border-x-0 border-t-0 shadow-none lg:grid-cols-[minmax(22rem,2fr)_minmax(13rem,1fr)_minmax(13rem,1fr)_minmax(11rem,0.8fr)_minmax(10rem,0.7fr)]">
			<ModuleTableSearch
				label="Search parties"
				value={query}
				onChange={onQueryChange}
				placeholder="Search by party, type, status, or address"
			/>
			<ModuleTableFilterSelect
				label="Classification"
				value={classificationFilter}
				options={["All", ...classificationOptions].map((option) => ({
					label: option,
					value: option,
				}))}
				onChange={(value) =>
					onClassificationFilterChange(
						value as PartyClassification | "All",
					)
				}
			/>
			<ModuleTableFilterSelect
				label="Party Type"
				value={partyTypeFilter}
				options={["All", ...partyTypeOptions].map((option) => ({
					label: option,
					value: option,
				}))}
				onChange={(value) =>
					onPartyTypeFilterChange(value as PartyType | "All")
				}
			/>
			<ModuleTableFilterSelect
				label="Status"
				value={statusFilter}
				options={["All", ...statusOptions].map((option) => ({
					label: option,
					value: option,
				}))}
				onChange={(value) =>
					onStatusFilterChange(value as PartyInformationStatus | "All")
				}
			/>
			<ModuleTableResetButton onClick={onResetFilters}>
				Reset
			</ModuleTableResetButton>
		</ModuleTableToolbar>
	);
}
