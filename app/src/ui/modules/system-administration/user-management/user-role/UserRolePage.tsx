"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ShieldCheck, Sparkles } from "lucide-react";
import { UserRoleHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
  getNextUserStatus,
  type UserRoleRecord,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { UserRoleSpotlightTutorialOpenEvent } from "@/app/src/data/modules/system-administration/user-management/user-role/UserRoleSpotlightTutorialData";
import { useUserRoleStore } from "@/app/src/hooks/modules/system-administration/user-management/user-role/useUserRole";
import { UserRoleList } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleList";
import { UserRoleSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleSpotlightTutorial";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

export function UserRolePage() {
  const userRoles = useUserRoleStore((state) => state.userRoles);
  const updateUserRole = useUserRoleStore((state) => state.updateUserRole);
  const isMutating = useUserRoleStore((state) => state.isMutating);
  const [pendingStatusRole, setPendingStatusRole] =
    useState<UserRoleRecord | null>(null);
  const pendingNextStatus = pendingStatusRole
    ? getNextUserStatus(pendingStatusRole.status)
    : "Inactive";
  const pendingStatusLabel =
    pendingNextStatus === "Inactive" ? "Set as Inactive" : "Set as Active";

  function handleConfirmStatusChange() {
    if (!pendingStatusRole) {
      return;
    }

    updateUserRole({
      ...pendingStatusRole,
      status: pendingNextStatus,
    });
    setPendingStatusRole(null);
  }

  function openSpotlightTutorial() {
    window.dispatchEvent(new Event(UserRoleSpotlightTutorialOpenEvent));
  }

  return (
    <section className="grid gap-5">
      <UserRoleSpotlightTutorial />
      <ModuleHeader
        variant="panel"
        data-spotlight-id="user-role-header"
        titleAs="h1"
        title="User Roles"
        description="Maintain access role templates for users."
        eyebrow={
          <>
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
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
              href={`${UserRoleHref}/add`}
              data-spotlight-id="user-role-add"
              className={moduleHeaderActionClassNames.primary}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Type
            </Link>
          </>
        }
      />
      <UserRoleList
        baseHref={UserRoleHref}
        icon={ShieldCheck}
        items={userRoles}
        onStatusChange={setPendingStatusRole}
      />
      <AppDialog
        isOpen={Boolean(pendingStatusRole)}
        isPending={isMutating}
        title={
          pendingNextStatus === "Inactive"
            ? "Set user role as inactive?"
            : "Set user role as active?"
        }
        description={`This will mark ${
          pendingStatusRole?.name ?? "the selected role"
        } as ${pendingNextStatus.toLowerCase()} while keeping the role available for reference.`}
        confirmLabel={pendingStatusLabel}
        tone={pendingNextStatus === "Inactive" ? "danger" : "success"}
        onCancel={() => setPendingStatusRole(null)}
        onConfirm={handleConfirmStatusChange}
      />
    </section>
  );
}
