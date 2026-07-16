export const MaintenanceSavingLabel = "Saving...";
export const MaintenanceUpdatingLabel = "Updating...";

export function getMaintenanceSavePendingLabel(mode?: string | null) {
	return mode === "edit" ? MaintenanceUpdatingLabel : MaintenanceSavingLabel;
}
