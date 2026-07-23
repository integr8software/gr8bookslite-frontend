"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { createWarehouse, fetchWarehouses, updateWarehouse, updateWarehouseStatus } from "@/app/src/services/modules/warehouse-management/warehouses/WarehouseApi";
import { WarehouseQueryKeys } from "@/app/src/services/modules/warehouse-management/warehouses/WarehouseQueryKeys";
import type {
  WarehouseFormValues,
  WarehousePermissions,
  WarehouseRecord,
  WarehouseStatistics,
} from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";

type WarehouseStoreState = {
  warehouses: WarehouseRecord[];
  addWarehouse: (warehouse: WarehouseFormValues) => Promise<WarehouseRecord>;
  updateWarehouse: (warehouse: WarehouseRecord) => Promise<WarehouseRecord>;
  setWarehouseStatus: (warehouseId: string, status: "Active" | "Inactive") => Promise<WarehouseRecord>;
  refreshWarehouses: () => void;
  permissions: WarehousePermissions;
  statistics: WarehouseStatistics;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt: number;
  isMutating: boolean;
};

const EmptyWarehousePermissions: WarehousePermissions = {
  canView: false,
  canCreate: false,
  canUpdate: false,
  canExport: false,
};

const EmptyWarehouseStatistics: WarehouseStatistics = {
  totalWarehouses: 0,
  activeWarehouses: 0,
  inactiveWarehouses: 0,
};

export function useWarehousesStore<TSelected = WarehouseStoreState>(selector?: (state: WarehouseStoreState) => TSelected) {
  const queryClient = useQueryClient();
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const warehousesQuery = useQuery({
    queryKey: WarehouseQueryKeys.warehouses(activeCompanyId),
    queryFn: fetchWarehouses,
    enabled: activeCompanyId !== null,
    retry: false,
  });
  function refreshWarehouses() {
    void queryClient.invalidateQueries({
      queryKey: WarehouseQueryKeys.all(activeCompanyId),
    });
  }

  const addWarehouseMutation = useMutation({
    mutationFn: createWarehouse,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: WarehouseQueryKeys.all(activeCompanyId),
      });
      toast.success("Warehouse created.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not create warehouse. Please try again.");
    },
  });

  const updateWarehouseMutation = useMutation({
    mutationFn: updateWarehouse,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: WarehouseQueryKeys.all(activeCompanyId),
      });
      toast.success("Warehouse updated.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update warehouse. Please try again.");
    },
  });

  const warehouseStatusMutation = useMutation({
    mutationFn: ({ warehouseId, status }: { warehouseId: string; status: "Active" | "Inactive" }) => updateWarehouseStatus({ warehouseId, status }),
    onSuccess: (warehouse) => {
      void queryClient.invalidateQueries({
        queryKey: WarehouseQueryKeys.all(activeCompanyId),
      });
      toast.success(`Warehouse set ${warehouse.status.toLowerCase()}.`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update warehouse status. Please try again.");
    },
  });

  const state: WarehouseStoreState = {
    warehouses: warehousesQuery.data?.warehouses ?? [],
    addWarehouse: (warehouse) => addWarehouseMutation.mutateAsync(warehouse),
    updateWarehouse: (warehouse) => updateWarehouseMutation.mutateAsync(warehouse),
    setWarehouseStatus: (warehouseId, status) => warehouseStatusMutation.mutateAsync({ warehouseId, status }),
    refreshWarehouses,
    permissions: warehousesQuery.data?.permissions ?? EmptyWarehousePermissions,
    statistics: warehousesQuery.data?.statistics ?? EmptyWarehouseStatistics,
    isLoading: warehousesQuery.isLoading,
    isRefreshing: warehousesQuery.isFetching && !warehousesQuery.isLoading,
    lastSyncedAt: warehousesQuery.dataUpdatedAt,
    isMutating: addWarehouseMutation.isPending || updateWarehouseMutation.isPending || warehouseStatusMutation.isPending,
  };

  return selector ? selector(state) : (state as TSelected);
}
