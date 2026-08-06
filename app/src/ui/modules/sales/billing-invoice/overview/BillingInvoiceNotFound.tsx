import { FileQuestion } from "lucide-react";
import { BillingInvoiceHref } from "@/app/src/constants/modules/sales/billing-invoice/BillingInvoiceConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function BillingInvoiceNotFound() {
	return (
		<ModuleNotFound
			actionHref={BillingInvoiceHref}
			actionLabel="Back to Billing Invoice"
			description="The billing invoice record may have been removed or is no longer available."
			icon={<FileQuestion className="h-5 w-5" aria-hidden="true" />}
			title="Billing invoice not found"
			titleAs="h1"
		/>
	);
}

