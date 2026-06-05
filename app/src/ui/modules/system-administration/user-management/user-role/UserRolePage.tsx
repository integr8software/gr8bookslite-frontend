"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { UserRoleHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
  getNextUserStatus,
  type UserRoleRecord,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { useBranchUserRoleContext } from "@/app/src/hooks/modules/system-administration/user-management/user-role/useBranchUserRoleContext";
import {
  GetBranchRoles,
  UpdateBranchRoleStatus,
} from "@/app/src/services/modules/system-administration/user-management/user-role/BranchUserRoleApi";
import { UserRoleQueryKeys } from "@/app/src/services/modules/system-administration/user-management/user-role/UserRoleQueryKeys";
import { UserListQueryKeys } from "@/app/src/services/modules/system-administration/user-management/users/UserListQueryKeys";
import { UserRoleList } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleList";
import { UserRoleLoading } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleLoading";
import { UserRoleSpotlightTutorial } from "@/app/src/ui/modules/system-administration/user-management/user-role/UserRoleSpotlightTutorial";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

export function UserRolePage() {
  const queryClient = useQueryClient();
  const { accessToken, branchId, isLoadingBranchContext } =
    useBranchUserRoleContext();
  const [pendingStatusRole, setPendingStatusRole] =
    useState<UserRoleRecord | null>(null);
  const userRolesQuery = useQuery({
    enabled: Boolean(accessToken && branchId),
    queryKey: branchId
      ? UserRoleQueryKeys.branchRoles(branchId)
      : UserRoleQueryKeys.branchRoles(""),
    queryFn: async () => GetBranchRoles(branchId ?? ""),
  });
  const statusMutation = useMutation({
    mutationFn: async ({
      role,
      nextStatus,
    }: {
      role: UserRoleRecord;
      nextStatus: UserRoleRecord["status"];
    }) => {
      if (!branchId) {
        throw new Error("Select a branch before changing user roles.");
      }

      return UpdateBranchRoleStatus(branchId, role.id, nextStatus === "Active");
    },
    onSuccess: (updatedRole) => {
      if (branchId) {
        queryClient.setQueryData<UserRoleRecord[]>(
          UserRoleQueryKeys.branchRoles(branchId),
          (current = []) =>
            current.map((role) =>
              role.id === updatedRole.id ? updatedRole : role,
            ),
        );
        queryClient.invalidateQueries({
          queryKey: UserListQueryKeys.branchRoles(branchId),
        });
      }

      toast.success("User role status updated.");
      setPendingStatusRole(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update user role status.",
      );
    },
  });
  const pendingNextStatus = pendingStatusRole
    ? getNextUserStatus(pendingStatusRole.status)
    : "Inactive";
  const pendingStatusLabel =
    pendingNextStatus === "Inactive" ? "Set as Inactive" : "Set as Active";

  function handleConfirmStatusChange() {
    if (!pendingStatusRole) {
      return;
    }

    statusMutation.mutate({
      role: pendingStatusRole,
      nextStatus: pendingNextStatus,
    });
  }

  const userRoles = userRolesQuery.data ?? [];
  const isLoading = isLoadingBranchContext || userRolesQuery.isLoading;
  const isMutating = statusMutation.isPending;

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
            <Link
              href={`${UserRoleHref}/add`}
              data-spotlight-id="user-role-add"
              className={`${moduleHeaderActionClassNames.primary} max-sm:w-full`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Type
            </Link>
          </>
        }
      />
      {isLoading ? (
        <UserRoleLoading />
      ) : (
        <UserRoleList
          baseHref={UserRoleHref}
          icon={ShieldCheck}
          items={userRoles}
          onStatusChange={setPendingStatusRole}
        />
      )}
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
