"use client";

import { useParams } from "next/navigation";
import { WarehouseHref } from "@/app/src/constants/modules/maintenance/warehouses/WarehouseConstants";
import { useWarehousesStore } from "@/app/src/hooks/modules/maintenance/warehouses/useWarehouses";

export function useWarehouseItemsPage() {
  const params = useParams<{ recordId?: string }>();
  const { warehouses } = useWarehousesStore();
  const warehouse = warehouses.find((currentWarehouse) => currentWarehouse.id === params.recordId);

  return {
    warehouse,
    warehouseHref: WarehouseHref,
  };
}
