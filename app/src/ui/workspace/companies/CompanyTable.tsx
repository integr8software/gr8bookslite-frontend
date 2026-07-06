import Link from "next/link";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import {
	WorkspaceCompaniesTablePaginationStorageKey,
	WorkspaceCompanyTableColumns,
	getWorkspaceCompanyEditHref,
	getWorkspaceCompanyHref,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { useWorkspaceCompaniesTable } from "@/app/src/hooks/workspace/companies/useWorkspaceCompaniesTable";
import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyPlan,
	WorkspaceCompanyRecord,
	WorkspaceCompanyStatus,
	WorkspaceCompanyTableRecord,
	WorkspaceCompanyType,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	ModuleTableColumnVisibilityButton,
	ModuleTableExportButton,
	type ModuleTableExportColumn,
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import {
	WorkspaceManagementCompanyAvatar,
	WorkspaceManagementPlanBadge,
	WorkspaceManagementStatusBadge,
	WorkspaceManagementSummaryBadge,
} from "@/app/src/ui/workspace/WorkspaceManagementBadges";

export function CompanyTable({
	branches,
	companies,
	isLoading,
	lastSyncedAt,
	onDeactivate,
	planOptions,
}: {
	branches: WorkspaceCompanyBranchRecord[];
	companies: WorkspaceCompanyRecord[];
	isLoading: boolean;
	lastSyncedAt?: number | string | Date | null;
	onDeactivate: (company: WorkspaceCompanyRecord) => void;
	planOptions?: readonly WorkspaceCompanyPlan[];
}) {
	const companyList = useWorkspaceCompaniesTable({
		branches,
		companies,
		planOptions,
	});
	const tableMinWidthClassName = getTableMinWidthClassName(
		companyList.table.getVisibleLeafColumns().length,
	);

	return (
		<div
			data-spotlight-id="workspace-company-table"
			className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm"
		>
			<ModuleTable
				variant="embedded"
				emptyDescription="Try adjusting search, status, type, or plan filters."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No companies found"
				isLoading={isLoading}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName={`${tableMinWidthClassName} table-fixed`}
				paginationStorageKey={
					WorkspaceCompaniesTablePaginationStorageKey
				}
				table={companyList.table}
				tableTitle="Companies"
				toolbar={
					<CompanyTableFilters
						allRows={companyList.records}
						filteredRows={companyList.filteredRecords}
						hasActiveFilters={companyList.hasActiveFilters}
						planFilter={companyList.planFilter}
						planOptions={companyList.planOptions}
						query={companyList.query}
						statusFilter={companyList.statusFilter}
						statusOptions={companyList.statusOptions}
						table={companyList.table}
						typeFilter={companyList.typeFilter}
						typeOptions={companyList.typeOptions}
						onPlanFilterChange={companyList.setPlanFilter}
						onQueryChange={companyList.setQuery}
						onResetFilters={companyList.resetFilters}
						onStatusFilterChange={companyList.setStatusFilter}
						onTypeFilterChange={companyList.setTypeFilter}
					/>
				}
				renderRow={({ id, original }) => (
					<CompanyTableRow
						key={id}
						company={original}
						onDeactivate={onDeactivate}
					/>
				)}
			/>
		</div>
	);
}

function CompanyTableFilters({
	allRows,
	filteredRows,
	hasActiveFilters,
	planFilter,
	planOptions,
	query,
	statusFilter,
	statusOptions,
	table,
	typeFilter,
	typeOptions,
	onPlanFilterChange,
	onQueryChange,
	onResetFilters,
	onStatusFilterChange,
	onTypeFilterChange,
}: {
	allRows: WorkspaceCompanyTableRecord[];
	filteredRows: WorkspaceCompanyTableRecord[];
	hasActiveFilters: boolean;
	planFilter: WorkspaceCompanyPlan | "All";
	planOptions: readonly WorkspaceCompanyPlan[];
	query: string;
	statusFilter: WorkspaceCompanyStatus | "All";
	statusOptions: readonly WorkspaceCompanyStatus[];
	table: ReturnType<typeof useWorkspaceCompaniesTable>["table"];
	typeFilter: WorkspaceCompanyType | "All";
	typeOptions: readonly WorkspaceCompanyType[];
	onPlanFilterChange: (value: WorkspaceCompanyPlan | "All") => void;
	onQueryChange: (value: string) => void;
	onResetFilters: () => void;
	onStatusFilterChange: (value: WorkspaceCompanyStatus | "All") => void;
	onTypeFilterChange: (value: WorkspaceCompanyType | "All") => void;
}) {
	return (
		<ModuleTableToolbar
			data-spotlight-id="workspace-company-filters"
			className="!grid-cols-1 !gap-2 rounded-none border-x-0 border-t-0 !p-3 shadow-none sm:!gap-2 sm:!p-3 md:!grid-cols-[minmax(0,1fr)_auto]"
		>
			<div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1.4fr)_minmax(9rem,0.8fr)_minmax(10rem,0.9fr)_minmax(9rem,0.8fr)]">
				<ModuleTableSearch
					label="Search companies"
					value={query}
					onChange={onQueryChange}
					placeholder="Search companies"
				/>
				<ModuleTableFilterSelect
					label="Type"
					value={typeFilter}
					options={getFilterOptions(typeOptions)}
					onChange={(value) =>
						onTypeFilterChange(value as WorkspaceCompanyType | "All")
					}
				/>
				<ModuleTableFilterSelect
					label="Plan"
					value={planFilter}
					options={getFilterOptions(planOptions)}
					onChange={(value) =>
						onPlanFilterChange(value as WorkspaceCompanyPlan | "All")
					}
				/>
				<ModuleTableFilterSelect
					label="Status"
					value={statusFilter}
					options={getFilterOptions(statusOptions)}
					onChange={(value) =>
						onStatusFilterChange(
							value as WorkspaceCompanyStatus | "All",
						)
					}
				/>
			</div>
			<div className="grid grid-cols-3 gap-2 md:w-[10.75rem]">
				<ModuleTableColumnVisibilityButton table={table} />
				<ModuleTableExportButton
					allRows={allRows}
					columns={WorkspaceCompanyExportColumns}
					fileName="workspace-companies"
					filteredRows={filteredRows}
					isFiltered={hasActiveFilters}
					table={table}
					title="Workspace Companies"
				/>
				<ModuleTableResetButton className="px-2" onClick={onResetFilters}>
					Reset
				</ModuleTableResetButton>
			</div>
		</ModuleTableToolbar>
	);
}

function CompanyTableRow({
	company,
	onDeactivate,
}: {
	company: WorkspaceCompanyTableRecord;
	onDeactivate: (company: WorkspaceCompanyRecord) => void;
}) {
	return (
		<tr className="module-table-row">
			<td className="px-5 py-4">
				<Link
					href={getWorkspaceCompanyHref(company.id)}
					className="flex min-w-0 items-center gap-3 rounded-lg transition hover:text-skyblue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
				>
					<WorkspaceManagementCompanyAvatar
						initials={company.initials}
						logoUrl={company.logoUrl}
						name={company.name}
					/>
					<span className="min-w-0">
						<span className="block truncate text-sm font-semibold text-darknavy">
							{company.name}
						</span>
						<span className="mt-1 block truncate text-sm text-darknavy/50">
							{company.email}
						</span>
					</span>
				</Link>
			</td>
			<CompanyTableCell>
				<WorkspaceManagementSummaryBadge>
					{company.totalBranches}
				</WorkspaceManagementSummaryBadge>
			</CompanyTableCell>
			<CompanyTableCell>
				<WorkspaceManagementSummaryBadge>
					{company.totalUsers}
				</WorkspaceManagementSummaryBadge>
			</CompanyTableCell>
			<CompanyTableCell>{company.companyType}</CompanyTableCell>
			<CompanyTableCell>
				<WorkspaceManagementPlanBadge plan={company.plan} />
			</CompanyTableCell>
			<CompanyTableCell align="center">
				<WorkspaceManagementStatusBadge status={company.status} />
			</CompanyTableCell>
			<CompanyTableCell align="center">
				<CompanyRecordActions
					company={company}
					onDeactivate={() => onDeactivate(company)}
				/>
			</CompanyTableCell>
		</tr>
	);
}

function CompanyTableCell({
	align = "left",
	children,
}: {
	align?: "center" | "left";
	children: ReactNode;
}) {
	return (
		<td
			className={`px-4 py-4 align-middle text-sm text-darknavy first:pl-5 last:pr-5 ${
				align === "center" ? "text-center" : "text-left"
			}`}
		>
			{children}
		</td>
	);
}

function getFilterOptions(options: readonly string[]) {
	return [
		{ label: "All", value: "All" },
		...options.map((option) => ({ label: option, value: option })),
	];
}

function getTableMinWidthClassName(visibleColumnCount: number) {
	if (visibleColumnCount >= 7) return "min-w-[72rem]";
	if (visibleColumnCount === 6) return "min-w-[62rem]";
	if (visibleColumnCount === 5) return "min-w-[52rem]";
	if (visibleColumnCount === 4) return "min-w-[42rem]";
	return "min-w-[34rem]";
}

const WorkspaceCompanyExportColumns: ModuleTableExportColumn<WorkspaceCompanyTableRecord>[] =
	WorkspaceCompanyTableColumns.flatMap((column) =>
		"key" in column
			? [
					{
						header: column.label,
						id: column.key,
						value: column.key,
					},
				]
			: [],
	);

function CompanyRecordActions({
	company,
	onDeactivate,
}: {
	company: WorkspaceCompanyTableRecord;
	onDeactivate: () => void;
}) {
	return (
		<ModuleTableActions className="justify-center">
			<ModuleTableActionLink
				variant="view"
				href={getWorkspaceCompanyHref(company.id)}
				label={`Open ${company.name}`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={getWorkspaceCompanyEditHref(company.id)}
				label={`Edit ${company.name}`}
			/>
			<ModuleTableActionButton
				variant="inactive"
				onClick={onDeactivate}
				label={`Deactivate ${company.name}`}
			/>
		</ModuleTableActions>
	);
}
