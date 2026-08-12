import {
  AlignmentGuideThreshold,
  DefaultFieldColor,
  DefaultFontFamily,
  DefaultMarginSetup,
  DefaultTableColumns,
  DefaultTableSetup,
} from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import {
  CustomizeReportPaperSizes,
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
  CustomizeReportTableSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function cloneLayout(layout: CustomizeReportLayout): CustomizeReportLayout {
  return {
    fields: layout.fields.map((field) => ({ ...field })),
    lines: layout.lines.map((line) => ({ ...line })),
    pageSetup: { ...layout.pageSetup },
    tableSetup: layout.tableSetup
      ? {
          ...layout.tableSetup,
          columns: layout.tableSetup.columns.map((column) => ({ ...column })),
        }
      : undefined,
    marginSetup: layout.marginSetup ? { ...layout.marginSetup } : undefined,
  };
}

export function getTableSetupWithDefaults(tableSetup?: CustomizeReportTableSetup) {
  const configuredColumns = tableSetup?.columns || [];
  const defaultColumns = DefaultTableColumns.map((defaultColumn) => ({
    ...defaultColumn,
    ...(configuredColumns.find((column) => column.key === defaultColumn.key) || {}),
  }));
  const customColumns = configuredColumns.filter(
    (column) => !DefaultTableColumns.some((defaultColumn) => defaultColumn.key === column.key),
  );

  return {
    ...(tableSetup || DefaultTableSetup),
    previewRows: tableSetup?.previewRows ?? DefaultTableSetup.previewRows,
    columns: [...defaultColumns, ...customColumns],
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
    height: tableSetup.rowHeight * ((tableSetup.previewRows ?? DefaultTableSetup.previewRows) + 1),
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

  if (field.value) {
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
  return {
    ...data,
    documentNo: `${report.documentPrefix}-2026-0001`,
    reportTitle: report.reportTitle,
    totalAmount: formatCurrency(data.totalAmount),
    items: data.items.map((item) => ({
      ...item,
      unitCost: formatCurrency(item.unitCost),
      amount: formatCurrency(item.amount),
    })),
  };
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
  };
}

export function buildReportTemplate(
  fields: CustomizeReportField[],
  lines: CustomizeReportLine[],
  pageSetup: CustomizeReportPageSetup,
  tableSetup: CustomizeReportTableSetup,
) {
  const visibleColumns = tableSetup.columns.filter((column) => column.visible);
  const positionedFields = fields
    .filter((field) => field.visible)
    .map((field) => {
      if (field.type === "image") {
        return `
				${field.src ? `<img class="report-image" src="${field.src}" alt="${escapeHtml(field.label)}" style="left:${field.x}px;top:${field.y}px;width:${field.width}px;height:${field.height}px;z-index:${field.zIndex ?? 1};" />` : ""}
			`;
      }

      const content = field.value ? escapeHtml(field.value) : `{{${field.binding}}}`;

      return `
				<div class="report-field" style="left:${field.x}px;top:${field.y}px;width:${field.width}px;height:${field.height}px;font-family:${field.fontFamily || DefaultFontFamily};font-size:${field.fontSize}px;color:${field.color || DefaultFieldColor};text-align:${field.align};font-weight:${field.bold ? 700 : 400};font-style:${field.italic ? "italic" : "normal"};text-decoration:${field.underline ? "underline" : "none"};z-index:${field.zIndex ?? 1};">
					${content}
				</div>`;
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
		@page { size: ${pageSetup.format} ${pageSetup.orientation}; margin: 0; }
		* { box-sizing: border-box; }
		body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #0f172a; background: #fff; }
		.report-page { position: relative; width: ${pageSetup.width}px; height: ${pageSetup.height}px; overflow: hidden; background: #fff; }
		.report-field { position: absolute; overflow: hidden; line-height: 1.25; white-space: pre-wrap; }
		.report-image { position: absolute; object-fit: contain; }
		.report-line { position: absolute; }
		.items-table { position: absolute; left: ${tableSetup.x}px; top: ${tableSetup.y}px; width: ${tableSetup.width}px; border-collapse: collapse; font-size: ${tableSetup.fontSize}px; }
		.items-table th { ${tableSetup.showBorders ? "border: 1px solid #cbd5e1;" : ""} background: #f8fafc; height: ${tableSetup.rowHeight}px; padding: 0 8px; font-weight: 700; }
		.items-table td { ${tableSetup.showBorders ? "border: 1px solid #e2e8f0;" : ""} height: ${tableSetup.rowHeight}px; padding: 0 8px; }
		.items-table .number { text-align: right; }
		.signature-line { position: absolute; bottom: 94px; width: 220px; border-top: 1px solid #334155; }
		.signature-line.left { left: 42px; }
		.signature-line.right { right: 68px; }
	</style>
</head>
<body>
	<div class="report-page">
		${positionedLines}
		${positionedFields}
		<table class="items-table">
			<thead>
				<tr>
					${tableHeaderCells}
				</tr>
			</thead>
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

