import type {
	PartyClassification,
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
	onClassificationFilterChange: (value: PartyClassification | "All") => void;
	onPartyTypeFilterChange: (value: PartyType | "All") => void;
	onQueryChange: (value: string) => void;
	onResetFilters: () => void;
};

export function PartyInformationTableFilters({
	classificationFilter,
	classificationOptions,
	partyTypeFilter,
	partyTypeOptions,
	query,
	onClassificationFilterChange,
	onPartyTypeFilterChange,
	onQueryChange,
	onResetFilters,
}: PartyInformationTableFiltersProps) {
	return (
		<ModuleTableToolbar className="rounded-none border-x-0 border-t-0 shadow-none lg:grid-cols-[minmax(24rem,2.5fr)_minmax(15rem,1fr)_minmax(15rem,1fr)_minmax(11rem,1fr)]">
			<ModuleTableSearch
				label="Search parties"
				value={query}
				onChange={onQueryChange}
				placeholder="Search parties..."
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
			<ModuleTableResetButton onClick={onResetFilters}>
				Reset
			</ModuleTableResetButton>
		</ModuleTableToolbar>
	);
}
