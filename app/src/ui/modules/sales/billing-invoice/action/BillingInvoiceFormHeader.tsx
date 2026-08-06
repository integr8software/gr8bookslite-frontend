import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";
import { BillingInvoiceHref } from "@/app/src/constants/modules/sales/billing-invoice/BillingInvoiceConstants";
import type {
	BillingInvoiceActionMode,
	BillingInvoiceFormValues,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

type BillingInvoiceFormHeaderProps = {
	mode: BillingInvoiceActionMode;
	onPreview: () => void;
	values: BillingInvoiceFormValues;
	onSubmit: () => void;
};

export function BillingInvoiceFormHeader({
	mode,
	onPreview,
	onSubmit,
	values,
}: BillingInvoiceFormHeaderProps) {
	const title =
		mode === "view"
			? `View Billing Invoice | ${values.transactionNo}`
			: mode === "edit"
				? `Edit Billing Invoice | ${values.transactionNo}`
				: "Add Billing Invoice";

	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			eyebrow={values.referenceNo || "Billing Invoice"}
			title={title}
			description={
				mode === "view"
					? "Review customer billing details, taxes, shipment references, and line entries."
					: "Complete customer details, billing references, shipment details, taxes, and line entries before saving."
			}
			actionsClassName="items-center justify-start gap-2 sm:shrink-0 sm:justify-end [&>a]:shrink-0 [&>button]:shrink-0"
			actions={
				<BillingInvoiceHeaderActions
					mode={mode}
					onPreview={onPreview}
					onSubmit={onSubmit}
				/>
			}
		/>
	);
}

function BillingInvoiceHeaderActions({
	mode,
	onPreview,
	onSubmit,
}: {
	mode: BillingInvoiceActionMode;
	onPreview: () => void;
	onSubmit: () => void;
}) {
	const overflowItems = createOverflowItems(onSubmit);

	return (
		<>
			<Link
				href={BillingInvoiceHref}
				className={moduleHeaderActionClassNames.secondary}
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back
			</Link>
			<ReportPreviewAction onPreview={onPreview} />
			{mode === "view" ? null : (
				<>
					<div className="flex lg:hidden">
						<ModuleActionMenu
							className="[&>button]:h-10 [&>button]:w-10"
							items={overflowItems}
							label="Billing Invoice actions"
						/>
					</div>
					<div className="hidden items-center gap-2 lg:flex">
						<Link
							href={BillingInvoiceHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<X className="h-4 w-4" aria-hidden="true" />
							Cancel
						</Link>
						<button
							type="button"
							onClick={onSubmit}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Save
						</button>
					</div>
				</>
			)}
		</>
	);
}

function createOverflowItems(onSubmit: () => void): ModuleActionMenuItem[] {
	return [
		{
			href: BillingInvoiceHref,
			icon: X,
			label: "Cancel",
			type: "link",
		},
		{
			icon: Save,
			label: "Save",
			onSelect: onSubmit,
			tone: "primary",
			type: "button",
		},
	];
}

