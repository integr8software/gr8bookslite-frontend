"use client";

import Link from "next/link";
import { Plus, Sparkles, UserRoundCog } from "lucide-react";
import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import { UserListSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/user-management/user-list/UserListSpotlightTutorialData";
import { useUserManagementStore } from "@/app/src/hooks/modules/system-administration/user-management/useUserManagement";
import { UserListSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListSpotlightTutorial";
import { UserListTable } from "@/app/src/ui/modules/system-administration/user-management/user-list/UserListTable";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

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
      <ModuleHeader
        variant="panel"
        data-spotlight-id="user-list-header"
        titleAs="h1"
        title="User List"
        description="Maintain users, assigned roles, and team groups."
        eyebrow={
          <>
            <UserRoundCog className="h-3.5 w-3.5" aria-hidden="true" />
            User management
          </>
        }
        actions={
          <>
            <button
              type="button"
              onClick={openSpotlightTutorial}
              className={moduleHeaderActionClassNames.secondary}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Quick Tour
            </button>
            <Link
              href={`${UserListHref}/add`}
              data-spotlight-id="user-list-add-user"
              className={moduleHeaderActionClassNames.primary}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add User
            </Link>
          </>
        }
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
