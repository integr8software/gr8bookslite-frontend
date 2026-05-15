"use client";

import { UsersRound } from "lucide-react";
import { UserGroupHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";
import { UserGroupHeader } from "@/app/src/ui/modules/system-administration/user-management/user-group/UserGroupHeader";
import { UserGroupList } from "@/app/src/ui/modules/system-administration/user-management/user-group/UserGroupList";

export function UserGroupPage() {
  const userGroups = useUserManagementStore((state) => state.userGroups);
  const deleteUserGroup = useUserManagementStore((state) => state.deleteUserGroup);

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete ${name}?`)) return;
    deleteUserGroup(id);
  }

  return (
    <section className="grid gap-5">
      <UserGroupHeader
        addHref={`${UserGroupHref}/add/new`}
        description="Maintain grouped access roles for teams and departments."
        title="User Groups"
      />
      <UserGroupList
        baseHref={UserGroupHref}
        icon={UsersRound}
        items={userGroups}
        onDelete={handleDelete}
      />
    </section>
  );
}
