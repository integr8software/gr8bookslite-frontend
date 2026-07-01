import type { ModuleTableExportRows } from "@/app/src/ui/shared/module/module-table/ModuleTableExportTypes";
import { getModuleTableExportThemeColors } from "@/app/src/ui/shared/module/module-table/ModuleTableExportTheme";

export async function createXlsxWorkbook(
	rows: ModuleTableExportRows,
	sheetName: string,
) {
	const ExcelJS = (await import("exceljs")).default;
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet(createExcelSheetName(sheetName));
	const themeColors = getModuleTableExportThemeColors();

	workbook.creator = "GR8Books";
	workbook.created = new Date();
	workbook.modified = new Date();
	worksheet.views = [{ state: "frozen", ySplit: 1 }];

	rows.forEach((row) => worksheet.addRow(row));

	const headerRow = worksheet.getRow(1);
	const maxColumnCount = rows.reduce(
		(currentCount, row) => Math.max(currentCount, row.length),
		0,
	);

	headerRow.height = 22;
	for (let columnIndex = 1; columnIndex <= maxColumnCount; columnIndex += 1) {
		const cell = headerRow.getCell(columnIndex);

		cell.font = { bold: true, color: { argb: themeColors.contrastArgb } };
		cell.fill = {
			fgColor: { argb: themeColors.accentArgb },
			pattern: "solid",
			type: "pattern",
		};
		cell.alignment = { vertical: "middle" };
	}

	Array.from({ length: maxColumnCount }).forEach((_, columnIndex) => {
		const column = worksheet.getColumn(columnIndex + 1);

		column.width = calculateExcelColumnWidth(rows, columnIndex);
		column.alignment = { vertical: "middle" };
	});

	return workbook.xlsx.writeBuffer();
}

function createExcelSheetName(sheetName: string) {
	const safeSheetName = sheetName.replace(/[\\/*?:[\]]/g, " ").trim();

	return safeSheetName.slice(0, 31) || "Sheet1";
}

function calculateExcelColumnWidth(
	rows: ModuleTableExportRows,
	columnIndex: number,
) {
	const maxLength = rows.reduce(
		(currentLength, row) =>
			Math.max(currentLength, String(row[columnIndex] ?? "").length),
		0,
	);

	return Math.min(42, Math.max(12, maxLength + 2));
}
