"use client";

import type { PurchaseRequestRecord } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";
import { openPurchaseRequestPdf } from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestPdf";
import { PurchaseRequestPrintPreview } from "@/app/src/ui/modules/purchasing/purchase-request/PurchaseRequestPrintPreview";

type PurchaseRequestPreviewDrawerProps = {
	isOpen: boolean;
	onClose: () => void;
	record: PurchaseRequestRecord;
};

export function PurchaseRequestPreviewDrawer({
	isOpen,
	onClose,
	record,
}: PurchaseRequestPreviewDrawerProps) {
	return (
		<ReportPreviewDrawer
			className="purchase-request-preview-drawer"
			isOpen={isOpen}
			eyebrow="Purchasing document"
			title="Print Preview"
			description="Review the printable purchase request layout."
			onClose={onClose}
			onGeneratePdf={() => openPurchaseRequestPdf(record)}
		>
			<PurchaseRequestPrintPreview record={record} showControls={false} />
		</ReportPreviewDrawer>
	);
}
