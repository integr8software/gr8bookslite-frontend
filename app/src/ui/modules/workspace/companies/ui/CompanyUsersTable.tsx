import Link from "next/link";
import {
	CheckCircle2,
	CircleOff,
	Edit3,
	Eye,
	Search,
} from "lucide-react";
import {
	WorkspaceCompanyUsersTablePaginationStorageKey,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { getNextWorkspaceCompanyStatus } from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import { useWorkspaceCompanyUsersTable } from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyManagement";
import type {
	WorkspaceCompanyStatus,
	WorkspaceCompanyUserRecord,
	WorkspaceCompanyUserRole,
	WorkspaceCompanyUserTableRecord,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	WorkspaceStatusBadge,
	WorkspaceTextBadge,
	WorkspaceUserAvatar,
} from "./WorkspaceCompanyBadges";
import {
	WorkspaceCompaniesFilterBar,
	WorkspaceCompaniesFilterSelect,
	WorkspaceCompaniesIconLink,
	WorkspaceCompaniesResetButton,
	WorkspaceCompaniesSearchInput,
	WorkspaceCompaniesTableCell,
} from "./WorkspaceCompanyListPrimitives";

export function CompanyUsersTable({
	baseHref,
	isLoading,
	users,
	onStatusChange,
}: {
	baseHref: string;
	isLoading: boolean;
	users: WorkspaceCompanyUserRecord[];
	onStatusChange: (user: WorkspaceCompanyUserRecord) => void;
}) {
	const userList = useWorkspaceCompanyUsersTable(users);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<CompanyUsersTableFilters
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
				emptyDescription="Try adjusting your search, role, or status filters."
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
						onStatusChange={onStatusChange}
					/>
				)}
			/>
		</div>
	);
}

function CompanyUsersTableFilters({
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
	roleFilter: WorkspaceCompanyUserRole | "All";
	roleOptions: readonly WorkspaceCompanyUserRole[];
	statusFilter: WorkspaceCompanyStatus | "All";
	statusOptions: readonly WorkspaceCompanyStatus[];
	onQueryChange: (value: string) => void;
	onResetFilters: () => void;
	onRoleFilterChange: (value: WorkspaceCompanyUserRole | "All") => void;
	onStatusFilterChange: (value: WorkspaceCompanyStatus | "All") => void;
}) {
	return (
		<WorkspaceCompaniesFilterBar className="md:grid-cols-[1fr_12rem_10rem_auto]">
			<WorkspaceCompaniesSearchInput
				value={query}
				onChange={onQueryChange}
				placeholder="Search users"
			/>
			<WorkspaceCompaniesFilterSelect
				label="Role"
				options={roleOptions}
				value={roleFilter}
				onChange={(value) =>
					onRoleFilterChange(value as WorkspaceCompanyUserRole | "All")
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

function CompanyUsersTableRow({
	baseHref,
	user,
	onStatusChange,
}: {
	baseHref: string;
	user: WorkspaceCompanyUserTableRecord;
	onStatusChange: (user: WorkspaceCompanyUserRecord) => void;
}) {
	return (
		<tr className="module-table-row">
			<td className="px-3 py-2.5">
				<div className="flex min-w-0 items-center gap-3">
					<WorkspaceUserAvatar imageUrl={user.profileImageUrl} name={user.name} />
					<span className="truncate text-xs font-semibold text-darknavy">
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
			<WorkspaceCompaniesTableCell>{user.lastLogin ?? "-"}</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell align="center">
				<UserRecordActions
					baseHref={baseHref}
					user={user}
					onStatusChange={() => onStatusChange(user)}
				/>
			</WorkspaceCompaniesTableCell>
		</tr>
	);
}

function UserRecordActions({
	baseHref,
	user,
	onStatusChange,
}: {
	baseHref: string;
	user: WorkspaceCompanyUserTableRecord;
	onStatusChange: () => void;
}) {
	const nextStatus = getNextWorkspaceCompanyStatus(user.status);
	const StatusIcon = nextStatus === "Inactive" ? CircleOff : CheckCircle2;

	return (
		<div className="flex items-center justify-center gap-1">
			<IconLink href={`${baseHref}/view/${user.id}`} label={`View ${user.name}`}>
				<Eye className="h-4 w-4" aria-hidden="true" />
			</IconLink>
			<IconLink href={`${baseHref}/edit/${user.id}`} label={`Edit ${user.name}`}>
				<Edit3 className="h-4 w-4" aria-hidden="true" />
			</IconLink>
			<button
				type="button"
				onClick={onStatusChange}
				aria-label={`Set ${user.name} as ${nextStatus.toLowerCase()}`}
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
