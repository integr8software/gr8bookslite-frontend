import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function DiscountManagementNotFound() {
	return (
		<ModuleNotFound
			title="Discount not found"
			description="The requested discount record does not exist or has already been removed."
		/>
	);
}
