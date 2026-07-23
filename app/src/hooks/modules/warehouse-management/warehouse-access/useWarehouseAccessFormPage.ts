"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  WarehouseAccessDefaultPermission,
  WarehouseAccessHref,
  WarehouseAccessPermissionOptions,
  WarehouseAccessStockMovementPermissions,
} from "@/app/src/constants/modules/warehouse-management/warehouse-access/WarehouseAccessConstants";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useWarehousesStore } from "@/app/src/hooks/modules/warehouse-management/warehouses/useWarehouses";
import {
  createWarehouseAccessAssignments,
  fetchWarehouseAccess,
  fetchWarehouseAccessDirectory,
} from "@/app/src/services/modules/warehouse-management/warehouse-access/WarehouseAccessApi";
import { WarehouseAccessQueryKeys } from "@/app/src/services/modules/warehouse-management/warehouse-access/WarehouseAccessQueryKeys";
import type { WarehouseAccessPermission } from "@/app/src/types/modules/warehouse-management/warehouse-access/WarehouseAccessTypes";

export function useWarehouseAccessFormPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const { isLoading: warehousesLoading, warehouses } = useWarehousesStore();
  const accessQuery = useQuery({
    queryKey: WarehouseAccessQueryKeys.list(activeCompanyId),
    queryFn: () => fetchWarehouseAccess(),
    enabled: activeCompanyId !== null,
    retry: false,
  });
  const directoryQuery = useQuery({
    queryKey: WarehouseAccessQueryKeys.directory(activeCompanyId),
    queryFn: fetchWarehouseAccessDirectory,
    enabled: activeCompanyId !== null,
    retry: false,
  });
  const [warehouseIds, setWarehouseIds] = useState<string[]>(() => (warehouses[0] ? [warehouses[0].id] : []));
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [permissionsByWarehouse, setPermissionsByWarehouse] = useState<Record<string, WarehouseAccessPermission[]>>({});
  const warehouseAccess = accessQuery.data?.warehouseAccess ?? [];
  const effectiveWarehouseIds = useMemo(() => (warehouseIds.length > 0 ? warehouseIds : warehouses[0] ? [warehouses[0].id] : []), [warehouseIds, warehouses]);
  const effectivePermissionsByWarehouse = useMemo(
    () => ({
      ...Object.fromEntries(effectiveWarehouseIds.map((warehouseId) => [warehouseId, [WarehouseAccessDefaultPermission]])),
      ...permissionsByWarehouse,
    }),
    [effectiveWarehouseIds, permissionsByWarehouse],
  );
  const selectedWarehouses = warehouses.filter((warehouse) => effectiveWarehouseIds.includes(warehouse.id));
  const branchOptions = useMemo(() => directoryQuery.data?.branches.map((branch) => branch.name) ?? [], [directoryQuery.data?.branches]);
  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const users = directoryQuery.data?.users ?? [];

    return users.filter(
      (user) =>
        (branchFilter === "All" || user.branchNames.includes(branchFilter)) &&
        (!normalized || [user.name, user.email, user.branchNames.join(" ")].join(" ").toLowerCase().includes(normalized)),
    );
  }, [branchFilter, directoryQuery.data?.users, query]);
  const hasAccessInEveryWarehouse = (userId: string, userName: string) =>
    selectedWarehouses.length > 0 &&
    selectedWarehouses.every((warehouse) =>
      warehouseAccess.some(
        (access) => access.warehouseId === warehouse.id && (access.userId === userId || access.userName.trim().toLowerCase() === userName.trim().toLowerCase()),
      ),
    );
  const grantAccessMutation = useMutation({
    mutationFn: createWarehouseAccessAssignments,
    onSuccess: (createdAssignments) => {
      void queryClient.invalidateQueries({
        queryKey: WarehouseAccessQueryKeys.all(activeCompanyId),
      });
      toast.success(`${createdAssignments.length} access assignment${createdAssignments.length === 1 ? "" : "s"} created.`);
      router.push(WarehouseAccessHref);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not grant warehouse access. Please try again.");
    },
  });

  function toggleWarehouse(warehouseId: string) {
    setWarehouseIds((current) => (current.includes(warehouseId) ? current.filter((id) => id !== warehouseId) : [...current, warehouseId]));
    setPermissionsByWarehouse((current) => ({
      ...current,
      [warehouseId]: current[warehouseId] ?? [WarehouseAccessDefaultPermission],
    }));
  }

  function toggleAllWarehouses() {
    setWarehouseIds((current) => (current.length === warehouses.length ? [] : warehouses.map((warehouse) => warehouse.id)));
    setPermissionsByWarehouse((current) => ({
      ...current,
      ...Object.fromEntries(warehouses.map((warehouse) => [warehouse.id, current[warehouse.id] ?? [WarehouseAccessDefaultPermission]])),
    }));
  }

  function toggleUser(userId: string) {
    setSelectedUserIds((current) => (current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]));
  }

  function toggleAllFiltered() {
    const availableIds = filteredUsers.filter((user) => !hasAccessInEveryWarehouse(user.id, user.name)).map((user) => user.id);
    const allSelected = availableIds.length > 0 && availableIds.every((id) => selectedUserIds.includes(id));
    setSelectedUserIds((current) => (allSelected ? current.filter((id) => !availableIds.includes(id)) : Array.from(new Set([...current, ...availableIds]))));
  }

  function togglePermission(warehouseId: string, permission: WarehouseAccessPermission) {
    setPermissionsByWarehouse((current) => {
      const warehousePermissions = current[warehouseId] ?? [];
      return {
        ...current,
        [warehouseId]: warehousePermissions.includes(permission)
          ? warehousePermissions.filter((item) => item !== permission)
          : [...warehousePermissions, permission],
      };
    });
  }

  function toggleAllPermissions(warehouseId: string) {
    setPermissionsByWarehouse((current) => ({
      ...current,
      [warehouseId]: (current[warehouseId]?.length ?? 0) === WarehouseAccessPermissionOptions.length ? [] : [...WarehouseAccessPermissionOptions],
    }));
  }

  function togglePermissionForAll(permission: WarehouseAccessPermission) {
    const isEnabledForAll = selectedWarehouses.every((warehouse) => effectivePermissionsByWarehouse[warehouse.id]?.includes(permission));
    setPermissionsByWarehouse((current) =>
      Object.fromEntries([
        ...Object.entries(current).filter(([warehouseId]) => !effectiveWarehouseIds.includes(warehouseId)),
        ...selectedWarehouses.map((warehouse) => {
          const permissions = current[warehouse.id] ?? [WarehouseAccessDefaultPermission];
          return [warehouse.id, isEnabledForAll ? permissions.filter((item) => item !== permission) : Array.from(new Set([...permissions, permission]))];
        }),
      ]),
    );
  }

  function useSamePermissionsForAll() {
    const sourcePermissions = effectivePermissionsByWarehouse[selectedWarehouses[0]?.id] ?? [WarehouseAccessDefaultPermission];
    setPermissionsByWarehouse((current) => ({
      ...current,
      ...Object.fromEntries(selectedWarehouses.map((warehouse) => [warehouse.id, [...sourcePermissions]])),
    }));
  }

  function grantAccess() {
    const assignments = selectedWarehouses.flatMap((warehouse) =>
      selectedUserIds
        .filter((userId) => !warehouseAccess.some((access) => access.warehouseId === warehouse.id && access.userId === userId))
        .map((userId) => ({
          accessLevel: deriveLegacyAccessLevel(effectivePermissionsByWarehouse[warehouse.id] ?? [WarehouseAccessDefaultPermission]),
          permissions: effectivePermissionsByWarehouse[warehouse.id] ?? [WarehouseAccessDefaultPermission],
          status: "Active" as const,
          userId,
          warehouseId: warehouse.id,
        })),
    );

    if (assignments.length === 0) {
      toast.error("No new warehouse access assignments to create.");
      return;
    }

    if (assignments.some((assignment) => assignment.permissions.length === 0)) {
      toast.error("Select at least one warehouse permission.");
      return;
    }

    grantAccessMutation.mutate(assignments);
  }

  return {
    branchFilter,
    branchOptions,
    clearSelectedUsers: () => setSelectedUserIds([]),
    filteredUsers,
    grantAccess,
    hasAccessInEveryWarehouse,
    isLoading: warehousesLoading || accessQuery.isLoading || directoryQuery.isLoading,
    isMutating: grantAccessMutation.isPending,
    permissionsByWarehouse: effectivePermissionsByWarehouse,
    query,
    selectedUserIds,
    selectedWarehouses,
    setBranchFilter,
    setQuery,
    toggleAllFiltered,
    toggleAllPermissions,
    toggleAllWarehouses,
    togglePermission,
    togglePermissionForAll,
    toggleUser,
    toggleWarehouse,
    useSamePermissionsForAll,
    warehouseIds: effectiveWarehouseIds,
    warehouses,
  };
}

function deriveLegacyAccessLevel(permissions: WarehouseAccessPermission[]) {
  if (permissions.length === WarehouseAccessPermissionOptions.length) {
    return "Manager" as const;
  }

  if (permissions.some((permission) => WarehouseAccessStockMovementPermissions.some((movementPermission) => movementPermission === permission))) {
    return "Picker" as const;
  }

  return "Viewer" as const;
}
