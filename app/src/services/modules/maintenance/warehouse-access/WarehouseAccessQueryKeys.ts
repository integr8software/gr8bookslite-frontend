export const WarehouseAccessQueryKeys = {
  all: (companyId?: number | null) => ["maintenance", "warehouse-access", companyId ?? "no-company"] as const,
  lists: (companyId?: number | null) => [...WarehouseAccessQueryKeys.all(companyId), "list"] as const,
  list: (
    companyId?: number | null,
    filters?: {
      warehouseId?: string;
    },
  ) => [...WarehouseAccessQueryKeys.lists(companyId), filters ?? {}] as const,
  details: (companyId?: number | null) => [...WarehouseAccessQueryKeys.all(companyId), "detail"] as const,
  detail: (companyId: number | null | undefined, recordId: string | undefined) =>
    [...WarehouseAccessQueryKeys.details(companyId), recordId ?? "no-record"] as const,
  directory: (companyId?: number | null) => [...WarehouseAccessQueryKeys.all(companyId), "directory"] as const,
};
