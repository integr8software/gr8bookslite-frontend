"use client";

import { UsersRound } from "lucide-react";
import { UserGroupHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { UserGroupSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/user-management/user-group/UserGroupSpotlightTutorialData";
import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";
import { UserGroupHeader } from "@/app/src/ui/modules/system-administration/user-management/user-group/UserGroupHeader";
import { UserGroupList } from "@/app/src/ui/modules/system-administration/user-management/user-group/UserGroupList";
import { UserGroupSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/user-group/UserGroupSpotlightTutorial";

export function UserGroupPage() {
  const userGroups = useUserManagementStore((state) => state.userGroups);
  const deleteUserGroup = useUserManagementStore((state) => state.deleteUserGroup);

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete ${name}?`)) return;
    deleteUserGroup(id);
  }

  function openSpotlightTutorial() {
    window.dispatchEvent(new Event(UserGroupSpotlightTutorialOpenEvent));
  }

  return (
    <section className="grid gap-5">
      <UserGroupSpotlightTutorial />
      <UserGroupHeader
        addHref={`${UserGroupHref}/add`}
        description="Maintain teams and department groupings for users."
        onStartSpotlightTutorial={openSpotlightTutorial}
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
