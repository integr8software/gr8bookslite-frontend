import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { formatDeliveryReceiptQuantity } from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import type { DeliveryReceiptFormValues } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";

pdfMake.addVirtualFileSystem(pdfFonts);

type PdfTableLayoutNode = {
	table: {
		body: unknown[];
		widths?: unknown;
	};
};

export function openDeliveryReceiptPdf(values: DeliveryReceiptFormValues) {
	pdfMake.createPdf(createDeliveryReceiptPdfDefinition(values)).open();
}

function createDeliveryReceiptPdfDefinition(
	values: DeliveryReceiptFormValues,
): TDocumentDefinitions {
	return {
		pageSize: "A4",
		pageOrientation: "portrait",
		pageMargins: [34, 28, 34, 28],
		defaultStyle: {
			font: "Roboto",
			fontSize: 8,
			lineHeight: 1.05,
		},
		content: [
			{
				table: {
					widths: ["*"],
					body: [
						[createHeaderTable()],
						[createTitleRow(values)],
						[createCustomerBlock(values)],
						[createEntriesTable(values)],
						[createSignatureTable()],
					],
				},
				layout: outerLayout,
			},
		],
	};
}

function createHeaderTable(): TableCell {
	return toTableCell({
		table: {
			widths: [120, "*", 120],
			body: [
				[
					{
						text: "gr8books\nneo",
						bold: true,
						color: "#174ea6",
						fontSize: 15,
						margin: [8, 15, 0, 8],
					},
					{
						stack: [
							headerText("Your Company Name Here", 10),
							headerText("VAT REG TIN : 000-000-000-000"),
							headerText(
								"ABC, 123, Sample, Malamig, City of Mandaluyong, NCR, Second District",
							),
							headerText("Telephone No: 0967-237-4514", 0, [0, 8, 0, 0]),
						],
						margin: [0, 10, 0, 8],
					},
					{ text: "" },
				],
			],
		},
		layout: noBordersLayout,
	});
}

function createTitleRow(values: DeliveryReceiptFormValues): TableCell {
	return toTableCell({
		table: {
			widths: ["*", 150],
			body: [
				[
					{
						text: "DELIVERY RECEIPT",
						bold: true,
						fontSize: 17,
						margin: [4, 5, 0, 3],
					},
					{
						stack: [
							boldLine(`DR No. : ${values.transactionNo || "-"}`),
							boldLine(`Date : ${formatReportDate(values.documentDate)}`),
						],
						margin: [0, 5, 0, 3],
					},
				],
			],
		},
		layout: bottomOnlyLayout,
	});
}

function createCustomerBlock(values: DeliveryReceiptFormValues): TableCell {
	return toTableCell({
		stack: [
			infoLine("Customer", values.vceName),
			infoLine("Bill To", values.billToName),
			infoLine("Address", values.address),
			infoLine("Delivery Date", formatReportDate(values.deliveryDate)),
			infoLine("Driver", values.driverName),
			infoLine("Plate No.", values.plateNo),
			infoLine("Remarks", values.remarks),
		],
		margin: [4, 4, 4, 12],
	});
}

function createEntriesTable(values: DeliveryReceiptFormValues): TableCell {
	const rows = values.lineEntries.filter(
		(entry) => entry.itemCode || entry.name || entry.description,
	);
	const tableRows = rows.length
		? rows.map((entry) => [
				cell(entry.itemCode),
				cell(entry.description || entry.name),
				cell(formatQuantity(entry.quantity), "right"),
				cell(entry.uom),
				cell(entry.warehouse),
			])
		: [[cell(""), cell(""), cell("0.00", "right"), cell(""), cell("")]];

	return toTableCell({
		table: {
			headerRows: 1,
			widths: [80, "*", 60, 60, 100],
			body: [
				[
					headerCell("Item Code"),
					headerCell("Description"),
					headerCell("Qty"),
					headerCell("UOM"),
					headerCell("Warehouse"),
				],
				...tableRows,
				[
					toTableCell({ text: "", colSpan: 5, margin: [0, 170, 0, 0] }),
					{},
					{},
					{},
					{},
				],
			],
		},
		layout: entriesLayout,
	});
}

function createSignatureTable(): TableCell {
	return toTableCell({
		table: {
			widths: ["*", "*"],
			body: [[signatureCell("Prepared by"), signatureCell("Received by")]],
		},
		layout: innerLayout,
	});
}

function headerText(text: string, fontSize = 7, margin: number[] = [0, 2, 0, 0]) {
	return { text, alignment: "center" as const, bold: true, fontSize, margin };
}

function boldLine(text: string) {
	return { text, bold: true, fontSize: 8 };
}

function infoLine(label: string, value: string) {
	return {
		text: [
			{ text: `${label} : `, bold: true },
			{ text: value || " " },
		],
	};
}

function headerCell(text: string): TableCell {
	return cell(text, "center", true);
}

function cell(text: string, alignment: "left" | "right" | "center" = "left", bold = false): TableCell {
	return toTableCell({
		text: text || " ",
		alignment,
		bold,
		margin: [3, 3, 3, 3],
	});
}

function signatureCell(label: string): TableCell {
	return toTableCell({
		stack: [
			{ text: `${label} :`, bold: true },
			{
				text: " ",
				margin: [40, 58, 40, 0],
				border: [false, false, false, true],
			},
		],
		margin: [4, 6, 4, 8],
	});
}

function formatQuantity(value: string) {
	const quantity = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));

	return formatDeliveryReceiptQuantity(Number.isFinite(quantity) ? quantity : 0);
}

function formatReportDate(value: string) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(date);
}

function toTableCell(cellValue: unknown): TableCell {
	return cellValue as TableCell;
}

function getRowCount(node: PdfTableLayoutNode) {
	return node.table.body.length;
}

function getColumnCount(node: PdfTableLayoutNode) {
	const widths = node.table.widths;

	return Array.isArray(widths) ? widths.length : 1;
}

const noBordersLayout = {
	hLineWidth: () => 0,
	vLineWidth: () => 0,
};

const outerLayout = {
	hLineWidth: (index: number, node: PdfTableLayoutNode) =>
		index === 0 || index === getRowCount(node) ? 1.2 : 0,
	vLineWidth: (index: number, node: PdfTableLayoutNode) =>
		index === 0 || index === getColumnCount(node) ? 1.2 : 0,
	hLineColor: () => "#000000",
	vLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const bottomOnlyLayout = {
	hLineWidth: (index: number, node: PdfTableLayoutNode) =>
		index === getRowCount(node) ? 1.2 : 0,
	vLineWidth: () => 0,
	hLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const innerLayout = {
	hLineWidth: (index: number) => (index === 0 ? 1.2 : 0),
	vLineWidth: (index: number, node: PdfTableLayoutNode) =>
		index > 0 && index < getColumnCount(node) ? 1 : 0,
	hLineColor: () => "#000000",
	vLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const entriesLayout = {
	hLineWidth: (index: number, node: PdfTableLayoutNode) =>
		index === getRowCount(node) ? 0 : 1,
	vLineWidth: (index: number, node: PdfTableLayoutNode) =>
		index > 0 && index < getColumnCount(node) ? 1 : 0,
	hLineColor: () => "#000000",
	vLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};
