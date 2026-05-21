import {
	CheckCircle2,
	CircleOff,
	Edit3,
	Eye,
	Search,
	Users,
} from "lucide-react";
import {
	WorkspaceCompanyBranchesTablePaginationStorageKey,
	getWorkspaceCompanyBranchUsersHref,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { getNextWorkspaceCompanyStatus } from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import { useWorkspaceCompanyBranchesTable } from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyManagement";
import type {
	WorkspaceBranchUserRecord,
	WorkspaceCompanyBranchKind,
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyBranchTableRecord,
	WorkspaceCompanyStatus,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	WorkspaceStatusBadge,
	WorkspaceTextBadge,
} from "./WorkspaceCompanyBadges";
import {
	WorkspaceCompaniesFilterBar,
	WorkspaceCompaniesFilterSelect,
	WorkspaceCompaniesIconLink,
	WorkspaceCompaniesResetButton,
	WorkspaceCompaniesSearchInput,
	WorkspaceCompaniesTableCell,
} from "./WorkspaceCompanyListPrimitives";

export function CompanyBranchesTable({
	baseHref,
	branchUsers,
	branches,
	companyId,
	isLoading,
	onStatusChange,
}: {
	baseHref: string;
	branchUsers: WorkspaceBranchUserRecord[];
	branches: WorkspaceCompanyBranchRecord[];
	companyId: string;
	isLoading: boolean;
	onStatusChange: (branch: WorkspaceCompanyBranchRecord) => void;
}) {
	const branchList = useWorkspaceCompanyBranchesTable({ branches, branchUsers });

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
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
			<ModuleTable
				emptyDescription="Try adjusting search, type, or status filters."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No branches found"
				isLoading={isLoading}
				minWidthClassName="min-w-[63rem]"
				paginationStorageKey={WorkspaceCompanyBranchesTablePaginationStorageKey}
				table={branchList.table}
				renderRow={({ id, original }) => (
					<CompanyBranchesTableRow
						key={id}
						baseHref={baseHref}
						branch={original}
						companyId={companyId}
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
		<WorkspaceCompaniesFilterBar className="md:grid-cols-[1fr_12rem_10rem_auto]">
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
	companyId,
	onStatusChange,
}: {
	baseHref: string;
	branch: WorkspaceCompanyBranchTableRecord;
	companyId: string;
	onStatusChange: (branch: WorkspaceCompanyBranchRecord) => void;
}) {
	return (
		<tr className="module-table-row">
			<WorkspaceCompaniesTableCell>
				<WorkspaceTextBadge>{branch.code}</WorkspaceTextBadge>
			</WorkspaceCompaniesTableCell>
			<td className="px-3 py-2.5">
				<div className="min-w-0">
					<p className="truncate text-xs font-semibold text-darknavy">
						{branch.name}
					</p>
					<p className="mt-1 truncate text-xs text-darknavy/50">
						{branch.email}
					</p>
				</div>
			</td>
			<WorkspaceCompaniesTableCell>{branch.branchType}</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell>
				<WorkspaceTextBadge>{branch.totalUsers}</WorkspaceTextBadge>
			</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell>
				<WorkspaceStatusBadge status={branch.status} />
			</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell align="center">
				<BranchRecordActions
					baseHref={baseHref}
					branch={branch}
					companyId={companyId}
					onStatusChange={() => onStatusChange(branch)}
				/>
			</WorkspaceCompaniesTableCell>
		</tr>
	);
}

function BranchRecordActions({
	baseHref,
	branch,
	companyId,
	onStatusChange,
}: {
	baseHref: string;
	branch: WorkspaceCompanyBranchTableRecord;
	companyId: string;
	onStatusChange: () => void;
}) {
	const nextStatus = getNextWorkspaceCompanyStatus(branch.status);
	const StatusIcon = nextStatus === "Inactive" ? CircleOff : CheckCircle2;

	return (
		<div className="flex items-center justify-center gap-1">
			<IconLink href={`${baseHref}/view/${branch.id}`} label={`View ${branch.name}`}>
				<Eye className="h-4 w-4" aria-hidden="true" />
			</IconLink>
			<IconLink href={`${baseHref}/edit/${branch.id}`} label={`Edit ${branch.name}`}>
				<Edit3 className="h-4 w-4" aria-hidden="true" />
			</IconLink>
			<IconLink
				href={getWorkspaceCompanyBranchUsersHref(companyId, branch.id)}
				label={`Open users for ${branch.name}`}
			>
				<Users className="h-4 w-4" aria-hidden="true" />
			</IconLink>
			<button
				type="button"
				onClick={onStatusChange}
				aria-label={`Set ${branch.name} as ${nextStatus.toLowerCase()}`}
				className={
					nextStatus === "Inactive"
						? "flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10"
						: "flex h-9 w-9 items-center justify-center rounded-md text-emerald-700 transition hover:bg-emerald-50"
				}
			>
				<StatusIcon className="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	);
}

function IconLink({
	children,
	href,
	label,
}: {
	children: React.ReactNode;
	href: string;
	label: string;
}) {
	return (
		<WorkspaceCompaniesIconLink href={href} label={label}>
			{children}
		</WorkspaceCompaniesIconLink>
	);
}
