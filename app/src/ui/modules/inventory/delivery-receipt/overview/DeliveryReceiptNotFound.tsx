import { FileX2 } from "lucide-react";
import { DeliveryReceiptHref } from "@/app/src/constants/modules/inventory/delivery-receipt/DeliveryReceiptConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function DeliveryReceiptNotFound() {
	return (
		<ModuleNotFound
			actionHref={DeliveryReceiptHref}
			actionLabel="Back to delivery receipts"
			icon={<FileX2 className="h-5 w-5" aria-hidden="true" />}
			title="Delivery receipt not found"
			description="The delivery receipt may have been removed or the link is no longer valid."
		/>
	);
}
