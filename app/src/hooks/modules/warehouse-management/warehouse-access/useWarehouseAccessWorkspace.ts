"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  WarehouseAccessPermissionOptions,
  WarehouseAccessPickerDefaultPermissions,
  WarehouseAccessStockMovementPermissions,
  WarehouseAccessViewerDefaultPermissions,
} from "@/app/src/constants/modules/warehouse-management/warehouse-access/WarehouseAccessConstants";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useWarehousesStore } from "@/app/src/hooks/modules/warehouse-management/warehouses/useWarehouses";
import { fetchWarehouseAccess, revokeWarehouseAccess, updateWarehouseAccess } from "@/app/src/services/modules/warehouse-management/warehouse-access/WarehouseAccessApi";
import { WarehouseAccessQueryKeys } from "@/app/src/services/modules/warehouse-management/warehouse-access/WarehouseAccessQueryKeys";
import type {
  WarehouseAccessLevel,
  WarehouseAccessPermission,
  WarehouseAccessRecord,
} from "@/app/src/types/modules/warehouse-management/warehouse-access/WarehouseAccessTypes";

export function useWarehouseAccessWorkspace() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const {
    isLoading: warehousesLoading,
    isRefreshing: warehousesRefreshing,
    warehouses: baseWarehouses,
  } = useWarehousesStore();
  const accessQuery = useQuery({
    queryKey: WarehouseAccessQueryKeys.list(activeCompanyId),
    queryFn: () => fetchWarehouseAccess(),
    enabled: activeCompanyId !== null,
    retry: false,
  });
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [selectedAccessId, setSelectedAccessId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [permissionFilter, setPermissionFilter] = useState<"All" | WarehouseAccessPermission>("All");
  const [draftOverride, setDraftOverride] = useState<WarehouseAccessRecord | null>(null);
  const warehouses = useMemo(
    () =>
      baseWarehouses.map((warehouse) => ({
        ...warehouse,
        access: (accessQuery.data?.warehouseAccess ?? []).filter((access) => access.warehouseId === warehouse.id),
      })),
    [accessQuery.data?.warehouseAccess, baseWarehouses],
  );
  const initialWarehouseId = searchParams.get("warehouseId");
  const resolvedWarehouseId =
    warehouses.find((warehouse) => warehouse.id === selectedWarehouseId)?.id ??
    warehouses.find((warehouse) => warehouse.id === initialWarehouseId)?.id ??
    warehouses[0]?.id ??
    "";
  const warehouse = warehouses.find((item) => item.id === resolvedWarehouseId) ?? warehouses[0];
  const filteredAccess = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!warehouse) return [];

    return warehouse.access.filter(
      (access) =>
        (statusFilter === "All" || access.status === statusFilter) &&
        (permissionFilter === "All" || access.permissions.includes(permissionFilter)) &&
        (!normalizedQuery ||
          [access.userName, access.userEmail, access.status, access.permissions.join(" ")].join(" ").toLowerCase().includes(normalizedQuery)),
    );
  }, [permissionFilter, query, statusFilter, warehouse]);
  const activeAccessCount = warehouse?.access.filter((access) => access.status === "Active").length ?? 0;
  const inactiveAccessCount = warehouse?.access.filter((access) => access.status === "Inactive").length ?? 0;
  const totalAccessCount = warehouse?.access.length ?? 0;
  const savedAccess = warehouse?.access.find((access) => access.id === selectedAccessId) ?? warehouse?.access[0];
  const draft =
    draftOverride && draftOverride.id === savedAccess?.id ? draftOverride : savedAccess ? { ...savedAccess, permissions: [...savedAccess.permissions] } : null;
  const isDirty = Boolean(draft && savedAccess && JSON.stringify(draft) !== JSON.stringify(savedAccess));

  const updateAccessMutation = useMutation({
    mutationFn: updateWarehouseAccess,
    onSuccess: (updatedAccess) => {
      void queryClient.invalidateQueries({
        queryKey: WarehouseAccessQueryKeys.all(activeCompanyId),
      });
      setDraftOverride({ ...updatedAccess, permissions: [...updatedAccess.permissions] });
      toast.success("Warehouse access updated.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update warehouse access. Please try again.");
    },
  });
  const revokeAccessMutation = useMutation({
    mutationFn: revokeWarehouseAccess,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: WarehouseAccessQueryKeys.all(activeCompanyId),
      });
      setSelectedAccessId("");
      setDraftOverride(null);
      toast.success("Warehouse access revoked.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not revoke warehouse access. Please try again.");
    },
  });

  function selectWarehouse(nextWarehouseId: string) {
    const nextWarehouse = warehouses.find((item) => item.id === nextWarehouseId);
    const nextAccess = nextWarehouse?.access[0] ?? null;
    setSelectedWarehouseId(nextWarehouseId);
    setSelectedAccessId(nextAccess?.id ?? "");
    setDraftOverride(nextAccess ? { ...nextAccess, permissions: [...nextAccess.permissions] } : null);
    setQuery("");
    setStatusFilter("All");
    setPermissionFilter("All");
  }

  function selectAccess(access: WarehouseAccessRecord) {
    setSelectedAccessId(access.id);
    setDraftOverride({ ...access, permissions: [...access.permissions] });
  }

  function updateDraft<TKey extends keyof WarehouseAccessRecord>(field: TKey, value: WarehouseAccessRecord[TKey]) {
    setDraftOverride((current) => {
      const source = current ?? draft;

      return source ? { ...source, [field]: value } : source;
    });
  }

  function togglePermission(permission: WarehouseAccessPermission) {
    if (!draft) return;
    updateDraft(
      "permissions",
      draft.permissions.includes(permission) ? draft.permissions.filter((item) => item !== permission) : [...draft.permissions, permission],
    );
  }

  function setRole(role: WarehouseAccessLevel) {
    setDraftOverride((current) => {
      const source = current ?? draft;

      return source
        ? {
            ...source,
            accessLevel: role,
            permissions: getDefaultPermissions(role),
          }
        : source;
    });
  }

  function toggleAllPermissions() {
    if (!draft) return;
    updateDraft("permissions", draft.permissions.length === WarehouseAccessPermissionOptions.length ? [] : [...WarehouseAccessPermissionOptions]);
  }

  function discardChanges() {
    if (!savedAccess) return;
    setDraftOverride({ ...savedAccess, permissions: [...savedAccess.permissions] });
  }

  function resetPermissions() {
    if (!draft) return;
    updateDraft("permissions", getDefaultPermissions(draft.accessLevel));
  }

  function saveChanges() {
    if (!draft) return;
    if (draft.permissions.length === 0) {
      toast.error("Select at least one warehouse permission.");
      return;
    }

    updateAccessMutation.mutate({
      ...draft,
      accessLevel: deriveLegacyAccessLevel(draft.permissions),
    });
  }

  function revokeAccess() {
    if (!draft) return;
    revokeAccessMutation.mutate(draft.id);
  }

  function refreshRecords() {
    void queryClient.invalidateQueries({
      queryKey: WarehouseAccessQueryKeys.all(activeCompanyId),
    });
  }

  return {
    discardChanges,
    draft,
    activeAccessCount,
    filteredAccess,
    inactiveAccessCount,
    isLoading: warehousesLoading || accessQuery.isLoading,
    isMutating: updateAccessMutation.isPending || revokeAccessMutation.isPending,
    isRefreshing: warehousesRefreshing || (accessQuery.isFetching && !accessQuery.isLoading),
    isDirty,
    permissionFilter,
    query,
    refreshRecords,
    resetPermissions,
    revokeAccess,
    saveChanges,
    selectAccess,
    selectedAccessId: savedAccess?.id ?? selectedAccessId,
    selectWarehouse,
    setPermissionFilter,
    setQuery,
    setRole,
    setStatusFilter,
    statusFilter,
    togglePermission,
    toggleAllPermissions,
    totalAccessCount,
    updateDraft,
    warehouse,
    warehouses,
  };
}

function getDefaultPermissions(level: WarehouseAccessLevel): WarehouseAccessPermission[] {
  if (level === "Manager") {
    return [...WarehouseAccessPermissionOptions];
  }

  if (level === "Picker") return [...WarehouseAccessPickerDefaultPermissions];
  return [...WarehouseAccessViewerDefaultPermissions];
}

function deriveLegacyAccessLevel(permissions: WarehouseAccessPermission[]) {
  if (permissions.length === WarehouseAccessPermissionOptions.length) return "Manager" as const;
  if (permissions.some((permission) => WarehouseAccessStockMovementPermissions.some((movementPermission) => movementPermission === permission))) {
    return "Picker" as const;
  }

  return "Viewer" as const;
}
