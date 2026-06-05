"use client";

import { useCallback, useState } from "react";
import { AlertCircle, Plus, UserCog } from "lucide-react";
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
  const {
    cancelInvitation,
    companies,
    errorMessage,
    isLoading,
    isMutating,
    resendInvitation,
    users,
  } = useWorkspaceCompanyManagementStore((state) => ({
    cancelInvitation: state.cancelCompanyUserInvitation,
    companies: state.companies,
    errorMessage: state.errorMessage,
    isLoading: state.isLoading,
    isMutating: state.isMutating,
    resendInvitation: state.resendCompanyUserInvitation,
    users: state.users,
  }));
  const openAddDrawer = useCallback(() => {
    setDrawerState({ mode: "add" });
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawerState(null);
  }, []);

  return (
    <section className="grid gap-5">
      <WorkspaceUsersSpotlightTutorial
        onCloseAddDrawer={closeDrawer}
        onOpenAddDrawer={openAddDrawer}
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
            onClick={openAddDrawer}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add User
          </button>
        }
      />
      {errorMessage ? (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <p>{errorMessage}</p>
        </div>
      ) : null}
      <WorkspaceUsersTable
        companies={companies}
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
        onClose={closeDrawer}
        showSpotlightTutorial={false}
        user={drawerState?.user}
      />
    </section>
  );
}
