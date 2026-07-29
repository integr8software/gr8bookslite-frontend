"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DeliveryReceiptHref } from "@/app/src/constants/modules/inventory/delivery-receipt/DeliveryReceiptConstants";
import { useDeliveryReceiptActionForm } from "@/app/src/hooks/modules/inventory/delivery-receipt/useDeliveryReceipt";
import { getInitialPickLists } from "@/app/src/data/modules/inventory/pick-list/PickListData";
import type { DeliveryReceiptActionMode } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
	DeliveryReceiptDetailsForm,
	type DeliveryReceiptDetailsSection,
} from "@/app/src/ui/modules/inventory/delivery-receipt/action/DeliveryReceiptDetailsForm";
import { DeliveryReceiptFormHeader } from "@/app/src/ui/modules/inventory/delivery-receipt/action/DeliveryReceiptFormHeader";
import { DeliveryReceiptEntrySection } from "@/app/src/ui/modules/inventory/delivery-receipt/entries/DeliveryReceiptEntrySection";
import { DeliveryReceiptNotFound } from "@/app/src/ui/modules/inventory/delivery-receipt/overview/DeliveryReceiptNotFound";
import { openDeliveryReceiptPdf } from "@/app/src/ui/modules/inventory/delivery-receipt/reports/DeliveryReceiptPdf";
import { DeliveryReceiptReportPreview } from "@/app/src/ui/modules/inventory/delivery-receipt/reports/DeliveryReceiptReportPreview";
import {
	ModuleTabs,
	type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import type { AppCopyFromRecord } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

export function DeliveryReceiptActionPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const mode = getModeFromPathname(pathname);
	const isReadonly = mode === "view";
	const recordId =
		typeof params.recordId === "string" ? params.recordId : undefined;
	const [activeTab, setActiveTab] =
		useState<DeliveryReceiptDetailsSection>("customer");
	const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
	const receiptForm = useDeliveryReceiptActionForm(mode, recordId, () => {
		router.push(DeliveryReceiptHref);
	});
	const pickListCopyRecords = useMemo<AppCopyFromRecord[]>(
		() =>
			getInitialPickLists().map((pickList) => ({
				documentDate: pickList.documentDate,
				id: pickList.id,
				partyName:
					pickList.formValues?.lineEntries.find((entry) =>
						entry.vceName.trim(),
					)?.vceName ?? "",
				remarks: pickList.formValues?.remarks,
				source: "Pick List",
				sourceNo: pickList.transactionNo,
			})),
		[],
	);

	if (receiptForm.isRecordMissing) {
		return <DeliveryReceiptNotFound />;
	}

	return (
		<>
			<section className="grid gap-5">
				<DeliveryReceiptFormHeader
					copyFromRecords={pickListCopyRecords}
					mode={mode}
					onCopyFromPickList={receiptForm.copyFromPickLists}
					onPreview={() => setIsReportPreviewOpen(true)}
					values={receiptForm.values}
					onSubmit={receiptForm.submitReceipt}
				/>
				<ModuleTabs
					activeTab={activeTab}
					ariaLabel="Delivery receipt sections"
					tabs={DeliveryReceiptTabs}
					onTabChange={setActiveTab}
				/>
				<DeliveryReceiptDetailsForm
					isReadonly={isReadonly}
					section={activeTab}
					values={receiptForm.values}
					onUpdateField={receiptForm.updateField}
				/>
				<DeliveryReceiptEntrySection
					isReadonly={isReadonly}
					rows={receiptForm.values.lineEntries}
					onRowsChange={receiptForm.updateLineEntries}
				/>
			</section>
			<DeliveryReceiptReportPreview
				isOpen={isReportPreviewOpen}
				values={receiptForm.values}
				onClose={() => setIsReportPreviewOpen(false)}
				onGeneratePdf={() => openDeliveryReceiptPdf(receiptForm.values)}
			/>
		</>
	);
}

const DeliveryReceiptTabs = [
	{ id: "customer", label: "Customer / Billing" },
	{ id: "delivery", label: "Delivery / Vehicle" },
	{ id: "attachment", label: "File Attachment" },
] satisfies ModuleTabItem<DeliveryReceiptDetailsSection>[];

function getModeFromPathname(pathname: string): DeliveryReceiptActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
