import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";
import { ServiceInvoiceHref } from "@/app/src/constants/modules/sales/service-invoice/ServiceInvoiceConstants";
import type {
	ServiceInvoiceActionMode,
	ServiceInvoiceFormValues,
} from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

type ServiceInvoiceFormHeaderProps = {
	mode: ServiceInvoiceActionMode;
	onPreview: () => void;
	values: ServiceInvoiceFormValues;
	onSubmit: () => void;
};

export function ServiceInvoiceFormHeader({
	mode,
	onPreview,
	onSubmit,
	values,
}: ServiceInvoiceFormHeaderProps) {
	const title =
		mode === "view"
			? `View Service Invoice | ${values.transactionNo}`
			: mode === "edit"
				? `Edit Service Invoice | ${values.transactionNo}`
				: "Add Service Invoice";

	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			eyebrow={values.referenceNo || "Service invoice"}
			title={title}
			description={
				mode === "view"
					? "Review customer billing details, taxes, and service line entries."
					: "Complete customer details, billing references, taxes, and service entries before saving."
			}
			actionsClassName="items-center justify-start gap-2 sm:shrink-0 sm:justify-end [&>a]:shrink-0 [&>button]:shrink-0"
			actions={
				<ServiceInvoiceHeaderActions
					mode={mode}
					onPreview={onPreview}
					onSubmit={onSubmit}
				/>
			}
		/>
	);
}

function ServiceInvoiceHeaderActions({
	mode,
	onPreview,
	onSubmit,
}: {
	mode: ServiceInvoiceActionMode;
	onPreview: () => void;
	onSubmit: () => void;
}) {
	const overflowItems = createOverflowItems(onSubmit);

	return (
		<>
			<Link
				href={ServiceInvoiceHref}
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
							label="Service invoice actions"
						/>
					</div>
					<div className="hidden items-center gap-2 lg:flex">
						<Link
							href={ServiceInvoiceHref}
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
			href: ServiceInvoiceHref,
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
