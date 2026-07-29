"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardList, History, Save } from "lucide-react";
import { InventoryCountHref } from "@/app/src/constants/modules/inventory/inventory-count/InventoryCountConstants";
import {
	getInventoryCountTitle,
	useInventoryCountFormPage,
} from "@/app/src/hooks/modules/inventory/inventory-count/useInventoryCountFormPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";
import { openInventoryCountPdf } from "./InventoryCountPdf";
import { InventoryCountHeaderFields } from "./InventoryCountHeaderFields";
import { InventoryCountItemsTable } from "./InventoryCountItemsTable";
import { InventoryCountReportPreview } from "./InventoryCountReportPreview";
import { InventoryCountUploadHistoryDialog } from "./InventoryCountUploadHistoryDialog";

export function InventoryCountFormPage() {
	const page = useInventoryCountFormPage();

	return (
		<>
			<form className="grid gap-5" onSubmit={page.handleSubmit}>
				<ModuleHeader
					variant="panel"
					titleAs="h1"
					title={getInventoryCountTitle(page.mode, page.values.countNo)}
					description={
						page.mode === "view"
							? "Review inventory count details, counted quantities, and variances."
							: "Complete warehouse count details and item quantities before saving."
					}
					eyebrow={
						<>
							<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
							Inventory Count
						</>
					}
					actions={
						<div className="flex flex-wrap gap-2">
							<Link
								href={InventoryCountHref}
								className={moduleHeaderActionClassNames.secondary}
							>
								<ArrowLeft className="h-4 w-4" aria-hidden="true" />
								Back
							</Link>
							<ReportPreviewAction
								onPreview={() => page.setIsReportPreviewOpen(true)}
							/>
							<button
								type="button"
								className={moduleHeaderActionClassNames.secondary}
								onClick={() => page.setIsUploadHistoryDialogOpen(true)}
							>
								<History className="h-4 w-4" aria-hidden="true" />
								Upload Count History
							</button>
							{!page.isReadonly ? (
								<>
									<AppCopyFromDropdown
										records={page.copyFromRecords}
										sources={["Sales Order", "Job Order"]}
										onApply={page.copyFromSourceTransactions}
									/>
									<button
										type="submit"
										className={moduleHeaderActionClassNames.primary}
									>
										<Save className="h-4 w-4" aria-hidden="true" />
										Save
									</button>
								</>
							) : null}
						</div>
					}
				/>

				<InventoryCountHeaderFields
					isReadonly={page.isReadonly}
					values={page.values}
					onChange={page.updateField}
				/>

				<InventoryCountItemsTable rows={page.values.lines} />
			</form>
			<InventoryCountReportPreview
				isOpen={page.isReportPreviewOpen}
				values={page.values}
				onClose={() => page.setIsReportPreviewOpen(false)}
				onPrint={() => openInventoryCountPdf(page.values)}
			/>
			<InventoryCountUploadHistoryDialog
				isOpen={page.isUploadHistoryDialogOpen}
				rows={page.values.uploadHistory}
				onClose={() => page.setIsUploadHistoryDialogOpen(false)}
			/>
		</>
	);
}
