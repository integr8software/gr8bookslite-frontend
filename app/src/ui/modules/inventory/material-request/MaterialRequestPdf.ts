import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { formatMaterialRequestDate } from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import type {
	MaterialRequestFormValues,
	MaterialRequestItem,
	MaterialRequestNumberValue,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";

pdfMake.addVirtualFileSystem(pdfFonts);

type PdfTableLayoutNode = {
	table: {
		body: unknown[];
		widths?: unknown;
	};
};

export function openMaterialRequestPdf(values: MaterialRequestFormValues) {
	pdfMake.createPdf(createMaterialRequestPdfDefinition(values)).open();
}

function createMaterialRequestPdfDefinition(
	values: MaterialRequestFormValues,
): TDocumentDefinitions {
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
						[createPurposeRow(values)],
						[createItemsTable(values.items)],
						[createFooterTable()],
					],
				},
				layout: outerLayout,
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
						fontSize: 28,
						margin: [28, 20, 0, 24],
					},
					{
						stack: [
							centerText("Your Company Name Here", 12, [0, 12, 0, 0]),
							centerText("VAT REG TIN : 000-000-000", 8, [0, 3, 0, 0]),
							centerText(
								"ABC, 123, Sample, Malamig, City Of Mandaluyong, NCR, Second District",
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

function createTitleRow(values: MaterialRequestFormValues): TableCell {
	return toTableCell({
		table: {
			widths: ["*", 95],
			body: [
				[
					{
						text: "MATERIAL REQUEST",
						bold: true,
						fontSize: 18,
						alignment: "left",
						margin: [4, 2, 0, 7],
					},
					{
						stack: [
							{
								text: "MR No.:",
								bold: true,
								fontSize: 8,
								alignment: "right",
							},
							{
								text: formatRequestNo(values.requestNo),
								bold: true,
								fontSize: 16,
								alignment: "right",
								margin: [0, 2, 0, 0],
							},
						],
						margin: [0, 0, 8, 2],
					},
				],
			],
		},
		layout: noBordersLayout,
	});
}

function createInfoTable(values: MaterialRequestFormValues): TableCell {
	return toTableCell({
		table: {
			widths: ["*", 230],
			body: [
				[
					infoCell("Warehouse", values.toWarehouse),
					infoCell("Date", formatMaterialRequestDate(values.documentDate)),
				],
				[
					infoCell("Requestor", values.department || values.vceName),
					infoCell("Required Date", formatMaterialRequestDate(values.requiredDate)),
				],
			],
		},
		layout: innerGridLayout,
	});
}

function createPurposeRow(values: MaterialRequestFormValues): TableCell {
	return toTableCell({
		stack: [
			{ text: "Purpose", bold: true },
			{ text: values.purpose || values.remarks || " ", margin: [0, 8, 0, 0] },
		],
		margin: [4, 5, 4, 26],
	});
}

function createItemsTable(items: MaterialRequestItem[]): TableCell {
	const rows = createMaterialRequestPdfRows(items);
	const shouldShowStockQuantity = hasStockQuantity(items);

	return toTableCell({
		table: {
			headerRows: 1,
			widths: shouldShowStockQuantity ? [105, "*", 80, 110, 110] : [120, "*", 90, 120],
			body: [
				createItemsTableHeader(shouldShowStockQuantity),
				...rows.map((row) => createItemsTableRow(row, shouldShowStockQuantity)),
			],
		},
		layout: innerGridLayout,
	});
}

function createItemsTableHeader(shouldShowStockQuantity: boolean) {
	const cells = [
		headerCell("Item Code"),
		headerCell("Item Name"),
		headerCell("UOM", "center"),
		headerCell("Req QTY", "right"),
	];

	if (shouldShowStockQuantity) {
		cells.push(headerCell("Stock QTY", "right"));
	}

	return cells;
}

function createItemsTableRow(
	row: ReturnType<typeof createMaterialRequestPdfRows>[number],
	shouldShowStockQuantity: boolean,
) {
	const cells = [
		bodyCell(row.itemCode),
		bodyCell(row.itemName),
		bodyCell(row.uom, "center"),
		bodyCell(row.requestQuantity, "right"),
	];

	if (shouldShowStockQuantity) {
		cells.push(bodyCell(row.stockQuantity, "right"));
	}

	return cells;
}

function createFooterTable(): TableCell {
	return toTableCell({
		table: {
			widths: ["*", "*", "*"],
			body: [[footerCell("Prepared by:"), footerCell("Checked by:"), footerCell("Approved by:")]],
		},
		layout: innerGridLayout,
	});
}

function createMaterialRequestPdfRows(items: MaterialRequestItem[]) {
	const rows = items
		.filter((item) => item.itemCode || item.itemName)
		.map((item) => ({
			itemCode: item.itemCode,
			itemName: item.itemName || item.description,
			requestQuantity: formatQuantity(item.requestQuantity),
			stockQuantity: formatQuantity(item.stockQuantity),
			uom: item.uom,
		}));

	return rows.length
		? rows
		: [
				{
					itemCode: "",
					itemName: "",
					requestQuantity: "",
					stockQuantity: "",
					uom: "",
				},
			];
}

function hasStockQuantity(items: MaterialRequestItem[]) {
	return items.some((item) => item.stockQuantity !== "" && Number(item.stockQuantity) > 0);
}

function centerText(text: string, fontSize = 8, margin: number[] = [0, 2, 0, 0]) {
	return { text, alignment: "center" as const, bold: true, fontSize, margin };
}

function infoCell(label: string, value: string): TableCell {
	return toTableCell({
		text: [{ text: `${label} : `, bold: true }, { text: value || " " }],
		margin: [4, 4, 4, 4],
	});
}

function headerCell(text: string, alignment: "left" | "right" | "center" = "left") {
	return toTableCell({
		text,
		bold: true,
		alignment,
		margin: [2, 2, 2, 2],
	});
}

function bodyCell(text: string, alignment: "left" | "right" | "center" = "left") {
	return toTableCell({
		text: text || " ",
		alignment,
		margin: [2, 3, 2, 3],
	});
}

function footerCell(label: string): TableCell {
	return toTableCell({
		text: label,
		margin: [4, 5, 4, 42],
	});
}

function formatQuantity(value: MaterialRequestNumberValue) {
	if (value === "") return "";

	return Number(value).toLocaleString("en-US", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	});
}

function formatRequestNo(value: string) {
	const numeric = value.replace(/\D/g, "");

	return numeric ? numeric.slice(-6).replace(/^0+/, "") || "0" : value || "-";
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
