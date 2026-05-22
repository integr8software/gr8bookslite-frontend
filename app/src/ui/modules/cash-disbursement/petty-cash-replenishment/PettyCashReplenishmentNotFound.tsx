import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function PettyCashReplenishmentNotFound() {
	return (
		<ModuleNotFound
			title="Petty cash replenishment not found"
			description="The requested petty cash replenishment does not exist or has already been removed."
		/>
	);
}
