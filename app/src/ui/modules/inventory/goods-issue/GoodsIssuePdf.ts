import type { GoodsIssueFormValues } from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import {
	formatInventoryReportCode,
	formatInventoryReportDate,
	formatInventoryReportNumber,
} from "@/app/src/ui/modules/inventory/shared/report/InventoryReportLayout";
import { openInventoryReportPdf } from "@/app/src/ui/modules/inventory/shared/report/InventoryReportPdf";
import { GoodsIssueReportColumns } from "@/app/src/ui/modules/inventory/goods-issue/GoodsIssueReportPreview";

export function openGoodsIssuePdf(values: GoodsIssueFormValues) {
	openInventoryReportPdf({
		title: "Goods Issue",
		afterTitle: [`Date: ${formatInventoryReportDate(values.documentDate)}`],
		codeLabel: "GI NO.",
		codeValue: formatInventoryReportCode(values.transactionNo, "000000"),
		infoRows: [
			{ label: "Source", value: values.sourceWarehouse },
			{ label: "Issue To", value: values.projectRef || values.vceCode },
			{ label: "Name", value: values.vceName },
			{ label: "Remarks", value: values.remarks },
		],
		tableColumns: GoodsIssueReportColumns,
		tableRows: values.lineEntries
			.filter((entry) => entry.itemCode || entry.description)
			.map((entry) => ({
				itemCode: entry.itemCode,
				itemName: entry.description,
				uom: entry.uom,
				quantity: formatInventoryReportNumber(entry.issueQuantity),
			})),
	});
}
