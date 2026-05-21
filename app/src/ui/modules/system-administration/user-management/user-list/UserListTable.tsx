import { Search } from "lucide-react";
import { UserListTablePaginationStorageKey } from "@/app/src/constants/modules/user-management/UserListConstants";
import type {
	DepartmentRecord,
	UserManagementRecord,
	UserRoleRecord,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { useUserListTable } from "@/app/src/hooks/modules/system-administration/user-management/user-list/useUserList";
import { UserListTableFilters } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListTableFilters";
import { UserListTableRow } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListTableRow";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";

export function UserListTable({
	departments,
	users,
	userRoles,
	onDelete,
}: {
	departments: DepartmentRecord[];
	users: UserManagementRecord[];
	userRoles: UserRoleRecord[];
	onDelete: (id: string, name: string) => void;
}) {
	const userList = useUserListTable({ departments, users, userRoles });

	return (
		<div
			className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm"
			data-spotlight-id="user-list-table"
		>
			<UserListTableFilters
				groupFilter={userList.departmentFilter}
				groupOptions={userList.departmentOptions}
				query={userList.query}
				statusFilter={userList.statusFilter}
				statusOptions={userList.statusOptions}
				typeFilter={userList.roleFilter}
				typeOptions={userList.roleOptions}
				onGroupFilterChange={userList.setDepartmentFilter}
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
						onDelete={onDelete}
					/>
				)}
			/>
		</div>
	);
}
