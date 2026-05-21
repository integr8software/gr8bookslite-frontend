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
				minWidthClassName="min-w-[72rem]"
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
		<div className="grid gap-3 border-b border-darknavy/10 bg-white p-4 md:grid-cols-[1fr_14rem_12rem_auto]">
			<label className="flex min-h-11 items-center gap-2 rounded-lg border border-darknavy/10 px-3 text-sm text-darknavy shadow-sm">
				<Search className="h-4 w-4 text-darknavy/35" aria-hidden="true" />
				<input
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-darknavy/35"
					placeholder="Search users"
				/>
			</label>
			<FilterSelect
				label="Role"
				options={roleOptions}
				value={roleFilter}
				onChange={(value) =>
					onRoleFilterChange(value as WorkspaceCompanyUserRole | "All")
				}
			/>
			<FilterSelect
				label="Status"
				options={statusOptions}
				value={statusFilter}
				onChange={(value) =>
					onStatusFilterChange(value as WorkspaceCompanyStatus | "All")
				}
			/>
			<button
				type="button"
				onClick={onResetFilters}
				className="inline-flex h-11 items-center justify-center rounded-lg border border-darknavy/10 px-4 text-sm font-semibold text-darknavy transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
			>
				Reset
			</button>
		</div>
	);
}

function FilterSelect({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: readonly string[];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className="grid gap-1">
			<span className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
				{label}
			</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="h-11 rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
			>
				<option value="All">All</option>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</label>
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
			<td className="px-4 py-3">
				<div className="flex min-w-0 items-center gap-3">
					<WorkspaceUserAvatar imageUrl={user.profileImageUrl} name={user.name} />
					<span className="truncate text-xs font-semibold text-darknavy">
						{user.name}
					</span>
				</div>
			</td>
			<TableCell>{user.email}</TableCell>
			<TableCell>
				<WorkspaceTextBadge>{user.role}</WorkspaceTextBadge>
			</TableCell>
			<TableCell>
				<WorkspaceStatusBadge status={user.status} />
			</TableCell>
			<TableCell>{user.lastLogin ?? "-"}</TableCell>
			<TableCell align="center">
				<UserRecordActions
					baseHref={baseHref}
					user={user}
					onStatusChange={() => onStatusChange(user)}
				/>
			</TableCell>
		</tr>
	);
}

function TableCell({
	align = "left",
	children,
}: {
	align?: "center" | "left";
	children: React.ReactNode;
}) {
	return (
		<td
			className={`px-4 py-3 align-middle text-xs text-darknavy first:pl-5 last:pr-5 ${
				align === "center" ? "text-center" : "text-left"
			}`}
		>
			{children}
		</td>
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
		<Link
			href={href}
			aria-label={label}
			className="flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5"
		>
			{children}
		</Link>
	);
}
