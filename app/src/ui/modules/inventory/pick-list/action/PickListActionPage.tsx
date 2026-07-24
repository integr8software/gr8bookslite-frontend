"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PickListHref } from "@/app/src/constants/modules/inventory/pick-list/PickListConstants";
import { PickListSalesOrderCopyRecords } from "@/app/src/data/modules/inventory/pick-list/PickListData";
import { usePickListActionForm } from "@/app/src/hooks/modules/inventory/pick-list/usePickList";
import type { PickListActionMode } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import { PickListDetailsForm } from "@/app/src/ui/modules/inventory/pick-list/action/PickListDetailsForm";
import { PickListFormHeader } from "@/app/src/ui/modules/inventory/pick-list/action/PickListFormHeader";
import { PickListEntrySection } from "@/app/src/ui/modules/inventory/pick-list/entries/PickListEntrySection";
import { PickListNotFound } from "@/app/src/ui/modules/inventory/pick-list/overview/PickListNotFound";
import { openPickListPdf } from "@/app/src/ui/modules/inventory/pick-list/reports/PickListPdf";
import { PickListReportPreview } from "@/app/src/ui/modules/inventory/pick-list/reports/PickListReportPreview";
import type { AppCopyFromRecord } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

export function PickListActionPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const mode = getModeFromPathname(pathname);
	const isReadonly = mode === "view";
	const recordId =
		typeof params.recordId === "string" ? params.recordId : undefined;
	const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
	const pickListForm = usePickListActionForm(mode, recordId, () => {
		router.push(PickListHref);
	});
	const salesOrderCopyRecords = useMemo<AppCopyFromRecord[]>(
		() =>
			PickListSalesOrderCopyRecords.map((record) => ({
				documentDate: record.documentDate,
				id: record.id,
				partyName: record.customerName,
				remarks: record.remarks,
				source: "Sales Order",
				sourceNo: record.sourceNo,
			})),
		[],
	);

	if (pickListForm.isRecordMissing) {
		return <PickListNotFound />;
	}

	return (
		<>
			<section className="grid gap-5">
				<PickListFormHeader
					copyFromRecords={salesOrderCopyRecords}
					mode={mode}
					onCopyFromSalesOrder={pickListForm.copyFromSalesOrders}
					onPreview={() => setIsReportPreviewOpen(true)}
					values={pickListForm.values}
					onSubmit={pickListForm.submitPickList}
				/>
				<PickListDetailsForm
					isReadonly={isReadonly}
					values={pickListForm.values}
					onUpdateField={pickListForm.updateField}
				/>
				<PickListEntrySection
					isReadonly={isReadonly}
					rows={pickListForm.values.lineEntries}
					onRowsChange={pickListForm.updateLineEntries}
				/>
			</section>
			<PickListReportPreview
				isOpen={isReportPreviewOpen}
				values={pickListForm.values}
				onClose={() => setIsReportPreviewOpen(false)}
				onGeneratePdf={() => openPickListPdf(pickListForm.values)}
			/>
		</>
	);
}

function getModeFromPathname(pathname: string): PickListActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
