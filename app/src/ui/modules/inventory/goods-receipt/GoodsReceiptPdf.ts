import type { GoodsReceiptFormValues } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import {
	formatInventoryReportCode,
	formatInventoryReportDate,
	formatInventoryReportNumber,
} from "@/app/src/ui/modules/inventory/shared/report/InventoryReportLayout";
import { openInventoryReportPdf } from "@/app/src/ui/modules/inventory/shared/report/InventoryReportPdf";
import { GoodsReceiptReportColumns } from "@/app/src/ui/modules/inventory/goods-receipt/GoodsReceiptReportPreview";

export function openGoodsReceiptPdf(values: GoodsReceiptFormValues) {
	openInventoryReportPdf({
		title: "Goods Receipt",
		afterTitle: [`Date: ${formatInventoryReportDate(values.documentDate)}`],
		codeLabel: "GR NO.",
		codeValue: formatInventoryReportCode(values.transactionNo, "000000"),
		infoRows: [
			{ label: "Source", value: values.sourceWarehouse },
			{ label: "Issue To", value: values.projectRef || values.vceCode },
			{ label: "Name", value: values.vceName },
			{ label: "Remarks", value: values.remarks },
		],
		tableColumns: GoodsReceiptReportColumns,
		tableRows: values.lineEntries
			.filter((entry) => entry.itemCode || entry.itemName)
			.map((entry) => ({
				itemCode: entry.itemCode,
				itemName: entry.itemName,
				uom: entry.uom,
				quantity: formatInventoryReportNumber(entry.receivedQuantity),
			})),
	});
}
