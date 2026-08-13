"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatTermDuration } from "@/app/src/data/modules/financial-maintenance/terms-maintenance/TermsMaintenanceDisplay";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { GetAuthProfileAccess, ResolveAuthProfileEffectiveRole } from "@/app/src/services/auth/AuthProfileAccess";
import { fetchTermOptions } from "@/app/src/services/modules/financial-maintenance/terms-maintenance/TermsMaintenanceApi";
import { TermsMaintenanceQueryKeys } from "@/app/src/services/modules/financial-maintenance/terms-maintenance/TermsMaintenanceQueryKeys";
import type { TermsMaintenancePermissions } from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsMaintenanceTypes";

const EmptyTermPermissions: TermsMaintenancePermissions = {
  canCreate: false,
  canExport: false,
  canImport: false,
  canUpdate: false,
  canView: false,
};

const ReservedRoleTermPermissions: TermsMaintenancePermissions = {
  canCreate: true,
  canExport: true,
  canImport: true,
  canUpdate: true,
  canView: true,
};

export function useTermDropdownOptions() {
  const accessToken = useAppStore((state) => state.accessToken);
  const authProfileQuery = useAuthProfileQuery({ accessToken });
  const termsQuery = useQuery({
    queryKey: TermsMaintenanceQueryKeys.options(),
    queryFn: fetchTermOptions,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const effectiveRole = ResolveAuthProfileEffectiveRole(authProfileQuery.data);
  const hasReservedRoleAccess = effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";
  const canCreateTerm =
    hasReservedRoleAccess || hasModulePermission(GetAuthProfileAccess(authProfileQuery.data)?.permissions, "TM", "create");

  const options = useMemo(
    () =>
      (termsQuery.data?.terms ?? []).map((term) => ({
        description: formatTermDuration(term),
        name: term.name,
        value: term.id,
      })),
    [termsQuery.data],
  );

  return {
    ...termsQuery,
    options,
    permissions: hasReservedRoleAccess ? ReservedRoleTermPermissions : { ...EmptyTermPermissions, canCreate: canCreateTerm },
    terms: termsQuery.data?.terms ?? [],
  };
}

function hasModulePermission(permissions: unknown[] | undefined, moduleCode: string, action: string) {
  const permissionKey = `${moduleCode}:${action}`;

  return (permissions ?? []).some((permission) => {
    if (typeof permission === "string") {
      return permission === permissionKey;
    }

    if (!permission || typeof permission !== "object") {
      return false;
    }

    const record = permission as {
      action?: unknown;
      code?: unknown;
      permissionCode?: unknown;
    };
    const code = record.code ?? record.permissionCode;

    return code === moduleCode && record.action === action;
  });
}
