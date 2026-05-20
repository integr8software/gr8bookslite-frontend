"use client";

import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { UserListSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/user-management/user-list/UserListSpotlightTutorialData";
import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";
import { UserListHeader } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListHeader";
import { UserListSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListSpotlightTutorial";
import { UserListTable } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListTable";

export function UserListPage() {
  const users = useUserManagementStore((state) => state.users);
  const userTypes = useUserManagementStore((state) => state.userTypes);
  const userGroups = useUserManagementStore((state) => state.userGroups);
  const deleteUser = useUserManagementStore((state) => state.deleteUser);

  function handleDeleteUser(userId: string, userName: string) {
    if (!window.confirm(`Delete ${userName}?`)) {
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
        title="User List"
      />
      <UserListTable
        userGroups={userGroups}
        users={users}
        userTypes={userTypes}
        onDelete={handleDeleteUser}
      />
    </section>
  );
}
