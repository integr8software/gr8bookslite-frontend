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
	onRoleChange,
}: {
	users: UserManagementRecord[];
	userRoles: UserRoleRecord[];
	onRoleChange: (user: UserManagementRecord, userRoleId: string) => void;
}) {
	const userList = useUserListTable({ users, userRoles });

	return (
		<div
			className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm"
			data-spotlight-id="users-table"
		>
			<UserListTableFilters
				query={userList.query}
				typeFilter={userList.roleFilter}
				typeOptions={userList.roleOptions}
				onQueryChange={userList.setQuery}
				onResetFilters={userList.resetFilters}
				onTypeFilterChange={userList.setRoleFilter}
			/>

			<ModuleTable
				variant="embedded"
				emptyDescription="Try adjusting your filters or search query."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No users found"
				minWidthClassName="min-w-[40rem] sm:min-w-[44rem] lg:min-w-[50rem]"
				paginationStorageKey={UserListTablePaginationStorageKey}
				table={userList.table}
				renderRow={({ id, original }) => (
					<UserListTableRow
						key={id}
						user={original}
						userRoles={userRoles}
						onRoleChange={onRoleChange}
					/>
				)}
			/>
		</div>
	);
}
