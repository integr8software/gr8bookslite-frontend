import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function PettyCashFundReplenishmentNotFound() {
	return (
		<ModuleNotFound
			title="Petty cash replenishment not found"
			description="The requested petty cash fund replenishment does not exist or has already been removed."
		/>
	);
}
