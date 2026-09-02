import { formatAmount } from "@/app/src/utils/currency.util";

export function createGridRowId(prefix = "grid") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatImportSourceSize(size: number) {
  if (size < 1024) {
    return `${Math.max(size, 1)} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function normalizeImportedAmount(value: string): string {
  const normalized = value.replace(/[₱,$\s]/g, "").replace(/,/g, "");
  const amount = Number(normalized || 0);

  return Number.isFinite(amount) && amount > 0 ? formatAmount(amount) : "";
}

export function normalizeTaxRate(value: string): string {
  if (!value.trim()) {
    return "0%";
  }

  const percent = Number.parseFloat(value.replace(/[^0-9.]/g, ""));

  return Number.isFinite(percent) ? `${percent}%` : value.trim();
}

export function formatTabularCell(value: string) {
  return String(value ?? "")
    .replace(/\r?\n/g, " ")
    .trim();
}

export function formatRowsAsTabularText(rows: string[][]) {
  return rows
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row) => row.map(formatTabularCell).join("\t"))
    .join("\n");
}

export function parseCsvRows(text: string): string[][] {
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

export async function readXlsxAccountingRawRows(buffer: ArrayBuffer): Promise<string[][]> {
  const entries = await readZipEntries(buffer);
  const sharedStrings = parseSharedStrings(entries.get("xl/sharedStrings.xml"));
  const sheetPath = findFirstWorksheetPath(entries);
  const sheetXml = entries.get(sheetPath);

  if (!sheetXml) {
    throw new Error("No worksheet was found in the Excel file.");
  }

  const documentNode = new DOMParser().parseFromString(sheetXml, "text/xml");
  const rows = Array.from(documentNode.getElementsByTagName("row")).map((row) => {
    const cells: string[] = [];

    Array.from(row.getElementsByTagName("c")).forEach((cell) => {
      const reference = cell.getAttribute("r") ?? "";
      const columnIndex = getExcelColumnIndex(reference);
      const cellType = cell.getAttribute("t");
      const rawValue =
        cellType === "inlineStr"
          ? Array.from(cell.getElementsByTagName("t"))
              .map((node) => node.textContent ?? "")
              .join("")
          : (cell.getElementsByTagName("v")[0]?.textContent ?? "");
      const value = cellType === "s" ? (sharedStrings[Number(rawValue)] ?? "") : rawValue;

      if (columnIndex >= 0) {
        cells[columnIndex] = value.trim();
      }
    });

    return cells;
  });

  return rows;
}

async function readZipEntries(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  const entries = new Map<string, string>();
  const eocdOffset = findEndOfCentralDirectory(view);
  const entryCount = view.getUint16(eocdOffset + 10, true);
  let centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
  const decoder = new TextDecoder();

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(centralDirectoryOffset, true) !== 0x02014b50) {
      break;
    }

    const compressionMethod = view.getUint16(centralDirectoryOffset + 10, true);
    const compressedSize = view.getUint32(centralDirectoryOffset + 20, true);
    const fileNameLength = view.getUint16(centralDirectoryOffset + 28, true);
    const extraLength = view.getUint16(centralDirectoryOffset + 30, true);
    const commentLength = view.getUint16(centralDirectoryOffset + 32, true);
    const localHeaderOffset = view.getUint32(centralDirectoryOffset + 42, true);
    const fileNameBytes = new Uint8Array(buffer, centralDirectoryOffset + 46, fileNameLength);
    const fileName = decoder.decode(fileNameBytes);
    const localFileNameLength = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
    const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
    const compressedBytes = buffer.slice(dataOffset, dataOffset + compressedSize);
    const fileText =
      compressionMethod === 0
        ? decoder.decode(compressedBytes)
        : compressionMethod === 8
          ? decoder.decode(await inflateRaw(compressedBytes))
          : "";

    if (fileText) {
      entries.set(fileName, fileText);
    }

    centralDirectoryOffset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(view: DataView) {
  const minimumOffset = Math.max(0, view.byteLength - 66000);

  for (let offset = view.byteLength - 22; offset >= minimumOffset; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      return offset;
    }
  }

  throw new Error("The Excel file could not be read.");
}

async function inflateRaw(compressedBytes: ArrayBuffer) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot read compressed Excel files.");
  }

  const stream = new Blob([compressedBytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));

  return new Response(stream).arrayBuffer();
}

function parseSharedStrings(xml?: string) {
  if (!xml) {
    return [];
  }

  const documentNode = new DOMParser().parseFromString(xml, "text/xml");

  return Array.from(documentNode.getElementsByTagName("si")).map((item) =>
    Array.from(item.getElementsByTagName("t"))
      .map((node) => node.textContent ?? "")
      .join(""),
  );
}

function findFirstWorksheetPath(entries: Map<string, string>) {
  if (entries.has("xl/worksheets/sheet1.xml")) {
    return "xl/worksheets/sheet1.xml";
  }

  const worksheetPath = Array.from(entries.keys()).find((path) => path.startsWith("xl/worksheets/") && path.endsWith(".xml"));

  if (!worksheetPath) {
    throw new Error("No worksheet was found in the Excel file.");
  }

  return worksheetPath;
}

function getExcelColumnIndex(reference: string) {
  const columnLetters = reference.match(/[A-Z]+/i)?.[0]?.toUpperCase() ?? "";

  if (!columnLetters) {
    return -1;
  }

  return (
    columnLetters.split("").reduce((sum, letter) => {
      return sum * 26 + letter.charCodeAt(0) - 64;
    }, 0) - 1
  );
}

let accountingGridTextMeasureContext: CanvasRenderingContext2D | null | undefined;

export function estimateGridTextWidth(value: string, horizontalPadding = 76) {
  const textWidth = measureGridTextWidth(value);

  return Math.min(800, Math.max(50, Math.ceil(textWidth + horizontalPadding)));
}

function measureGridTextWidth(value: string) {
  const fallbackWidth = estimateFallbackTextWidth(value);

  if (typeof document === "undefined") {
    return fallbackWidth;
  }

  if (accountingGridTextMeasureContext === undefined) {
    accountingGridTextMeasureContext = document.createElement("canvas").getContext("2d");
  }

  if (!accountingGridTextMeasureContext) {
    return fallbackWidth;
  }

  accountingGridTextMeasureContext.font = "500 14px Inter, Arial, Helvetica, sans-serif";

  return accountingGridTextMeasureContext.measureText(value).width;
}

function estimateFallbackTextWidth(value: string) {
  return Array.from(value).reduce((width, character) => width + getEstimatedCharacterWidth(character), 0);
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

  return 7;
}

export function downloadBytesFile(fileName: string, content: Uint8Array, type: string) {
  const buffer = new ArrayBuffer(content.byteLength);

  new Uint8Array(buffer).set(content);

  const blob = new Blob([buffer], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
