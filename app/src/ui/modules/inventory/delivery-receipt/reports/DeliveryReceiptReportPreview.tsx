"use client";

import type { DeliveryReceiptFormValues } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
	InventoryReportDocument,
	formatInventoryReportCode,
	formatInventoryReportDate,
	formatInventoryReportNumber,
	type InventoryReportTableColumn,
} from "@/app/src/ui/modules/inventory/shared/report/InventoryReportLayout";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type DeliveryReceiptReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	onGeneratePdf: () => void;
	values: DeliveryReceiptFormValues;
};

export function DeliveryReceiptReportPreview({
	isOpen,
	onClose,
	onGeneratePdf,
	values,
}: DeliveryReceiptReportPreviewProps) {
	return (
		<ReportPreviewDrawer
			className="delivery-receipt-report-preview-drawer"
			isOpen={isOpen}
			eyebrow="Inventory"
			title="Delivery Receipt Preview"
			description="Review the printable delivery receipt layout."
			onClose={onClose}
			onGeneratePdf={onGeneratePdf}
		>
			<DeliveryReceiptReportDocument values={values} />
		</ReportPreviewDrawer>
	);
}

export function DeliveryReceiptReportDocument({
	values,
}: {
	values: DeliveryReceiptFormValues;
}) {
	return (
		<InventoryReportDocument
			title="Delivery Receipt"
			afterTitle={
				<div className="text-[11px] font-bold">
					<p>Delivery Receipt Date: {formatInventoryReportDate(values.documentDate)}</p>
					<p>Delivery Date: {formatInventoryReportDate(values.deliveryDate)}</p>
				</div>
			}
			footerCodeLabel="DR NO."
			footerCodeValue={formatInventoryReportCode(values.transactionNo, "000000")}
			infoRows={[
				{ label: "Customer", value: values.vceName },
				{ label: "Address", value: values.address },
				{ label: "Driver", value: values.driverName },
				{ label: "FOR", value: values.remarks },
			]}
			tableColumns={DeliveryReceiptReportColumns}
			tableRows={values.lineEntries
				.filter((entry) => entry.itemCode || entry.name || entry.description)
				.map((entry) => ({
					itemName: entry.name || entry.description || entry.itemCode,
					uom: entry.uom,
					quantity: formatInventoryReportNumber(entry.quantity),
					warehouse: entry.warehouse,
				}))}
		/>
	);
}

export const DeliveryReceiptReportColumns = [
	{ key: "itemName", label: "ItemName", widthClassName: "w-[50%]" },
	{ key: "uom", label: "UOM", align: "center", widthClassName: "w-[14%]" },
	{ key: "quantity", label: "Qty", align: "right", widthClassName: "w-[14%]" },
	{ key: "warehouse", label: "Warehouse", widthClassName: "w-[22%]" },
] satisfies InventoryReportTableColumn[];
