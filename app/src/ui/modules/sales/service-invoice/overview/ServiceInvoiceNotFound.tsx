import { FileQuestion } from "lucide-react";
import { ServiceInvoiceHref } from "@/app/src/constants/modules/sales/service-invoice/ServiceInvoiceConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function ServiceInvoiceNotFound() {
	return (
		<ModuleNotFound
			actionHref={ServiceInvoiceHref}
			actionLabel="Back to Service Invoice"
			description="The service invoice record may have been removed or is no longer available."
			icon={<FileQuestion className="h-5 w-5" aria-hidden="true" />}
			title="Service invoice not found"
			titleAs="h1"
		/>
	);
}
