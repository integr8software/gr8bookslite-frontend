export const WarehouseQueryKeys = {
  all: (companyId?: number | null) => ["maintenance", "warehouses", companyId ?? "no-company"] as const,
  lists: (companyId?: number | null) => [...WarehouseQueryKeys.all(companyId), "list"] as const,
  list: (companyId?: number | null) => [...WarehouseQueryKeys.lists(companyId), { limit: 500 }] as const,
  details: (companyId?: number | null) => [...WarehouseQueryKeys.all(companyId), "detail"] as const,
  detail: (companyId: number | null | undefined, warehouseId: string) => [...WarehouseQueryKeys.details(companyId), warehouseId] as const,
  warehouses: (companyId?: number | null) => WarehouseQueryKeys.list(companyId),
};
