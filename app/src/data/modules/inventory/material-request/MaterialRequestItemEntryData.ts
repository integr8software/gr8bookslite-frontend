import {
	DefaultImportIndexes,
	DefaultItemColumnLabels,
	DefaultItemColumnOrder,
	DefaultRequiredItemColumnIds,
	DefaultRequiredItemColumnOrder,
	DefaultVisibleItemColumnOrder,
	LegacyDefaultItemColumnOrder,
} from "@/app/src/constants/modules/inventory/material-request/MaterialRequestItemEntryConstants";
import {
	createMaterialRequestId,
	emptyMaterialRequestItem,
} from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import type {
	MaterialRequestImportPreviewRow,
	MaterialRequestItemColumnId,
	MaterialRequestItemValidationMessages,
	MaterialRequestItemValidationResult,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestItemEntryTypes";
import type {
	MaterialRequestItem,
	MaterialRequestNumberValue,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { MaterialRequestItemValidationSchema } from "@/app/src/validations/modules/inventory/material-request/MaterialRequestValidation";

let materialRequestTextMeasureContext:
	| CanvasRenderingContext2D
	| null
	| undefined;

export function parseNumberInputValue(value: string): MaterialRequestNumberValue {
	if (value.trim() === "") {
		return "";
	}

	const numberValue = Number(value);

	return Number.isFinite(numberValue) ? numberValue : "";
}

export function formatNumberInputValue(value: MaterialRequestNumberValue) {
	return value === "" ? "" : String(value);
}

export function parseMaterialRequestImportText(
	text: string,
	requiredColumnIds: MaterialRequestItemColumnId[],
) {
	const trimmedText = text.trim();

	if (!trimmedText) {
		throw new Error("No item rows were found to import.");
	}

	const delimiter = trimmedText.includes("\t") ? "\t" : ",";
	const rows =
		delimiter === "\t"
			? trimmedText
				.split(/\r?\n/)
				.map((line) => line.split("\t").map((cell) => cell.trim()))
			: parseCsvRows(trimmedText);
	const nonEmptyRows = rows.filter((row) =>
		row.some((cell) => String(cell ?? "").trim() !== ""),
	);

	if (nonEmptyRows.length === 0) {
		throw new Error("No item rows were found to import.");
	}

	const headerIndexes = getImportHeaderIndexes(nonEmptyRows[0]);
	const dataRows = headerIndexes ? nonEmptyRows.slice(1) : nonEmptyRows;
	const indexes = headerIndexes ?? DefaultImportIndexes;
	const previewRows = dataRows
		.map((row) => createImportPreviewRow(row, indexes, requiredColumnIds))
		.filter((row) => materialRequestItemHasData(row.item));

	if (previewRows.length === 0) {
		throw new Error("The import did not contain usable item rows.");
	}

	return previewRows;
}

function createImportPreviewRow(
	row: string[],
	indexes: Partial<Record<MaterialRequestItemColumnId, number>>,
	requiredColumnIds: MaterialRequestItemColumnId[],
): MaterialRequestImportPreviewRow {
	const item: MaterialRequestItem = {
		...emptyMaterialRequestItem,
		batchNo: getImportedValue(row, indexes.batchNo),
		barcode: getImportedValue(row, indexes.barcode),
		brand: getImportedValue(row, indexes.brand),
		category: getImportedValue(row, indexes.category),
		color: getImportedValue(row, indexes.color),
		costCenter: getImportedValue(row, indexes.costCenter),
		description: getImportedValue(row, indexes.description),
		expiryDate: getImportedValue(row, indexes.expiryDate),
		id: createMaterialRequestId("import-item"),
		itemCode: getImportedValue(row, indexes.itemCode),
		itemName: getImportedValue(row, indexes.itemName),
		lotNo: getImportedValue(row, indexes.lotNo),
		location: getImportedValue(row, indexes.location),
		manufacturingDate: getImportedValue(row, indexes.manufacturingDate),
		model: getImportedValue(row, indexes.model),
		requestQuantity: normalizeImportedNumber(
			getImportedValue(row, indexes.requestQuantity),
		),
		remarks: getImportedValue(row, indexes.remarks),
		serialNumber: getImportedValue(row, indexes.serialNumber),
		size: getImportedValue(row, indexes.size),
		stockQuantity: normalizeImportedNumber(
			getImportedValue(row, indexes.stockQuantity),
		),
		unitCost: normalizeImportedNumber(getImportedValue(row, indexes.unitCost)),
		unitPrice: normalizeImportedNumber(
			getImportedValue(row, indexes.unitPrice),
		),
		uom: getImportedValue(row, indexes.uom) || emptyMaterialRequestItem.uom,
		warehouse: getImportedValue(row, indexes.warehouse),
	};

	return {
		...validateImportItem(item, requiredColumnIds),
		id: createMaterialRequestId("import-row"),
		item,
	};
}

export function validateImportItem(
	item: MaterialRequestItem,
	requiredColumnIds: MaterialRequestItemColumnId[],
): MaterialRequestItemValidationResult {
	const fieldErrors = createItemValidationMessages(item, requiredColumnIds);
	const errors = Object.values(fieldErrors);

	return {
		errors: Array.from(new Set(errors)),
		fieldErrors,
	};
}

export function createItemValidationMessagesById(
	items: MaterialRequestItem[],
	requiredColumnIds: MaterialRequestItemColumnId[],
) {
	const messagesById = new Map<string, MaterialRequestItemValidationMessages>();

	items.forEach((item) => {
		const fieldErrors = createItemValidationMessages(item, requiredColumnIds);

		if (Object.keys(fieldErrors).length > 0) {
			messagesById.set(item.id, fieldErrors);
		}
	});

	return messagesById;
}

export function filterItemValidationMessagesByTouchedCells(
	messagesById: Map<string, MaterialRequestItemValidationMessages>,
	touchedItemCellIds: Set<string>,
) {
	const touchedMessagesById =
		new Map<string, MaterialRequestItemValidationMessages>();

	messagesById.forEach((fieldErrors, itemId) => {
		const touchedFieldErrors: MaterialRequestItemValidationMessages = {};

		Object.entries(fieldErrors).forEach(([columnId, message]) => {
			if (
				message &&
				isItemColumnId(columnId) &&
				touchedItemCellIds.has(createItemCellId(itemId, columnId))
			) {
				touchedFieldErrors[columnId] = message;
			}
		});

		if (Object.keys(touchedFieldErrors).length > 0) {
			touchedMessagesById.set(itemId, touchedFieldErrors);
		}
	});

	return touchedMessagesById;
}

function createItemValidationMessages(
	item: MaterialRequestItem,
	requiredColumnIds: MaterialRequestItemColumnId[],
) {
	const result = MaterialRequestItemValidationSchema.safeParse(item);
	const fieldErrors: MaterialRequestItemValidationMessages = {};

	if (!result.success) {
		result.error.issues.forEach((issue) => {
			const columnId = issue.path[0];

			if (
				typeof columnId === "string" &&
				isItemColumnId(columnId) &&
				!fieldErrors[columnId]
			) {
				fieldErrors[columnId] = issue.message;
			}
		});
	}

	requiredColumnIds.forEach((columnId) => {
		if (DefaultRequiredItemColumnIds.has(columnId)) {
			return;
		}

		if (itemColumnHasRequiredValue(item, columnId)) {
			return;
		}

		fieldErrors[columnId] =
			fieldErrors[columnId] ??
			`Enter ${DefaultItemColumnLabels[columnId].toLowerCase()}.`;
	});

	return fieldErrors;
}

function getImportHeaderIndexes(row: string[]) {
	const indexes: Partial<Record<MaterialRequestItemColumnId, number>> = {};

	row.forEach((cell, index) => {
		const key = normalizeImportHeader(cell);

		if (key) {
			indexes[key] = index;
		}
	});

	return Object.keys(indexes).length >= 2
		? (indexes as Partial<Record<MaterialRequestItemColumnId, number>>)
		: null;
}

function normalizeImportHeader(value: string): MaterialRequestItemColumnId | null {
	const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

	if (["itemcode", "code", "sku"].includes(normalized)) {
		return "itemCode";
	}

	if (["barcode", "barcodeno"].includes(normalized)) {
		return "barcode";
	}

	if (["itemname", "name"].includes(normalized)) {
		return "itemName";
	}

	if (["description", "itemdescription", "desc"].includes(normalized)) {
		return "description";
	}

	if (["itemcategory", "category"].includes(normalized)) {
		return "category";
	}

	if (["uom", "unit", "unitofmeasure"].includes(normalized)) {
		return "uom";
	}

	if (["requestqty", "requestquantity", "qty", "quantity"].includes(normalized)) {
		return "requestQuantity";
	}

	if (["stockqty", "stockquantity", "stock"].includes(normalized)) {
		return "stockQuantity";
	}

	if (["lotno", "lotnumber", "lot"].includes(normalized)) {
		return "lotNo";
	}

	if (["serialnumber", "serialno", "serial", "sn"].includes(normalized)) {
		return "serialNumber";
	}

	if (["expirydate", "expirationdate", "expiry", "expiration"].includes(normalized)) {
		return "expiryDate";
	}

	if (["costcenter", "responsibilitycenter", "responsibility"].includes(normalized)) {
		return "costCenter";
	}

	if (["color", "colour"].includes(normalized)) {
		return "color";
	}

	if (["brand"].includes(normalized)) {
		return "brand";
	}

	if (["size"].includes(normalized)) {
		return "size";
	}

	if (["model"].includes(normalized)) {
		return "model";
	}

	if (["manufacturingdate", "manufacturedate", "mfgdate"].includes(normalized)) {
		return "manufacturingDate";
	}

	if (["location", "binlocation", "bin"].includes(normalized)) {
		return "location";
	}

	if (["warehouse", "whse"].includes(normalized)) {
		return "warehouse";
	}

	if (["unitcost", "cost"].includes(normalized)) {
		return "unitCost";
	}

	if (["unitprice", "price"].includes(normalized)) {
		return "unitPrice";
	}

	if (["batchno", "batchnumber", "batch"].includes(normalized)) {
		return "batchNo";
	}

	if (["remarks", "remark", "notes", "memo"].includes(normalized)) {
		return "remarks";
	}

	return null;
}

function parseCsvRows(text: string) {
	const rows: string[][] = [];
	let cell = "";
	let row: string[] = [];
	let isQuoted = false;

	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		const nextChar = text[index + 1];

		if (char === '"' && isQuoted && nextChar === '"') {
			cell += '"';
			index += 1;
			continue;
		}

		if (char === '"') {
			isQuoted = !isQuoted;
			continue;
		}

		if (char === "," && !isQuoted) {
			row.push(cell.trim());
			cell = "";
			continue;
		}

		if ((char === "\n" || char === "\r") && !isQuoted) {
			if (char === "\r" && nextChar === "\n") {
				index += 1;
			}

			row.push(cell.trim());
			rows.push(row);
			row = [];
			cell = "";
			continue;
		}

		cell += char;
	}

	row.push(cell.trim());
	rows.push(row);

	return rows;
}

function getImportedValue(row: string[], index?: number) {
	return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}

function normalizeImportedNumber(value: string) {
	const normalizedValue = value.replace(/[,$\s]/g, "");

	if (!normalizedValue) {
		return "";
	}

	const amount = Number(normalizedValue);

	return Number.isFinite(amount) ? amount : "";
}

export function parsePastedItemCellValue(
	columnId: MaterialRequestItemColumnId,
	value: string,
) {
	if (isNumericItemColumn(columnId)) {
		return normalizeImportedNumber(value);
	}

	return String(value ?? "").trim();
}

function itemColumnHasRequiredValue(
	item: MaterialRequestItem,
	columnId: MaterialRequestItemColumnId,
) {
	if (isNumericItemColumn(columnId)) {
		const value = item[columnId];

		if (value === "") {
			return false;
		}

		return columnId === "requestQuantity" ? Number(value) > 0 : Number(value) >= 0;
	}

	return String(item[columnId] ?? "").trim() !== "";
}

export async function readMaterialRequestImportFileText(file: File) {
	const fileName = file.name.toLowerCase();

	if (fileName.endsWith(".xlsx")) {
		const rows = await readMaterialRequestXlsxRawRows(await file.arrayBuffer());

		return formatRowsAsTabularText(rows);
	}

	if (
		fileName.endsWith(".csv") ||
		fileName.endsWith(".tsv") ||
		fileName.endsWith(".txt")
	) {
		return (await file.text()).trim();
	}

	throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

async function readMaterialRequestXlsxRawRows(buffer: ArrayBuffer) {
	const ExcelJS = await loadExcelJs();
	const workbook = new ExcelJS.Workbook();

	await workbook.xlsx.load(buffer);

	const worksheet = workbook.worksheets[0];

	if (!worksheet) {
		throw new Error("No worksheet was found in the Excel file.");
	}

	const rows: string[][] = [];

	worksheet.eachRow({ includeEmpty: false }, (row) => {
		const cells: string[] = [];

		row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
			cells[columnNumber - 1] = formatExcelCellValue(cell.value, cell.text);
		});

		rows.push(cells);
	});

	return rows;
}

function formatRowsAsTabularText(rows: string[][]) {
	return rows
		.filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
		.map((row) => row.map(formatTabularCell).join("\t"))
		.join("\n");
}

function formatTabularCell(value: string) {
	return String(value ?? "")
		.replace(/\r?\n/g, " ")
		.trim();
}

export function materialRequestItemHasData(item: MaterialRequestItem) {
	return (
		item.batchNo.trim() !== "" ||
		item.barcode.trim() !== "" ||
		item.brand.trim() !== "" ||
		item.category.trim() !== "" ||
		item.color.trim() !== "" ||
		item.costCenter.trim() !== "" ||
		item.description.trim() !== "" ||
		item.expiryDate.trim() !== "" ||
		item.itemCode.trim() !== "" ||
		item.itemName.trim() !== "" ||
		item.lotNo.trim() !== "" ||
		item.location.trim() !== "" ||
		item.manufacturingDate.trim() !== "" ||
		item.model.trim() !== "" ||
		item.remarks.trim() !== "" ||
		item.serialNumber.trim() !== "" ||
		item.size.trim() !== "" ||
		item.requestQuantity !== emptyMaterialRequestItem.requestQuantity ||
		item.stockQuantity !== emptyMaterialRequestItem.stockQuantity ||
		item.unitCost !== emptyMaterialRequestItem.unitCost ||
		item.unitPrice !== emptyMaterialRequestItem.unitPrice ||
		item.warehouse.trim() !== "" ||
		item.uom !== emptyMaterialRequestItem.uom
	);
}

export function isNumericItemColumn(columnId: MaterialRequestItemColumnId) {
	return (
		columnId === "requestQuantity" ||
		columnId === "stockQuantity" ||
		columnId === "unitCost" ||
		columnId === "unitPrice"
	);
}

export function isDateItemColumn(columnId: MaterialRequestItemColumnId) {
	return columnId === "expiryDate" || columnId === "manufacturingDate";
}

export function isItemColumnId(columnId: string): columnId is MaterialRequestItemColumnId {
	return DefaultItemColumnOrder.includes(
		columnId as MaterialRequestItemColumnId,
	);
}

export function mergeDefaultItemColumnOrder(
	columnIds: MaterialRequestItemColumnId[],
) {
	const defaultColumnIds = new Set(DefaultItemColumnOrder);
	const customColumnIds = columnIds.filter(
		(columnId) => !defaultColumnIds.has(columnId),
	);

	return [...DefaultItemColumnOrder, ...customColumnIds];
}

export function resolveVisibleItemColumnIds(
	columnIds: MaterialRequestItemColumnId[],
) {
	const normalizedColumnIds = columnIds.filter(isItemColumnId);

	if (isSameItemColumnOrder(normalizedColumnIds, LegacyDefaultItemColumnOrder)) {
		return DefaultVisibleItemColumnOrder;
	}

	const visibleColumnIds = new Set([
		...DefaultRequiredItemColumnOrder,
		...normalizedColumnIds,
	]);

	return DefaultVisibleItemColumnOrder.filter((columnId) =>
		visibleColumnIds.has(columnId),
	);
}

function isSameItemColumnOrder(
	firstColumnIds: MaterialRequestItemColumnId[],
	secondColumnIds: readonly MaterialRequestItemColumnId[],
) {
	return (
		firstColumnIds.length === secondColumnIds.length &&
		firstColumnIds.every(
			(columnId, index) => columnId === secondColumnIds[index],
		)
	);
}

export function createItemCellId(
	itemId: string,
	columnId: MaterialRequestItemColumnId,
) {
	return `${itemId}:${columnId}`;
}


export function downloadBytesFile(
	fileName: string,
	content: BlobPart,
	type: string,
) {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");

	link.href = url;
	link.download = fileName;
	link.click();
	URL.revokeObjectURL(url);
}

async function loadExcelJs() {
	const ExcelJS = await import("exceljs");

	return ExcelJS.default;
}

export async function createXlsxWorkbook(rows: string[][], sheetName: string) {
	const ExcelJS = await loadExcelJs();
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet(createExcelSheetName(sheetName));

	workbook.creator = "GR8Books";
	workbook.created = new Date();
	workbook.modified = new Date();
	worksheet.views = [{ state: "frozen", ySplit: 1 }];

	rows.forEach((row) => {
		worksheet.addRow(row);
	});

	const headerRow = worksheet.getRow(1);

	headerRow.height = 22;
	headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
	headerRow.fill = {
		fgColor: { argb: "FF22C55E" },
		pattern: "solid",
		type: "pattern",
	};
	headerRow.alignment = { vertical: "middle" };

	const maxColumnCount = rows.reduce(
		(currentCount, row) => Math.max(currentCount, row.length),
		0,
	);

	Array.from({ length: maxColumnCount }).forEach((_, columnIndex) => {
		const column = worksheet.getColumn(columnIndex + 1);

		column.width = calculateExcelColumnWidth(rows, columnIndex);
		column.alignment = { vertical: "middle" };
	});

	worksheet.eachRow((row) => {
		row.eachCell({ includeEmpty: true }, (cell) => {
			cell.border = {
				bottom: { color: { argb: "FFE5E7EB" }, style: "thin" },
				left: { color: { argb: "FFE5E7EB" }, style: "thin" },
				right: { color: { argb: "FFE5E7EB" }, style: "thin" },
				top: { color: { argb: "FFE5E7EB" }, style: "thin" },
			};
		});
	});

	return workbook.xlsx.writeBuffer();
}

function createExcelSheetName(sheetName: string) {
	const safeSheetName = sheetName.replace(/[\\/*?:[\]]/g, " ").trim();

	return safeSheetName.slice(0, 31) || "Sheet1";
}

function calculateExcelColumnWidth(rows: string[][], columnIndex: number) {
	const maxLength = rows.reduce((currentLength, row) => {
		return Math.max(currentLength, String(row[columnIndex] ?? "").length);
	}, 0);

	return Math.min(42, Math.max(12, maxLength + 2));
}

function formatExcelCellValue(value: unknown, displayText?: string) {
	const normalizedDisplayText = String(displayText ?? "")
		.replace(/\r?\n/g, " ")
		.trim();

	if (normalizedDisplayText) {
		return normalizedDisplayText;
	}

	if (value == null) {
		return "";
	}

	if (value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}

	if (typeof value === "object" && isRecord(value)) {
		if (Array.isArray(value.richText)) {
			return value.richText
				.map((part) =>
					isRecord(part) ? String(part.text ?? "") : "",
				)
				.join("")
				.replace(/\r?\n/g, " ")
				.trim();
		}

		if ("text" in value) {
			return String(value.text ?? "")
				.replace(/\r?\n/g, " ")
				.trim();
		}

		if ("result" in value) {
			return formatExcelCellValue(value.result);
		}
	}

	return String(value).replace(/\r?\n/g, " ").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function createSimplePdf(title: string, rows: string[][]) {
	const pageWidth = 792;
	const pageHeight = 612;
	const margin = 36;
	const lineHeight = 14;
	const maxLineLength = 132;
	const lines = [
		title,
		`Generated: ${new Date().toLocaleString()}`,
		"",
		...rows.map((row) =>
			row
				.map((cell) => String(cell ?? "").replace(/\s+/g, " ").trim())
				.join(" | "),
		),
	];
	const pages: string[][] = [];
	let currentPage: string[] = [];

	lines.flatMap((line) => wrapPdfLine(line, maxLineLength)).forEach((line) => {
		if (currentPage.length >= Math.floor((pageHeight - margin * 2) / lineHeight)) {
			pages.push(currentPage);
			currentPage = [];
		}

		currentPage.push(line);
	});

	if (currentPage.length > 0) {
		pages.push(currentPage);
	}

	const objects: string[] = [];
	const pageObjectNumbers: number[] = [];
	const fontObjectNumber = 3;
	let nextObjectNumber = 4;

	pages.forEach((pageLines) => {
		const contentObjectNumber = nextObjectNumber;
		const pageObjectNumber = nextObjectNumber + 1;
		nextObjectNumber += 2;
		const content = createPdfPageContent(pageLines, margin, pageHeight, lineHeight);

		objects[contentObjectNumber] =
			`<< /Length ${byteLength(content)} >>\nstream\n${content}\nendstream`;
		objects[pageObjectNumber] =
			`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
			`/Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> ` +
			`/Contents ${contentObjectNumber} 0 R >>`;
		pageObjectNumbers.push(pageObjectNumber);
	});

	objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
	objects[2] =
		`<< /Type /Pages /Count ${pageObjectNumbers.length} /Kids [` +
		pageObjectNumbers.map((objectNumber) => `${objectNumber} 0 R`).join(" ") +
		"] >>";
	objects[fontObjectNumber] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

	return writePdfObjects(objects);
}

function createPdfPageContent(
	lines: string[],
	margin: number,
	pageHeight: number,
	lineHeight: number,
) {
	const startY = pageHeight - margin;

	return [
		"BT",
		"/F1 9 Tf",
		`${margin} ${startY} Td`,
		...lines.flatMap((line, index) => [
			index === 0 ? "" : `0 -${lineHeight} Td`,
			`(${escapePdfText(line)}) Tj`,
		]),
		"ET",
	]
		.filter(Boolean)
		.join("\n");
}

function wrapPdfLine(line: string, maxLineLength: number) {
	if (line.length <= maxLineLength) {
		return [line];
	}

	const chunks: string[] = [];
	let remaining = line;

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
	const xrefRows = Array.from({ length: objects.length }, (_, index) => {
		if (index === 0) {
			return "0000000000 65535 f ";
		}

		return `${String(offsets[index] ?? 0).padStart(10, "0")} 00000 n `;
	}).join("\n");
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
export function calculateItemColumnFitWidth({
	columnId,
	columnLabels,
	items,
}: {
	columnId: MaterialRequestItemColumnId;
	columnLabels: Record<MaterialRequestItemColumnId, string>;
	items: MaterialRequestItem[];
}) {
	const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
	const contentWidth = items.reduce(
		(currentWidth, item) =>
			Math.max(
				currentWidth,
				estimateTextWidth(String(item[columnId] ?? ""), 24),
			),
		50,
	);

	return Math.max(headerWidth, contentWidth);
}

function estimateTextWidth(value: string, horizontalPadding: number) {
	const textWidth = measureTextWidth(value);

	return Math.min(
		800,
		Math.max(50, Math.ceil(textWidth + horizontalPadding)),
	);
}

function measureTextWidth(value: string) {
	const fallbackWidth = estimateFallbackTextWidth(value);

	if (typeof document === "undefined") {
		return fallbackWidth;
	}

	if (materialRequestTextMeasureContext === undefined) {
		materialRequestTextMeasureContext = document
			.createElement("canvas")
			.getContext("2d");
	}

	if (!materialRequestTextMeasureContext) {
		return fallbackWidth;
	}

	materialRequestTextMeasureContext.font =
		"500 14px Inter, Arial, Helvetica, sans-serif";

	return materialRequestTextMeasureContext.measureText(value).width;
}

function estimateFallbackTextWidth(value: string) {
	return Array.from(value).reduce(
		(width, character) => width + getEstimatedCharacterWidth(character),
		0,
	);
}

function getEstimatedCharacterWidth(character: string) {
	if (character === " ") {
		return 4;
	}

	if ("ilI.,:;!'`|".includes(character)) {
		return 4.2;
	}

	if ("mwMW@#%&".includes(character)) {
		return 9.2;
	}

	if (/[0-9]/.test(character)) {
		return 7.4;
	}

	if (/[A-Z]/.test(character)) {
		return 7.6;
	}

	return character.charCodeAt(0) > 127 ? 7.8 : 6.8;
}



