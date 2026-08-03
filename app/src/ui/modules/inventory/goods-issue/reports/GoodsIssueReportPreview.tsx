"use client";

import type { GoodsIssueFormValues } from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import {
	InventoryReportDocument,
	formatInventoryReportCode,
	formatInventoryReportDate,
	formatInventoryReportNumber,
	type InventoryReportTableColumn,
} from "@/app/src/ui/modules/inventory/shared/report/InventoryReportLayout";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type GoodsIssueReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	onGeneratePdf: () => void;
	values: GoodsIssueFormValues;
};

export function GoodsIssueReportPreview({
	isOpen,
	onClose,
	onGeneratePdf,
	values,
}: GoodsIssueReportPreviewProps) {
	return (
		<ReportPreviewDrawer
			isOpen={isOpen}
			eyebrow="Inventory"
			title="Goods Issue Preview"
			description="Review the printable goods issue layout."
			onClose={onClose}
			onGeneratePdf={onGeneratePdf}
		>
			<GoodsIssueReportDocument values={values} />
		</ReportPreviewDrawer>
	);
}

export function GoodsIssueReportDocument({
	values,
}: {
	values: GoodsIssueFormValues;
}) {
	return (
		<InventoryReportDocument
			title="Goods Issue"
			afterTitle={
				<div className="text-[11px] font-bold">
					Date: {formatInventoryReportDate(values.documentDate)}
				</div>
			}
			footerCodeLabel="GI NO."
			footerCodeValue={formatInventoryReportCode(values.transactionNo, "000000")}
			infoRows={[
				{ label: "Source", value: values.sourceWarehouse },
				{ label: "Issue To", value: values.projectRef || values.vceCode },
				{ label: "Name", value: values.vceName },
				{ label: "Remarks", value: values.remarks },
			]}
			tableColumns={GoodsIssueReportColumns}
			tableRows={values.lineEntries
				.filter((entry) => entry.itemCode || entry.itemName)
				.map((entry) => ({
					itemCode: entry.itemCode,
					itemName: entry.itemName,
					uom: entry.uom,
					quantity: formatInventoryReportNumber(entry.issueQuantity),
				}))}
		/>
	);
}

export const GoodsIssueReportColumns = [
	{ key: "itemCode", label: "Item Code", widthClassName: "w-[18%]" },
	{ key: "itemName", label: "ItemName", widthClassName: "w-[55%]" },
	{ key: "uom", label: "UOM", align: "center", widthClassName: "w-[12%]" },
	{ key: "quantity", label: "Issued QTY", align: "right", widthClassName: "w-[15%]" },
] satisfies InventoryReportTableColumn[];
