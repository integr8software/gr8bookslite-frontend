import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type {
	Content,
	TableCell,
	TDocumentDefinitions,
} from "pdfmake/interfaces";
import {
	formatPurchaseRequestDate,
	formatPurchaseRequestMoney,
	getPurchaseRequestItemAmount,
	getPurchaseRequestTotal,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import { FormatTinNumber } from "@/app/src/data/shared/TaxData";
import type {
	PurchaseRequestItem,
	PurchaseRequestRecord,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openPurchaseRequestPdf(record: PurchaseRequestRecord) {
	pdfMake
		.createPdf(createPurchaseRequestPdfDefinition(record))
		.open();
}

function createPurchaseRequestPdfDefinition(
	record: PurchaseRequestRecord,
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
						[createHeaderTable(record)],
						[createTitleRow()],
						[createSupplierRow(record)],
						[createForRow(record)],
						[createItemsTable(record)],
						[createApprovalTable(record)],
					],
				},
				layout: outerLayout,
			},
		],
	};
}

function createHeaderTable(record: PurchaseRequestRecord): TableCell {
	const logo: Content = record.logoImageUrl
		? {
				image: record.logoImageUrl,
				fit: [72, 58],
				alignment: "center",
			}
		: {
				text: "Logo",
				alignment: "center",
				color: "#1a6290",
				bold: true,
				fontSize: 7,
				margin: [0, 24, 0, 0],
			};

	return {
		table: {
			widths: [120, "*"],
			body: [
				[
					{
						...logo,
						margin: [0, 8, 0, 8],
					},
					{
						stack: [
							{
								text: record.companyName,
								bold: true,
								fontSize: 10,
								alignment: "center",
							},
							{
								text: `VAT REG TIN :${FormatTinNumber(record.vatRegTin)}`,
								alignment: "center",
								bold: true,
								margin: [0, 3, 0, 0],
							},
							{
								text: record.companyAddress,
								alignment: "center",
								bold: true,
								margin: [0, 3, 0, 0],
							},
							{
								text: `Telephone No: ${record.telephoneNo}`,
								alignment: "center",
								bold: true,
								margin: [0, 3, 0, 0],
							},
						],
						margin: [0, 8, 0, 8],
					},
				],
			],
		},
		layout: noBordersLayout,
	};
}

function createTitleRow(): TableCell {
	return {
		text: "PURCHASE REQUEST",
		bold: true,
		fontSize: 18,
		margin: [6, 7, 0, 6],
	};
}

function createSupplierRow(record: PurchaseRequestRecord): TableCell {
	return {
		table: {
			widths: ["*", 180],
			body: [
				[
					{
						text: [
							{ text: "Supplier: ", bold: true },
							{ text: record.vceName, bold: true },
						],
						margin: [3, 3, 3, 3],
					},
					{
						text: `Purchase Request Date: ${formatPurchaseRequestDate(record.prDate)}`,
						bold: true,
						alignment: "right",
						margin: [3, 3, 6, 3],
					},
				],
			],
		},
		layout: noBordersLayout,
	};
}

function createForRow(record: PurchaseRequestRecord): TableCell {
	return {
		text: [
			{ text: "FOR:", bold: true },
			record.forDepartment
				? { text: ` ${record.forDepartment}`, bold: true }
				: "",
		],
		margin: [3, 3, 3, 44],
	};
}

function createItemsTable(record: PurchaseRequestRecord): TableCell {
	const totalCost = getPurchaseRequestCostTotal(record);
	const totalQuantity = getPurchaseRequestQuantityTotal(record);
	const body: TableCell[][] = [
		[
			headerCell("ItemCode"),
			headerCell("BarCode"),
			headerCell("ItemName"),
			headerCell("UOM"),
			headerCell("Cost", "right"),
			headerCell("Qty", "right"),
			headerCell("Amount", "right"),
		],
		...record.items.map((item) => createItemRow(item, record.currency)),
		[
			{
				text: "Total :",
				bold: true,
				alignment: "right",
				colSpan: 4,
			},
			{},
			{},
			{},
			{
				text: formatPurchaseRequestMoney(totalCost, record.currency),
				bold: true,
				alignment: "right",
			},
			{
				text: formatPurchaseRequestQuantity(totalQuantity),
				bold: true,
				alignment: "right",
			},
			{
				text: formatPurchaseRequestMoney(
					getPurchaseRequestTotal(record),
					record.currency,
				),
				bold: true,
				alignment: "right",
			},
		],
	];

	return {
		table: {
			headerRows: 1,
			widths: [70, 70, "*", 44, 76, 48, 86],
			body,
		},
		layout: thinGridLayout,
	};
}

function createItemRow(
	item: PurchaseRequestItem,
	currency: string,
): TableCell[] {
	return [
		bodyCell(item.itemCode),
		bodyCell(item.barcode),
		bodyCell(item.description),
		bodyCell(item.uom),
		bodyCell(formatPurchaseRequestMoney(item.cost, currency), "right"),
		bodyCell(formatPurchaseRequestQuantity(item.quantity), "right"),
		bodyCell(
			formatPurchaseRequestMoney(getPurchaseRequestItemAmount(item), currency),
			"right",
		),
	];
}

function createApprovalTable(record: PurchaseRequestRecord): TableCell {
	return {
		table: {
			widths: ["*", "*", 110],
			body: [
				[
					approvalCell(
						"Prepared by:",
						record.preparedBy,
						record.preparedBySignatureImageUrl,
					),
					approvalCell(
						"Approved by:",
						record.approvedBy,
						record.approvedBySignatureImageUrl,
					),
					{
						stack: [
							{ text: "PR NO.:", bold: true },
							{
								text: record.transNo,
								bold: true,
								fontSize: getPrNumberFontSize(record.transNo),
								alignment: "right",
								margin: [0, 14, 4, 0],
								noWrap: false,
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

function approvalCell(
	label: string,
	value: string,
	signatureImageUrl = "",
): TableCell {
	const stack: Content[] = [{ text: label, bold: true }];

	if (signatureImageUrl) {
		stack.push({
			image: signatureImageUrl,
			fit: [110, 30],
			alignment: "center",
			margin: [0, 8, 0, -16],
		});
	}

	stack.push({
		text: value,
		bold: true,
		alignment: "center",
		margin: [0, signatureImageUrl ? 0 : 22, 0, 0],
	});

	return {
		stack,
		margin: [3, 3, 3, 3],
	};
}

function headerCell(text: string, alignment: "left" | "right" = "left"): TableCell {
	return {
		text,
		bold: true,
		alignment,
		margin: [3, 3, 3, 3],
	};
}

function bodyCell(text: string, alignment: "left" | "right" = "left"): TableCell {
	return {
		text,
		alignment,
		margin: [3, 3, 3, 3],
	};
}

function getPurchaseRequestCostTotal(
	record: Pick<PurchaseRequestRecord, "items">,
) {
	return record.items.reduce(
		(total, item) => total + (Number(item.cost) || 0),
		0,
	);
}

function getPurchaseRequestQuantityTotal(
	record: Pick<PurchaseRequestRecord, "items">,
) {
	return record.items.reduce(
		(total, item) => total + (Number(item.quantity) || 0),
		0,
	);
}

function formatPurchaseRequestQuantity(quantity: number) {
	return Math.trunc(Number(quantity) || 0).toLocaleString("en-US");
}

function getPrNumberFontSize(value: string) {
	if (value.length > 12) {
		return 12;
	}

	if (value.length > 9) {
		return 15;
	}

	return 20;
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
