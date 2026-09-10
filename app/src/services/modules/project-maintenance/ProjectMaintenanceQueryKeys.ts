export const ProjectMaintenanceQueryKeys = {
  all: () => ["project-maintenance"] as const,
  options: (companyId?: number | null) => [...ProjectMaintenanceQueryKeys.all(), "options", companyId] as const,
  projects: () => [...ProjectMaintenanceQueryKeys.all(), "projects"] as const,
};
