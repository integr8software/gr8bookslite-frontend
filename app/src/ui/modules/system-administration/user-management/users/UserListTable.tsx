import { Search } from "lucide-react";
import { UserListTablePaginationStorageKey } from "@/app/src/constants/modules/user-management/UserListConstants";
import type { UserRoleRecord } from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import type { UserManagementRecord } from "@/app/src/types/modules/user-management/UserManagementTypes";
import { useUserListTable } from "@/app/src/hooks/modules/system-administration/user-management/users/useUserList";
import { UserListTableFilters } from "@/app/src/ui/modules/system-administration/user-management/users/UserListTableFilters";
import { UserListTableRow } from "@/app/src/ui/modules/system-administration/user-management/users/UserListTableRow";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";

export function UserListTable({
	isLoading = false,
	isRoleUpdating = false,
	lastSyncedAt,
	users,
	userRoles,
	onRoleChange,
}: {
	isLoading?: boolean;
	isRoleUpdating?: boolean;
	lastSyncedAt?: number | string | Date | null;
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
			<ModuleTable
				variant="embedded"
				emptyDescription="Try adjusting your filters or search query."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No users found"
				isLoading={isLoading}
				lastSyncedAt={lastSyncedAt}
				minWidthClassName="min-w-[40rem] sm:min-w-[44rem] lg:min-w-[50rem]"
				paginationStorageKey={UserListTablePaginationStorageKey}
				table={userList.table}
				tableTitle="Branch users"
				toolbar={
					<UserListTableFilters
						query={userList.query}
						typeFilter={userList.roleFilter}
						typeOptions={userList.roleOptions}
						onQueryChange={userList.setQuery}
						onResetFilters={userList.resetFilters}
						onTypeFilterChange={userList.setRoleFilter}
					/>
				}
				renderRow={({ id, original }) => (
					<UserListTableRow
						key={id}
						user={original}
						userRoles={userRoles}
						isRoleUpdating={isRoleUpdating}
						onRoleChange={onRoleChange}
					/>
				)}
			/>
		</div>
	);
}
