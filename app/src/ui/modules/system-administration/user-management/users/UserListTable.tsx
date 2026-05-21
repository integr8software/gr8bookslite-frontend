import { Search } from "lucide-react";
import { UserListTablePaginationStorageKey } from "@/app/src/constants/modules/user-management/UserListConstants";
import type {
	UserManagementRecord,
	UserRoleRecord,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { useUserListTable } from "@/app/src/hooks/modules/system-administration/user-management/users/useUserList";
import { UserListTableFilters } from "@/app/src/ui/modules/system-administration/user-management/users/UserListTableFilters";
import { UserListTableRow } from "@/app/src/ui/modules/system-administration/user-management/users/UserListTableRow";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";

export function UserListTable({
	users,
	userRoles,
	onStatusChange,
}: {
	users: UserManagementRecord[];
	userRoles: UserRoleRecord[];
	onStatusChange: (user: UserManagementRecord) => void;
}) {
	const userList = useUserListTable({ users, userRoles });

	return (
		<div
			className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm"
			data-spotlight-id="users-table"
		>
			<UserListTableFilters
				query={userList.query}
				statusFilter={userList.statusFilter}
				statusOptions={userList.statusOptions}
				typeFilter={userList.roleFilter}
				typeOptions={userList.roleOptions}
				onQueryChange={userList.setQuery}
				onResetFilters={userList.resetFilters}
				onStatusFilterChange={userList.setStatusFilter}
				onTypeFilterChange={userList.setRoleFilter}
			/>

			<ModuleTable
				emptyDescription="Try adjusting your filters or search query."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No users found"
				minWidthClassName="min-w-[70rem]"
				paginationStorageKey={UserListTablePaginationStorageKey}
				table={userList.table}
				renderRow={({ id, original }) => (
					<UserListTableRow
						key={id}
						user={original}
						onStatusChange={onStatusChange}
					/>
				)}
			/>
		</div>
	);
}
