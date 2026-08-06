"use client";

import type { SalesQuotationRecord } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";
import { openSalesQuotationPdf } from "@/app/src/ui/modules/sales/sales-quotation/reports/SalesQuotationPdf";
import { SalesQuotationPrintPreview } from "@/app/src/ui/modules/sales/sales-quotation/reports/SalesQuotationPrintPreview";

type SalesQuotationPreviewDrawerProps = {
	isOpen: boolean;
	onClose: () => void;
	record: SalesQuotationRecord;
};

export function SalesQuotationPreviewDrawer({
	isOpen,
	onClose,
	record,
}: SalesQuotationPreviewDrawerProps) {
	return (
		<ReportPreviewDrawer
			className="sales-quotation-preview-drawer"
			isOpen={isOpen}
			eyebrow="Sales document"
			title="Print Preview"
			description="Review the printable sales quotation layout."
			onClose={onClose}
			onGeneratePdf={() => openSalesQuotationPdf(record)}
		>
			<SalesQuotationPrintPreview record={record} showControls={false} />
		</ReportPreviewDrawer>
	);
}

