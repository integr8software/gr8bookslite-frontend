import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import type {
	InventoryReportInfoRow,
	InventoryReportSignature,
	InventoryReportTableColumn,
	InventoryReportTableRow,
} from "@/app/src/ui/modules/inventory/shared/report/InventoryReportLayout";

pdfMake.addVirtualFileSystem(pdfFonts);

type InventoryReportPdfInput = {
	afterTitle?: string[];
	beforeTitle?: string[];
	codeLabel?: string;
	codeValue?: string;
	infoLabelWidth?: "compact" | "default";
	infoRows?: InventoryReportInfoRow[];
	signatures?: InventoryReportSignature[];
	tableColumns: InventoryReportTableColumn[];
	tableRows: InventoryReportTableRow[];
	title: string;
	titleLayout?: "center" | "centerWithInfo" | "default";
};

type PdfTableLayoutNode = {
	table: {
		body: unknown[];
		widths?: unknown;
	};
};

export function openInventoryReportPdf(input: InventoryReportPdfInput) {
	pdfMake.createPdf(createInventoryReportPdfDefinition(input)).open();
}

function createInventoryReportPdfDefinition(
	input: InventoryReportPdfInput,
): TDocumentDefinitions {
	const usesCenteredTitle =
		input.titleLayout === "center" || input.titleLayout === "centerWithInfo";

	return {
		pageSize: "A4",
		pageOrientation: "landscape",
		pageMargins: [24, 18, 24, 18],
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
						[createHeaderTable(usesCenteredTitle)],
						[createTitleTable(input)],
						...(input.infoRows?.length
							? [[createInfoTable(input.infoRows, input.infoLabelWidth)]]
							: []),
						[createRowsTable(input.tableColumns, input.tableRows)],
						[createFooterTable(input)],
					],
				},
				layout: outerLayout,
			},
			{
				canvas: [{ type: "line", x1: 0, y1: 0, x2: 780, y2: 0, lineWidth: 1 }],
				margin: [0, 14, 0, 0],
			},
		],
	};
}

function createHeaderTable(isCompact = false): TableCell {
	return toTableCell({
		table: {
			widths: [120, "*", 120],
			body: [
				[
					{
						text: "integr8",
						bold: true,
						color: "#174ea6",
						fontSize: 24,
						margin: [24, 24, 0, 24],
					},
					{
						stack: [
							centerText("Your Company Name Here", 12),
							centerText("VAT REG TIN : 000-000-000"),
							centerText(
								"ABC, 123, Sample, Malamig, City Of Mandaluyong, NCR, Second District",
							),
							centerText(
								"Telephone No: 0967-237-4514",
								8,
								isCompact ? [0, 2, 0, 0] : [0, 10, 0, 0],
							),
						],
						margin: [0, 24, 0, 24],
					},
					{ text: "" },
				],
			],
		},
		layout: noBordersLayout,
	});
}

function createTitleTable(input: InventoryReportPdfInput): TableCell {
	if (input.titleLayout === "center" || input.titleLayout === "centerWithInfo") {
		return toTableCell({
			table: {
				widths: ["*", "*", "*"],
				body: [
					[
						{
							stack:
								input.titleLayout === "centerWithInfo"
									? input.beforeTitle?.map((text) => ({
											text,
											bold: true,
											alignment: "left",
										})) ?? []
									: [],
							margin: [4, 3, 0, 2],
						},
						{
							text: input.title.toUpperCase(),
							bold: true,
							alignment: "center",
							margin: [0, 3, 0, 2],
						},
						{
							stack: input.afterTitle?.map((text) => ({
								text,
								bold: true,
								alignment: "right",
							})) ?? [],
							margin: [0, 3, 4, 2],
						},
					],
				],
			},
			layout:
				input.titleLayout === "centerWithInfo"
					? topAndBottomLayout
					: bottomOnlyLayout,
		});
	}

	return toTableCell({
		table: {
			widths: ["*", 180],
			body: [
				[
					{
						text: input.title.toUpperCase(),
						bold: true,
						fontSize: 18,
						margin: [4, 6, 0, 5],
					},
					{
						stack: input.afterTitle?.map((text) => ({ text, bold: true })) ?? [],
						margin: [0, 6, 0, 5],
					},
				],
			],
		},
		layout: bottomOnlyLayout,
	});
}

function createInfoTable(
	rows: InventoryReportInfoRow[],
	labelWidth: "compact" | "default" = "default",
): TableCell {
	return toTableCell({
		table: {
			widths: [labelWidth === "compact" ? 34 : 110, "*"],
			body: rows.map((row) => [
				{ text: `${row.label}:`, bold: true, margin: [4, 2, 4, 2] },
				{ text: row.value || " ", margin: [4, 2, 4, 2] },
			]),
		},
		layout: innerGridLayout,
	});
}

function createRowsTable(
	columns: InventoryReportTableColumn[],
	rows: InventoryReportTableRow[],
): TableCell {
	const resolvedRows =
		rows.length > 0 ? rows : [Object.fromEntries(columns.map((column) => [column.key, ""]))];

	return toTableCell({
		table: {
			headerRows: 1,
			widths: columns.map(() => "*"),
			body: [
				columns.map((column) =>
					toTableCell({
						text: column.label,
						bold: true,
						alignment: "center",
						margin: [2, 2, 2, 2],
					}),
				),
				...resolvedRows.map((row) =>
					columns.map((column) =>
						toTableCell({
							text: row[column.key] || " ",
							alignment: column.align ?? "left",
							margin: [2, 2, 2, 2],
						}),
					),
				),
			],
		},
		layout: innerGridLayout,
	});
}

function createFooterTable(input: InventoryReportPdfInput): TableCell {
	const signatures = input.signatures ?? [
		{ label: "Prepared by" },
		{ label: "Approved by" },
	];
	const signatureCells = signatures.map((signature) =>
		toTableCell({
			stack: [
				{ text: `${signature.label}:`, bold: true },
				{ text: signature.value || " ", margin: [0, 26, 0, 0] },
			],
			margin: [4, 6, 4, 6],
		}),
	);

	return toTableCell({
		table: {
			widths: [...signatures.map(() => "*"), input.codeLabel ? 120 : 0].filter(
				(width) => width !== 0,
			),
			body: [
				input.codeLabel
					? [
							...signatureCells,
							toTableCell({
								stack: [
									{ text: `${input.codeLabel}:`, bold: true },
									{
										text: input.codeValue || " ",
										bold: true,
										fontSize: 18,
										alignment: "right",
										margin: [0, 12, 4, 0],
									},
								],
								margin: [4, 6, 4, 6],
							}),
						]
					: signatureCells,
			],
		},
		layout: innerGridLayout,
	});
}

function centerText(text: string, fontSize = 8, margin: number[] = [0, 2, 0, 0]) {
	return { text, alignment: "center" as const, bold: true, fontSize, margin };
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

const topAndBottomLayout = {
	hLineWidth: (index: number, node: PdfTableLayoutNode) =>
		index === 0 || index === getRowCount(node) ? 1 : 0,
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
