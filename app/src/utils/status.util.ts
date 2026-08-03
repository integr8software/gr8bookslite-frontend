export const MaintenanceActiveStatusSwitchOption = {
  label: "Active",
  value: "Active",
} as const;

export const MaintenanceInactiveStatusSwitchOption = {
  label: "Inactive",
  value: "Inactive",
} as const;

export function isActiveStatus(status: string) {
  return status.trim().toUpperCase() === "ACTIVE";
}
