import type { TableCell } from "pdfmake/interfaces";

type ReportPdfCompanyHeaderInput = {
	address?: string;
	companyName?: string;
	isCompact?: boolean;
	logoImageSrc?: string;
	logoText?: string;
	telephoneNo?: string;
	vatRegTin?: string;
};

const DefaultCompanyAddress =
	"ABC, 123, Sample, Malamig, City Of Mandaluyong, NCR, Second District";

export function createReportPdfCompanyHeader({
	address = DefaultCompanyAddress,
	companyName = "Your Company Name Here",
	isCompact = false,
	logoImageSrc,
	logoText = "gr8books\nneo",
	telephoneNo = "0967-237-4514",
	vatRegTin = "000-000-000-000",
}: ReportPdfCompanyHeaderInput = {}): TableCell {
	return toTableCell({
		table: {
			widths: [120, "*", 120],
			body: [
				[
					logoImageSrc
						? {
								image: logoImageSrc,
								fit: [72, 58],
								alignment: "center",
								margin: [8, 8, 0, 8],
							}
						: {
								text: logoText,
								bold: true,
								color: "#174ea6",
								fontSize: 15,
								margin: [8, 15, 0, 8],
							},
					{
						stack: [
							headerText(companyName, 10),
							headerText(`VAT REG TIN : ${vatRegTin}`),
							headerText(address),
							headerText(
								`Telephone No: ${telephoneNo}`,
								7,
								isCompact ? [0, 2, 0, 0] : [0, 8, 0, 0],
							),
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

function headerText(text: string, fontSize = 7, margin: number[] = [0, 2, 0, 0]) {
	return {
		text,
		alignment: "center",
		bold: true,
		fontSize,
		margin,
	};
}

const noBordersLayout = {
	hLineWidth: () => 0,
	vLineWidth: () => 0,
	paddingLeft: () => 0,
	paddingRight: () => 0,
	paddingTop: () => 0,
	paddingBottom: () => 0,
};

function toTableCell(value: unknown): TableCell {
	return value as TableCell;
}
