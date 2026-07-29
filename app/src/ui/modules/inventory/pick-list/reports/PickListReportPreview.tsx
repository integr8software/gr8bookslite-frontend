"use client";

import type { PickListFormValues } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import {
	InventoryReportDocument,
	formatInventoryReportDate,
	formatInventoryReportNumber,
	type InventoryReportTableColumn,
} from "@/app/src/ui/modules/inventory/shared/report/InventoryReportLayout";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type PickListReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	onGeneratePdf: () => void;
	values: PickListFormValues;
};

export function PickListReportPreview({
	isOpen,
	onClose,
	onGeneratePdf,
	values,
}: PickListReportPreviewProps) {
	return (
		<ReportPreviewDrawer
			isOpen={isOpen}
			eyebrow="Inventory"
			title="Pick List Preview"
			description="Review the printable pick list layout."
			onClose={onClose}
			onGeneratePdf={onGeneratePdf}
		>
			<InventoryReportDocument
				title="TRUCKLOAD"
				titleLayout="centerWithInfo"
				beforeTitle={
					<div className="text-[11px] font-bold">
						Date:{" "}
						<span className="font-normal">
							{formatInventoryReportDate(values.documentDate)}
						</span>
					</div>
				}
				afterTitle={
					<div className="text-[11px] font-bold">
						{values.cluster || "Cluster"}
					</div>
				}
				signatures={[
					{ label: "PREPARED BY" },
					{ label: "APPROVED BY" },
					{ label: "RELEASED BY" },
					{ label: "RECEIVED BY" },
				]}
				tableColumns={PickListReportColumns}
				tableRows={values.lineEntries
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
					}))}
			/>
		</ReportPreviewDrawer>
	);
}

export const PickListReportColumns = [
	{ key: "soNo", label: "SO No" },
	{ key: "itemCode", label: "Item Code" },
	{ key: "barcode", label: "Barcode" },
	{ key: "itemName", label: "Item Name" },
	{ key: "soQuantity", label: "SO Qty", align: "right" },
	{ key: "plQuantity", label: "PL Qty", align: "right" },
	{ key: "uom", label: "UOM" },
	{ key: "expirationDate", label: "Expiration Date" },
	{ key: "lotNo", label: "Lot No" },
] satisfies InventoryReportTableColumn[];

export function formatPickListReportNumber(value: string) {
	return formatInventoryReportNumber(value);
}
