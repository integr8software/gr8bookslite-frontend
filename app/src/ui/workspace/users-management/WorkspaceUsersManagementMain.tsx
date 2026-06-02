"use client";

import { useState } from "react";
import { Plus, UserCog } from "lucide-react";
import { WorkspaceUserDrawerSpotlightTutorialOpenEvent } from "@/app/src/data/workspace/users-management/WorkspaceUserDrawerSpotlightTutorialData";
import { useWorkspaceCompanyManagementStore } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagement";
import type { WorkspaceCompanyUserRecord } from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { WorkspaceUsersTable } from "@/app/src/ui/workspace/users-management/WorkspaceUsersTable";
import { WorkspaceUserDrawer } from "@/app/src/ui/workspace/users-management/WorkspaceUserDrawer";
import { WorkspaceUsersSpotlightTutorial } from "@/app/src/ui/workspace/users-management/WorkspaceUsersSpotlightTutorial";

type DrawerState = {
  mode: "add" | "edit";
  user?: WorkspaceCompanyUserRecord;
} | null;

export function WorkspaceUsersManagementMain() {
  const [drawerState, setDrawerState] = useState<DrawerState>(null);
  const users = useWorkspaceCompanyManagementStore((state) => state.users);
  const isLoading = useWorkspaceCompanyManagementStore(
    (state) => state.isLoading,
  );
  const isMutating = useWorkspaceCompanyManagementStore(
    (state) => state.isMutating,
  );
  const resendInvitation = useWorkspaceCompanyManagementStore(
    (state) => state.resendCompanyUserInvitation,
  );
  const cancelInvitation = useWorkspaceCompanyManagementStore(
    (state) => state.cancelCompanyUserInvitation,
  );

  return (
    <section className="grid gap-5">
      <WorkspaceUsersSpotlightTutorial
        isEnabled={!drawerState}
        onComplete={() => {
          setDrawerState({ mode: "add" });
          openAddUserDrawerTutorial();
        }}
      />
      <ModuleHeader
        data-spotlight-id="workspace-users-header"
        variant="panel"
        titleAs="h1"
        title="Users Management"
        description="Maintain workspace users and assign each account to one or more companies, branches, or satellites."
        eyebrow={
          <>
            <UserCog className="h-3.5 w-3.5" aria-hidden="true" />
            Workspace
          </>
        }
        actions={
          <button
            type="button"
            data-spotlight-id="workspace-users-add"
            onClick={() => setDrawerState({ mode: "add" })}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add User
          </button>
        }
      />
      <WorkspaceUsersTable
        isLoading={isLoading}
        isResendingInvitation={isMutating}
        onCancelInvitation={cancelInvitation}
        onEdit={(user) => setDrawerState({ mode: "edit", user })}
        onResendInvitation={resendInvitation}
        users={users}
      />
      <WorkspaceUserDrawer
        isOpen={Boolean(drawerState)}
        mode={drawerState?.mode ?? "add"}
        onClose={() => setDrawerState(null)}
        user={drawerState?.user}
      />
    </section>
  );
}

function openAddUserDrawerTutorial() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      window.dispatchEvent(
        new Event(WorkspaceUserDrawerSpotlightTutorialOpenEvent),
      );
    });
  });
}
