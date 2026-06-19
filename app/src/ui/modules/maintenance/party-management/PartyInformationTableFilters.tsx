import type { Table } from "@tanstack/react-table";
import type {
	PartyClassification,
	PartyInformationStatus,
	PartyInformationTableRecord,
	PartyType,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	type ModuleTableExportColumn,
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type PartyInformationTableFiltersProps = {
	exportAllRows: PartyInformationTableRecord[];
	exportFilteredRows: PartyInformationTableRecord[];
	hasActiveFilters: boolean;
	classificationFilter: PartyClassification | "All";
	classificationOptions: readonly PartyClassification[];
	partyTypeFilter: PartyType | "All";
	partyTypeOptions: readonly PartyType[];
	query: string;
	statusFilter: PartyInformationStatus | "All";
	statusOptions: readonly PartyInformationStatus[];
	table: Table<PartyInformationTableRecord>;
	isRefreshing: boolean;
	onClassificationFilterChange: (value: PartyClassification | "All") => void;
	onPartyTypeFilterChange: (value: PartyType | "All") => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: PartyInformationStatus | "All") => void;
};

export function PartyInformationTableFilters({
	exportAllRows,
	exportFilteredRows,
	hasActiveFilters,
	classificationFilter,
	classificationOptions,
	partyTypeFilter,
	partyTypeOptions,
	query,
	statusFilter,
	statusOptions,
	table,
	isRefreshing,
	onClassificationFilterChange,
	onPartyTypeFilterChange,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
}: PartyInformationTableFiltersProps) {
	return (
		<ModuleTableToolbar
			className="!gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3"
			style={{
				gridTemplateColumns:
					"minmax(8rem,1.2fr) minmax(6rem,0.8fr) minmax(6rem,0.8fr) minmax(5.75rem,0.7fr) 3.25rem 3.25rem 3.25rem",
			}}
		>
			<ModuleTableSearch
				label="Search parties"
				value={query}
				onChange={onQueryChange}
				placeholder="Search by name or address"
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
			<ModuleTableColumnVisibilityButton table={table} />
			<ModuleTableExportButton
				allRows={exportAllRows}
				columns={PartyInformationExportColumns}
				fileName="party-information"
				filteredRows={exportFilteredRows}
				isFiltered={hasActiveFilters}
				table={table}
				title="Party Information"
			/>
			<ModuleTableResetButton
				className="px-2"
				isRefreshing={isRefreshing}
				onClick={onRefresh}
			>
				<span className="sr-only">Refresh</span>
			</ModuleTableResetButton>
		</ModuleTableToolbar>
	);
}

const PartyInformationExportColumns: ModuleTableExportColumn<PartyInformationTableRecord>[] =
	[
		{ header: "Party Code", value: "partyCodeNo" },
		{ header: "Name", id: "name", value: "name" },
		{ header: "Classification", id: "classification", value: "classification" },
		{ header: "Party Type", id: "partyTypesLabel", value: "partyTypesLabel" },
		{ header: "Status", id: "status", value: "status" },
		{ header: "Address", id: "addressLabel", value: "addressLabel" },
		{ header: "TIN", value: "tin" },
		{ header: "VAT Registration Type", value: "vatRegistrationType" },
		{ header: "BIR ATC Code", value: "atcCode" },
		{ header: "Email", value: "email" },
		{ header: "Contact No.", value: "contactNo" },
		{ header: "Terms", value: "termName" },
		{ header: "Default Receivable Account", value: "defaultReceivableAccount" },
		{ header: "Default Payable Account", value: "defaultPayableAccount" },
		{ header: "Employee Receivable Account", value: "employeeReceivableAccount" },
		{ header: "Employee Advance Account", value: "employeeAdvanceAccount" },
	];
