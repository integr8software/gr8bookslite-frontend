import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function PettyCashVoucherNotFound() {
	return (
		<ModuleNotFound
			title="Petty cash voucher not found"
			description="The requested petty cash voucher does not exist or has already been removed."
		/>
	);
}
