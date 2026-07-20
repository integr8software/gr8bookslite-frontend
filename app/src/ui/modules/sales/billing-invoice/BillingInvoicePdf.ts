import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { formatBillingInvoiceAmount } from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import type { BillingInvoiceFormValues } from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";

pdfMake.addVirtualFileSystem(pdfFonts);

type PdfTableLayoutNode = {
	table: {
		body: unknown[];
		widths?: unknown;
	};
};

export function openBillingInvoicePdf(values: BillingInvoiceFormValues) {
	pdfMake.createPdf(createBillingInvoicePdfDefinition(values)).open();
}

function createBillingInvoicePdfDefinition(
	values: BillingInvoiceFormValues,
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
						[createFooterTable(values)],
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

function createTitleRow(values: BillingInvoiceFormValues): TableCell {
	return toTableCell({
		table: {
			widths: ["*", 160],
			body: [
				[
					{
						text: "BILLING INVOICE",
						bold: true,
						fontSize: 18,
						margin: [6, 5, 0, 2],
					},
					{
						stack: [
							`BI No. : ${formatInvoiceNo(values.invoiceNo || values.transactionNo)}`,
							`Date : ${formatReportDate(values.documentDate)}`,
						],
						bold: true,
						margin: [4, 5, 4, 2],
					},
				],
			],
		},
		layout: bottomBorderLayout,
	});
}

function createCustomerBlock(values: BillingInvoiceFormValues): TableCell {
	return toTableCell({
		stack: [
			infoLine("Customer", values.name),
			infoLine("Contact Person", values.contactPerson),
			infoLine("Terms", values.terms),
			infoLine("Business Style", values.businessStyle),
			infoLine("TIN", ""),
			infoLine("Remarks", values.remarks),
		],
		bold: true,
		margin: [5, 3, 5, 18],
	});
}

function createEntriesTable(values: BillingInvoiceFormValues): TableCell {
	const rows = createInvoiceRows(values);

	return toTableCell({
		table: {
			widths: ["*", 120],
			body: [
				[tableHeader("Description"), tableHeader("Amount", "right")],
				...rows.map((row) => [
					bodyCell(row.description),
					bodyCell(row.amount, "right"),
				]),
				[
					{ text: "", margin: [0, 180, 0, 0] },
					{ text: "", margin: [0, 180, 0, 0] },
				],
			],
		},
		layout: invoiceBodyLayout,
	});
}

function createFooterTable(values: BillingInvoiceFormValues): TableCell {
	return toTableCell({
		table: {
			widths: ["65%", "35%"],
			body: [
				[createPaymentOptions(), createTotalsTable(values)],
				[
					createSignatureBox("Prepared by", values.salesAssociate || "Emman/Demo"),
					createSignatureBox("Received by", ""),
				],
			],
		},
		layout: footerLayout,
	});
}

function createPaymentOptions(): TableCell {
	return toTableCell({
		stack: [
			{ text: "Payment Options :", bold: true, fontSize: 8 },
			"1. Please prepare check payable to: AKD BUSINESS OUTSOURCING SOLUTION, INC.",
			"2. Please deposit to RCBC Account No: 7900572608.",
			"3. PNB 2430 7000 3201.",
			"4. You may send via remittance.",
		],
		fontSize: 6,
		margin: [5, 4, 5, 4],
	});
}

function createTotalsTable(values: BillingInvoiceFormValues): TableCell {
	return toTableCell({
		table: {
			widths: ["*", 82],
			body: [
				totalRow("Amount", values.grossAmount),
				totalRow("VAT Amount", values.vatAmount),
				totalRow("EWT Amount", values.ewtAmount),
				totalRow("Net Amount", values.netAmount),
			],
		},
		layout: totalsLayout,
	});
}

function createSignatureBox(label: string, name: string): TableCell {
	return toTableCell({
		stack: [
			{ text: `${label} :`, bold: true },
			{
				text: name || " ",
				alignment: "center",
				margin: [35, 54, 35, 0],
				decoration: "underline",
			},
		],
		margin: [5, 5, 5, 10],
	});
}

function totalRow(label: string, value: string): TableCell[] {
	return [
		{ text: `${label} :`, bold: true, margin: [4, 4, 4, 4] },
		{ text: formatAmount(value), bold: true, alignment: "right", margin: [4, 4, 4, 4] },
	];
}

function createInvoiceRows(values: BillingInvoiceFormValues) {
	const populatedRows = values.lineEntries
		.filter((entry) => entry.description || entry.particulars)
		.map((entry) => ({
			description: entry.description || entry.particulars,
			amount: formatAmount(entry.grossAmount || entry.netAmount),
		}));

	return populatedRows.length
		? populatedRows
		: [{ description: "", amount: formatAmount(values.grossAmount) }];
}

function headerText(text: string, fontSize = 7, margin: number[] = [0, 2, 0, 0]) {
	return { text, alignment: "center", bold: true, fontSize, margin };
}

function infoLine(label: string, value: string) {
	return { text: [{ text: `${label} : `, bold: true }, value || " "] };
}

function tableHeader(text: string, alignment: "left" | "right" | "center" = "center") {
	return { text, alignment, bold: true, margin: [3, 2, 3, 2] };
}

function bodyCell(text: string, alignment: "left" | "right" = "left") {
	return { text: text || " ", alignment, margin: [3, 3, 3, 3] };
}

function toTableCell(cell: unknown): TableCell {
	return cell as TableCell;
}

function formatAmount(value: string) {
	const amount = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));

	return formatBillingInvoiceAmount(Number.isFinite(amount) ? amount : 0);
}

function formatInvoiceNo(value: string) {
	const numeric = value.replace(/\D/g, "");

	return numeric ? numeric.slice(-6).padStart(6, "0") : value || "-";
}

function formatReportDate(value: string) {
	const date = new Date(value);

	if (!value || Number.isNaN(date.getTime())) {
		return value || "-";
	}

	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(date);
}

const noBordersLayout = {
	hLineWidth: () => 0,
	vLineWidth: () => 0,
};

const outerLayout = {
	hLineWidth: (i: number, node: PdfTableLayoutNode) =>
		i === 0 || i === getRowCount(node) ? 1 : 0,
	vLineWidth: (i: number, node: PdfTableLayoutNode) =>
		i === 0 || i === getColumnCount(node) ? 1 : 0,
	hLineColor: () => "#000000",
	vLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const bottomBorderLayout = {
	hLineWidth: (i: number, node: PdfTableLayoutNode) =>
		i === getRowCount(node) ? 1 : 0,
	vLineWidth: () => 0,
	hLineColor: () => "#000000",
};

const thinGridLayout = {
	hLineWidth: () => 0.8,
	vLineWidth: () => 0.8,
	hLineColor: () => "#000000",
	vLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const invoiceBodyLayout = {
	hLineWidth: (i: number, node: PdfTableLayoutNode) =>
		i === getRowCount(node) ? 0 : 0.8,
	vLineWidth: (i: number, node: PdfTableLayoutNode) =>
		i === 0 || i === getColumnCount(node) ? 0 : 0.8,
	hLineColor: () => "#000000",
	vLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const footerLayout = {
	hLineWidth: (i: number, node: PdfTableLayoutNode) =>
		i === getRowCount(node) ? 0 : 0.8,
	vLineWidth: (i: number, node: PdfTableLayoutNode) =>
		i === 0 || i === getColumnCount(node) ? 0 : 0.8,
	hLineColor: () => "#000000",
	vLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const totalsLayout = {
	hLineWidth: (i: number, node: PdfTableLayoutNode) =>
		i === 0 || i === getRowCount(node) ? 0 : 0.8,
	vLineWidth: (i: number, node: PdfTableLayoutNode) =>
		i === 0 || i === getColumnCount(node) ? 0 : 0.8,
	hLineColor: () => "#000000",
	vLineColor: () => "#000000",
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

function getRowCount(node: PdfTableLayoutNode) {
	return node.table.body.length;
}

function getColumnCount(node: PdfTableLayoutNode) {
	const widths = node?.table?.widths;

	return Array.isArray(widths) ? widths.length : 0;
}
