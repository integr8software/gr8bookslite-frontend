import type { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import {
  DisbursementAccountingImportTemplateColumnWidths,
  DisbursementAccountingImportTemplateHeaders,
  DisbursementAccountingImportTemplateRows,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryConstants";
import { formatCurrency, formatDateLabel } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type {
  DisbursementAccountingExportTheme,
  DisbursementAccountingGridColumnId,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherDataEntryTypes";
import type {
  DisbursementVoucherAccountingGridSession,
  DisbursementVoucherFormValues,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  formatAmountValue,
  formatRowsAsTabularText,
  normalizeAmount,
  readXlsxAccountingRawRows,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/entries/DisbursementVoucherAccountingGridImportUtils";

type GridColumnId = DisbursementAccountingGridColumnId;
type AccountingExportTheme = DisbursementAccountingExportTheme;
const AccountingDebitColumnId: GridColumnId = "debit";
const AccountingCreditColumnId: GridColumnId = "credit";
const AccountingAmountColumnIds = new Set<GridColumnId>([AccountingDebitColumnId, AccountingCreditColumnId]);
const AccountingWorksheetBorderColorArgb = "FFE5E7EB";

export function downloadAccountingImportTemplate() {
  const workbookBytes = createAccountingImportTemplateWorkbook();
  const templateBlob = new Blob([workbookBytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const downloadUrl = URL.createObjectURL(templateBlob);
  const anchor = document.createElement("a");

  anchor.href = downloadUrl;
  anchor.download = "disbursement-voucher-accounting-template.xlsx";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
}

function createAccountingImportTemplateWorkbook() {
  return createAccountingWorkbook({
    amountColumnIndexes: new Set([4, 5]),
    columnWidths: DisbursementAccountingImportTemplateColumnWidths,
    rows: [DisbursementAccountingImportTemplateHeaders, ...DisbursementAccountingImportTemplateRows],
    sheetName: "Accounting Entries",
    theme: getAccountingExportTheme(),
  });
}

export function createAccountingPdfDefinition(
  exportData: {
    amountColumnIndexes: Set<number>;
    rows: string[][];
    visibleColumnIds: GridColumnId[];
  },
  session: DisbursementVoucherAccountingGridSession | null,
  theme: AccountingExportTheme,
): TDocumentDefinitions {
  const [headers = [], ...bodyRows] = exportData.rows;
  const values = session?.values;
  const debitTotal = getPdfColumnTotal(bodyRows, exportData.visibleColumnIds, AccountingDebitColumnId);
  const creditTotal = getPdfColumnTotal(bodyRows, exportData.visibleColumnIds, AccountingCreditColumnId);
  const tableBody: TableCell[][] = [
    headers.map((header) => pdfHeaderCell(header, theme)),
    ...bodyRows.map((row) => row.map((value, columnIndex) => pdfBodyCell(value, exportData.amountColumnIndexes.has(columnIndex)))),
  ];

  if (bodyRows.length === 0) {
    tableBody.push([
      {
        text: "No accounting entries to export.",
        colSpan: Math.max(headers.length, 1),
        italics: true,
        color: "#64748B",
        margin: [4, 5, 4, 5],
      },
      ...Array.from({ length: Math.max(headers.length - 1, 0) }, () => ({})),
    ]);
  }

  tableBody.push(createPdfTotalsRow(headers.length, exportData.visibleColumnIds, debitTotal, creditTotal));

  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [24, 24, 24, 24],
    defaultStyle: {
      font: "Roboto",
      fontSize: 8,
      lineHeight: 1.15,
    },
    content: [
      {
        text: "DISBURSEMENT VOUCHER",
        bold: true,
        fontSize: 16,
        color: "#212738",
      },
      {
        text: "Accounting Entries",
        bold: true,
        fontSize: 10,
        color: theme.accentColor,
        margin: [0, 2, 0, 10],
      },
      createPdfVoucherDetails(values),
      {
        table: {
          headerRows: 1,
          widths: exportData.visibleColumnIds.map(getPdfColumnWidth),
          body: tableBody,
        },
        layout: pdfGridLayout,
        margin: [0, 10, 0, 0],
      },
    ],
  };
}

function createPdfVoucherDetails(values: DisbursementVoucherFormValues | undefined): Content {
  const detailRows = [
    ["Voucher No.", values?.voucherNo || "-"],
    ["Voucher Date", values?.voucherDate ? formatDateLabel(values.voucherDate) : "-"],
    ["Payee", values?.partyName || "-"],
    ["Payment Method", values?.paymentMethod || "-"],
    ["Disbursement Type", values?.disbursementType || "-"],
    ["Amount", values?.amount ? formatCurrency(parseMoneyNumberInput(values.amount)) : "-"],
  ];

  return {
    table: {
      widths: [80, "*", 88, "*", 92, "*"],
      body: [
        [
          pdfDetailLabelCell(detailRows[0][0]),
          pdfDetailValueCell(detailRows[0][1]),
          pdfDetailLabelCell(detailRows[1][0]),
          pdfDetailValueCell(detailRows[1][1]),
          pdfDetailLabelCell(detailRows[5][0]),
          pdfDetailValueCell(detailRows[5][1]),
        ],
        [
          pdfDetailLabelCell(detailRows[2][0]),
          pdfDetailValueCell(detailRows[2][1]),
          pdfDetailLabelCell(detailRows[3][0]),
          pdfDetailValueCell(detailRows[3][1]),
          pdfDetailLabelCell(detailRows[4][0]),
          pdfDetailValueCell(detailRows[4][1]),
        ],
      ],
    },
    layout: pdfGridLayout,
  };
}

function pdfHeaderCell(text: string, theme: AccountingExportTheme): TableCell {
  return {
    text,
    bold: true,
    color: theme.accentContrastColor,
    fillColor: theme.accentColor,
    margin: [4, 4, 4, 4],
  };
}

function pdfBodyCell(text: string, isAmountColumn: boolean): TableCell {
  return {
    text,
    alignment: isAmountColumn ? "right" : "left",
    margin: [4, 3, 4, 3],
  };
}

function pdfDetailLabelCell(text: string): TableCell {
  return {
    text,
    bold: true,
    fillColor: "#F8FAFC",
    color: "#475569",
    margin: [4, 3, 4, 3],
  };
}

function pdfDetailValueCell(text: string): TableCell {
  return {
    text,
    bold: true,
    color: "#212738",
    margin: [4, 3, 4, 3],
  };
}

function createPdfTotalsRow(columnCount: number, visibleColumnIds: GridColumnId[], debitTotal: number, creditTotal: number): TableCell[] {
  return visibleColumnIds.map((columnId, columnIndex) => {
    if (columnIndex === 0) {
      return {
        text: "Total",
        bold: true,
        fillColor: "#F8FAFC",
        margin: [4, 4, 4, 4],
      };
    }

    if (columnId === AccountingDebitColumnId) {
      return pdfTotalAmountCell(debitTotal);
    }

    if (columnId === AccountingCreditColumnId) {
      return pdfTotalAmountCell(creditTotal);
    }

    return {
      text: columnIndex < columnCount ? "" : "",
      fillColor: "#F8FAFC",
      margin: [4, 4, 4, 4],
    };
  });
}

function pdfTotalAmountCell(total: number): TableCell {
  return {
    text: formatAmountValue(total),
    bold: true,
    alignment: "right",
    fillColor: "#F8FAFC",
    margin: [4, 4, 4, 4],
  };
}

function getPdfColumnTotal(bodyRows: string[][], visibleColumnIds: GridColumnId[], targetColumnId: GridColumnId) {
  const targetIndex = visibleColumnIds.indexOf(targetColumnId);

  if (targetIndex < 0) {
    return 0;
  }

  return bodyRows.reduce((total, row) => total + normalizeAmount(row[targetIndex] ?? ""), 0);
}

function getPdfColumnWidth(columnId: GridColumnId) {
  if (columnId === "particulars") {
    return "*";
  }

  if (columnId === "accountName") {
    return 120;
  }

  if (AccountingAmountColumnIds.has(columnId)) {
    return 74;
  }

  if (columnId === "taxRate") {
    return 48;
  }

  return 78;
}

export const pdfGridLayout = {
  hLineColor: () => "#E5E7EB",
  hLineWidth: () => 0.6,
  paddingBottom: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  vLineColor: () => "#E5E7EB",
  vLineWidth: () => 0.6,
};

export function getAccountingExportTheme(): AccountingExportTheme {
  const accentColor = getCssColorVariable("--skyblue", "#57C4E5");
  const accentContrastColor = getCssColorVariable("--skyblue-contrast", "#FFFFFF");

  return {
    accentColor,
    accentContrastColor,
    excelAccentArgb: `FF${accentColor.slice(1).toUpperCase()}`,
    excelAccentContrastArgb: `FF${accentContrastColor.slice(1).toUpperCase()}`,
  };
}

function getCssColorVariable(variableName: string, fallback: string) {
  if (typeof window === "undefined") {
    return normalizeColorToHex(fallback);
  }

  const value = window.getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();

  return normalizeColorToHex(value || fallback);
}

function normalizeColorToHex(value: string) {
  const normalizedValue = value.trim();

  if (/^#[0-9a-f]{6}$/i.test(normalizedValue)) {
    return normalizedValue.toUpperCase();
  }

  if (/^#[0-9a-f]{3}$/i.test(normalizedValue)) {
    const [, red, green, blue] = normalizedValue;

    return `#${red}${red}${green}${green}${blue}${blue}`.toUpperCase();
  }

  const rgbMatch = normalizedValue.match(/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/i);

  if (rgbMatch) {
    return rgbPartsToHex(Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3]));
  }

  return "#57C4E5";
}

function rgbPartsToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue].map((part) => Math.max(0, Math.min(255, part)).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export function createAccountingWorkbook({
  amountColumnIndexes,
  columnWidths,
  rows,
  sheetName,
  theme,
}: {
  amountColumnIndexes: Set<number>;
  columnWidths: number[];
  rows: string[][];
  sheetName: string;
  theme: AccountingExportTheme;
}) {
  const worksheetXml = createAccountingTemplateWorksheetXml(rows, {
    amountColumnIndexes,
    columnWidths,
  });

  return createStoredZipArchive([
    {
      name: "[Content_Types].xml",
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        "</Types>",
    },
    {
      name: "_rels/.rels",
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        "</Relationships>",
    },
    {
      name: "xl/workbook.xml",
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        `<sheets><sheet name="${escapeXmlAttribute(sheetName)}" sheetId="1" r:id="rId1"/></sheets>` +
        "</workbook>",
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        "</Relationships>",
    },
    {
      name: "xl/styles.xml",
      text: createAccountingTemplateStylesXml(theme),
    },
    {
      name: "xl/worksheets/sheet1.xml",
      text: worksheetXml,
    },
  ]);
}

function createAccountingTemplateWorksheetXml(
  rows: string[][],
  {
    amountColumnIndexes,
    columnWidths,
  }: {
    amountColumnIndexes: Set<number>;
    columnWidths: number[];
  },
) {
  const maxColumnCount = Math.max(1, ...rows.map((row) => row.length));
  const lastColumn = getExcelColumnLetters(maxColumnCount - 1);
  const lastRow = rows.length;
  const columnsXml = Array.from({ length: maxColumnCount })
    .map((_, columnIndex) => {
      const width = columnWidths[columnIndex] ?? 16;

      return `<col min="${columnIndex + 1}" max="${columnIndex + 1}" width="${width}" customWidth="1"/>`;
    })
    .join("");
  const rowXml = rows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const cellXml = row
        .map((cell, columnIndex) => {
          const reference = `${getExcelColumnLetters(columnIndex)}${rowNumber}`;
          const styleId = rowIndex === 0 ? 1 : amountColumnIndexes.has(columnIndex) ? 3 : 0;
          const normalizedAmount = cell.replace(/,/g, "");

          if (rowIndex > 0 && amountColumnIndexes.has(columnIndex) && Number(normalizedAmount || 0) > 0) {
            return `<c r="${reference}" s="${styleId}"><v>${normalizedAmount}</v></c>`;
          }

          return `<c r="${reference}" t="inlineStr" s="${styleId}"><is><t>${escapeXmlText(cell)}</t></is></c>`;
        })
        .join("");
      const rowHeight = rowIndex === 0 ? ' ht="22" customHeight="1"' : "";

      return `<row r="${rowNumber}"${rowHeight}>${cellXml}</row>`;
    })
    .join("");

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    `<dimension ref="A1:${lastColumn}${lastRow}"/>` +
    '<sheetViews><sheetView workbookViewId="0" showGridLines="1">' +
    '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' +
    '<selection pane="bottomLeft" activeCell="A2" sqref="A2"/>' +
    "</sheetView></sheetViews>" +
    '<sheetFormatPr defaultRowHeight="20"/>' +
    `<cols>${columnsXml}</cols>` +
    "<sheetData>" +
    rowXml +
    "</sheetData>" +
    `<autoFilter ref="A1:${lastColumn}${lastRow}"/>` +
    '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>' +
    "</worksheet>"
  );
}

function createAccountingTemplateStylesXml(theme: AccountingExportTheme) {
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00"/></numFmts>' +
    '<fonts count="2">' +
    '<font><sz val="11"/><color rgb="FF212738"/><name val="Calibri"/></font>' +
    `<font><b/><sz val="11"/><color rgb="${theme.excelAccentContrastArgb}"/><name val="Calibri"/></font>` +
    "</fonts>" +
    '<fills count="3">' +
    '<fill><patternFill patternType="none"/></fill>' +
    '<fill><patternFill patternType="gray125"/></fill>' +
    `<fill><patternFill patternType="solid"><fgColor rgb="${theme.excelAccentArgb}"/><bgColor indexed="64"/></patternFill></fill>` +
    "</fills>" +
    '<borders count="2">' +
    "<border><left/><right/><top/><bottom/><diagonal/></border>" +
    `<border><left style="thin"><color rgb="${AccountingWorksheetBorderColorArgb}"/></left><right style="thin"><color rgb="${AccountingWorksheetBorderColorArgb}"/></right><top style="thin"><color rgb="${AccountingWorksheetBorderColorArgb}"/></top><bottom style="thin"><color rgb="${AccountingWorksheetBorderColorArgb}"/></bottom><diagonal/></border>` +
    "</borders>" +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="4">' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"><alignment vertical="center"/></xf>' +
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="left" vertical="center"/></xf>' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>' +
    '<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"><alignment horizontal="right" vertical="center"/></xf>' +
    "</cellXfs>" +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    "</styleSheet>"
  );
}

function getExcelColumnLetters(columnIndex: number) {
  let columnNumber = columnIndex + 1;
  let letters = "";

  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }

  return letters;
}

function escapeXmlText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeXmlAttribute(value: string) {
  return escapeXmlText(value).replace(/"/g, "&quot;");
}

function createStoredZipArchive(files: { name: string; text: string }[]) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.text);
    const crc = calculateCrc32(dataBytes);
    const localHeader = createZipLocalHeader(nameBytes, dataBytes, crc);
    const centralHeader = createZipCentralHeader(nameBytes, dataBytes, crc, offset);

    localParts.push(localHeader, dataBytes);
    centralParts.push(centralHeader);
    offset += localHeader.byteLength + dataBytes.byteLength;
  });

  const centralDirectoryOffset = offset;
  const centralDirectorySize = centralParts.reduce((sum, part) => sum + part.byteLength, 0);
  const endRecord = createZipEndRecord(files.length, centralDirectorySize, centralDirectoryOffset);

  return concatBytes([...localParts, ...centralParts, endRecord]);
}

function createZipLocalHeader(nameBytes: Uint8Array, dataBytes: Uint8Array, crc: number) {
  const header = new Uint8Array(30 + nameBytes.byteLength);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, dataBytes.byteLength, true);
  view.setUint32(22, dataBytes.byteLength, true);
  view.setUint16(26, nameBytes.byteLength, true);
  view.setUint16(28, 0, true);
  header.set(nameBytes, 30);

  return header;
}

function createZipCentralHeader(nameBytes: Uint8Array, dataBytes: Uint8Array, crc: number, localHeaderOffset: number) {
  const header = new Uint8Array(46 + nameBytes.byteLength);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, dataBytes.byteLength, true);
  view.setUint32(24, dataBytes.byteLength, true);
  view.setUint16(28, nameBytes.byteLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, localHeaderOffset, true);
  header.set(nameBytes, 46);

  return header;
}

function createZipEndRecord(fileCount: number, centralDirectorySize: number, centralDirectoryOffset: number) {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, fileCount, true);
  view.setUint16(10, fileCount, true);
  view.setUint32(12, centralDirectorySize, true);
  view.setUint32(16, centralDirectoryOffset, true);
  view.setUint16(20, 0, true);

  return header;
}

function concatBytes(parts: Uint8Array[]) {
  const totalLength = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.byteLength;
  });

  return output;
}

function calculateCrc32(bytes: Uint8Array) {
  let crc = 0xffffffff;

  bytes.forEach((byte) => {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  });

  return (crc ^ 0xffffffff) >>> 0;
}

export async function readAccountingImportFilePreviewText(file: File) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx")) {
    const rows = await readXlsxAccountingRawRows(await file.arrayBuffer());

    return formatRowsAsTabularText(rows);
  }

  if (fileName.endsWith(".csv") || fileName.endsWith(".tsv") || fileName.endsWith(".txt")) {
    return (await file.text()).trim();
  }

  throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}
