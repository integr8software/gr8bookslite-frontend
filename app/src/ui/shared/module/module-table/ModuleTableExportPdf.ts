import type { ModuleTableExportRows } from "@/app/src/ui/shared/module/module-table/ModuleTableExportTypes";
import { getModuleTableExportThemeColors } from "@/app/src/ui/shared/module/module-table/ModuleTableExportTheme";

export function createSimplePdf(title: string, rows: ModuleTableExportRows) {
	const pageWidth = 792;
	const pageHeight = 612;
	const margin = 28;
	const tableWidth = pageWidth - margin * 2;
	const header = rows[0] ?? [];
	const bodyRows = rows.slice(1);
	const columnWidths = calculatePdfColumnWidths(rows, tableWidth);
	const themeColors = getModuleTableExportThemeColors();
	const pages = createPdfTablePages({
		bodyRows,
		columnWidths,
		header,
		margin,
		pageHeight,
		pageWidth,
		themeColors,
		title,
	});

	const objects: string[] = [];
	const pageObjectNumbers: number[] = [];
	const fontObjectNumber = 3;
	const boldFontObjectNumber = 4;
	let nextObjectNumber = 5;

	pages.forEach((content) => {
		const contentObjectNumber = nextObjectNumber;
		const pageObjectNumber = nextObjectNumber + 1;
		nextObjectNumber += 2;

		objects[contentObjectNumber] =
			`<< /Length ${byteLength(content)} >>\nstream\n${content}\nendstream`;
		objects[pageObjectNumber] =
			`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
			`/Resources << /Font << /F1 ${fontObjectNumber} 0 R /F2 ${boldFontObjectNumber} 0 R >> >> ` +
			`/Contents ${contentObjectNumber} 0 R >>`;
		pageObjectNumbers.push(pageObjectNumber);
	});

	objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
	objects[2] =
		`<< /Type /Pages /Count ${pageObjectNumbers.length} /Kids [` +
		pageObjectNumbers.map((objectNumber) => `${objectNumber} 0 R`).join(" ") +
		"] >>";
	objects[fontObjectNumber] =
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
	objects[boldFontObjectNumber] =
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

	return writePdfObjects(objects);
}

function createPdfTablePages({
	bodyRows,
	columnWidths,
	header,
	margin,
	pageHeight,
	pageWidth,
	themeColors,
	title,
}: {
	bodyRows: string[][];
	columnWidths: number[];
	header: string[];
	margin: number;
	pageHeight: number;
	pageWidth: number;
	themeColors: ReturnType<typeof getModuleTableExportThemeColors>;
	title: string;
}) {
	const pages: string[] = [];
	const headerHeight = 26;
	const titleHeight = 24;
	const footerHeight = 16;
	const tableBottom = margin + footerHeight;
	const firstTableTop = pageHeight - margin - titleHeight;
	const nextTableTop = pageHeight - margin;
	let commands: string[] = [];
	let pageIndex = 1;
	let y = firstTableTop;

	function startPage(isFirstPage: boolean) {
		commands = [];
		y = isFirstPage ? firstTableTop : nextTableTop;

		if (isFirstPage) {
			commands.push(createPdfText(title, margin, pageHeight - margin - 4, 12, true));
		}

		commands.push(
			createPdfTableRow({
				background: themeColors.accentPdfRgb,
				columnWidths,
				fontSize: 7,
				isBold: true,
				margin,
				row: header,
				rowHeight: headerHeight,
				textColor: themeColors.contrastPdfRgb,
				y,
			}),
		);
		y -= headerHeight;
	}

	function finishPage() {
		commands.push(
			createPdfText(
				`Page ${pageIndex}`,
				pageWidth - margin - 40,
				margin - 2,
				7,
			),
		);
		pages.push(commands.join("\n"));
		pageIndex += 1;
	}

	startPage(true);

	for (const row of bodyRows) {
		const rowLines = row.map((cell, index) =>
			wrapPdfCellText(cell, columnWidths[index] ?? 80, 7),
		);
		const maxRowHeight = Math.floor((pageHeight - margin * 2) * 0.38);
		const rowHeight = Math.max(
			24,
			Math.min(
				maxRowHeight,
				Math.max(...rowLines.map((lines) => lines.length)) * 9 + 10,
			),
		);

		if (y - rowHeight < tableBottom) {
			finishPage();
			startPage(false);
		}

		commands.push(
			createPdfTableRow({
				columnWidths,
				fontSize: 7,
				margin,
				row,
				rowHeight,
				y,
			}),
		);
		y -= rowHeight;
	}

	finishPage();

	return pages;
}

function createPdfTableRow({
	background,
	columnWidths,
	fontSize,
	isBold = false,
	margin,
	row,
	rowHeight,
	textColor = "0 0 0",
	y,
}: {
	background?: string;
	columnWidths: number[];
	fontSize: number;
	isBold?: boolean;
	margin: number;
	row: string[];
	rowHeight: number;
	textColor?: string;
	y: number;
}) {
	const commands: string[] = [];
	let x = margin;

	row.forEach((cell, index) => {
		const width = columnWidths[index] ?? 80;
		const textLines = wrapPdfCellText(cell, width, fontSize);

		if (background) {
			commands.push(
				`${background} rg ${formatPdfNumber(x)} ${formatPdfNumber(
					y - rowHeight,
				)} ${formatPdfNumber(width)} ${formatPdfNumber(rowHeight)} re f`,
			);
		}

		commands.push(
			`0.82 0.86 0.9 RG ${formatPdfNumber(x)} ${formatPdfNumber(
				y - rowHeight,
			)} ${formatPdfNumber(width)} ${formatPdfNumber(rowHeight)} re S`,
		);
		textLines
			.slice(0, Math.max(1, Math.floor((rowHeight - 8) / 9)))
			.forEach((line, lineIndex) => {
				commands.push(
				createPdfText(
					line,
					x + 4,
					y - 11 - lineIndex * 9,
					fontSize,
					isBold,
					textColor,
				),
			);
		});
		x += width;
	});

	return commands.join("\n");
}

function createPdfText(
	text: string,
	x: number,
	y: number,
	fontSize: number,
	isBold = false,
	color = "0 0 0",
) {
	return [
		"BT",
		`${isBold ? "/F2" : "/F1"} ${fontSize} Tf`,
		`${color} rg ${formatPdfNumber(x)} ${formatPdfNumber(y)} Td`,
		`(${escapePdfText(text)}) Tj`,
		"ET",
	].join("\n");
}

function calculatePdfColumnWidths(
	rows: ModuleTableExportRows,
	tableWidth: number,
) {
	const columnCount = rows[0]?.length ?? 1;
	const minimumWidth = Math.max(42, Math.floor(tableWidth / columnCount) * 0.45);
	const weights = Array.from({ length: columnCount }, (_, index) => {
		const headerLength = rows[0]?.[index]?.length ?? 8;
		const contentLength = rows
			.slice(1)
			.reduce(
				(maxLength, row) =>
					Math.max(maxLength, String(row[index] ?? "").length),
				headerLength,
			);

		return Math.min(3.2, Math.max(1, Math.sqrt(contentLength / 14)));
	});
	const totalWeight = weights.reduce((total, weight) => total + weight, 0);
	const availableWidth = tableWidth - minimumWidth * columnCount;
	const widths = weights.map(
		(weight) => minimumWidth + (availableWidth * weight) / totalWeight,
	);
	const widthDelta =
		tableWidth - widths.reduce((total, width) => total + width, 0);

	widths[widths.length - 1] = (widths.at(-1) ?? minimumWidth) + widthDelta;

	return widths;
}

function wrapPdfCellText(value: string, width: number, fontSize: number) {
	const maxLineLength = Math.max(
		6,
		Math.floor((width - 8) / Math.max(3.4, fontSize * 0.5)),
	);
	const text = String(value ?? "").replace(/\s+/g, " ").trim();

	if (!text) {
		return [""];
	}

	const chunks: string[] = [];
	let remaining = text;

	while (remaining.length > maxLineLength) {
		const breakIndex = Math.max(
			remaining.lastIndexOf(" ", maxLineLength),
			Math.floor(maxLineLength * 0.75),
		);

		chunks.push(remaining.slice(0, breakIndex).trimEnd());
		remaining = remaining.slice(breakIndex).trimStart();
	}

	chunks.push(remaining);
	return chunks;
}

function formatPdfNumber(value: number) {
	return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function writePdfObjects(objects: string[]) {
	const parts = ["%PDF-1.4\n"];
	const offsets: number[] = [0];
	let offset = byteLength(parts[0]);

	for (let objectNumber = 1; objectNumber < objects.length; objectNumber += 1) {
		const object = objects[objectNumber];

		if (!object) {
			continue;
		}

		offsets[objectNumber] = offset;
		const part = `${objectNumber} 0 obj\n${object}\nendobj\n`;

		parts.push(part);
		offset += byteLength(part);
	}

	const xrefOffset = offset;
	const xrefRows = Array.from({ length: objects.length }, (_, index) =>
		index === 0
			? "0000000000 65535 f "
			: `${String(offsets[index] ?? 0).padStart(10, "0")} 00000 n `,
	).join("\n");
	const trailer =
		`xref\n0 ${objects.length}\n${xrefRows}\n` +
		`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\n` +
		`startxref\n${xrefOffset}\n%%EOF`;

	parts.push(trailer);
	return new TextEncoder().encode(parts.join(""));
}

function byteLength(value: string) {
	return new TextEncoder().encode(value).byteLength;
}

function escapePdfText(value: string) {
	return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
