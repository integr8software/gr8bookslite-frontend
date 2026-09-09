export const ProjectMaintenanceQueryKeys = {
  all: () => ["project-maintenance"] as const,
  projects: () => [...ProjectMaintenanceQueryKeys.all(), "projects"] as const,
};
