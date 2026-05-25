import { Search } from "lucide-react";
import {
	WorkspaceBranchUsersTablePaginationStorageKey,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { getNextWorkspaceCompanyStatus } from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import { useWorkspaceBranchUsersTable } from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyManagement";
import type {
	WorkspaceBranchUserRecord,
	WorkspaceBranchUserRole,
	WorkspaceBranchUserTableRecord,
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
	WorkspaceUserAvatar,
} from "@/app/src/ui/modules/workspace/companies/ui/WorkspaceCompanyBadges";
import {
	WorkspaceCompaniesFilterBar,
	WorkspaceCompaniesFilterSelect,
	WorkspaceCompaniesResetButton,
	WorkspaceCompaniesSearchInput,
	WorkspaceCompaniesTableCell,
} from "@/app/src/ui/modules/workspace/companies/ui/WorkspaceCompanyListPrimitives";

export function BranchUsersTable({
	baseHref,
	isLoading,
	users,
	onStatusChange,
}: {
	baseHref: string;
	isLoading: boolean;
	users: WorkspaceBranchUserRecord[];
	onStatusChange: (user: WorkspaceBranchUserRecord) => void;
}) {
	const userList = useWorkspaceBranchUsersTable(users);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<BranchUsersTableFilters
				query={userList.query}
				roleFilter={userList.roleFilter}
				roleOptions={userList.roleOptions}
				statusFilter={userList.statusFilter}
				statusOptions={userList.statusOptions}
				onQueryChange={userList.setQuery}
				onResetFilters={userList.resetFilters}
				onRoleFilterChange={userList.setRoleFilter}
				onStatusFilterChange={userList.setStatusFilter}
			/>
			<ModuleTable
				variant="embedded"
				emptyDescription="Try adjusting your search, branch role, or status filters."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No branch users found"
				isLoading={isLoading}
				minWidthClassName="min-w-[66rem]"
				paginationStorageKey={WorkspaceBranchUsersTablePaginationStorageKey}
				table={userList.table}
				renderRow={({ id, original }) => (
					<BranchUsersTableRow
						key={id}
						baseHref={baseHref}
						user={original}
						onStatusChange={onStatusChange}
					/>
				)}
			/>
		</div>
	);
}

function BranchUsersTableFilters({
	query,
	roleFilter,
	roleOptions,
	statusFilter,
	statusOptions,
	onQueryChange,
	onResetFilters,
	onRoleFilterChange,
	onStatusFilterChange,
}: {
	query: string;
	roleFilter: WorkspaceBranchUserRole | "All";
	roleOptions: readonly WorkspaceBranchUserRole[];
	statusFilter: WorkspaceCompanyStatus | "All";
	statusOptions: readonly WorkspaceCompanyStatus[];
	onQueryChange: (value: string) => void;
	onResetFilters: () => void;
	onRoleFilterChange: (value: WorkspaceBranchUserRole | "All") => void;
	onStatusFilterChange: (value: WorkspaceCompanyStatus | "All") => void;
}) {
	return (
		<WorkspaceCompaniesFilterBar className="md:grid-cols-[1fr_13rem_10rem_auto]">
			<WorkspaceCompaniesSearchInput
				value={query}
				onChange={onQueryChange}
				placeholder="Search branch users"
			/>
			<WorkspaceCompaniesFilterSelect
				label="Branch Role"
				options={roleOptions}
				value={roleFilter}
				onChange={(value) =>
					onRoleFilterChange(value as WorkspaceBranchUserRole | "All")
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

function BranchUsersTableRow({
	baseHref,
	user,
	onStatusChange,
}: {
	baseHref: string;
	user: WorkspaceBranchUserTableRecord;
	onStatusChange: (user: WorkspaceBranchUserRecord) => void;
}) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<div className="flex min-w-0 items-center gap-3">
					<WorkspaceUserAvatar name={user.name} />
					<span className="truncate text-sm font-semibold text-darknavy">
						{user.name}
					</span>
				</div>
			</td>
			<WorkspaceCompaniesTableCell>{user.email}</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell>
				<WorkspaceTextBadge>{user.role}</WorkspaceTextBadge>
			</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell>
				<WorkspaceStatusBadge status={user.status} />
			</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell>{user.assignedAt}</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell align="center">
				<BranchUserRecordActions
					baseHref={baseHref}
					user={user}
					onStatusChange={() => onStatusChange(user)}
				/>
			</WorkspaceCompaniesTableCell>
		</tr>
	);
}

function BranchUserRecordActions({
	baseHref,
	user,
	onStatusChange,
}: {
	baseHref: string;
	user: WorkspaceBranchUserTableRecord;
	onStatusChange: () => void;
}) {
	const nextStatus = getNextWorkspaceCompanyStatus(user.status);

	return (
		<ModuleTableActions className="justify-center">
			<ModuleTableActionLink
				variant="view"
				href={`${baseHref}/view/${user.id}`}
				label={`View ${user.name}`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={`${baseHref}/edit/${user.id}`}
				label={`Edit ${user.name}`}
			/>
			<ModuleTableActionButton
				variant={nextStatus === "Inactive" ? "inactive" : "active"}
				onClick={onStatusChange}
				label={`Set ${user.name} as ${nextStatus.toLowerCase()}`}
			/>
		</ModuleTableActions>
	);
}
