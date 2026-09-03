export const ServicesMaintenanceQueryKeys = {
  all: (companyId?: number | null) => ["services-maintenance", companyId ?? "no-company"] as const,
  services: (companyId?: number | null) => [...ServicesMaintenanceQueryKeys.all(companyId), "services"] as const,
  options: (companyId?: number | null, serviceType?: string | null) =>
    [...ServicesMaintenanceQueryKeys.all(companyId), "options", serviceType ?? "all"] as const,
  accountOptions: (companyId?: number | null) => [...ServicesMaintenanceQueryKeys.all(companyId), "account-options"] as const,
  nextAccountCode: (companyId?: number | null) => [...ServicesMaintenanceQueryKeys.all(companyId), "next-account-code"] as const,
};
