"use client";

import { useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { WarehouseAccessDefaultPermission, WarehouseAccessHref } from "@/app/src/constants/modules/warehouse-management/warehouse-access/WarehouseAccessConstants";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useWarehousesStore } from "@/app/src/hooks/modules/warehouse-management/warehouses/useWarehouses";
import {
  createWarehouseAccess,
  fetchWarehouseAccessDirectory,
  fetchWarehouseAccessRecord,
  updateWarehouseAccess,
} from "@/app/src/services/modules/warehouse-management/warehouse-access/WarehouseAccessApi";
import { WarehouseAccessQueryKeys } from "@/app/src/services/modules/warehouse-management/warehouse-access/WarehouseAccessQueryKeys";
import type { WarehouseAccessFormValues } from "@/app/src/types/modules/warehouse-management/warehouse-access/WarehouseAccessTypes";
import type {
  WarehouseModuleActionMode,
  WarehouseModuleFormValues,
  WarehouseModuleRecord,
} from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";

export function useWarehouseAccessRecordFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const params = useParams<{ recordId?: string }>();
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const mode = getActionMode(pathname);
  const { isLoading: warehousesLoading, warehouses } = useWarehousesStore();
  const needsRecord = mode !== "add";
  const recordQuery = useQuery({
    queryKey: WarehouseAccessQueryKeys.detail(activeCompanyId, params.recordId),
    queryFn: () => fetchWarehouseAccessRecord(params.recordId ?? ""),
    enabled: activeCompanyId !== null && needsRecord && Boolean(params.recordId),
    retry: false,
  });
  const directoryQuery = useQuery({
    queryKey: WarehouseAccessQueryKeys.directory(activeCompanyId),
    queryFn: fetchWarehouseAccessDirectory,
    enabled: activeCompanyId !== null,
    retry: false,
  });
  const [draftForm, setDraftForm] = useState<WarehouseModuleFormValues | null>(null);
  const row = useMemo<WarehouseModuleRecord | undefined>(() => {
    const record = recordQuery.data;
    if (!record) return undefined;

    return {
      id: `access-${record.warehouseId}-${record.id}`,
      kind: "access",
      recordId: record.id,
      status: record.status,
      values: [record.warehouseName ?? "", record.userName, record.permissions.join(", "), record.status],
      warehouseId: record.warehouseId ?? "",
    };
  }, [recordQuery.data]);

  const recordForm = recordQuery.data
    ? {
        ...createBlankForm(recordQuery.data.warehouseId ?? warehouses[0]?.id ?? ""),
        accessLevel: recordQuery.data.accessLevel,
        permissions: [...recordQuery.data.permissions],
        status: recordQuery.data.status,
        userEmail: recordQuery.data.userEmail ?? "",
        userId: recordQuery.data.userId ?? "",
        userName: recordQuery.data.userName,
        warehouseId: recordQuery.data.warehouseId ?? "",
      }
    : null;
  const form = draftForm ?? recordForm ?? createBlankForm(warehouses[0]?.id ?? "");

  const createMutation = useMutation({
    mutationFn: (values: WarehouseAccessFormValues) => createWarehouseAccess(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: WarehouseAccessQueryKeys.all(activeCompanyId),
      });
      toast.success("Warehouse access created.");
      router.push(WarehouseAccessHref);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not create warehouse access. Please try again.");
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateWarehouseAccess,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: WarehouseAccessQueryKeys.all(activeCompanyId),
      });
      toast.success("Warehouse access updated.");
      router.push(WarehouseAccessHref);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update warehouse access. Please try again.");
    },
  });

  function handleSave(nextForm: WarehouseModuleFormValues) {
    if (!nextForm.userId || !nextForm.warehouseId) {
      toast.error("Select a warehouse and user.");
      return;
    }

    if (nextForm.permissions.length === 0) {
      toast.error("Select at least one warehouse permission.");
      return;
    }

    if (mode === "add") {
      createMutation.mutate({
        accessLevel: nextForm.accessLevel,
        permissions: nextForm.permissions,
        status: nextForm.status === "Inactive" ? "Inactive" : "Active",
        userEmail: nextForm.userEmail,
        userId: nextForm.userId,
        userName: nextForm.userName,
        warehouseId: nextForm.warehouseId,
      });
      return;
    }

    if (!recordQuery.data) return;

    updateMutation.mutate({
      ...recordQuery.data,
      accessLevel: nextForm.accessLevel,
      permissions: nextForm.permissions,
      status: nextForm.status === "Inactive" ? "Inactive" : "Active",
    });
  }

  return {
    form,
    isMutating: createMutation.isPending || updateMutation.isPending,
    isLoading: warehousesLoading || recordQuery.isLoading || directoryQuery.isLoading,
    isNotFound: needsRecord && !recordQuery.isLoading && !recordQuery.data,
    mode,
    row,
    setForm: setDraftForm,
    users: directoryQuery.data?.users ?? [],
    warehouseHref: WarehouseAccessHref,
    warehouses,
    handleSave,
  };
}

function createBlankForm(warehouseId: string): WarehouseModuleFormValues {
  return {
    accessLevel: "Viewer",
    approvedBy: "",
    aisle: "",
    balance: "0",
    binNo: "",
    capacity: "",
    capacityUom: "units",
    date: new Date().toISOString().slice(0, 10),
    destinationWarehouse: "",
    item: "",
    locationCode: "",
    locationName: "",
    locationType: "General Storage",
    notes: "",
    permissions: [WarehouseAccessDefaultPermission],
    quantityIn: "0",
    quantityOut: "0",
    rackNo: "",
    referenceNumber: `ACC-${Date.now().toString().slice(-6)}`,
    requestedBy: "",
    room: "",
    shelfNo: "",
    sourceWarehouse: "",
    status: "Active",
    temperatureZone: "",
    transactionType: "",
    user: "",
    userEmail: "",
    userId: "",
    userName: "",
    warehouseId,
    zone: "",
  };
}

function getActionMode(pathname: string): WarehouseModuleActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
