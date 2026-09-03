"use client";

import { Suspense } from "react";
import { useUserListPage } from "@/app/src/hooks/modules/system-administration/user-management/users/useUserListPage";
import { UserListHeader } from "@/app/src/ui/modules/system-administration/user-management/users/UserListHeader";
import { UserListTable } from "@/app/src/ui/modules/system-administration/user-management/users/UserListTable";
import { UserListSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/users/UserListSpotlightTutorial";

export function UserListPage() {
  return (
    <Suspense fallback={null}>
      <UserListPageInner />
    </Suspense>
  );
}

function UserListPageInner() {
  const { description, isEmpty, isLoading, isRoleUpdating, lastSyncedAt, onRoleChange, userRoles, users } = useUserListPage();

  return (
    <section className="grid gap-5">
      <UserListSpotlightTutorial />
      <UserListHeader description={description} title="Users" />
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-darknavy/20 bg-white p-12 text-center shadow-sm">
          <p className="text-base font-semibold text-darknavy">No users found</p>
          <p className="mt-1 text-sm text-darknavy/60">No users are currently assigned to this branch.</p>
        </div>
      ) : (
        <UserListTable
          isLoading={isLoading}
          isRoleUpdating={isRoleUpdating}
          lastSyncedAt={lastSyncedAt}
          users={users}
          userRoles={userRoles}
          onRoleChange={onRoleChange}
        />
      )}
    </section>
  );
}
