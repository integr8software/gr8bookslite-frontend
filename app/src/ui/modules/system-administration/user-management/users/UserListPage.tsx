"use client";

import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";
import { UserListHeader } from "@/app/src/ui/modules/system-administration/user-management/users/UserListHeader";
import { UserListTable } from "@/app/src/ui/modules/system-administration/user-management/users/UserListTable";

export function UserListPage() {
  const users = useUserManagementStore((state) => state.users);
  const userRoles = useUserManagementStore((state) => state.userRoles);
  const updateUser = useUserManagementStore((state) => state.updateUser);

  return (
    <section className="grid gap-5">
      <UserListHeader
        description="Review users and assign the right role for each account."
        title="Users"
      />
      <UserListTable
        users={users}
        userRoles={userRoles}
        onRoleChange={(user, userRoleId) =>
          updateUser({
            ...user,
            userRoleId,
          })
        }
      />
    </section>
  );
}
