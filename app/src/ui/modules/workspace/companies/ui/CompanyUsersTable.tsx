import { Search } from "lucide-react";
import {
	WorkspaceCompanyUsersTablePaginationStorageKey,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { useWorkspaceCompanyUsersTable } from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyManagement";
import type {
	WorkspaceCompanyStatus,
	WorkspaceCompanyUserRecord,
	WorkspaceCompanyUserTableRecord,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/ModuleTableActions";
import {
	WorkspaceStatusBadge,
	WorkspaceUserAvatar,
} from "@/app/src/ui/modules/workspace/companies/ui/WorkspaceCompanyBadges";
import {
	WorkspaceCompaniesFilterBar,
	WorkspaceCompaniesFilterSelect,
	WorkspaceCompaniesResetButton,
	WorkspaceCompaniesSearchInput,
	WorkspaceCompaniesTableCell,
} from "@/app/src/ui/modules/workspace/companies/ui/WorkspaceCompanyListPrimitives";

export function CompanyUsersTable({
	baseHref,
	isLoading,
	users,
}: {
	baseHref: string;
	isLoading: boolean;
	users: WorkspaceCompanyUserRecord[];
}) {
	const userList = useWorkspaceCompanyUsersTable(users);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<CompanyUsersTableFilters
				query={userList.query}
				statusFilter={userList.statusFilter}
				statusOptions={userList.statusOptions}
				onQueryChange={userList.setQuery}
				onResetFilters={userList.resetFilters}
				onStatusFilterChange={userList.setStatusFilter}
			/>
			<ModuleTable
				variant="embedded"
				emptyDescription="Try adjusting your search or status filter."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No company users found"
				isLoading={isLoading}
				minWidthClassName="min-w-[66rem]"
				paginationStorageKey={WorkspaceCompanyUsersTablePaginationStorageKey}
				table={userList.table}
				renderRow={({ id, original }) => (
					<CompanyUsersTableRow
						key={id}
						baseHref={baseHref}
						user={original}
					/>
				)}
			/>
		</div>
	);
}

function CompanyUsersTableFilters({
	query,
	statusFilter,
	statusOptions,
	onQueryChange,
	onResetFilters,
	onStatusFilterChange,
}: {
	query: string;
	statusFilter: WorkspaceCompanyStatus | "All";
	statusOptions: readonly WorkspaceCompanyStatus[];
	onQueryChange: (value: string) => void;
	onResetFilters: () => void;
	onStatusFilterChange: (value: WorkspaceCompanyStatus | "All") => void;
}) {
	return (
		<WorkspaceCompaniesFilterBar className="md:grid-cols-[1fr_10rem_auto]">
			<WorkspaceCompaniesSearchInput
				value={query}
				onChange={onQueryChange}
				placeholder="Search users"
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

function CompanyUsersTableRow({
	baseHref,
	user,
}: {
	baseHref: string;
	user: WorkspaceCompanyUserTableRecord;
}) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<div className="flex min-w-0 items-center gap-3">
					<WorkspaceUserAvatar imageUrl={user.profileImageUrl} name={user.name} />
					<span className="truncate text-sm font-semibold text-darknavy">
						{user.name}
					</span>
				</div>
			</td>
			<WorkspaceCompaniesTableCell>{user.email}</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell>
				<WorkspaceStatusBadge status={user.status} />
			</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell>{user.lastLogin ?? "-"}</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell align="center">
				<UserRecordActions
					baseHref={baseHref}
					user={user}
				/>
			</WorkspaceCompaniesTableCell>
		</tr>
	);
}

function UserRecordActions({
	baseHref,
	user,
}: {
	baseHref: string;
	user: WorkspaceCompanyUserTableRecord;
}) {
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
		</ModuleTableActions>
	);
}
