import Link from "next/link";
import { ArrowLeft, FileText, Save } from "lucide-react";
import {
	PurchaseOrderFormPageCopy,
	PurchaseOrderHref,
} from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import type {
	PurchaseOrderFormHeaderProps,
	PurchaseOrderFormMode,
} from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

export function PurchaseOrderFormHeader({
	copyFromRecords,
	isSubmitting = false,
	mode,
	onCopyFromSource,
	onPreview,
	onSubmit,
	recordId,
	values,
}: PurchaseOrderFormHeaderProps) {
	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={getTitle(mode, values.transNo)}
			description={PurchaseOrderFormPageCopy[mode].description}
			eyebrow={
				<>
					<FileText className="h-3.5 w-3.5" aria-hidden="true" />
					Purchasing document
				</>
			}
			actions={
				<>
					<Link
						href={PurchaseOrderHref}
						className={moduleHeaderActionClassNames.secondary}
					>
						<ArrowLeft className="h-4 w-4" aria-hidden="true" />
						Back
					</Link>
					<ReportPreviewAction onPreview={onPreview} />
					{mode === "view" ? (
						<Link
							href={`${PurchaseOrderHref}/edit/${recordId ?? ""}`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Edit
						</Link>
					) : (
						<>
							<AppCopyFromDropdown
								disabled={Boolean(values.copyFromSource)}
								records={copyFromRecords}
								sources={["Purchase Request", "Canvass"]}
								onApply={onCopyFromSource}
							/>
							<button
								type="button"
								disabled={isSubmitting}
								onClick={onSubmit}
								className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								{isSubmitting ? "Saving..." : "Save"}
							</button>
						</>
					)}
				</>
			}
		/>
	);
}

function getTitle(mode: PurchaseOrderFormMode, transNo: string) {
	if (mode === "add") return PurchaseOrderFormPageCopy.add.title;
	if (mode === "edit") return `${PurchaseOrderFormPageCopy.edit.title} ${transNo}`;

	return `${PurchaseOrderFormPageCopy.view.title} ${transNo}`;
}
