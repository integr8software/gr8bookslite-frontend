import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import {
	createReceivingReportReportRows,
	formatReportCode,
	formatReportDate,
	formatReportNumberAmount,
	type ReceivingReportReportValues,
} from "@/app/src/ui/modules/inventory/receiving-report/reports/ReceivingReportReportPreview";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";

pdfMake.addVirtualFileSystem(pdfFonts);

type PdfTableLayoutNode = {
	table: {
		body: unknown[];
		widths?: unknown;
	};
};

export function openReceivingReportPdf(values: ReceivingReportReportValues) {
	pdfMake.createPdf(createReceivingReportPdfDefinition(values)).open();
}

function createReceivingReportPdfDefinition(
	values: ReceivingReportReportValues,
): TDocumentDefinitions {
	const totals = calculateReceivingReportPdfTotals(values);

	return {
		pageSize: "A4",
		pageOrientation: "landscape",
		pageMargins: [22, 14, 22, 14],
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
						[createCompanyHeader()],
						[createTitleRow(values)],
						[createInfoTable(values)],
						[createForRow()],
						[createItemsTable(values)],
						[createTotalsTable(totals)],
						[createFooterTable(values)],
					],
				},
				layout: outerLayout,
			},
			{
				canvas: [{ type: "line", x1: 0, y1: 0, x2: 780, y2: 0, lineWidth: 1 }],
				margin: [0, 8, 0, 0],
			},
			{
				canvas: [{ type: "line", x1: 0, y1: 0, x2: 780, y2: 0, lineWidth: 1 }],
				margin: [0, 16, 0, 0],
			},
		],
	};
}

function createCompanyHeader(): TableCell {
	return toTableCell({
		table: {
			widths: [150, "*", 150],
			body: [
				[
					{
						text: "integr8",
						bold: true,
						color: "#111111",
						fontSize: 28,
						margin: [28, 20, 0, 26],
					},
					{
						stack: [
							centerText("Your Company Name Here", 12, [0, 12, 0, 0]),
							centerText("VAT REG TIN : 000-000-000", 8, [0, 3, 0, 0]),
							centerText(
								"Abc, 123, Sample, Malamig, City Of Mandaluyong, Ncr, Second District",
								8,
								[0, 3, 0, 0],
							),
							centerText("Telephone No: 0967-237-4514", 8, [0, 5, 0, 0]),
						],
					},
					{ text: "" },
				],
			],
		},
		layout: noBordersLayout,
	});
}

function createTitleRow(values: ReceivingReportReportValues): TableCell {
	return toTableCell({
		table: {
			widths: ["*", 270],
			body: [
				[
					{
						text: "RECEIVING REPORT",
						bold: true,
						fontSize: 19,
						margin: [10, 0, 0, 8],
					},
					{
						text: `Receiving Report Date: ${formatReportDate(values.documentDate)}`,
						bold: true,
						margin: [2, 9, 0, 0],
					},
				],
			],
		},
		layout: bottomOnlyLayout,
	});
}

function createInfoTable(values: ReceivingReportReportValues): TableCell {
	return toTableCell({
		table: {
			widths: ["*", 270],
			body: [
				[
					infoCell("Supplier", values.vceName || values.vceCode),
					infoCell("Delivery Date", formatReportDate(values.deliveryDate)),
				],
				[infoCell("DR No.", values.drNo), infoCell("PR No.", values.prNo)],
				[infoCell("PO No.", values.poNo), blankInfoCell()],
				[infoCell("Address", values.address), infoCell("Contact No", values.contactNo)],
			],
		},
		layout: innerGridLayout,
	});
}

function createForRow(): TableCell {
	return toTableCell({
		text: "FOR:",
		bold: true,
		margin: [4, 5, 4, 58],
	});
}

function createItemsTable(values: ReceivingReportReportValues): TableCell {
	const rows = createReceivingReportReportRows(values);
	const resolvedRows =
		rows.length > 0
			? rows
			: [
					{
						barcode: "",
						cost: "",
						description: "",
						grossAmount: "",
						netAmount: "",
						poQty: "",
						rrQty: "",
						uom: "",
						vatAmount: "",
					},
				];

	return toTableCell({
		table: {
			headerRows: 1,
			widths: [65, 180, 38, 82, 43, 43, 110, 110, "*"],
			body: [
				[
					headerCell("BarCode"),
					headerCell("ItemName"),
					headerCell("UOM", "center"),
					headerCell("Cost", "right"),
					headerCell("PO Qty", "right"),
					headerCell("RR Qty", "right"),
					headerCell("Gross", "right"),
					headerCell("VAT", "right"),
					headerCell("Net", "right"),
				],
				...resolvedRows.map((row) => [
					bodyCell(row.barcode),
					bodyCell(row.description),
					bodyCell(row.uom, "center"),
					bodyCell(row.cost, "right"),
					bodyCell(row.poQty, "right"),
					bodyCell(row.rrQty, "right"),
					bodyCell(row.grossAmount, "right"),
					bodyCell(row.vatAmount, "right"),
					bodyCell(row.netAmount, "right"),
				]),
			],
		},
		layout: innerGridLayout,
	});
}

function createTotalsTable(totals: ReturnType<typeof calculateReceivingReportPdfTotals>) {
	return toTableCell({
		table: {
			widths: ["*", 95, 100],
			body: [
				[
					{ text: "", rowSpan: 4 },
					totalLabel("Gross Amount"),
					totalValue(totals.grossAmount),
				],
				["", totalLabel("VAT Amount"), totalValue(totals.vatAmount)],
				["", totalLabel("EWT Amount"), totalValue(totals.ewtAmount)],
				["", totalLabel("Net Amount"), totalValue(totals.netAmount)],
			],
		},
		layout: totalsLayout,
	});
}

function createFooterTable(values: ReceivingReportReportValues): TableCell {
	return toTableCell({
		table: {
			widths: ["*", "*", 145],
			body: [
				[
					footerCell("Prepared by:"),
					footerCell("Approved by:"),
					{
						stack: [
							{ text: "RR NO.:", bold: true },
							{
								text: formatReportCode(values.transNo),
								bold: true,
								fontSize: 20,
								alignment: "right",
								margin: [0, 18, 4, 0],
							},
						],
						margin: [4, 4, 4, 4],
					},
				],
			],
		},
		layout: innerGridLayout,
	});
}

function calculateReceivingReportPdfTotals(values: ReceivingReportReportValues) {
	return values.lines.reduce(
		(totals, line) => ({
			ewtAmount: totals.ewtAmount + parseMoneyNumberInput(line.ewtAmount),
			grossAmount: totals.grossAmount + parseMoneyNumberInput(line.grossAmount),
			netAmount: totals.netAmount + parseMoneyNumberInput(line.netAmount),
			vatAmount: totals.vatAmount + parseMoneyNumberInput(line.vatAmount),
		}),
		{
			ewtAmount: 0,
			grossAmount: 0,
			netAmount: 0,
			vatAmount: 0,
		},
	);
}

function centerText(text: string, fontSize = 8, margin: number[] = [0, 2, 0, 0]) {
	return { text, alignment: "center" as const, bold: true, fontSize, margin };
}

function infoCell(label: string, value: string): TableCell {
	return toTableCell({
		text: [{ text: `${label}: `, bold: true }, { text: value || " " }],
		margin: [4, 3, 4, 3],
	});
}

function blankInfoCell(): TableCell {
	return toTableCell({
		text: " ",
		margin: [4, 3, 4, 3],
	});
}

function headerCell(text: string, alignment: "left" | "right" | "center" = "left") {
	return toTableCell({
		text,
		bold: true,
		alignment,
		margin: [2, 1, 2, 1],
	});
}

function bodyCell(text: string, alignment: "left" | "right" | "center" = "left") {
	return toTableCell({
		text: text || " ",
		alignment,
		margin: [2, 2, 2, 2],
	});
}

function totalLabel(label: string): TableCell {
	return toTableCell({
		text: `${label} :`,
		bold: true,
		alignment: "right",
		margin: [2, 4, 2, 2],
	});
}

function totalValue(value: number): TableCell {
	return toTableCell({
		text: formatReportNumberAmount(value),
		bold: true,
		alignment: "right",
		margin: [2, 4, 2, 2],
	});
}

function footerCell(label: string): TableCell {
	return toTableCell({
		text: label,
		margin: [4, 4, 4, 48],
	});
}

function toTableCell(value: unknown): TableCell {
	return value as TableCell;
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
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const outerLayout = {
	hLineWidth: (index: number, node: PdfTableLayoutNode) =>
		index === 0 || index === getRowCount(node) ? 1 : 0,
	vLineWidth: (index: number, node: PdfTableLayoutNode) =>
		index === 0 || index === getColumnCount(node) ? 1 : 0,
	hLineColor: () => "#000000",
	vLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const bottomOnlyLayout = {
	hLineWidth: (index: number, node: PdfTableLayoutNode) =>
		index === getRowCount(node) ? 1 : 0,
	vLineWidth: () => 0,
	hLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const innerGridLayout = {
	hLineWidth: () => 1,
	vLineWidth: () => 1,
	hLineColor: () => "#000000",
	vLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const totalsLayout = {
	hLineWidth: () => 0,
	vLineWidth: (index: number) => (index === 1 ? 1 : 0),
	hLineColor: () => "#000000",
	vLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};
