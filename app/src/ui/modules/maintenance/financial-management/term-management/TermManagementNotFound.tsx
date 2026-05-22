import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function TermManagementNotFound() {
	return (
		<ModuleNotFound
			title="Term not found"
			description="The requested term record does not exist or has already been removed."
		/>
	);
}
