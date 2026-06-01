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
import { Search, Send } from "lucide-react";
import {
	WorkspaceCompanyStatusOptions,
	WorkspaceUsersManagementHref,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import type {
	WorkspaceCompanyStatus,
	WorkspaceCompanyUserRecord,
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

type WorkspaceUsersTableColumnKey = keyof Pick<
	WorkspaceCompanyUserRecord,
	"name" | "email" | "status" | "lastLogin"
>;

const WorkspaceUsersTablePaginationStorageKey = "workspace-users";

const WorkspaceUsersTableColumns = [
	{ key: "name", label: "User", className: "w-[18rem]" },
	{ key: "email", label: "Email", className: "w-[20rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "lastLogin", label: "Last Login", className: "w-[13rem]" },
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
	isLoading,
	isResendingInvitation,
	onCancelInvitation,
	onEdit,
	onResendInvitation,
	users,
}: {
	isLoading: boolean;
	isResendingInvitation: boolean;
	onCancelInvitation: (userId: string) => Promise<unknown>;
	onEdit: (user: WorkspaceCompanyUserRecord) => void;
	onResendInvitation: (userId: string) => Promise<unknown>;
	users: WorkspaceCompanyUserRecord[];
}) {
	const userList = useWorkspaceUsersTable(users);
	const [pendingCancelUser, setPendingCancelUser] =
		useState<WorkspaceCompanyUserRecord | null>(null);

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Try adjusting your search or status filter."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No workspace users found"
				isLoading={isLoading}
				minWidthClassName="min-w-[66rem]"
				paginationStorageKey={WorkspaceUsersTablePaginationStorageKey}
				table={userList.table}
				toolbar={
					<WorkspaceUsersTableFilters
						query={userList.query}
						statusFilter={userList.statusFilter}
						statusOptions={userList.statusOptions}
						onQueryChange={userList.setQuery}
						onResetFilters={userList.resetFilters}
						onStatusFilterChange={userList.setStatusFilter}
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

function useWorkspaceUsersTable(users: WorkspaceCompanyUserRecord[]) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQueryState] = useState("");
	const [statusFilter, setStatusFilterState] = useState<
		WorkspaceCompanyStatus | "All"
	>("All");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const filteredUsers = useMemo(
		() =>
			users.filter((user) => {
				const searchable = [
					user.name,
					user.email,
					user.contactNumber,
					user.status,
					user.lastLogin,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				return (
					searchable.includes(query.toLowerCase()) &&
					(statusFilter === "All" || user.status === statusFilter)
				);
			}),
		[query, statusFilter, users],
	);
	const columns = useMemo<ColumnDef<WorkspaceCompanyUserRecord>[]>(
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
		setStatusFilterState("All");
		table.setPageIndex(0);
	}

	function setQuery(value: string) {
		setQueryState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: WorkspaceCompanyStatus | "All") {
		setStatusFilterState(value);
		table.setPageIndex(0);
	}

	return {
		query,
		resetFilters,
		setQuery,
		setStatusFilter,
		statusFilter,
		statusOptions: WorkspaceCompanyStatusOptions,
		table,
	};
}

function WorkspaceUsersTableFilters({
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
		<ModuleTableToolbar className="rounded-none border-x-0 border-t-0 shadow-none md:grid-cols-[minmax(24rem,2.5fr)_minmax(10rem,1fr)_minmax(11rem,1fr)]">
			<ModuleTableSearch
				label="Search users"
				value={query}
				onChange={onQueryChange}
				placeholder="Search users"
			/>
			<ModuleTableFilterSelect
				label="Status"
				options={getFilterOptions(statusOptions)}
				value={statusFilter}
				onChange={(value) =>
					onStatusFilterChange(
						value as WorkspaceCompanyStatus | "All",
					)
				}
			/>
			<ModuleTableResetButton onClick={onResetFilters}>
				Reset
			</ModuleTableResetButton>
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
	user: WorkspaceCompanyUserRecord;
}) {
	const [pendingResendUserId, setPendingResendUserId] = useState<
		string | null
	>(null);
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
				<WorkspaceManagementStatusBadge status={user.status} />
			</WorkspaceUsersTableCell>
			<WorkspaceUsersTableCell>
				{user.lastLogin ?? "-"}
			</WorkspaceUsersTableCell>
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

function getFilterOptions(options: readonly string[]) {
	return [
		{ label: "All", value: "All" },
		...options.map((option) => ({ label: option, value: option })),
	];
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
): ColumnDef<WorkspaceCompanyUserRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
