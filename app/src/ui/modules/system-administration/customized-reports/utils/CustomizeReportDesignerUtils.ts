import {
  AlignmentGuideThreshold,
  DefaultFieldColor,
  DefaultFontFamily,
  DefaultTableBorderSetup,
  DefaultMarginSetup,
  DefaultTableColumns,
  DefaultTableSetup,
} from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import {
  CustomizeReportPaperSizes,
  ReceiptCustomizeReportModuleIds,
  CustomizeReportStorageKey,
} from "@/app/src/data/modules/system-administration/customized-reports/CustomizeReportData";
import type {
  AlignmentGuide,
  ReportElementBounds,
  SelectedElementKey,
  SnapPosition,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportDesignerTypes";
import type {
  CustomizeReportField,
  CustomizeReportLayout,
  CustomizeReportLine,
  CustomizeReportMarginSetup,
  CustomizeReportModuleOption,
  CustomizeReportPageSetup,
  CustomizeReportPaperFormat,
  CustomizeReportSampleData as CustomizeReportSampleDataType,
  CustomizeReportTableBorderSetup,
  CustomizeReportTableSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function cloneLayout(layout: CustomizeReportLayout): CustomizeReportLayout {
  return {
    fields: layout.fields.map((field) => ({ ...field })),
    lines: layout.lines.map((line) => ({ ...line })),
    pageSetup: getPageSetupWithDefaults(layout.pageSetup),
    tableSetup: layout.tableSetup
      ? {
          ...layout.tableSetup,
          borderSetup: getTableBorderSetup(layout.tableSetup),
          columns: layout.tableSetup.columns.map((column) => ({ ...column })),
        }
      : undefined,
    marginSetup: layout.marginSetup ? { ...layout.marginSetup } : undefined,
  };
}

export function getTableSetupWithDefaults(tableSetup?: CustomizeReportTableSetup) {
  const configuredColumns = tableSetup?.columns || [];
  const fallbackBorderValue = tableSetup?.showBorders ?? DefaultTableSetup.showBorders;
  const fallbackBorderSetup = createUniformTableBorderSetup(fallbackBorderValue);
  const defaultColumns = DefaultTableColumns.map((defaultColumn) => ({
    ...defaultColumn,
    ...(configuredColumns.find((column) => column.key === defaultColumn.key) || {}),
  }));
  const customColumns = configuredColumns.filter(
    (column) => !DefaultTableColumns.some((defaultColumn) => defaultColumn.key === column.key),
  );

  return {
    ...(tableSetup || DefaultTableSetup),
    fontFamily: tableSetup?.fontFamily ?? DefaultTableSetup.fontFamily,
    color: tableSetup?.color ?? DefaultTableSetup.color,
    bold: tableSetup?.bold ?? DefaultTableSetup.bold,
    italic: tableSetup?.italic ?? DefaultTableSetup.italic,
    underline: tableSetup?.underline ?? DefaultTableSetup.underline,
    previewRows: tableSetup?.previewRows ?? DefaultTableSetup.previewRows,
    showHeader: tableSetup?.showHeader ?? DefaultTableSetup.showHeader,
    borderSetup: {
      ...fallbackBorderSetup,
      ...(tableSetup?.borderSetup || {}),
    },
    columns: [...defaultColumns, ...customColumns],
  };
}

export function getPageSetupWithDefaults(pageSetup?: CustomizeReportPageSetup): CustomizeReportPageSetup {
  return {
    ...getPageSetup(pageSetup?.format || "Letter", pageSetup?.orientation || "portrait"),
    ...(pageSetup || {}),
    applyTo: pageSetup?.applyTo || "whole-document",
    firstPageSource: pageSetup?.firstPageSource || "Default tray",
    footerHeight: pageSetup?.footerHeight ?? 96,
    headerHeight: pageSetup?.headerHeight ?? 104,
    otherPagesSource: pageSetup?.otherPagesSource || "Default tray",
    showSectionGuides: pageSetup?.showSectionGuides ?? true,
  };
}

export function createUniformTableBorderSetup(isVisible: boolean): CustomizeReportTableBorderSetup {
  return {
    top: isVisible,
    right: isVisible,
    bottom: isVisible,
    left: isVisible,
    insideHorizontal: isVisible,
    insideVertical: isVisible,
  };
}

export function getTableBorderSetup(tableSetup: CustomizeReportTableSetup) {
  return {
    ...DefaultTableBorderSetup,
    ...createUniformTableBorderSetup(tableSetup.showBorders),
    ...tableSetup.borderSetup,
  };
}

export function getMarginSetupWithDefaults(marginSetup?: CustomizeReportMarginSetup) {
  return {
    ...DefaultMarginSetup,
    ...(marginSetup || {}),
  };
}

export function getSelectedElementKey(type: "field" | "line" | "table", id: string): SelectedElementKey {
  return `${type}:${id}` as SelectedElementKey;
}

export function parseSelectedElementKey(key: SelectedElementKey) {
  const [type, id] = key.split(":") as ["field" | "line" | "table", string];
  return { type, id };
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isEditableElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

export function getFieldBounds(field: CustomizeReportField): ReportElementBounds {
  return {
    id: field.id,
    label: field.label,
    type: "field",
    x: field.x,
    y: field.y,
    width: field.width,
    height: field.height,
  };
}

export function getLineBounds(line: CustomizeReportLine): ReportElementBounds {
  return {
    id: line.id,
    label: line.label,
    type: "line",
    x: line.x,
    y: line.y,
    width: line.orientation === "horizontal" ? line.length : line.thickness,
    height: line.orientation === "horizontal" ? line.thickness : line.length,
  };
}

export function getTableBounds(tableSetup: CustomizeReportTableSetup): ReportElementBounds {
  return {
    id: "items-table",
    label: "Items Table",
    type: "table",
    x: tableSetup.x,
    y: tableSetup.y,
    width: tableSetup.width,
    height: tableSetup.rowHeight * ((tableSetup.previewRows ?? DefaultTableSetup.previewRows) + (tableSetup.showHeader ? 1 : 0)),
  };
}

export function getVisibleElementBounds(
  fields: CustomizeReportField[],
  lines: CustomizeReportLine[],
  tableSetup: CustomizeReportTableSetup,
  excludedElementId?: string,
) {
  return [
    ...fields.filter((field) => field.visible).map(getFieldBounds),
    ...lines.filter((line) => line.visible).map(getLineBounds),
    getTableBounds(tableSetup),
  ].filter((element) => element.id !== excludedElementId);
}

export function getSnappedPosition(
  activeElement: ReportElementBounds,
  candidateElements: ReportElementBounds[],
  pageSetup: CustomizeReportPageSetup,
): SnapPosition {
  let nextX = activeElement.x;
  let nextY = activeElement.y;
  let bestVerticalMatch: { distance: number; offset: number; guide: AlignmentGuide } | null = null;
  let bestHorizontalMatch: { distance: number; offset: number; guide: AlignmentGuide } | null =
    null;

  const activeVerticalPoints = [
    activeElement.x,
    activeElement.x + activeElement.width / 2,
    activeElement.x + activeElement.width,
  ];
  const activeHorizontalPoints = [
    activeElement.y,
    activeElement.y + activeElement.height / 2,
    activeElement.y + activeElement.height,
  ];

  for (const candidateElement of candidateElements) {
    const candidateVerticalPoints = [
      candidateElement.x,
      candidateElement.x + candidateElement.width / 2,
      candidateElement.x + candidateElement.width,
    ];
    const candidateHorizontalPoints = [
      candidateElement.y,
      candidateElement.y + candidateElement.height / 2,
      candidateElement.y + candidateElement.height,
    ];

    for (const activePoint of activeVerticalPoints) {
      for (const candidatePoint of candidateVerticalPoints) {
        const offset = candidatePoint - activePoint;
        const distance = Math.abs(offset);

        if (
          distance <= AlignmentGuideThreshold &&
          (!bestVerticalMatch || distance < bestVerticalMatch.distance)
        ) {
          bestVerticalMatch = {
            distance,
            offset,
            guide: {
              id: `vertical-${candidateElement.id}-${Math.round(candidatePoint)}`,
              orientation: "vertical",
              position: Math.round(candidatePoint),
              start: Math.max(0, Math.min(activeElement.y, candidateElement.y) - 14),
              end: Math.min(
                pageSetup.height,
                Math.max(
                  activeElement.y + activeElement.height,
                  candidateElement.y + candidateElement.height,
                ) + 14,
              ),
            },
          };
        }
      }
    }

    for (const activePoint of activeHorizontalPoints) {
      for (const candidatePoint of candidateHorizontalPoints) {
        const offset = candidatePoint - activePoint;
        const distance = Math.abs(offset);

        if (
          distance <= AlignmentGuideThreshold &&
          (!bestHorizontalMatch || distance < bestHorizontalMatch.distance)
        ) {
          bestHorizontalMatch = {
            distance,
            offset,
            guide: {
              id: `horizontal-${candidateElement.id}-${Math.round(candidatePoint)}`,
              orientation: "horizontal",
              position: Math.round(candidatePoint),
              start: Math.max(0, Math.min(activeElement.x, candidateElement.x) - 14),
              end: Math.min(
                pageSetup.width,
                Math.max(
                  activeElement.x + activeElement.width,
                  candidateElement.x + candidateElement.width,
                ) + 14,
              ),
            },
          };
        }
      }
    }
  }

  if (bestVerticalMatch) {
    nextX += bestVerticalMatch.offset;
  }

  if (bestHorizontalMatch) {
    nextY += bestHorizontalMatch.offset;
  }

  return {
    x: clamp(Math.round(nextX), 0, pageSetup.width - activeElement.width),
    y: clamp(Math.round(nextY), 0, pageSetup.height - activeElement.height),
    guides: [
      ...(bestVerticalMatch ? [bestVerticalMatch.guide] : []),
      ...(bestHorizontalMatch ? [bestHorizontalMatch.guide] : []),
    ],
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getFieldPreviewValue(field: CustomizeReportField, data: Record<string, unknown>) {
  if (field.type === "image") {
    return field.label;
  }

  if (field.value !== undefined) {
    return field.value;
  }

  const value = data[field.binding];

  if (field.type === "currency" && typeof value === "number") {
    return formatCurrency(value);
  }

  return String(value ?? field.label);
}

export function getReportStorageKey(reportId: string) {
  return `${CustomizeReportStorageKey}.${reportId}`;
}

export function getReportData(data: CustomizeReportSampleDataType, report: CustomizeReportModuleOption) {
  const isDisbursementVoucher = report.id === "cash-disbursement-disbursement-voucher";
  const isReceiptReport = ReceiptCustomizeReportModuleIds.includes(report.id as (typeof ReceiptCustomizeReportModuleIds)[number]);

  return {
    ...data,
    documentNo: isDisbursementVoucher ? data.documentNo : `${report.documentPrefix}-2026-0001`,
    reportTitle: isDisbursementVoucher ? data.reportTitle : report.reportTitle.toUpperCase(),
    partyName: isReceiptReport ? "Sample Customer" : data.partyName,
    address: isReceiptReport ? "123 Sample Street, Sample City" : "",
    tin: isReceiptReport ? "000-000-000-000" : "",
    businessStyle: isReceiptReport ? "Retail" : "",
    amountInWords: isReceiptReport ? "ONE THOUSAND PESOS ONLY" : data.amountInWords,
    purpose: isReceiptReport ? "invoice payment" : data.purpose,
    totalAmount: formatCurrency(data.totalAmount),
    totalCredit: formatCurrency(data.totalCredit),
    items: data.items.map((item) => ({
      ...item,
      amount: formatMoneyCellValue(item.amount),
      credit: formatMoneyCellValue(item.credit),
      debit: formatMoneyCellValue(item.debit),
      unitCost: formatMoneyCellValue(item.unitCost),
    })),
  };
}

function formatMoneyCellValue(value: number | string | undefined) {
  return typeof value === "number" ? formatCurrency(value) : value;
}

export function isSavedLayout(value: unknown): value is CustomizeReportLayout {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as CustomizeReportLayout).fields) &&
    Array.isArray((value as CustomizeReportLayout).lines)
  );
}

export function getPageSetup(
  format: CustomizeReportPaperFormat,
  orientation: CustomizeReportPageSetup["orientation"],
): CustomizeReportPageSetup {
  const paperSize = CustomizeReportPaperSizes[format];

  return {
    format,
    orientation,
    width: orientation === "landscape" ? paperSize.height : paperSize.width,
    height: orientation === "landscape" ? paperSize.width : paperSize.height,
    applyTo: "whole-document",
    firstPageSource: "Default tray",
    footerHeight: 96,
    headerHeight: 104,
    otherPagesSource: "Default tray",
    showSectionGuides: true,
  };
}

export function buildReportTemplate(
  fields: CustomizeReportField[],
  lines: CustomizeReportLine[],
  pageSetup: CustomizeReportPageSetup,
  tableSetup: CustomizeReportTableSetup,
) {
  const visibleColumns = tableSetup.columns.filter((column) => column.visible);
  const pdfFooterReservedHeight = 22;
  const printablePageHeight = Math.max(1, pageSetup.height - pdfFooterReservedHeight);
  const tableBorderCss = getTableBorderCss(tableSetup);
  const positionedFields = fields
    .filter((field) => field.visible)
    .map((field) => {
      if (field.type === "image") {
        return `
				${field.src ? `<img class="report-image" src="${field.src}" alt="${escapeHtml(field.label)}" style="left:${field.x}px;top:${field.y}px;width:${field.width}px;height:${field.height}px;z-index:${field.zIndex ?? 1};" />` : ""}
			`;
      }

      const content = field.value !== undefined ? escapeHtml(field.value) : `{{${field.binding}}}`;

      return `
				<div class="report-field" style="left:${field.x}px;top:${field.y}px;width:${field.width}px;height:${field.height}px;font-family:${field.fontFamily || DefaultFontFamily};font-size:${field.fontSize}px;color:${field.color || DefaultFieldColor};text-align:${field.align};font-weight:${field.bold ? 700 : 400};font-style:${field.italic ? "italic" : "normal"};text-decoration:${field.underline ? "underline" : "none"};z-index:${field.zIndex ?? 1};">${content}</div>`;
    })
    .join("");
  const tableHeaderCells = visibleColumns
    .map(
      (column) =>
        `<th style="width:${column.width}px;text-align:${column.align};">${escapeHtml(column.label)}</th>`,
    )
    .join("");
  const tableBodyCells = visibleColumns
    .map((column) => {
      const numericClass = column.align === "right" ? ` class="number"` : "";
      return `<td${numericClass} style="width:${column.width}px;text-align:${column.align};">{{${column.key}}}</td>`;
    })
    .join("");
  const positionedLines = lines
    .filter((line) => line.visible)
    .map((line) => {
      const width = line.orientation === "horizontal" ? line.length : line.thickness;
      const height = line.orientation === "horizontal" ? line.thickness : line.length;

      return `
				<div class="report-line" style="left:${line.x}px;top:${line.y}px;width:${width}px;height:${height}px;background:${line.color};z-index:${line.zIndex ?? 1};"></div>`;
    })
    .join("");

  return `<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
	<style>
		@page { size: ${pageSetup.width}px ${pageSetup.height}px; margin: 0; }
		* { box-sizing: border-box; }
		body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #0f172a; background: #fff; }
		.report-page { position: relative; width: ${pageSetup.width}px; min-height: ${printablePageHeight}px; overflow: visible; background: #fff; }
		.report-field { position: absolute; overflow: hidden; line-height: 1.25; white-space: pre-wrap; }
		.report-image { position: absolute; object-fit: contain; }
		.report-line { position: absolute; }
		.items-table-anchor { height: ${tableSetup.y}px; }
		.items-table { position: relative; margin-left: ${tableSetup.x}px; width: ${tableSetup.width}px; border-collapse: separate; border-spacing: 0; break-inside: auto; page-break-inside: auto; font-family: ${tableSetup.fontFamily || DefaultFontFamily}; font-size: ${tableSetup.fontSize}px; color: ${tableSetup.color || DefaultFieldColor}; font-style: ${tableSetup.italic ? "italic" : "normal"}; font-weight: ${tableSetup.bold ? 700 : 400}; text-decoration: ${tableSetup.underline ? "underline" : "none"}; }
		.items-table thead { display: table-header-group; }
		.items-table tbody { display: table-row-group; }
		.items-table tr { break-inside: avoid; page-break-inside: avoid; }
		.items-table th { background: #f8fafc; height: ${tableSetup.rowHeight}px; padding: 0 8px; font-weight: ${tableSetup.bold ? 700 : 600}; }
		.items-table td { height: ${tableSetup.rowHeight}px; padding: 0 8px; }
		.items-table .number { text-align: right; }
		${tableBorderCss}
		.signature-line { position: absolute; bottom: 94px; width: 220px; border-top: 1px solid #334155; }
		.signature-line.left { left: 42px; }
		.signature-line.right { right: 68px; }
	</style>
</head>
<body>
	<div class="report-page">
		${positionedLines}
		${positionedFields}
		<div class="items-table-anchor"></div>
		<table class="items-table">
			${
        tableSetup.showHeader
          ? `<thead>
				<tr>
					${tableHeaderCells}
				</tr>
			</thead>`
          : ""
      }
			<tbody>
				{{#each items}}
					<tr>
						${tableBodyCells}
					</tr>
				{{/each}}
			</tbody>
		</table>
	</div>
</body>
</html>`;
}

function getTableBorderCss(tableSetup: CustomizeReportTableSetup) {
  const borderSetup = getTableBorderSetup(tableSetup);
  const borderRules = [
    borderSetup.left ? ".items-table tr > *:first-child { border-left: 1px solid #cbd5e1; }" : "",
    borderSetup.right ? ".items-table tr > *:last-child { border-right: 1px solid #cbd5e1; }" : "",
    borderSetup.insideVertical ? ".items-table tr > *:not(:last-child) { border-right: 1px solid #cbd5e1; }" : "",
    borderSetup.bottom ? ".items-table tbody tr:last-child > * { border-bottom: 1px solid #cbd5e1; }" : "",
    borderSetup.insideHorizontal ? ".items-table tbody tr:not(:last-child) > * { border-bottom: 1px solid #e2e8f0; }" : "",
  ];

  if (tableSetup.showHeader) {
    borderRules.push(
      borderSetup.top ? ".items-table thead tr:first-child > * { border-top: 1px solid #cbd5e1; }" : "",
      borderSetup.insideHorizontal ? ".items-table thead tr:last-child > * { border-bottom: 1px solid #cbd5e1; }" : "",
    );
  } else {
    borderRules.push(borderSetup.top ? ".items-table tbody tr:first-child > * { border-top: 1px solid #cbd5e1; }" : "");
  }

  return borderRules.filter(Boolean).join("\n\t\t");
}

