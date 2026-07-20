import type { DeliveryReceiptFormValues } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import {
	formatInventoryReportCode,
	formatInventoryReportDate,
	formatInventoryReportNumber,
} from "@/app/src/ui/modules/inventory/shared/report/InventoryReportLayout";
import { openInventoryReportPdf } from "@/app/src/ui/modules/inventory/shared/report/InventoryReportPdf";
import { DeliveryReceiptReportColumns } from "@/app/src/ui/modules/inventory/delivery-receipt/DeliveryReceiptReportPreview";

export function openDeliveryReceiptPdf(values: DeliveryReceiptFormValues) {
	openInventoryReportPdf({
		title: "Delivery Receipt",
		afterTitle: [
			`Delivery Receipt Date: ${formatInventoryReportDate(values.documentDate)}`,
			`Delivery Date: ${formatInventoryReportDate(values.deliveryDate)}`,
		],
		codeLabel: "DR NO.",
		codeValue: formatInventoryReportCode(values.transactionNo, "000000"),
		infoRows: [
			{ label: "Customer", value: values.vceName },
			{ label: "Address", value: values.address },
			{ label: "Driver", value: values.driverName },
			{ label: "FOR", value: values.remarks },
		],
		tableColumns: DeliveryReceiptReportColumns,
		tableRows: values.lineEntries
			.filter((entry) => entry.itemCode || entry.name || entry.description)
			.map((entry) => ({
				itemName: entry.name || entry.description || entry.itemCode,
				uom: entry.uom,
				quantity: formatInventoryReportNumber(entry.quantity),
				warehouse: entry.warehouse,
			})),
	});
}
