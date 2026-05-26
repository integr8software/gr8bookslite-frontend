import { Search } from "lucide-react";
import {
	WorkspaceCompanyBranchesTablePaginationStorageKey,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { getNextWorkspaceCompanyStatus } from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import { useWorkspaceCompanyBranchesTable } from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyManagement";
import type {
	WorkspaceCompanyBranchKind,
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyBranchTableRecord,
	WorkspaceCompanyStatus,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/ModuleTableActions";
import {
	WorkspaceStatusBadge,
	WorkspaceTextBadge,
} from "@/app/src/ui/modules/workspace/companies/ui/WorkspaceCompanyBadges";
import {
	WorkspaceCompaniesFilterBar,
	WorkspaceCompaniesFilterSelect,
	WorkspaceCompaniesResetButton,
	WorkspaceCompaniesSearchInput,
	WorkspaceCompaniesTableCell,
} from "@/app/src/ui/modules/workspace/companies/ui/WorkspaceCompanyListPrimitives";

export function CompanyBranchesTable({
	baseHref,
	branches,
	isLoading,
	onStatusChange,
}: {
	baseHref: string;
	branches: WorkspaceCompanyBranchRecord[];
	isLoading: boolean;
	onStatusChange: (branch: WorkspaceCompanyBranchRecord) => void;
}) {
	const branchList = useWorkspaceCompanyBranchesTable({ branches });

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Try adjusting search, type, or status filters."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No branches found"
				isLoading={isLoading}
				minWidthClassName="min-w-[63rem]"
				paginationStorageKey={WorkspaceCompanyBranchesTablePaginationStorageKey}
				table={branchList.table}
				toolbar={
					<CompanyBranchesTableFilters
						kindFilter={branchList.kindFilter}
						kindOptions={branchList.kindOptions}
						query={branchList.query}
						statusFilter={branchList.statusFilter}
						statusOptions={branchList.statusOptions}
						onKindFilterChange={branchList.setKindFilter}
						onQueryChange={branchList.setQuery}
						onResetFilters={branchList.resetFilters}
						onStatusFilterChange={branchList.setStatusFilter}
					/>
				}
				renderRow={({ id, original }) => (
					<CompanyBranchesTableRow
						key={id}
						baseHref={baseHref}
						branch={original}
						onStatusChange={onStatusChange}
					/>
				)}
			/>
		</div>
	);
}

function CompanyBranchesTableFilters({
	kindFilter,
	kindOptions,
	query,
	statusFilter,
	statusOptions,
	onKindFilterChange,
	onQueryChange,
	onResetFilters,
	onStatusFilterChange,
}: {
	kindFilter: WorkspaceCompanyBranchKind | "All";
	kindOptions: readonly WorkspaceCompanyBranchKind[];
	query: string;
	statusFilter: WorkspaceCompanyStatus | "All";
	statusOptions: readonly WorkspaceCompanyStatus[];
	onKindFilterChange: (value: WorkspaceCompanyBranchKind | "All") => void;
	onQueryChange: (value: string) => void;
	onResetFilters: () => void;
	onStatusFilterChange: (value: WorkspaceCompanyStatus | "All") => void;
}) {
	return (
		<WorkspaceCompaniesFilterBar className="md:grid-cols-[minmax(24rem,2.5fr)_minmax(12rem,1fr)_minmax(10rem,1fr)_minmax(11rem,1fr)]">
			<WorkspaceCompaniesSearchInput
				value={query}
				onChange={onQueryChange}
				placeholder="Search branches"
			/>
			<WorkspaceCompaniesFilterSelect
				label="Type"
				options={kindOptions}
				value={kindFilter}
				onChange={(value) =>
					onKindFilterChange(value as WorkspaceCompanyBranchKind | "All")
				}
			/>
			<WorkspaceCompaniesFilterSelect
				label="Status"
				options={statusOptions}
				value={statusFilter}
				onChange={(value) =>
					onStatusFilterChange(value as WorkspaceCompanyStatus | "All")
				}
			/>
			<WorkspaceCompaniesResetButton onClick={onResetFilters} />
		</WorkspaceCompaniesFilterBar>
	);
}

function CompanyBranchesTableRow({
	baseHref,
	branch,
	onStatusChange,
}: {
	baseHref: string;
	branch: WorkspaceCompanyBranchTableRecord;
	onStatusChange: (branch: WorkspaceCompanyBranchRecord) => void;
}) {
	return (
		<tr className="module-table-row">
			<WorkspaceCompaniesTableCell>
				<WorkspaceTextBadge>{branch.code}</WorkspaceTextBadge>
			</WorkspaceCompaniesTableCell>
			<td className="px-4 py-4">
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold text-darknavy">
						{branch.name}
						{branch.isMain ? " (Head Office)" : ""}
					</p>
					<p className="mt-1 truncate text-sm text-darknavy/50">
						{branch.email}
					</p>
				</div>
			</td>
			<WorkspaceCompaniesTableCell>
				{branch.isMain ? "Head Office" : branch.branchType}
			</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell>
				<WorkspaceStatusBadge status={branch.status} />
			</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell align="center">
				<BranchRecordActions
					baseHref={baseHref}
					branch={branch}
					onStatusChange={() => onStatusChange(branch)}
				/>
			</WorkspaceCompaniesTableCell>
		</tr>
	);
}

function BranchRecordActions({
	baseHref,
	branch,
	onStatusChange,
}: {
	baseHref: string;
	branch: WorkspaceCompanyBranchTableRecord;
	onStatusChange: () => void;
}) {
	const nextStatus = getNextWorkspaceCompanyStatus(branch.status);

	return (
		<ModuleTableActions className="justify-center">
			<ModuleTableActionLink
				variant="view"
				href={`${baseHref}/view/${branch.id}`}
				label={`View ${branch.name}`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={`${baseHref}/edit/${branch.id}`}
				label={`Edit ${branch.name}`}
			/>
			<ModuleTableActionButton
				variant={nextStatus === "Inactive" ? "inactive" : "active"}
				onClick={onStatusChange}
				label={`Set ${branch.name} as ${nextStatus.toLowerCase()}`}
			/>
		</ModuleTableActions>
	);
}
