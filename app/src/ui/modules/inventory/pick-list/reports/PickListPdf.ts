import type { PickListFormValues } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import { formatInventoryReportDate } from "@/app/src/ui/modules/inventory/shared/report/InventoryReportLayout";
import { openInventoryReportPdf } from "@/app/src/ui/modules/inventory/shared/report/InventoryReportPdf";
import { PickListReportColumns } from "@/app/src/ui/modules/inventory/pick-list/reports/PickListReportPreview";

export function openPickListPdf(values: PickListFormValues) {
	openInventoryReportPdf({
		title: "TRUCKLOAD",
		titleLayout: "centerWithInfo",
		beforeTitle: [`Date: ${formatInventoryReportDate(values.documentDate)}`],
		afterTitle: [values.cluster || "Cluster"],
		signatures: [
			{ label: "PREPARED BY" },
			{ label: "APPROVED BY" },
			{ label: "RELEASED BY" },
			{ label: "RECEIVED BY" },
		],
		tableColumns: PickListReportColumns,
		tableRows: values.lineEntries
			.filter((entry) => entry.itemCode || entry.itemName)
			.map((entry) => ({
				soNo: entry.soNo,
				itemCode: entry.itemCode,
				barcode: entry.barcode,
				itemName: entry.itemName,
				soQuantity: entry.soQuantity,
				plQuantity: entry.plQuantity,
				uom: entry.uom,
				expirationDate: entry.expirationDate,
				lotNo: entry.lotNo,
			})),
	});
}
