import type { Table } from "@tanstack/react-table";
import {
	TermManagementDatemodeOptions,
	TermManagementStatusOptions,
	TermManagementTableColumns,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import type {
	TermManagement,
	TermManagementStatus,
} from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import type { TermManagementPermissions } from "@/app/src/services/modules/maintenance/term-management/TermManagementApi";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	type ModuleTableExportColumn,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type TermManagementTableFiltersProps = {
	datemodeFilter: string;
	exportAllRows: TermManagement[];
	exportFilteredRows: TermManagement[];
	hasActiveFilters: boolean;
	isRefreshing: boolean;
	permissions: TermManagementPermissions;
	query: string;
	statusFilter: "" | TermManagementStatus;
	table: Table<TermManagement>;
	onDatemodeFilterChange: (value: string) => void;
	onQueryChange: (value: string) => void;
	onRefresh: () => void;
	onStatusFilterChange: (value: "" | TermManagementStatus) => void;
};

export function TermManagementTableFilters({
	datemodeFilter,
	exportAllRows,
	exportFilteredRows,
	hasActiveFilters,
	isRefreshing,
	permissions,
	query,
	statusFilter,
	table,
	onDatemodeFilterChange,
	onQueryChange,
	onRefresh,
	onStatusFilterChange,
}: TermManagementTableFiltersProps) {
	return (
		<ModuleTableToolbar
			className="!grid-cols-2 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(11rem,1.2fr)_minmax(7rem,0.8fr)_minmax(7rem,0.8fr)_3.25rem_3.25rem_3.25rem]"
		>
			<ModuleTableSearch
				label="Search terms"
				value={query}
				onChange={onQueryChange}
				placeholder="Search by name, datemode, period, or status"
			/>
			<ModuleTableFilterSelect
				label="Datemode"
				value={datemodeFilter}
				options={[
					{ label: "All", value: "All" },
					...TermManagementDatemodeOptions.map((datemode) => ({
						label: datemode,
						value: datemode,
					})),
				]}
				onChange={onDatemodeFilterChange}
			/>
			<ModuleTableFilterSelect
				label="Status"
				value={statusFilter}
				options={[
					{ label: "All", value: "" },
					...TermManagementStatusOptions.map((status) => ({
						label: status,
						value: status,
					})),
				]}
				onChange={(value) =>
					onStatusFilterChange(value as "" | TermManagementStatus)
				}
			/>
			<ModuleTableColumnVisibilityButton table={table} />
			{permissions.canExport ? (
				<ModuleTableExportButton
					allRows={exportAllRows}
					columns={TermManagementExportColumns}
					fileName="term-management"
					filteredRows={exportFilteredRows}
					isFiltered={hasActiveFilters}
					table={table}
					title="Term Management"
				/>
			) : (
				<span aria-hidden="true" />
			)}
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

const TermManagementExportColumns: ModuleTableExportColumn<TermManagement>[] = [
	...TermManagementTableColumns.flatMap((column) =>
		"key" in column
			? [
				{
					header: column.label,
					id: column.key,
					value: column.key,
				},
			]
			: [],
	),
];
