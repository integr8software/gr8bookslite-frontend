import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function TransactionTypeNotFound() {
	return (
		<ModuleNotFound
			title="Transaction type not found"
			description="The requested transaction type record does not exist or has already been removed."
		/>
	);
}
