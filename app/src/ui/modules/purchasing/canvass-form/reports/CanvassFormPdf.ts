import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import {
	formatCanvassFormAmount,
	formatCanvassFormDate,
	getCanvassFormTotal,
	normalizeCanvassFormItem,
} from "@/app/src/data/modules/purchasing/canvass-form/CanvassFormData";
import type { CanvassFormRecord } from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import { createReportPdfCompanyHeader } from "@/app/src/ui/shared/reports/ReportPdfCompanyHeader";

pdfMake.addVirtualFileSystem(pdfFonts);

export function openCanvassFormPdf(record: CanvassFormRecord) {
	pdfMake.createPdf(createCanvassFormPdfDefinition(record)).open();
}

function createCanvassFormPdfDefinition(record: CanvassFormRecord): TDocumentDefinitions {
	return {
		pageSize: "A4",
		pageOrientation: "landscape",
		pageMargins: [24, 20, 24, 20],
		defaultStyle: { font: "Roboto", fontSize: 7, lineHeight: 1.1 },
		content: [
			{
				table: {
					widths: ["*"],
					body: [
						[header(record)],
						[info(record)],
						[remarks(record)],
						[items(record)],
						[signatures()],
					],
				},
				layout: gridLayout,
			},
		],
	};
}

function header(record: CanvassFormRecord): TableCell {
	return {
		table: {
			widths: ["*"],
			body: [
				[createReportPdfCompanyHeader()],
				[
					{
						table: {
							widths: ["*", 180],
							body: [
								[
									{
										text: "CANVASS FORM",
										bold: true,
										fontSize: 14,
										margin: [4, 4, 0, 3],
									},
									{
										stack: [
											`Document Date: ${formatCanvassFormDate(record.documentDate)}`,
											`Trans No.: ${record.transNo}`,
										],
										bold: true,
										alignment: "right",
										margin: [0, 4, 4, 3],
									},
								],
							],
						},
						layout: noBordersLayout,
					},
				],
			],
		},
		layout: noBordersLayout,
	};
}

function info(record: CanvassFormRecord): TableCell {
	return {
		table: {
			widths: ["*", "*", "*"],
			body: [
				[label("Requested By", record.requestedBy), label("Required Before", formatCanvassFormDate(record.requiredBefore)), label("Terms of Payment", record.termsOfPayment)],
				[label("Currency", record.currency), label("Status", record.status), label("Trans No.", record.transNo)],
			],
		},
		layout: gridLayout,
	};
}

function remarks(record: CanvassFormRecord): TableCell {
	return { text: [{ text: "Remarks: ", bold: true }, record.remarks], margin: [3, 3, 3, 18] };
}

function items(record: CanvassFormRecord): TableCell {
	const body: TableCell[][] = [
		["PR No.", "Item Code", "Description", "UOM", "Qty", "VAT Inc.", "VAT Ex.", "Supplier 1", "Cost 1", "Supplier 2", "Cost 2", "Supplier 3", "Cost 3", "Supplier 4", "Cost 4", "Selected", "Total"].map((text) => ({ text, bold: true })),
		...record.items.map((item) => {
			const normalized = normalizeCanvassFormItem(item);
			return [
				item.prNo,
				item.itemCode,
				item.description,
				item.uom,
				amount(item.quantity),
				item.vatInclusive,
				item.vatExclusive,
				item.supplierName1,
				amount(item.unitCost1),
				item.supplierName2,
				amount(item.unitCost2),
				item.supplierName3,
				amount(item.unitCost3),
				item.supplierName4,
				amount(item.unitCost4),
				item.selectedSupplier,
				amount(normalized.totalCost, true),
			] as TableCell[];
		}),
		[
			{ text: "Total:", bold: true, alignment: "right", colSpan: 16 },
			{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
			amount(getCanvassFormTotal(record), true),
		],
	];
	return { table: { headerRows: 1, widths: [48, 50, "*", 34, 38, 42, 42, 60, 44, 60, 44, 60, 44, 60, 44, 60, 54], body }, layout: gridLayout };
}

function signatures(): TableCell {
	return {
		table: { widths: ["*", "*", "*"], body: [[signature("Prepared by:"), signature("Checked by:"), signature("Approved by:")]] },
		layout: gridLayout,
	};
}

function label(labelText: string, value: string): TableCell {
	return { text: [{ text: `${labelText}: `, bold: true }, value], margin: [3, 3, 3, 3] };
}

function amount(value: number, bold = false): TableCell {
	return { text: formatCanvassFormAmount(value), alignment: "right", bold };
}

function signature(labelText: string): TableCell {
	return { text: labelText, margin: [3, 3, 3, 28] };
}

const noBordersLayout = {
	hLineWidth: () => 0,
	vLineWidth: () => 0,
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

const gridLayout = {
	hLineWidth: () => 0.45,
	vLineWidth: () => 0.45,
	paddingLeft: () => 2,
	paddingRight: () => 2,
	paddingTop: () => 2,
	paddingBottom: () => 2,
};
