import Link from "next/link";
import { Download, Plus, Upload } from "lucide-react";
import { BillingInvoiceHref } from "@/app/src/constants/modules/sales/billing-invoice/BillingInvoiceConstants";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function BillingInvoiceListHeaderActions() {
	return (
		<>
			<div className="flex lg:hidden">
				<ModuleActionMenu
					className="[&>button]:h-10 [&>button]:w-10"
					items={BillingInvoiceListOverflowItems}
					label="Billing Invoice list actions"
				/>
			</div>
			<div className="hidden items-center gap-2 lg:flex">
				<button
					type="button"
					className={moduleHeaderActionClassNames.secondary}
				>
					<Upload className="h-4 w-4" aria-hidden="true" />
					Upload
				</button>
				<button
					type="button"
					className={moduleHeaderActionClassNames.secondary}
				>
					<Download className="h-4 w-4" aria-hidden="true" />
					Export
				</button>
			</div>
			<Link
				href={`${BillingInvoiceHref}/add`}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Start New Billing Invoice
			</Link>
		</>
	);
}

const BillingInvoiceListOverflowItems = [
	{
		icon: Upload,
		label: "Upload",
		onSelect: () => undefined,
		type: "button",
	},
	{
		icon: Download,
		label: "Export",
		onSelect: () => undefined,
		type: "button",
	},
] satisfies ModuleActionMenuItem[];
