"use client";

import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { UserListSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/user-management/users/UserListSpotlightTutorialData";
import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";
import { UserListHeader } from "@/app/src/ui/modules/system-administration/user-management/users/UserListHeader";
import { UserListSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/users/UserListSpotlightTutorial";
import { UserListTable } from "@/app/src/ui/modules/system-administration/user-management/users/UserListTable";

export function UserListPage() {
  const users = useUserManagementStore((state) => state.users);
  const userRoles = useUserManagementStore((state) => state.userRoles);
  const departments = useUserManagementStore((state) => state.departments);
  const deleteUser = useUserManagementStore((state) => state.deleteUser);

  function handleDeleteUser(userId: string, userName: string) {
    if (!window.confirm(`Set ${userName} as inactive?`)) {
      return;
    }

    deleteUser(userId);
  }

  function openSpotlightTutorial() {
    window.dispatchEvent(new Event(UserListSpotlightTutorialOpenEvent));
  }

  return (
    <section className="grid gap-5">
      <UserListSpotlightTutorial />
      <UserListHeader
        addHref={`${UserListHref}/add`}
        description="Maintain users, assigned roles, and team groups."
        onStartSpotlightTutorial={openSpotlightTutorial}
        title="Users"
      />
      <UserListTable
        departments={departments}
        users={users}
        userRoles={userRoles}
        onDelete={handleDeleteUser}
      />
    </section>
  );
}
