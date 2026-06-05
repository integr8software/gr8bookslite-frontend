import { useMemo, useState, type ReactNode } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
	type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, GitBranch, Search, Send } from "lucide-react";
import {
	WorkspaceUserStatusOptions,
	WorkspaceUsersManagementHref,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyRecord,
	WorkspaceCompanyUserRecord,
	WorkspaceUserStatus,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	WorkspaceManagementStatusBadge,
	WorkspaceManagementUserAvatar,
} from "@/app/src/ui/workspace/WorkspaceManagementBadges";

type WorkspaceUsersTableRecord = WorkspaceCompanyUserRecord & {
	accessItems: WorkspaceUsersAccessItem[];
	accessSummary: string;
	branchNames: string;
	companyNames: string;
	mainOfficeNames: string;
	satelliteNames: string;
	userType: "Regular";
};

type WorkspaceUsersAccessItem = {
	name: string;
	type: "Branch" | "Satellite";
};

type WorkspaceUsersTableColumnKey = keyof Pick<
	WorkspaceUsersTableRecord,
	| "name"
	| "email"
	| "companyNames"
	| "mainOfficeNames"
	| "accessSummary"
	| "status"
	| "lastLogin"
	| "createdAt"
>;

const WorkspaceUsersTablePaginationStorageKey = "workspace-users";
const AllFilterValue = "All";
const RegularUserType = "Regular";

const WorkspaceUsersTableColumns = [
	{ key: "name", label: "User", className: "w-[18rem]" },
	{ key: "email", label: "Email", className: "w-[20rem]" },
	{ key: "companyNames", label: "Company", className: "w-[18rem]" },
	{ key: "mainOfficeNames", label: "Main Office", className: "w-[16rem]" },
	{ key: "accessSummary", label: "Branches / Satellites", className: "w-[28rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "lastLogin", label: "Last Login", className: "w-[13rem]" },
	{ key: "createdAt", label: "Created", className: "w-[11rem]" },
	{ label: "Actions", className: "w-[13rem] text-center" },
] as const satisfies readonly (
	| {
			key: WorkspaceUsersTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];

export function WorkspaceUsersTable({
	companies,
	isLoading,
	isResendingInvitation,
	onCancelInvitation,
	onEdit,
	onResendInvitation,
	users,
}: {
	companies: WorkspaceCompanyRecord[];
	isLoading: boolean;
	isResendingInvitation: boolean;
	onCancelInvitation: (userId: string) => Promise<unknown>;
	onEdit: (user: WorkspaceCompanyUserRecord) => void;
	onResendInvitation: (userId: string) => Promise<unknown>;
	users: WorkspaceCompanyUserRecord[];
}) {
	const userList = useWorkspaceUsersTable(users, companies);
	const [pendingCancelUser, setPendingCancelUser] =
		useState<WorkspaceCompanyUserRecord | null>(null);

	return (
		<div
			data-spotlight-id="workspace-users-table"
			className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm"
		>
			<ModuleTable
				variant="embedded"
				emptyDescription="Try adjusting your search or filters."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No workspace users found"
				isLoading={isLoading}
				minWidthClassName="min-w-[118rem]"
				paginationStorageKey={WorkspaceUsersTablePaginationStorageKey}
				table={userList.table}
				toolbar={
					<WorkspaceUsersTableFilters
						branchFilter={userList.branchFilter}
						branchOptions={userList.branchOptions}
						companyFilter={userList.companyFilter}
						companyOptions={userList.companyOptions}
						query={userList.query}
						statusFilter={userList.statusFilter}
						statusOptions={userList.statusOptions}
						userTypeFilter={userList.userTypeFilter}
						onBranchFilterChange={userList.setBranchFilter}
						onCompanyFilterChange={userList.setCompanyFilter}
						onQueryChange={userList.setQuery}
						onResetFilters={userList.resetFilters}
						onStatusFilterChange={userList.setStatusFilter}
						onUserTypeFilterChange={userList.setUserTypeFilter}
					/>
				}
				renderRow={({ id, original }) => (
					<WorkspaceUsersTableRow
						key={id}
						isResendingInvitation={isResendingInvitation}
						onCancelInvitation={setPendingCancelUser}
						onEdit={onEdit}
						onResendInvitation={onResendInvitation}
						user={original}
					/>
				)}
			/>
			<AppDialog
				isOpen={Boolean(pendingCancelUser)}
				isPending={isResendingInvitation}
				title="Cancel invitation?"
				description={`This will remove the pending invitation for ${
					pendingCancelUser?.email ?? "this user"
				} and stop setup links from working. No billing charge will be applied.`}
				confirmationPhrase="cancel invite"
				confirmLabel="Cancel Invite"
				pendingLabel="Cancelling..."
				cancelLabel="Keep Invite"
				tone="danger"
				onCancel={() => setPendingCancelUser(null)}
				onConfirm={() => {
					if (!pendingCancelUser) {
						return;
					}

					void onCancelInvitation(pendingCancelUser.id).finally(() =>
						setPendingCancelUser(null),
					);
				}}
			/>
		</div>
	);
}

function useWorkspaceUsersTable(
	users: WorkspaceCompanyUserRecord[],
	companies: WorkspaceCompanyRecord[],
) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQueryState] = useState("");
	const [statusFilter, setStatusFilterState] = useState<
		WorkspaceUserStatus | typeof AllFilterValue
	>(AllFilterValue);
	const [companyFilter, setCompanyFilterState] = useState(AllFilterValue);
	const [branchFilter, setBranchFilterState] = useState(AllFilterValue);
	const [userTypeFilter, setUserTypeFilterState] = useState<
		"Regular" | typeof AllFilterValue
	>(AllFilterValue);
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const tableRecords = useMemo(
		() => createWorkspaceUsersTableRecords(users, companies),
		[companies, users],
	);
	const filteredUsers = useMemo(
		() =>
			tableRecords.filter((user) => {
				const searchable = [
					user.name,
					user.email,
					user.contactNumber,
					user.companyNames,
					user.mainOfficeNames,
					user.branchNames,
					user.satelliteNames,
					user.status,
					user.lastLogin,
					user.createdAt,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();
				const matchesCompany =
					companyFilter === AllFilterValue ||
					user.companyAssignments.some(
						(assignment) => assignment.companyId === companyFilter,
					);
				const matchesBranch =
					branchFilter === AllFilterValue ||
					user.companyAssignments.some((assignment) =>
						assignment.branchIds.includes(branchFilter),
					);

				return (
					searchable.includes(query.toLowerCase()) &&
					(statusFilter === AllFilterValue || user.status === statusFilter) &&
					matchesCompany &&
					matchesBranch &&
					(userTypeFilter === AllFilterValue || user.userType === userTypeFilter)
				);
			}),
		[branchFilter, companyFilter, query, statusFilter, tableRecords, userTypeFilter],
	);
	const columns = useMemo<ColumnDef<WorkspaceUsersTableRecord>[]>(
		() =>
			WorkspaceUsersTableColumns.map((column) => {
				if (!("key" in column)) {
					return createActionColumn(column.label, column.className);
				}

				return createColumn(column.key, column.label, column.className);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredUsers,
		columns,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	function resetFilters() {
		setQueryState("");
		setStatusFilterState(AllFilterValue);
		setCompanyFilterState(AllFilterValue);
		setBranchFilterState(AllFilterValue);
		setUserTypeFilterState(AllFilterValue);
		table.setPageIndex(0);
	}

	function setQuery(value: string) {
		setQueryState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: WorkspaceUserStatus | typeof AllFilterValue) {
		setStatusFilterState(value);
		table.setPageIndex(0);
	}

	function setCompanyFilter(value: string) {
		setCompanyFilterState(value);
		table.setPageIndex(0);
	}

	function setBranchFilter(value: string) {
		setBranchFilterState(value);
		table.setPageIndex(0);
	}

	function setUserTypeFilter(value: "Regular" | typeof AllFilterValue) {
		setUserTypeFilterState(value);
		table.setPageIndex(0);
	}

	return {
		branchFilter,
		branchOptions: getBranchFilterOptions(companies),
		companyFilter,
		companyOptions: getCompanyFilterOptions(companies),
		query,
		resetFilters,
		setBranchFilter,
		setCompanyFilter,
		setQuery,
		setStatusFilter,
		setUserTypeFilter,
		statusFilter,
		statusOptions: WorkspaceUserStatusOptions,
		table,
		userTypeFilter,
	};
}

function WorkspaceUsersTableFilters({
	branchFilter,
	branchOptions,
	companyFilter,
	companyOptions,
	query,
	statusFilter,
	statusOptions,
	userTypeFilter,
	onBranchFilterChange,
	onCompanyFilterChange,
	onQueryChange,
	onResetFilters,
	onStatusFilterChange,
	onUserTypeFilterChange,
}: {
	branchFilter: string;
	branchOptions: readonly { label: string; value: string }[];
	companyFilter: string;
	companyOptions: readonly { label: string; value: string }[];
	query: string;
	statusFilter: WorkspaceUserStatus | typeof AllFilterValue;
	statusOptions: readonly WorkspaceUserStatus[];
	userTypeFilter: "Regular" | typeof AllFilterValue;
	onBranchFilterChange: (value: string) => void;
	onCompanyFilterChange: (value: string) => void;
	onQueryChange: (value: string) => void;
	onResetFilters: () => void;
	onStatusFilterChange: (value: WorkspaceUserStatus | typeof AllFilterValue) => void;
	onUserTypeFilterChange: (value: "Regular" | typeof AllFilterValue) => void;
}) {
	return (
		<ModuleTableToolbar
			data-spotlight-id="workspace-users-filters"
			className="rounded-none border-x-0 border-t-0 shadow-none lg:grid-cols-[minmax(24rem,2.2fr)_repeat(5,minmax(10rem,1fr))]"
		>
			<ModuleTableSearch
				label="Search users"
				value={query}
				onChange={onQueryChange}
				placeholder="Search name, email, contact, company, or branch"
			/>
			<ModuleTableFilterSelect
				label="Status"
				options={getFilterOptions(statusOptions)}
				value={statusFilter}
				onChange={(value) =>
					onStatusFilterChange(value as WorkspaceUserStatus | typeof AllFilterValue)
				}
			/>
			<ModuleTableFilterSelect
				label="Company"
				options={companyOptions}
				value={companyFilter}
				onChange={onCompanyFilterChange}
			/>
			<ModuleTableFilterSelect
				label="Branch/Satellite"
				options={branchOptions}
				value={branchFilter}
				onChange={onBranchFilterChange}
			/>
			<ModuleTableFilterSelect
				label="User Type"
				options={[
					{ label: "All", value: AllFilterValue },
					{ label: RegularUserType, value: RegularUserType },
				]}
				value={userTypeFilter}
				onChange={(value) =>
					onUserTypeFilterChange(value as "Regular" | typeof AllFilterValue)
				}
			/>
			<ModuleTableResetButton onClick={onResetFilters}>Reset</ModuleTableResetButton>
		</ModuleTableToolbar>
	);
}

function WorkspaceUsersTableRow({
	isResendingInvitation,
	onCancelInvitation,
	onEdit,
	onResendInvitation,
	user,
}: {
	isResendingInvitation: boolean;
	onCancelInvitation: (user: WorkspaceCompanyUserRecord) => void;
	onEdit: (user: WorkspaceCompanyUserRecord) => void;
	onResendInvitation: (userId: string) => Promise<unknown>;
	user: WorkspaceUsersTableRecord;
}) {
	const [pendingResendUserId, setPendingResendUserId] = useState<string | null>(
		null,
	);
	const isPendingResend = pendingResendUserId === user.id;

	async function handleResendInvitation() {
		setPendingResendUserId(user.id);

		try {
			await onResendInvitation(user.id);
		} finally {
			setPendingResendUserId(null);
		}
	}

	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<div className="flex min-w-0 items-center gap-3">
					<WorkspaceManagementUserAvatar
						imageUrl={user.profileImageUrl}
						name={user.name}
					/>
					<span className="truncate text-sm font-semibold text-darknavy">
						{user.name}
					</span>
				</div>
			</td>
			<WorkspaceUsersTableCell>{user.email}</WorkspaceUsersTableCell>
			<WorkspaceUsersTableCell>
				<AssignmentSummary
					emptyLabel="-"
					showAllLabel="Show all companies"
					showLessLabel="Show fewer companies"
					value={user.companyNames}
				/>
			</WorkspaceUsersTableCell>
			<WorkspaceUsersTableCell>
				<AssignmentSummary
					emptyLabel="-"
					showAllLabel="Show all main offices"
					showLessLabel="Show fewer main offices"
					value={user.mainOfficeNames}
				/>
			</WorkspaceUsersTableCell>
			<WorkspaceUsersTableCell>
				<WorkspaceUsersAccessSummary items={user.accessItems} />
			</WorkspaceUsersTableCell>
			<WorkspaceUsersTableCell>
				<WorkspaceManagementStatusBadge status={user.status} />
			</WorkspaceUsersTableCell>
			<WorkspaceUsersTableCell>{user.lastLogin ?? "-"}</WorkspaceUsersTableCell>
			<WorkspaceUsersTableCell>{user.createdAt}</WorkspaceUsersTableCell>
			<WorkspaceUsersTableCell align="center">
				<UserRecordActions
					isPendingResend={isPendingResend}
					isResendingInvitation={isResendingInvitation}
					onCancelInvitation={() => onCancelInvitation(user)}
					onEdit={() => onEdit(user)}
					onResendInvitation={handleResendInvitation}
					user={user}
				/>
			</WorkspaceUsersTableCell>
		</tr>
	);
}

function WorkspaceUsersTableCell({
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

function AssignmentSummary({
	emptyLabel,
	showAllLabel,
	showLessLabel,
	value,
}: {
	emptyLabel: string;
	showAllLabel: string;
	showLessLabel: string;
	value: string;
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	if (!value) {
		return <span className="text-darknavy/40">{emptyLabel}</span>;
	}

	const items = value.split(", ");
	const visibleItems = isExpanded ? items : items.slice(0, 1);
	const hiddenCount = items.length - visibleItems.length;
	const label = isExpanded ? showLessLabel : showAllLabel;

	return (
		<div className="flex min-w-0 flex-col gap-2">
			<div className="flex min-w-0 flex-wrap items-center gap-2">
				{visibleItems.map((item) => (
					<span
						key={item}
						className="max-w-[11rem] truncate rounded-md bg-darknavy/5 px-2.5 py-1 text-xs font-semibold text-darknavy/75 ring-1 ring-darknavy/8"
						title={item}
					>
						{item}
					</span>
				))}
				{hiddenCount > 0 ? (
					<span className="rounded-md bg-skyblue/15 px-2 py-1 text-xs font-semibold text-darknavy/70 ring-1 ring-skyblue/20">
						+{hiddenCount}
					</span>
				) : null}
			</div>
			{items.length > 1 ? (
				<button
					type="button"
					aria-expanded={isExpanded}
					onClick={() => setIsExpanded((current) => !current)}
					className="inline-flex w-fit items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-semibold text-skyblue transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25"
				>
					{label}
					<ChevronDown
						className={`h-3.5 w-3.5 transition ${
							isExpanded ? "rotate-180" : ""
						}`}
						aria-hidden="true"
					/>
				</button>
			) : null}
		</div>
	);
}

function WorkspaceUsersAccessSummary({
	items,
}: {
	items: WorkspaceUsersAccessItem[];
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	if (!items.length) {
		return <span className="text-darknavy/40">-</span>;
	}

	const visibleItems = isExpanded ? items : items.slice(0, 2);
	const hiddenCount = items.length - visibleItems.length;
	const label = isExpanded ? "Show fewer assignments" : "Show all assignments";

	return (
		<div className="flex min-w-0 flex-col gap-2">
			<div className="flex min-w-0 flex-wrap items-center gap-2">
				{visibleItems.map((item) => (
					<AccessChip key={`${item.type}-${item.name}`} item={item} />
				))}
				{hiddenCount > 0 ? (
					<span className="rounded-md bg-skyblue/15 px-2 py-1 text-xs font-semibold text-darknavy/70 ring-1 ring-skyblue/20">
						+{hiddenCount}
					</span>
				) : null}
			</div>
			{items.length > 2 ? (
				<button
					type="button"
					aria-expanded={isExpanded}
					onClick={() => setIsExpanded((current) => !current)}
					className="inline-flex w-fit items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-semibold text-skyblue transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25"
				>
					<GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
					{label}
					<ChevronDown
						className={`h-3.5 w-3.5 transition ${
							isExpanded ? "rotate-180" : ""
						}`}
						aria-hidden="true"
					/>
				</button>
			) : null}
		</div>
	);
}

function AccessChip({ item }: { item: WorkspaceUsersAccessItem }) {
	const isSatellite = item.type === "Satellite";

	return (
		<span
			className={`max-w-[12rem] truncate rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${
				isSatellite
					? "bg-indigo-500/10 text-indigo-950/75 ring-indigo-400/20"
					: "bg-darknavy/5 text-darknavy/75 ring-darknavy/8"
			}`}
			title={`${item.type}: ${item.name}`}
		>
			{item.name}
			<span className="ml-1 text-[0.65rem] uppercase text-darknavy/45">
				{isSatellite ? "Sat" : "Br"}
			</span>
		</span>
	);
}

function getFilterOptions(options: readonly string[]) {
	return [
		{ label: "All", value: AllFilterValue },
		...options.map((option) => ({ label: option, value: option })),
	];
}

function getCompanyFilterOptions(companies: WorkspaceCompanyRecord[]) {
	return [
		{ label: "All", value: AllFilterValue },
		...companies.map((company) => ({ label: company.name, value: company.id })),
	];
}

function getBranchFilterOptions(companies: WorkspaceCompanyRecord[]) {
	return [
		{ label: "All", value: AllFilterValue },
		...companies.flatMap((company) =>
			(company.branches ?? []).map((branch) => ({
				label: `${branch.name} (${branch.isMain ? "Main Office" : branch.branchType})`,
				value: branch.id,
			})),
		),
	];
}

function createWorkspaceUsersTableRecords(
	users: WorkspaceCompanyUserRecord[],
	companies: WorkspaceCompanyRecord[],
): WorkspaceUsersTableRecord[] {
	const companyMap = new Map(companies.map((company) => [company.id, company]));
	const branchMap = new Map(
		companies.flatMap((company) =>
			(company.branches ?? []).map((branch) => [branch.id, branch] as const),
		),
	);

	return users.map((user) => {
		const assignedCompanies = user.companyAssignments
			.map((assignment) => companyMap.get(assignment.companyId))
			.filter(Boolean) as WorkspaceCompanyRecord[];
		const assignedBranches = user.companyAssignments.flatMap((assignment) =>
			assignment.branchIds
				.map((branchId) => branchMap.get(branchId))
				.filter(Boolean),
		) as WorkspaceCompanyBranchRecord[];

		return {
			...user,
			accessItems: createAccessItems(assignedBranches),
			accessSummary: formatNames(
				assignedBranches.filter((branch) => !branch.isMain),
			),
			branchNames: formatNames(
				assignedBranches.filter(
					(branch) => !branch.isMain && branch.branchType === "Branch",
				),
			),
			companyNames: formatNames(assignedCompanies),
			mainOfficeNames: formatNames(assignedBranches.filter((branch) => branch.isMain)),
			satelliteNames: formatNames(
				assignedBranches.filter((branch) => branch.branchType === "Satellite"),
			),
			userType: RegularUserType,
		};
	});
}

function createAccessItems(
	branches: WorkspaceCompanyBranchRecord[],
): WorkspaceUsersAccessItem[] {
	const uniqueItems = new Map<string, WorkspaceUsersAccessItem>();

	branches
		.filter((branch) => !branch.isMain)
		.forEach((branch) => {
			const type = branch.branchType === "Satellite" ? "Satellite" : "Branch";
			const key = `${type}:${branch.name}`;

			if (!uniqueItems.has(key)) {
				uniqueItems.set(key, { name: branch.name, type });
			}
		});

	return Array.from(uniqueItems.values());
}

function formatNames(records: { name: string }[]) {
	return Array.from(new Set(records.map((record) => record.name))).join(", ");
}

function UserRecordActions({
	isPendingResend,
	isResendingInvitation,
	onCancelInvitation,
	onEdit,
	onResendInvitation,
	user,
}: {
	isPendingResend: boolean;
	isResendingInvitation: boolean;
	onCancelInvitation: () => void;
	onEdit: () => void;
	onResendInvitation: () => void;
	user: WorkspaceCompanyUserRecord;
}) {
	const canResendInvitation = user.status === "Pending";

	return (
		<ModuleTableActions className="justify-center">
			{canResendInvitation ? (
				<ModuleTableActionButton
					icon={Send}
					isLoading={isPendingResend}
					label={
						isPendingResend
							? `Resending invitation to ${user.name}`
							: `Resend invitation to ${user.name}`
					}
					variant="neutral"
					disabled={isResendingInvitation}
					onClick={onResendInvitation}
				/>
			) : null}
			{canResendInvitation ? (
				<ModuleTableActionButton
					variant="delete"
					label={`Cancel invitation for ${user.name}`}
					disabled={isResendingInvitation}
					onClick={onCancelInvitation}
				/>
			) : null}
			<ModuleTableActionLink
				variant="view"
				href={`${WorkspaceUsersManagementHref}/view/${user.id}`}
				label={`View ${user.name}`}
			/>
			<ModuleTableActionButton
				variant="edit"
				label={`Edit ${user.name}`}
				onClick={onEdit}
			/>
		</ModuleTableActions>
	);
}

function createActionColumn<TRecord>(
	header: string,
	className: string,
): ColumnDef<TRecord> {
	return {
		id: "actions",
		header,
		enableSorting: false,
		meta: { className },
	};
}

function createColumn(
	key: WorkspaceUsersTableColumnKey,
	header: string,
	className: string,
): ColumnDef<WorkspaceUsersTableRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
