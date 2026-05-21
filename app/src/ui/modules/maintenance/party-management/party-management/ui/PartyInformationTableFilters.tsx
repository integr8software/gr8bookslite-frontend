import { Search } from "lucide-react";
import type {
	PartyClassification,
	PartyType,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";

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
		<div className="flex flex-wrap items-center gap-3 border-b border-darknavy/10 px-4 py-3">
			<div className="relative w-full sm:w-72">
				<Search
					className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/38"
					aria-hidden="true"
				/>
				<input
					type="search"
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					placeholder="Search parties..."
					className="h-9 w-full rounded border border-darknavy/10 bg-white pl-9 pr-3 text-xs text-darknavy outline-none transition placeholder:text-darknavy/38 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
				/>
			</div>
			<div className="grid min-w-full flex-1 gap-3 sm:min-w-0 sm:grid-cols-2">
				<ToolbarSelect
					label="Classification"
					value={classificationFilter}
					options={["All", ...classificationOptions]}
					onChange={(value) =>
						onClassificationFilterChange(value as PartyClassification | "All")
					}
				/>
				<ToolbarSelect
					label="Party Type"
					value={partyTypeFilter}
					options={["All", ...partyTypeOptions]}
					onChange={(value) =>
						onPartyTypeFilterChange(value as PartyType | "All")
					}
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
