import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";
import { PickListHref } from "@/app/src/constants/modules/inventory/pick-list/PickListConstants";
import type {
	PickListActionMode,
	PickListFormValues,
} from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

type PickListFormHeaderProps = {
	mode: PickListActionMode;
	onPreview: () => void;
	values: PickListFormValues;
	onSubmit: () => void;
};

export function PickListFormHeader({
	mode,
	onPreview,
	onSubmit,
	values,
}: PickListFormHeaderProps) {
	const title =
		mode === "view"
			? `View Pick List | ${values.transactionNo}`
			: mode === "edit"
				? `Edit Pick List | ${values.transactionNo}`
				: "Add Pick List";

	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			eyebrow={values.cluster || "Pick List"}
			title={title}
			description={
				mode === "view"
					? "Review delivery, driver, cluster, and pick list rows."
					: "Complete delivery, driver, cluster, and Party Code rows before saving."
			}
			actionsClassName="items-center justify-start gap-2 sm:shrink-0 sm:justify-end [&>a]:shrink-0 [&>button]:shrink-0"
			actions={
				<PickListHeaderActions
					mode={mode}
					onPreview={onPreview}
					onSubmit={onSubmit}
				/>
			}
		/>
	);
}

function PickListHeaderActions({
	mode,
	onPreview,
	onSubmit,
}: {
	mode: PickListActionMode;
	onPreview: () => void;
	onSubmit: () => void;
}) {
	const overflowItems = createOverflowItems(onSubmit);

	return (
		<>
			<Link href={PickListHref} className={moduleHeaderActionClassNames.secondary}>
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
							label="Pick List actions"
						/>
					</div>
					<div className="hidden items-center gap-2 lg:flex">
						<Link
							href={PickListHref}
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
			href: PickListHref,
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
