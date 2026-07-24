import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import {
	formatPurchaseOrderAmount,
	formatPurchaseOrderDate,
	getPurchaseOrderItemGrossAmount,
	getPurchaseOrderItemNetAmount,
	getPurchaseOrderTotals,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import type {
	PurchaseOrderItem,
	PurchaseOrderRecord,
} from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";
import { formatPurchaseOrderNumber } from "@/app/src/ui/modules/purchasing/purchase-order/reports/PurchaseOrderReportPreview";
import { createReportPdfCompanyHeader } from "@/app/src/ui/shared/reports/ReportPdfCompanyHeader";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openPurchaseOrderPdf(record: PurchaseOrderRecord) {
	pdfMake.createPdf(createPurchaseOrderPdfDefinition(record)).open();
}

function createPurchaseOrderPdfDefinition(
	record: PurchaseOrderRecord,
): TDocumentDefinitions {
	return {
		pageSize: "A4",
		pageOrientation: "portrait",
		pageMargins: [28, 24, 28, 24],
		defaultStyle: {
			font: "Roboto",
			fontSize: 8,
			lineHeight: 1.1,
		},
		content: [
			{
				table: {
					widths: ["*"],
					body: [
						[createHeaderTable()],
						[createTitleRow(record)],
						[createSupplierRows(record)],
						[createForRow()],
						[createItemsTable(record)],
						[createApprovalTable(record)],
					],
				},
				layout: outerLayout,
			},
			{
				canvas: [{ type: "line", x1: 0, y1: 0, x2: 540, y2: 0, lineWidth: 1 }],
				margin: [0, 6, 0, 0],
			},
			{
				canvas: [{ type: "line", x1: 0, y1: 0, x2: 540, y2: 0, lineWidth: 1 }],
				margin: [0, 16, 0, 0],
			},
		],
	};
}

function createHeaderTable(): TableCell {
	return createReportPdfCompanyHeader();
}

function createTitleRow(record: PurchaseOrderRecord): TableCell {
	return {
		table: {
			widths: ["*", 180],
			body: [
				[
					{
						text: "PURCHASE ORDER",
						bold: true,
						fontSize: 18,
						margin: [6, 8, 0, 6],
					},
					{
						text: `Purchase Order Date: ${formatPurchaseOrderDate(record.documentDate)}`,
						bold: true,
						alignment: "right",
						margin: [0, 13, 7, 0],
					},
				],
			],
		},
		layout: noBordersLayout,
	};
}

function createSupplierRows(record: PurchaseOrderRecord): TableCell {
	return {
		table: {
			widths: ["*", 180],
			body: [
				[
					labelCell("Supplier", record.vceName),
					labelCell("Delivery Date", formatPurchaseOrderDate(record.deliveryDate)),
				],
				[
					labelCell("Address", record.address),
					labelCell("Contact No", record.contactNo),
				],
				[
					labelCell("Terms of Payment", record.termsOfPayment),
					labelCell("Currency", record.currency),
				],
			],
		},
		layout: thinGridLayout,
	};
}

function createForRow(): TableCell {
	return {
		text: [{ text: "FOR:", bold: true }],
		margin: [3, 3, 3, 44],
	};
}

function createItemsTable(record: PurchaseOrderRecord): TableCell {
	const totals = getPurchaseOrderTotals(record);
	const body: TableCell[][] = [
		[
			headerCell("ItemCode"),
			headerCell("BarCode"),
			headerCell("ItemName"),
			headerCell("UOM"),
			headerCell("Cost", "right"),
			headerCell("Qty", "right"),
			headerCell("Gross", "right"),
			headerCell("VAT", "right"),
			headerCell("Net", "right"),
		],
		...record.items.map((item) => createItemRow(item)),
		[
			{ text: "Total :", bold: true, alignment: "right", colSpan: 6 },
			{},
			{},
			{},
			{},
			{},
			totalCell(formatPurchaseOrderAmount(totals.grossAmount)),
			totalCell(formatPurchaseOrderAmount(totals.vatAmount)),
			totalCell(formatPurchaseOrderAmount(totals.netAmount)),
		],
	];

	return {
		table: {
			headerRows: 1,
			widths: [56, 54, "*", 36, 62, 44, 68, 58, 68],
			body,
		},
		layout: thinGridLayout,
	};
}

function createItemRow(item: PurchaseOrderItem): TableCell[] {
	return [
		bodyCell(item.itemCode),
		bodyCell(item.barcode),
		bodyCell(item.itemName),
		bodyCell(item.uom),
		bodyCell(formatPurchaseOrderAmount(item.cost), "right"),
		bodyCell(formatPurchaseOrderAmount(item.quantity), "right"),
		bodyCell(formatPurchaseOrderAmount(getPurchaseOrderItemGrossAmount(item)), "right"),
		bodyCell(formatPurchaseOrderAmount(item.vatAmount), "right"),
		bodyCell(formatPurchaseOrderAmount(getPurchaseOrderItemNetAmount(item)), "right"),
	];
}

function createApprovalTable(record: PurchaseOrderRecord): TableCell {
	return {
		table: {
			widths: ["*", "*", "*", "*", 90],
			body: [
				[
					approvalCell("Prepared by:"),
					approvalCell("Verified by:"),
					approvalCell("Approved by:"),
					approvalCell("Conforme:"),
					{
						stack: [
							{ text: "PO NO.:", bold: true },
							{
								text: formatPurchaseOrderNumber(record.transNo),
								bold: true,
								fontSize: 20,
								alignment: "right",
								margin: [0, 14, 4, 0],
							},
						],
						margin: [3, 3, 3, 3],
					},
				],
			],
		},
		layout: approvalLayout,
	};
}

function labelCell(label: string, value: string): TableCell {
	return {
		text: [{ text: `${label}: `, bold: true }, { text: value, bold: true }],
		margin: [3, 3, 3, 3],
	};
}

function headerCell(text: string, alignment: "left" | "right" = "left"): TableCell {
	return { text, bold: true, alignment, margin: [2, 2, 2, 2] };
}

function bodyCell(text: string, alignment: "left" | "right" = "left"): TableCell {
	return { text, alignment, margin: [2, 2, 2, 2] };
}

function totalCell(text: string): TableCell {
	return { text, bold: true, alignment: "right", margin: [2, 2, 2, 2] };
}

function approvalCell(label: string): TableCell {
	return { text: label, margin: [3, 3, 3, 28] };
}

const noBordersLayout = {
	hLineWidth: () => 0,
	vLineWidth: () => 0,
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const outerLayout = {
	hLineWidth: () => 1,
	vLineWidth: () => 1,
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const thinGridLayout = {
	hLineWidth: () => 0.35,
	vLineWidth: () => 0.35,
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const approvalLayout = {
	hLineWidth: (rowIndex: number) => (rowIndex === 0 ? 0 : 0.35),
	vLineWidth: () => 0.35,
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};
