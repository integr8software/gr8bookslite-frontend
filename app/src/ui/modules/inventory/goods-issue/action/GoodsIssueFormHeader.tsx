import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";
import { GoodsIssueHref } from "@/app/src/constants/modules/inventory/goods-issue/GoodsIssueConstants";
import type {
	GoodsIssueActionMode,
	GoodsIssueFormValues,
} from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import {
	AppCopyFromDropdown,
	type AppCopyFromRecord,
} from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

type GoodsIssueFormHeaderProps = {
	copyFromRecords: AppCopyFromRecord[];
	mode: GoodsIssueActionMode;
	onCopyFromMaterialRequest: (recordIds: string[]) => void;
	onPreview: () => void;
	values: GoodsIssueFormValues;
	onSubmit: () => void;
};

export function GoodsIssueFormHeader({
	copyFromRecords,
	mode,
	onCopyFromMaterialRequest,
	onPreview,
	onSubmit,
	values,
}: GoodsIssueFormHeaderProps) {
	const title =
		mode === "view"
			? `View Goods Issue | ${values.transactionNo}`
			: mode === "edit"
				? `Edit Goods Issue | ${values.transactionNo}`
				: "Add Goods Issue";

	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			eyebrow={values.transactionType || "Goods Issue"}
			title={title}
			description={
				mode === "view"
					? "Review transaction, warehouse, references, and issued item entries."
					: "Complete transaction, warehouse, Party Code, references, and issued item entries before saving."
			}
			actionsClassName="items-center justify-start gap-2 sm:shrink-0 sm:justify-end [&>a]:shrink-0 [&>button]:shrink-0"
			actions={
				<GoodsIssueHeaderActions
					copyFromRecords={copyFromRecords}
					mode={mode}
					onCopyFromMaterialRequest={onCopyFromMaterialRequest}
					onPreview={onPreview}
					onSubmit={onSubmit}
				/>
			}
		/>
	);
}

function GoodsIssueHeaderActions({
	copyFromRecords,
	mode,
	onCopyFromMaterialRequest,
	onPreview,
	onSubmit,
}: {
	copyFromRecords: AppCopyFromRecord[];
	mode: GoodsIssueActionMode;
	onCopyFromMaterialRequest: (recordIds: string[]) => void;
	onPreview: () => void;
	onSubmit: () => void;
}) {
	const overflowItems = createOverflowItems(onSubmit);

	return (
		<>
			<Link href={GoodsIssueHref} className={moduleHeaderActionClassNames.secondary}>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				Back
			</Link>
			<ReportPreviewAction onPreview={onPreview} />
			{mode === "view" ? null : (
				<>
					<AppCopyFromDropdown
						records={copyFromRecords}
						sources={["Material Request"]}
						onApply={onCopyFromMaterialRequest}
					/>
					<div className="flex lg:hidden">
						<ModuleActionMenu
							className="[&>button]:h-10 [&>button]:w-10"
							items={overflowItems}
							label="Goods Issue actions"
						/>
					</div>
					<div className="hidden items-center gap-2 lg:flex">
						<Link
							href={GoodsIssueHref}
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
		{ href: GoodsIssueHref, icon: X, label: "Cancel", type: "link" },
		{
			icon: Save,
			label: "Save",
			onSelect: onSubmit,
			tone: "primary",
			type: "button",
		},
	];
}
