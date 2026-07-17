"use client";

import type { GoodsReceiptFormValues } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import {
	InventoryReportDocument,
	formatInventoryReportCode,
	formatInventoryReportDate,
	formatInventoryReportNumber,
	type InventoryReportTableColumn,
} from "@/app/src/ui/modules/inventory/shared/report/InventoryReportLayout";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type GoodsReceiptReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	onGeneratePdf: () => void;
	values: GoodsReceiptFormValues;
};

export function GoodsReceiptReportPreview({
	isOpen,
	onClose,
	onGeneratePdf,
	values,
}: GoodsReceiptReportPreviewProps) {
	return (
		<ReportPreviewDrawer
			isOpen={isOpen}
			eyebrow="Inventory"
			title="Goods Receipt Preview"
			description="Review the printable goods receipt layout."
			onClose={onClose}
			onGeneratePdf={onGeneratePdf}
		>
			<GoodsReceiptReportDocument values={values} />
		</ReportPreviewDrawer>
	);
}

export function GoodsReceiptReportDocument({
	values,
}: {
	values: GoodsReceiptFormValues;
}) {
	return (
		<InventoryReportDocument
			title="Goods Receipt"
			afterTitle={
				<div className="text-[11px] font-bold">
					Date: {formatInventoryReportDate(values.documentDate)}
				</div>
			}
			footerCodeLabel="GR NO."
			footerCodeValue={formatInventoryReportCode(values.transactionNo, "000000")}
			infoRows={[
				{ label: "Source", value: values.sourceWarehouse },
				{ label: "Issue To", value: values.projectRef || values.vceCode },
				{ label: "Name", value: values.vceName },
				{ label: "Remarks", value: values.remarks },
			]}
			tableColumns={GoodsReceiptReportColumns}
			tableRows={values.lineEntries
				.filter((entry) => entry.itemCode || entry.itemName)
				.map((entry) => ({
					itemCode: entry.itemCode,
					itemName: entry.itemName,
					uom: entry.uom,
					quantity: formatInventoryReportNumber(entry.receivedQuantity),
				}))}
		/>
	);
}

export const GoodsReceiptReportColumns = [
	{ key: "itemCode", label: "Item Code", widthClassName: "w-[18%]" },
	{ key: "itemName", label: "ItemName", widthClassName: "w-[55%]" },
	{ key: "uom", label: "UOM", align: "center", widthClassName: "w-[12%]" },
	{ key: "quantity", label: "Issued QTY", align: "right", widthClassName: "w-[15%]" },
] satisfies InventoryReportTableColumn[];
