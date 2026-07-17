import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";
import { DeliveryReceiptHref } from "@/app/src/constants/modules/inventory/delivery-receipt/DeliveryReceiptConstants";
import type {
	DeliveryReceiptActionMode,
	DeliveryReceiptFormValues,
} from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

type DeliveryReceiptFormHeaderProps = {
	mode: DeliveryReceiptActionMode;
	onPreview: () => void;
	values: DeliveryReceiptFormValues;
	onSubmit: () => void;
};

export function DeliveryReceiptFormHeader({
	mode,
	onPreview,
	onSubmit,
	values,
}: DeliveryReceiptFormHeaderProps) {
	const title =
		mode === "view"
			? `View Delivery Receipt | ${values.transactionNo}`
			: mode === "edit"
				? `Edit Delivery Receipt | ${values.transactionNo}`
				: "Add Delivery Receipt";

	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			eyebrow={values.soNo || "Delivery Receipt"}
			title={title}
			description={
				mode === "view"
					? "Review delivery details, customer references, vehicle information, and item entries."
					: "Complete Party Code details, delivery references, vehicle information, and item entries before saving."
			}
			actionsClassName="items-center justify-start gap-2 sm:shrink-0 sm:justify-end [&>a]:shrink-0 [&>button]:shrink-0"
			actions={
				<DeliveryReceiptHeaderActions
					mode={mode}
					onPreview={onPreview}
					onSubmit={onSubmit}
				/>
			}
		/>
	);
}

function DeliveryReceiptHeaderActions({
	mode,
	onPreview,
	onSubmit,
}: {
	mode: DeliveryReceiptActionMode;
	onPreview: () => void;
	onSubmit: () => void;
}) {
	const overflowItems = createOverflowItems(onSubmit);

	return (
		<>
			<Link
				href={DeliveryReceiptHref}
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
							label="Delivery Receipt actions"
						/>
					</div>
					<div className="hidden items-center gap-2 lg:flex">
						<Link
							href={DeliveryReceiptHref}
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
			href: DeliveryReceiptHref,
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
