import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";
import { BillingHref } from "@/app/src/constants/modules/sales/billing/BillingConstants";
import type {
	BillingActionMode,
	BillingFormValues,
} from "@/app/src/types/modules/sales/billing/BillingTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import {
	AppCopyFromDropdown,
	type AppCopyFromRecord,
} from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

type BillingFormHeaderProps = {
	mode: BillingActionMode;
	onPreview: () => void;
	values: BillingFormValues;
	onSubmit: () => void;
};

export function BillingFormHeader({
	mode,
	onPreview,
	onSubmit,
	values,
}: BillingFormHeaderProps) {
	const title =
		mode === "view"
			? `View Billing | ${values.transactionNo}`
			: mode === "edit"
				? `Edit Billing | ${values.transactionNo}`
				: "Add Billing";

	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			eyebrow={values.referenceNo || "Billing"}
			title={title}
			description={
				mode === "view"
					? "Review customer billing details, taxes, and billing line entries."
					: "Complete customer details, billing references, taxes, and billing entries before saving."
			}
			actionsClassName="items-center justify-start gap-2 sm:shrink-0 sm:justify-end [&>a]:shrink-0 [&>button]:shrink-0"
			actions={
				<BillingHeaderActions
					mode={mode}
					onPreview={onPreview}
					onSubmit={onSubmit}
				/>
			}
		/>
	);
}

function BillingHeaderActions({
	mode,
	onPreview,
	onSubmit,
}: {
	mode: BillingActionMode;
	onPreview: () => void;
	onSubmit: () => void;
}) {
	const overflowItems = createOverflowItems(onSubmit);

	return (
		<>
			<Link
				href={BillingHref}
				className={moduleHeaderActionClassNames.secondary}
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back
			</Link>
			<ReportPreviewAction onPreview={onPreview} />
			{mode === "view" ? null : (
				<>
					<AppCopyFromDropdown
						records={BillingCopyFromRecords}
						sources={["SQ"]}
						onApply={() => undefined}
					/>
					<div className="flex lg:hidden">
						<ModuleActionMenu
							className="[&>button]:h-10 [&>button]:w-10"
							items={overflowItems}
							label="Billing actions"
						/>
					</div>
					<div className="hidden items-center gap-2 lg:flex">
						<Link
							href={BillingHref}
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
			href: BillingHref,
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

const BillingCopyFromRecords: AppCopyFromRecord[] = [];
