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
			.filter((entry) => entry.vceCode || entry.vceName)
			.map((entry) => ({
				code: entry.vceCode,
				name: entry.vceName,
				cs: "0.00",
				pcS: "0.00",
				po: "0.00",
				add: "",
				ttl: "",
				sales: "",
				return: "",
				discount: "",
			})),
	});
}
