"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CirclePause,
  Clock3,
  Plus,
  ShieldAlert,
  UserCog,
  Users,
} from "lucide-react";
import { useWorkspaceCompanyManagementStore } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagementStore";
import type { WorkspaceCompanyUserRecord } from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
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
    lastSyncedAt,
    resendInvitation,
    users,
  } = useWorkspaceCompanyManagementStore((state) => ({
    cancelInvitation: state.cancelCompanyUserInvitation,
    companies: state.companies,
    errorMessage: state.errorMessage,
    isLoading: state.isLoading,
    isMutating: state.isMutating,
    lastSyncedAt: state.lastSyncedAt,
    resendInvitation: state.resendCompanyUserInvitation,
    users: state.users,
  }));
  const openAddDrawer = useCallback(() => {
    setDrawerState({ mode: "add" });
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawerState(null);
  }, []);
  const userMetrics = useMemo(() => {
    const activeUsers = users.filter((user) => user.status === "Active").length;
    const pendingUsers = users.filter((user) => user.status === "Pending").length;
    const inactiveUsers = users.filter((user) => user.status === "Inactive").length;
    const suspendedUsers = users.filter(
      (user) => user.status === "Suspended",
    ).length;
    const companyAssignments = users.reduce(
      (total, user) => total + user.companyAssignments.length,
      0,
    );

    return [
      {
        icon: Users,
        label: "Total Users",
        helper: "All workspace accounts",
        tone: "blue" as const,
        value: users.length,
      },
      {
        icon: CheckCircle2,
        label: "Active Users",
        helper: "Can access assigned areas",
        tone: "emerald" as const,
        value: activeUsers,
      },
      {
        icon: Clock3,
        label: "Pending Invites",
        helper: "Awaiting activation",
        tone: "cyan" as const,
        value: pendingUsers,
      },
      {
        icon: CirclePause,
        label: "Inactive Users",
        helper: "Currently inactive",
        tone: "amber" as const,
        value: inactiveUsers,
      },
      {
        icon: ShieldAlert,
        label: "Suspended Users",
        helper: "Access suspended",
        tone: "violet" as const,
        value: suspendedUsers,
      },
      {
        icon: Building2,
        label: "Company Assignments",
        helper: "Across workspace users",
        tone: "slate" as const,
        value: companyAssignments,
      },
    ];
  }, [users]);

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
      <div data-spotlight-id="workspace-users-metrics">
        <ModuleStatisticCards
          className="xl:grid-cols-6"
          isLoading={isLoading}
          items={userMetrics}
        />
      </div>
      <WorkspaceUsersTable
        companies={companies}
        isLoading={isLoading}
        lastSyncedAt={lastSyncedAt}
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
