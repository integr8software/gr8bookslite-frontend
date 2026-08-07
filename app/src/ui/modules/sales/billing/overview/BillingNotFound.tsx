import { FileQuestion } from "lucide-react";
import { BillingHref } from "@/app/src/constants/modules/sales/billing/BillingConstants";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function BillingNotFound() {
	return (
		<ModuleNotFound
			actionHref={BillingHref}
			actionLabel="Back to Billing"
			description="The billing record may have been removed or is no longer available."
			icon={<FileQuestion className="h-5 w-5" aria-hidden="true" />}
			title="Billing not found"
			titleAs="h1"
		/>
	);
}
