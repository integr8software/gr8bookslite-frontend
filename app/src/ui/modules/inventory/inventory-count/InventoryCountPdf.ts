import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import type { InventoryCountValues } from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";

pdfMake.addVirtualFileSystem(pdfFonts);

type PdfTableLayoutNode = {
	table: {
		body: unknown[];
		widths?: unknown;
	};
};

export function openInventoryCountPdf(values: InventoryCountValues) {
	pdfMake.createPdf(createInventoryCountPdfDefinition(values)).open();
}

function createInventoryCountPdfDefinition(
	values: InventoryCountValues,
): TDocumentDefinitions {
	return {
		pageSize: "A4",
		pageOrientation: "landscape",
		pageMargins: [18, 12, 18, 12],
		defaultStyle: {
			font: "Roboto",
			fontSize: 8,
			lineHeight: 1,
		},
		content: [
			createCompanyHeader(),
			{
				text: "Inventory Count",
				alignment: "center",
				bold: true,
				fontSize: 16,
				margin: [0, 12, 0, 10],
			},
			createReportDetails(values),
			createItemsTable(values),
		],
	};
}

function createCompanyHeader(): Content {
	return toContent({
		table: {
			widths: [150, "*", 150],
			body: [
				[
					{
						text: "integr8",
						bold: true,
						fontSize: 28,
						margin: [22, 18, 0, 10],
					},
					{
						stack: [
							centerText("Your Company Name Here", 12, [0, 8, 0, 0]),
							centerText("VAT REG TIN : 000-000-000", 8, [0, 8, 0, 0]),
							centerText(
								"ABC, 123, Sample, Malamig, CITY OF MANDALUYONG, NCR, SECOND DISTRICT",
								8,
								[0, 8, 0, 0],
							),
							centerText("Telephone No: 0967-237-4514", 8, [0, 12, 0, 0]),
						],
					},
					{ text: "" },
				],
			],
		},
		layout: noBordersLayout,
	});
}

function createReportDetails(values: InventoryCountValues): Content {
	return toContent({
		columns: [
			{
				width: "*",
				stack: [
					detailText(`Warehouse: ${values.warehouse}`),
					detailText(`Inventory Count No.: ${values.countNo}`),
				],
			},
			{
				width: "*",
				stack: [
					detailText(`Uploader: ${values.uploader || "-"}`),
					detailText(`Inventory Count Date: ${values.countDate}`),
				],
			},
		],
		margin: [0, 0, 0, 10],
	});
}

function createItemsTable(values: InventoryCountValues): Content {
	const rows = values.lines.length
		? values.lines
		: [
				{
					countQty: "",
					id: "blank",
					itemCode: "",
					itemName: "",
					remarks: "",
					systemQty: "",
					uom: "",
					variance: "",
				},
			];

	return toContent({
		table: {
			headerRows: 1,
			widths: [95, "*", 64, 105, 105, 105],
			body: [
				[
					headerCell("Item Code"),
					headerCell("Description"),
					headerCell("UOM"),
					headerCell("StockQTY"),
					headerCell("InventoryCountQTY"),
					headerCell("VarianceQTY"),
				],
				...rows.map((row) => [
					bodyCell(row.itemCode),
					bodyCell(row.itemName),
					bodyCell(row.uom),
					bodyCell(formatQuantity(row.systemQty)),
					bodyCell(formatQuantity(row.countQty)),
					bodyCell(formatQuantity(row.variance)),
				]),
			],
		},
		layout: inventoryGridLayout,
	});
}

function centerText(text: string, fontSize = 8, margin: number[] = [0, 2, 0, 0]) {
	return { text, alignment: "center" as const, bold: true, fontSize, margin };
}

function detailText(text: string) {
	return { text, bold: true, fontSize: 8, margin: [0, 1, 0, 1] };
}

function headerCell(text: string) {
	return toTableCell({
		text,
		alignment: "center",
		bold: true,
		fontSize: 9,
		margin: [2, 2, 2, 2],
	});
}

function bodyCell(text: string) {
	return toTableCell({
		text: text || " ",
		alignment: "center",
		fontSize: 8,
		margin: [2, 1, 2, 1],
	});
}

function formatQuantity(value: string) {
	const quantity = Number.parseFloat(value);

	return Number.isFinite(quantity) ? quantity.toFixed(2) : "0.00";
}

function toTableCell(value: unknown): TableCell {
	return value as TableCell;
}

function toContent(value: unknown): Content {
	return value as Content;
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

const inventoryGridLayout = {
	hLineWidth: () => 1,
	vLineWidth: (index: number, node: PdfTableLayoutNode) =>
		index === 0 || index === getColumnCount(node) ? 1 : 1,
	hLineColor: () => "#000000",
	vLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};
