"use client";

import { useState } from "react";
import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
	getNextUserStatus,
	type UserManagementRecord,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { UserListSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/user-management/users/UserListSpotlightTutorialData";
import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";
import { UserListHeader } from "@/app/src/ui/modules/system-administration/user-management/users/UserListHeader";
import { UserListSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/users/UserListSpotlightTutorial";
import { UserListTable } from "@/app/src/ui/modules/system-administration/user-management/users/UserListTable";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";

export function UserListPage() {
  const users = useUserManagementStore((state) => state.users);
  const userRoles = useUserManagementStore((state) => state.userRoles);
  const updateUser = useUserManagementStore((state) => state.updateUser);
  const isMutating = useUserManagementStore((state) => state.isMutating);
  const [pendingStatusUser, setPendingStatusUser] =
    useState<UserManagementRecord | null>(null);
  const pendingNextStatus = pendingStatusUser
    ? getNextUserStatus(pendingStatusUser.status)
    : "Inactive";
  const pendingStatusLabel =
    pendingNextStatus === "Inactive" ? "Set as Inactive" : "Set as Active";

  function handleConfirmStatusChange() {
    if (!pendingStatusUser) {
      return;
    }

    updateUser({
      ...pendingStatusUser,
      status: pendingNextStatus,
    });
    setPendingStatusUser(null);
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
        users={users}
        userRoles={userRoles}
        onStatusChange={setPendingStatusUser}
      />
      <AppConfirmDialog
        isOpen={Boolean(pendingStatusUser)}
        isPending={isMutating}
        title={
          pendingNextStatus === "Inactive"
            ? "Set user as inactive?"
            : "Set user as active?"
        }
        description={`This will mark ${
          pendingStatusUser?.name ?? "the selected user"
        } as ${pendingNextStatus.toLowerCase()} while keeping the account record available.`}
        confirmLabel={pendingStatusLabel}
        tone={pendingNextStatus === "Inactive" ? "danger" : "success"}
        onCancel={() => setPendingStatusUser(null)}
        onConfirm={handleConfirmStatusChange}
      />
    </section>
  );
}
