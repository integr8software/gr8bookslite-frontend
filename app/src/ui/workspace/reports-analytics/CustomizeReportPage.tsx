"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect */

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Layers,
  Lock,
  Menu,
  Minus,
  PanelRight,
  Plus,
  Redo2,
  RefreshCcw,
  Save,
  SlidersHorizontal,
  Type,
  Upload,
  Trash2,
  Undo2,
  Unlock,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  type ChangeEvent as ReactChangeEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import {
  CustomizeReportDefaultPageSetup,
  CustomizeReportFields,
  CustomizeReportLines,
  CustomizeReportModuleOptions,
  CustomizeReportPaperSizes,
  CustomizeReportSampleData,
  CustomizeReportStorageKey,
} from "@/app/src/data/workspace/reports-analytics/CustomizeReportData";
import type {
  CustomizeReportAlign,
  CustomizeReportField,
  CustomizeReportLayout,
  CustomizeReportLine,
  CustomizeReportMarginSetup,
  CustomizeReportModuleOption,
  CustomizeReportPageSetup,
  CustomizeReportPaperFormat,
  CustomizeReportSampleData as CustomizeReportSampleDataType,
  CustomizeReportTableColumn,
  CustomizeReportTableColumnKey,
  CustomizeReportTableSetup,
} from "@/app/src/types/workspace/reports-analytics/CustomizeReportTypes";

type DragState = {
  elementId: string;
  elementType: "field" | "line";
  action: "move" | "resize";
  resizeHandle?: "nw" | "ne" | "sw" | "se";
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  originWidth?: number;
  originHeight?: number;
  groupOrigins?: Array<{
    key: SelectedElementKey;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
};

type CanvasPanState = {
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
};

type ReportElementBounds = {
  id: string;
  label: string;
  type: "field" | "line";
  x: number;
  y: number;
  width: number;
  height: number;
};

type AlignmentGuide = {
  id: string;
  orientation: "horizontal" | "vertical";
  position: number;
  start: number;
  end: number;
};

type SnapPosition = {
  x: number;
  y: number;
  guides: AlignmentGuide[];
};

type LayoutHistory = {
  past: CustomizeReportLayout[];
  future: CustomizeReportLayout[];
};

type SelectedElementKey = `field:${string}` | `line:${string}`;

type AlignDistributionAction =
  | "left"
  | "center"
  | "right"
  | "top"
  | "middle"
  | "bottom"
  | "distribute-horizontal"
  | "distribute-vertical";

const AlignmentGuideThreshold = 6;
const MaxLayoutHistoryLength = 50;
const DefaultGridSize = 10;
const MinFieldWidth = 40;
const MinFieldHeight = 18;
const DefaultFieldColor = "#0f172a";
const DefaultFontFamily = "Arial, Helvetica, sans-serif";
const FontFamilyOptions = [
  "Arial, Helvetica, sans-serif",
  "Georgia, serif",
  "Tahoma, Geneva, sans-serif",
  "Times New Roman, Times, serif",
  "Verdana, Geneva, sans-serif",
];
const MinZoom = 50;
const MaxZoom = 150;
const ZoomStep = 10;
const DefaultTableColumns: CustomizeReportTableColumn[] = [
  { key: "itemCode", label: "Item Code", width: 116, visible: true, align: "left" },
  { key: "description", label: "Description", width: 144, visible: true, align: "left" },
  { key: "qty", label: "Qty", width: 48, visible: true, align: "right" },
  { key: "uom", label: "UOM", width: 58, visible: true, align: "left" },
  { key: "unitCost", label: "Unit Cost", width: 84, visible: true, align: "right" },
  { key: "amount", label: "Amount", width: 96, visible: true, align: "right" },
];
const DefaultTableSetup: CustomizeReportTableSetup = {
  x: 42,
  y: 238,
  width: 686,
  fontSize: 11,
  rowHeight: 26,
  showBorders: true,
  columns: DefaultTableColumns,
};
const DefaultMarginSetup: CustomizeReportMarginSetup = {
  visible: true,
  top: 36,
  right: 36,
  bottom: 36,
  left: 36,
};

const InspectorNumberInputClassName =
  "h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

const ToolbarButtonClassName =
  "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-700";

const PrimaryButtonClassName =
  "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-orange-500 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60";

const ReportToolbarSelectClassName =
  "h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

const DefaultCustomizeReportModuleId = "inventory-receiving-report";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function cloneLayout(layout: CustomizeReportLayout): CustomizeReportLayout {
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

function getTableSetupWithDefaults(tableSetup?: CustomizeReportTableSetup) {
  return {
    ...(tableSetup || DefaultTableSetup),
    columns: DefaultTableColumns.map((defaultColumn) => ({
      ...defaultColumn,
      ...(tableSetup?.columns.find((column) => column.key === defaultColumn.key) || {}),
    })),
  };
}

function getMarginSetupWithDefaults(marginSetup?: CustomizeReportMarginSetup) {
  return {
    ...DefaultMarginSetup,
    ...(marginSetup || {}),
  };
}

function getSelectedElementKey(type: "field" | "line", id: string): SelectedElementKey {
  return `${type}:${id}` as SelectedElementKey;
}

function parseSelectedElementKey(key: SelectedElementKey) {
  const [type, id] = key.split(":") as ["field" | "line", string];
  return { type, id };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isEditableElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function getFieldBounds(field: CustomizeReportField): ReportElementBounds {
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

function getLineBounds(line: CustomizeReportLine): ReportElementBounds {
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

function getVisibleElementBounds(
  fields: CustomizeReportField[],
  lines: CustomizeReportLine[],
  excludedElementId?: string,
) {
  return [
    ...fields.filter((field) => field.visible).map(getFieldBounds),
    ...lines.filter((line) => line.visible).map(getLineBounds),
  ].filter((element) => element.id !== excludedElementId);
}

function getSnappedPosition(
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getFieldPreviewValue(field: CustomizeReportField, data: Record<string, unknown>) {
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

function getReportStorageKey(reportId: string) {
  return `${CustomizeReportStorageKey}.${reportId}`;
}

function getReportData(data: CustomizeReportSampleDataType, report: CustomizeReportModuleOption) {
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

function isSavedLayout(value: unknown): value is CustomizeReportLayout {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as CustomizeReportLayout).fields) &&
    Array.isArray((value as CustomizeReportLayout).lines)
  );
}

function getPageSetup(
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

function buildReportTemplate(
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

export function CustomizeReportPage() {
  const [fields, setFields] = useState<CustomizeReportField[]>(CustomizeReportFields);
  const [lines, setLines] = useState<CustomizeReportLine[]>(CustomizeReportLines);
  const [pageSetup, setPageSetup] = useState<CustomizeReportPageSetup>(
    CustomizeReportDefaultPageSetup,
  );
  const [tableSetup, setTableSetup] = useState<CustomizeReportTableSetup>(DefaultTableSetup);
  const [marginSetup, setMarginSetup] = useState<CustomizeReportMarginSetup>(DefaultMarginSetup);
  const [selectedFieldId, setSelectedFieldId] = useState(CustomizeReportFields[0].id);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<"field" | "line">("field");
  const [selectedElementKeys, setSelectedElementKeys] = useState<SelectedElementKey[]>([
    getSelectedElementKey("field", CustomizeReportFields[0].id),
  ]);
  const [selectedReportId, setSelectedReportId] = useState(DefaultCustomizeReportModuleId);
  const [isRendering, setIsRendering] = useState(false);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(DefaultGridSize);
  const [zoom, setZoom] = useState(100);
  const [isCanvasPanning, setIsCanvasPanning] = useState(false);
  const [isElementsPanelOpen, setIsElementsPanelOpen] = useState(true);
  const [isToolsDialogOpen, setIsToolsDialogOpen] = useState(false);
  const [layoutHistory, setLayoutHistory] = useState<LayoutHistory>({
    past: [],
    future: [],
  });
  const dragStateRef = useRef<DragState | null>(null);
  const canvasPanStateRef = useRef<CanvasPanState | null>(null);
  const canvasScrollRef = useRef<HTMLDivElement | null>(null);

  const canUndo = layoutHistory.past.length > 0;
  const canRedo = layoutHistory.future.length > 0;

  function getCurrentLayout(): CustomizeReportLayout {
    return cloneLayout({ fields, lines, pageSetup, tableSetup, marginSetup });
  }

  function snapValue(value: number) {
    if (!snapToGrid) {
      return Math.round(value);
    }

    return Math.round(value / gridSize) * gridSize;
  }

  function pushUndoSnapshot() {
    const currentLayout = getCurrentLayout();

    setLayoutHistory((currentHistory) => ({
      past: [...currentHistory.past, currentLayout].slice(-MaxLayoutHistoryLength),
      future: [],
    }));
  }

  function restoreLayoutSnapshot(layout: CustomizeReportLayout) {
    const nextLayout = cloneLayout(layout);

    setFields(nextLayout.fields);
    setLines(nextLayout.lines);
    setPageSetup(nextLayout.pageSetup);
    setTableSetup(getTableSetupWithDefaults(nextLayout.tableSetup));
    setMarginSetup(getMarginSetupWithDefaults(nextLayout.marginSetup));
    setAlignmentGuides([]);

    if (selectedElementType === "line" && selectedLineId) {
      const restoredLine = nextLayout.lines.find((line) => line.id === selectedLineId);

      if (restoredLine) {
        setSelectedLineId(restoredLine.id);
        setSelectedElementType("line");
        setSelectedElementKeys([getSelectedElementKey("line", restoredLine.id)]);
        return;
      }
    }

    const restoredField =
      nextLayout.fields.find((field) => field.id === selectedFieldId) || nextLayout.fields[0];

    setSelectedFieldId(restoredField?.id || CustomizeReportFields[0].id);
    setSelectedLineId(null);
    setSelectedElementType("field");
    setSelectedElementKeys(restoredField ? [getSelectedElementKey("field", restoredField.id)] : []);
  }

  function handleUndoLayout() {
    if (!canUndo) {
      return;
    }

    const previousLayout = layoutHistory.past[layoutHistory.past.length - 1];

    setLayoutHistory((currentHistory) => ({
      past: currentHistory.past.slice(0, -1),
      future: [getCurrentLayout(), ...currentHistory.future].slice(0, MaxLayoutHistoryLength),
    }));
    restoreLayoutSnapshot(previousLayout);
  }

  function handleRedoLayout() {
    if (!canRedo) {
      return;
    }

    const nextLayout = layoutHistory.future[0];

    setLayoutHistory((currentHistory) => ({
      past: [...currentHistory.past, getCurrentLayout()].slice(-MaxLayoutHistoryLength),
      future: currentHistory.future.slice(1),
    }));
    restoreLayoutSnapshot(nextLayout);
  }

  useEffect(() => {
    const reportStorageKey = getReportStorageKey(selectedReportId);
    const legacyStoredLayout =
      selectedReportId === DefaultCustomizeReportModuleId
        ? window.localStorage.getItem(CustomizeReportStorageKey)
        : null;
    const storedLayout = window.localStorage.getItem(reportStorageKey) || legacyStoredLayout;

    if (!storedLayout) {
      setFields(CustomizeReportFields);
      setLines(CustomizeReportLines);
      setPageSetup(CustomizeReportDefaultPageSetup);
      setTableSetup(DefaultTableSetup);
      setMarginSetup(DefaultMarginSetup);
      setSelectedFieldId(CustomizeReportFields[0].id);
      setSelectedLineId(null);
      setSelectedElementType("field");
      setSelectedElementKeys([getSelectedElementKey("field", CustomizeReportFields[0].id)]);
      setLayoutHistory({ past: [], future: [] });
      return;
    }

    try {
      const parsedLayout = JSON.parse(storedLayout) as
        CustomizeReportField[] | CustomizeReportLayout;
      const nextFields = isSavedLayout(parsedLayout) ? parsedLayout.fields : parsedLayout;
      const nextLines = isSavedLayout(parsedLayout) ? parsedLayout.lines : CustomizeReportLines;
      const nextPageSetup = isSavedLayout(parsedLayout)
        ? parsedLayout.pageSetup || CustomizeReportDefaultPageSetup
        : CustomizeReportDefaultPageSetup;
      const nextTableSetup = isSavedLayout(parsedLayout)
        ? getTableSetupWithDefaults(parsedLayout.tableSetup)
        : DefaultTableSetup;
      const nextMarginSetup = isSavedLayout(parsedLayout)
        ? getMarginSetupWithDefaults(parsedLayout.marginSetup)
        : DefaultMarginSetup;

      setFields(nextFields);
      setLines(nextLines);
      setPageSetup(nextPageSetup);
      setTableSetup(nextTableSetup);
      setMarginSetup(nextMarginSetup);
      setSelectedFieldId(nextFields[0]?.id || CustomizeReportFields[0].id);
      setSelectedLineId(null);
      setSelectedElementType("field");
      setSelectedElementKeys(
        nextFields[0] ? [getSelectedElementKey("field", nextFields[0].id)] : [],
      );
      setLayoutHistory({ past: [], future: [] });
    } catch {
      window.localStorage.removeItem(reportStorageKey);
    }
  }, [selectedReportId]);

  const selectedField = useMemo(
    () => fields.find((field) => field.id === selectedFieldId) || fields[0],
    [fields, selectedFieldId],
  );

  const selectedLine = useMemo(
    () => lines.find((line) => line.id === selectedLineId) || null,
    [lines, selectedLineId],
  );

  const selectedReport = useMemo(
    () =>
      CustomizeReportModuleOptions.find((report) => report.id === selectedReportId) ||
      CustomizeReportModuleOptions[0],
    [selectedReportId],
  );

  const selectedElementSet = useMemo(
    () => new Set<SelectedElementKey>(selectedElementKeys),
    [selectedElementKeys],
  );

  const selectedElements = useMemo(
    () =>
      selectedElementKeys
        .map((key) => {
          const { type, id } = parseSelectedElementKey(key);

          if (type === "field") {
            const field = fields.find((currentField) => currentField.id === id);
            return field ? { key, type, id, bounds: getFieldBounds(field) } : null;
          }

          const line = lines.find((currentLine) => currentLine.id === id);

          return line ? { key, type, id, bounds: getLineBounds(line) } : null;
        })
        .filter((element): element is NonNullable<typeof element> => Boolean(element)),
    [fields, lines, selectedElementKeys],
  );

  const hasMultiSelection = selectedElements.length > 1;

  const reportData = useMemo(
    () => getReportData(CustomizeReportSampleData, selectedReport),
    [selectedReport],
  );

  const templatePreview = useMemo(
    () => buildReportTemplate(fields, lines, pageSetup, tableSetup),
    [fields, lines, pageSetup, tableSetup],
  );

  useEffect(() => {
    function handleUndoRedoShortcut(event: KeyboardEvent) {
      const key = event.key.toLowerCase();

      if (isEditableElement(event.target)) {
        return;
      }

      if (!(event.ctrlKey || event.metaKey)) {
        if (!["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
          return;
        }

        event.preventDefault();

        const nudgeAmount = event.shiftKey ? 10 : 1;
        const deltaX = key === "arrowleft" ? -nudgeAmount : key === "arrowright" ? nudgeAmount : 0;
        const deltaY = key === "arrowup" ? -nudgeAmount : key === "arrowdown" ? nudgeAmount : 0;

        if (selectedElementType === "line" && selectedLine) {
          if (selectedLine.locked) {
            return;
          }

          pushUndoSnapshot();
          setLines((currentLines) =>
            currentLines.map((line) => {
              if (line.id !== selectedLine.id) {
                return line;
              }

              const width = line.orientation === "horizontal" ? line.length : line.thickness;
              const height = line.orientation === "horizontal" ? line.thickness : line.length;

              return {
                ...line,
                x: clamp(line.x + deltaX, 0, pageSetup.width - width),
                y: clamp(line.y + deltaY, 0, pageSetup.height - height),
              };
            }),
          );
          return;
        }

        if (selectedField) {
          if (selectedField.locked) {
            return;
          }

          pushUndoSnapshot();
          setFields((currentFields) =>
            currentFields.map((field) =>
              field.id === selectedField.id
                ? {
                    ...field,
                    x: clamp(field.x + deltaX, 0, pageSetup.width - field.width),
                    y: clamp(field.y + deltaY, 0, pageSetup.height - field.height),
                  }
                : field,
            ),
          );
        }

        return;
      }

      if (key === "z" && event.shiftKey) {
        event.preventDefault();
        handleRedoLayout();
        return;
      }

      if (key === "z") {
        event.preventDefault();
        handleUndoLayout();
        return;
      }

      if (key === "y") {
        event.preventDefault();
        handleRedoLayout();
      }
    }

    window.addEventListener("keydown", handleUndoRedoShortcut);

    return () => {
      window.removeEventListener("keydown", handleUndoRedoShortcut);
    };
  });

  useEffect(() => {
    const canvasScrollElement = canvasScrollRef.current;

    if (!canvasScrollElement) {
      return;
    }

    function handleCanvasWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setZoom((currentZoom) =>
        clamp(currentZoom + (event.deltaY < 0 ? ZoomStep : -ZoomStep), MinZoom, MaxZoom),
      );
    }

    canvasScrollElement.addEventListener("wheel", handleCanvasWheel, {
      passive: false,
    });

    return () => {
      canvasScrollElement.removeEventListener("wheel", handleCanvasWheel);
    };
  }, []);

  function updateSelectedField(updater: (field: CustomizeReportField) => CustomizeReportField) {
    if (selectedField?.locked) {
      toast.error("Unlock this element before editing.");
      return;
    }

    pushUndoSnapshot();
    setFields((currentFields) =>
      currentFields.map((field) => (field.id === selectedField.id ? updater(field) : field)),
    );
  }

  function updateSelectedLine(updater: (line: CustomizeReportLine) => CustomizeReportLine) {
    if (!selectedLine) {
      return;
    }

    if (selectedLine.locked) {
      toast.error("Unlock this line before editing.");
      return;
    }

    pushUndoSnapshot();
    setLines((currentLines) =>
      currentLines.map((line) => (line.id === selectedLine.id ? updater(line) : line)),
    );
  }

  function selectElement(type: "field" | "line", id: string, additive = false) {
    const key = getSelectedElementKey(type, id);

    setSelectedElementType(type);
    if (type === "field") {
      setSelectedFieldId(id);
      setSelectedLineId(null);
    } else {
      setSelectedLineId(id);
    }

    setSelectedElementKeys((currentKeys) => {
      if (!additive) {
        return [key];
      }

      if (currentKeys.includes(key)) {
        const nextKeys = currentKeys.filter((currentKey) => currentKey !== key);
        return nextKeys.length > 0 ? nextKeys : [key];
      }

      return [...currentKeys, key];
    });
  }

  function handleElementSelect(
    event: ReactMouseEvent<HTMLElement>,
    type: "field" | "line",
    id: string,
  ) {
    selectElement(type, id, event.shiftKey);
  }

  function getSelectedGroupOrigins(activeKey: SelectedElementKey) {
    const keys = selectedElementKeys.includes(activeKey) ? selectedElementKeys : [activeKey];

    return keys
      .map((key) => {
        const { type, id } = parseSelectedElementKey(key);

        if (type === "field") {
          const field = fields.find((currentField) => currentField.id === id);

          if (!field || field.locked) {
            return null;
          }

          const bounds = getFieldBounds(field);

          return {
            key,
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
          };
        }

        const line = lines.find((currentLine) => currentLine.id === id);

        if (!line || line.locked) {
          return null;
        }

        const bounds = getLineBounds(line);

        return {
          key,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        };
      })
      .filter((origin): origin is NonNullable<typeof origin> => Boolean(origin));
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLButtonElement | HTMLDivElement>,
    field: CustomizeReportField,
  ) {
    if (field.locked) {
      selectElement("field", field.id, event.shiftKey);
      return;
    }

    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    pushUndoSnapshot();
    selectElement("field", field.id, event.shiftKey);
    const activeKey = getSelectedElementKey("field", field.id);
    dragStateRef.current = {
      elementId: field.id,
      elementType: "field",
      action: "move",
      startX: event.clientX,
      startY: event.clientY,
      originX: field.x,
      originY: field.y,
      groupOrigins: getSelectedGroupOrigins(activeKey),
    };
  }

  function handleLinePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    line: CustomizeReportLine,
  ) {
    if (line.locked) {
      selectElement("line", line.id, event.shiftKey);
      return;
    }

    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    pushUndoSnapshot();
    selectElement("line", line.id, event.shiftKey);
    const activeKey = getSelectedElementKey("line", line.id);
    dragStateRef.current = {
      elementId: line.id,
      elementType: "line",
      action: "move",
      startX: event.clientX,
      startY: event.clientY,
      originX: line.x,
      originY: line.y,
      groupOrigins: getSelectedGroupOrigins(activeKey),
    };
  }

  function handleResizePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    field: CustomizeReportField,
    resizeHandle: DragState["resizeHandle"],
  ) {
    if (field.locked) {
      return;
    }

    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    pushUndoSnapshot();
    selectElement("field", field.id, false);
    dragStateRef.current = {
      elementId: field.id,
      elementType: "field",
      action: "resize",
      resizeHandle,
      startX: event.clientX,
      startY: event.clientY,
      originX: field.x,
      originY: field.y,
      originWidth: field.width,
      originHeight: field.height,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement | HTMLDivElement>) {
    const dragState = dragStateRef.current;

    if (!dragState) {
      return;
    }

    const zoomScale = zoom / 100;
    const deltaX = (event.clientX - dragState.startX) / zoomScale;
    const deltaY = (event.clientY - dragState.startY) / zoomScale;

    if (
      dragState.action === "move" &&
      dragState.groupOrigins &&
      dragState.groupOrigins.length > 1
    ) {
      const pageMinX = Math.min(...dragState.groupOrigins.map((origin) => origin.x));
      const pageMaxX = Math.max(...dragState.groupOrigins.map((origin) => origin.x + origin.width));
      const pageMinY = Math.min(...dragState.groupOrigins.map((origin) => origin.y));
      const pageMaxY = Math.max(
        ...dragState.groupOrigins.map((origin) => origin.y + origin.height),
      );
      const groupDeltaX = clamp(snapValue(deltaX), -pageMinX, pageSetup.width - pageMaxX);
      const groupDeltaY = clamp(snapValue(deltaY), -pageMinY, pageSetup.height - pageMaxY);
      const nextPositions = new Map(
        dragState.groupOrigins.map((origin) => [
          origin.key,
          {
            x: origin.x + groupDeltaX,
            y: origin.y + groupDeltaY,
          },
        ]),
      );

      setFields((currentFields) =>
        currentFields.map((field) => {
          const position = nextPositions.get(getSelectedElementKey("field", field.id));

          return position
            ? {
                ...field,
                x: position.x,
                y: position.y,
              }
            : field;
        }),
      );
      setLines((currentLines) =>
        currentLines.map((line) => {
          const position = nextPositions.get(getSelectedElementKey("line", line.id));

          return position
            ? {
                ...line,
                x: position.x,
                y: position.y,
              }
            : line;
        }),
      );
      return;
    }

    if (dragState.action === "resize") {
      const field = fields.find((currentField) => currentField.id === dragState.elementId);

      if (!field || !dragState.resizeHandle) {
        return;
      }

      const originWidth = dragState.originWidth ?? field.width;
      const originHeight = dragState.originHeight ?? field.height;
      let nextX = dragState.originX;
      let nextY = dragState.originY;
      let nextWidth = originWidth;
      let nextHeight = originHeight;

      if (dragState.resizeHandle.includes("e")) {
        nextWidth = snapValue(originWidth + deltaX);
      }

      if (dragState.resizeHandle.includes("s")) {
        nextHeight = snapValue(originHeight + deltaY);
      }

      if (dragState.resizeHandle.includes("w")) {
        const nextLeft = snapValue(dragState.originX + deltaX);
        nextX = clamp(nextLeft, 0, dragState.originX + originWidth - MinFieldWidth);
        nextWidth = originWidth + dragState.originX - nextX;
      }

      if (dragState.resizeHandle.includes("n")) {
        const nextTop = snapValue(dragState.originY + deltaY);
        nextY = clamp(nextTop, 0, dragState.originY + originHeight - MinFieldHeight);
        nextHeight = originHeight + dragState.originY - nextY;
      }

      nextWidth = clamp(nextWidth, MinFieldWidth, pageSetup.width - nextX);
      nextHeight = clamp(nextHeight, MinFieldHeight, pageSetup.height - nextY);

      setFields((currentFields) =>
        currentFields.map((currentField) =>
          currentField.id === dragState.elementId
            ? {
                ...currentField,
                x: nextX,
                y: nextY,
                width: nextWidth,
                height: nextHeight,
              }
            : currentField,
        ),
      );
      return;
    }

    if (dragState.elementType === "line") {
      const line = lines.find((currentLine) => currentLine.id === dragState.elementId);

      if (!line) {
        return;
      }

      const width = line.orientation === "horizontal" ? line.length : line.thickness;
      const height = line.orientation === "horizontal" ? line.thickness : line.length;
      const rawX = clamp(snapValue(dragState.originX + deltaX), 0, pageSetup.width - width);
      const rawY = clamp(snapValue(dragState.originY + deltaY), 0, pageSetup.height - height);
      const snappedPosition = getSnappedPosition(
        {
          id: line.id,
          label: line.label,
          type: "line",
          x: rawX,
          y: rawY,
          width,
          height,
        },
        getVisibleElementBounds(fields, lines, line.id),
        pageSetup,
      );

      setAlignmentGuides(snappedPosition.guides);
      setLines((currentLines) =>
        currentLines.map((currentLine) =>
          currentLine.id === dragState.elementId
            ? {
                ...currentLine,
                x: snappedPosition.x,
                y: snappedPosition.y,
              }
            : currentLine,
        ),
      );
      return;
    }

    const field = fields.find((currentField) => currentField.id === dragState.elementId);

    if (!field) {
      return;
    }

    const rawX = clamp(snapValue(dragState.originX + deltaX), 0, pageSetup.width - field.width);
    const rawY = clamp(snapValue(dragState.originY + deltaY), 0, pageSetup.height - field.height);
    const snappedPosition = getSnappedPosition(
      {
        ...getFieldBounds(field),
        x: rawX,
        y: rawY,
      },
      getVisibleElementBounds(fields, lines, field.id),
      pageSetup,
    );

    setAlignmentGuides(snappedPosition.guides);
    setFields((currentFields) =>
      currentFields.map((currentField) =>
        currentField.id === dragState.elementId
          ? {
              ...currentField,
              x: snappedPosition.x,
              y: snappedPosition.y,
            }
          : currentField,
      ),
    );
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement | HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragStateRef.current = null;
    setAlignmentGuides([]);
  }

  function handleCanvasPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || isEditableElement(event.target)) {
      return;
    }

    const target = event.target instanceof HTMLElement ? event.target : null;

    if (target?.closest("[data-report-element='true'], button, input, textarea, select")) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    canvasPanStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
    };
    setIsCanvasPanning(true);
    event.preventDefault();
  }

  function handleCanvasPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const panState = canvasPanStateRef.current;

    if (!panState) {
      return;
    }

    event.currentTarget.scrollLeft = panState.scrollLeft + panState.startX - event.clientX;
    event.currentTarget.scrollTop = panState.scrollTop + panState.startY - event.clientY;
  }

  function handleCanvasPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!canvasPanStateRef.current) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    canvasPanStateRef.current = null;
    setIsCanvasPanning(false);
  }

  function handleSaveLayout() {
    window.localStorage.setItem(
      getReportStorageKey(selectedReport.id),
      JSON.stringify({
        fields,
        lines,
        pageSetup,
        tableSetup,
        marginSetup,
      } satisfies CustomizeReportLayout),
    );
    toast.success(`${selectedReport.label} layout saved.`);
  }

  function handleResetLayout() {
    pushUndoSnapshot();
    window.localStorage.removeItem(getReportStorageKey(selectedReport.id));
    setFields(CustomizeReportFields);
    setLines(CustomizeReportLines);
    setPageSetup(CustomizeReportDefaultPageSetup);
    setTableSetup(DefaultTableSetup);
    setMarginSetup(DefaultMarginSetup);
    selectElement("field", CustomizeReportFields[0].id);
    toast.success(`${selectedReport.label} layout reset.`);
  }

  function handleAddLine() {
    pushUndoSnapshot();
    const nextLine: CustomizeReportLine = {
      id: `line-${Date.now()}`,
      label: `Line ${lines.length + 1}`,
      x: 42,
      y: 190 + lines.length * 14,
      length: 240,
      thickness: 1,
      orientation: "horizontal",
      color: "#334155",
      visible: true,
    };

    setLines((currentLines) => [...currentLines, nextLine]);
    selectElement("line", nextLine.id);
    toast.success("Line added.");
  }

  function handleAddStaticText() {
    pushUndoSnapshot();

    const nextField: CustomizeReportField = {
      id: `static-text-${Date.now()}`,
      label: `Text ${fields.filter((field) => field.value).length + 1}`,
      binding: "",
      value: "Custom Text",
      type: "text",
      x: 42,
      y: 120,
      width: 180,
      height: 24,
      fontSize: 12,
      align: "left",
      bold: false,
      visible: true,
    };

    setFields((currentFields) => [...currentFields, nextField]);
    selectElement("field", nextField.id);
    toast.success("Text added.");
  }

  function handleLogoUpload(event: ReactChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageSource = typeof reader.result === "string" ? reader.result : "";

      if (!imageSource) {
        toast.error("Unable to read logo image.");
        return;
      }

      pushUndoSnapshot();

      const nextField: CustomizeReportField = {
        id: `logo-${Date.now()}`,
        label: "Logo",
        binding: "",
        src: imageSource,
        type: "image",
        x: 42,
        y: 24,
        width: 120,
        height: 60,
        fontSize: 12,
        align: "left",
        bold: false,
        visible: true,
      };

      setFields((currentFields) => [...currentFields, nextField]);
      selectElement("field", nextField.id);
      toast.success("Logo uploaded.");
    };

    reader.onerror = () => {
      toast.error("Unable to read logo image.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleDeleteSelectedLine() {
    if (!selectedLine) {
      return;
    }

    if (selectedLine.locked) {
      toast.error("Unlock this line before deleting.");
      return;
    }

    pushUndoSnapshot();
    setLines((currentLines) => currentLines.filter((line) => line.id !== selectedLine.id));
    selectElement("field", fields[0]?.id || CustomizeReportFields[0].id);
    toast.success("Line removed.");
  }

  function handleDeleteSelectedField() {
    if (!selectedField) {
      return;
    }

    if (selectedField.locked) {
      toast.error("Unlock this element before deleting.");
      return;
    }

    if (fields.length <= 1) {
      toast.error("Keep at least one field in the report.");
      return;
    }

    pushUndoSnapshot();
    const remainingFields = fields.filter((field) => field.id !== selectedField.id);

    setFields(remainingFields);
    selectElement("field", remainingFields[0]?.id || CustomizeReportFields[0].id);
    toast.success("Element removed.");
  }

  function handleDuplicateSelectedElement() {
    pushUndoSnapshot();

    if (selectedElementType === "line" && selectedLine) {
      const lineWidth =
        selectedLine.orientation === "horizontal" ? selectedLine.length : selectedLine.thickness;
      const lineHeight =
        selectedLine.orientation === "horizontal" ? selectedLine.thickness : selectedLine.length;
      const nextLine: CustomizeReportLine = {
        ...selectedLine,
        id: `line-${Date.now()}`,
        label: `${selectedLine.label} Copy`,
        x: clamp(selectedLine.x + 16, 0, pageSetup.width - lineWidth),
        y: clamp(selectedLine.y + 16, 0, pageSetup.height - lineHeight),
        locked: false,
        zIndex: Math.max(1, ...lines.map((line) => line.zIndex ?? 1)) + 1,
      };

      setLines((currentLines) => [...currentLines, nextLine]);
      selectElement("line", nextLine.id);
      toast.success("Line duplicated.");
      return;
    }

    if (!selectedField) {
      return;
    }

    const nextField: CustomizeReportField = {
      ...selectedField,
      id: `${selectedField.id}-copy-${Date.now()}`,
      label: `${selectedField.label} Copy`,
      x: clamp(selectedField.x + 16, 0, pageSetup.width - selectedField.width),
      y: clamp(selectedField.y + 16, 0, pageSetup.height - selectedField.height),
      locked: false,
      zIndex: Math.max(1, ...fields.map((field) => field.zIndex ?? 1)) + 1,
    };

    setFields((currentFields) => [...currentFields, nextField]);
    selectElement("field", nextField.id);
    toast.success("Element duplicated.");
  }

  function handleToggleSelectedLock() {
    pushUndoSnapshot();

    if (selectedElementType === "line" && selectedLine) {
      setLines((currentLines) =>
        currentLines.map((line) =>
          line.id === selectedLine.id
            ? {
                ...line,
                locked: !line.locked,
              }
            : line,
        ),
      );
      return;
    }

    if (selectedField) {
      setFields((currentFields) =>
        currentFields.map((field) =>
          field.id === selectedField.id
            ? {
                ...field,
                locked: !field.locked,
              }
            : field,
        ),
      );
    }
  }

  function handleLayerSelectedElement(action: "backward" | "forward" | "back" | "front") {
    const allZIndexes = [
      ...fields.map((field) => field.zIndex ?? 1),
      ...lines.map((line) => line.zIndex ?? 1),
    ];
    const minZIndex = Math.min(1, ...allZIndexes);
    const maxZIndex = Math.max(1, ...allZIndexes);
    const getNextZIndex = (currentZIndex: number) => {
      if (action === "back") {
        return minZIndex - 1;
      }

      if (action === "front") {
        return maxZIndex + 1;
      }

      return action === "forward" ? currentZIndex + 1 : currentZIndex - 1;
    };

    pushUndoSnapshot();

    if (selectedElementType === "line" && selectedLine) {
      setLines((currentLines) =>
        currentLines.map((line) =>
          line.id === selectedLine.id
            ? {
                ...line,
                zIndex: getNextZIndex(line.zIndex ?? 1),
              }
            : line,
        ),
      );
      return;
    }

    if (selectedField) {
      setFields((currentFields) =>
        currentFields.map((field) =>
          field.id === selectedField.id
            ? {
                ...field,
                zIndex: getNextZIndex(field.zIndex ?? 1),
              }
            : field,
        ),
      );
    }
  }

  function handleAlignDistributeSelected(action: AlignDistributionAction) {
    if (selectedElements.length < 2) {
      toast.error("Select at least two elements.");
      return;
    }

    const unlockedElements = selectedElements.filter((element) => {
      if (element.type === "field") {
        return !fields.find((field) => field.id === element.id)?.locked;
      }

      return !lines.find((line) => line.id === element.id)?.locked;
    });

    if (unlockedElements.length < 2) {
      toast.error("Unlock at least two selected elements first.");
      return;
    }

    const minLeft = Math.min(...unlockedElements.map((element) => element.bounds.x));
    const maxRight = Math.max(
      ...unlockedElements.map((element) => element.bounds.x + element.bounds.width),
    );
    const minTop = Math.min(...unlockedElements.map((element) => element.bounds.y));
    const maxBottom = Math.max(
      ...unlockedElements.map((element) => element.bounds.y + element.bounds.height),
    );
    const centerX = minLeft + (maxRight - minLeft) / 2;
    const centerY = minTop + (maxBottom - minTop) / 2;
    const horizontalOrder = [...unlockedElements].sort((a, b) => a.bounds.x - b.bounds.x);
    const verticalOrder = [...unlockedElements].sort((a, b) => a.bounds.y - b.bounds.y);
    const horizontalGap =
      horizontalOrder.length > 2
        ? (maxRight - minLeft - horizontalOrder.reduce((sum, item) => sum + item.bounds.width, 0)) /
          (horizontalOrder.length - 1)
        : 0;
    const verticalGap =
      verticalOrder.length > 2
        ? (maxBottom - minTop - verticalOrder.reduce((sum, item) => sum + item.bounds.height, 0)) /
          (verticalOrder.length - 1)
        : 0;
    const nextPositions = new Map<string, { x: number; y: number }>();

    for (const element of unlockedElements) {
      let nextX = element.bounds.x;
      let nextY = element.bounds.y;

      if (action === "left") nextX = minLeft;
      if (action === "center") nextX = centerX - element.bounds.width / 2;
      if (action === "right") nextX = maxRight - element.bounds.width;
      if (action === "top") nextY = minTop;
      if (action === "middle") nextY = centerY - element.bounds.height / 2;
      if (action === "bottom") nextY = maxBottom - element.bounds.height;

      nextPositions.set(element.key, { x: Math.round(nextX), y: Math.round(nextY) });
    }

    if (action === "distribute-horizontal" && horizontalOrder.length > 2) {
      let cursorX = minLeft;

      for (const element of horizontalOrder) {
        nextPositions.set(element.key, { x: Math.round(cursorX), y: element.bounds.y });
        cursorX += element.bounds.width + horizontalGap;
      }
    }

    if (action === "distribute-vertical" && verticalOrder.length > 2) {
      let cursorY = minTop;

      for (const element of verticalOrder) {
        nextPositions.set(element.key, { x: element.bounds.x, y: Math.round(cursorY) });
        cursorY += element.bounds.height + verticalGap;
      }
    }

    pushUndoSnapshot();
    setFields((currentFields) =>
      currentFields.map((field) => {
        const position = nextPositions.get(getSelectedElementKey("field", field.id));

        return position
          ? {
              ...field,
              x: clamp(position.x, 0, pageSetup.width - field.width),
              y: clamp(position.y, 0, pageSetup.height - field.height),
            }
          : field;
      }),
    );
    setLines((currentLines) =>
      currentLines.map((line) => {
        const position = nextPositions.get(getSelectedElementKey("line", line.id));
        const bounds = getLineBounds(line);

        return position
          ? {
              ...line,
              x: clamp(position.x, 0, pageSetup.width - bounds.width),
              y: clamp(position.y, 0, pageSetup.height - bounds.height),
            }
          : line;
      }),
    );
  }

  function handleToggleFieldVisibility(fieldId: string) {
    pushUndoSnapshot();
    setFields((currentFields) =>
      currentFields.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              visible: !field.visible,
            }
          : field,
      ),
    );
    selectElement("field", fieldId);
  }

  function handleToggleLineVisibility(lineId: string) {
    pushUndoSnapshot();
    setLines((currentLines) =>
      currentLines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              visible: !line.visible,
            }
          : line,
      ),
    );
    selectElement("line", lineId);
  }

  function handlePageFormatChange(format: CustomizeReportPaperFormat) {
    pushUndoSnapshot();
    setPageSetup((currentSetup) => getPageSetup(format, currentSetup.orientation));
  }

  function handlePageOrientationChange(orientation: CustomizeReportPageSetup["orientation"]) {
    pushUndoSnapshot();
    setPageSetup((currentSetup) => getPageSetup(currentSetup.format, orientation));
  }

  function updateTableSetup(
    updater: (setup: CustomizeReportTableSetup) => CustomizeReportTableSetup,
  ) {
    pushUndoSnapshot();
    setTableSetup((currentSetup) => getTableSetupWithDefaults(updater(currentSetup)));
  }

  function updateTableColumn(
    columnKey: CustomizeReportTableColumnKey,
    updater: (column: CustomizeReportTableColumn) => CustomizeReportTableColumn,
  ) {
    updateTableSetup((currentSetup) => ({
      ...currentSetup,
      columns: currentSetup.columns.map((column) =>
        column.key === columnKey ? updater(column) : column,
      ),
    }));
  }

  function updateMarginSetup(
    updater: (setup: CustomizeReportMarginSetup) => CustomizeReportMarginSetup,
  ) {
    pushUndoSnapshot();
    setMarginSetup((currentSetup) => updater(currentSetup));
  }

  async function handlePreviewPdf() {
    setIsRendering(true);
    const previewWindow = window.open("", "_blank");

    try {
      const response = await fetch("/api/customize-report/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: templatePreview,
          data: reportData,
          fileName: `${selectedReport.documentPrefix}-custom-report-preview`,
          page: {
            format: pageSetup.format,
            landscape: pageSetup.orientation === "landscape",
          },
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorBody?.message || "Unable to generate PDF preview.");
      }

      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);

      if (previewWindow) {
        previewWindow.location.href = pdfUrl;
      } else {
        window.location.href = pdfUrl;
      }

      toast.success("PDF preview generated.");
    } catch (error) {
      previewWindow?.close();
      toast.error(error instanceof Error ? error.message : "Unable to generate PDF preview.");
    } finally {
      setIsRendering(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-6">
      <section className="mb-4 rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(220px,1fr)_auto] lg:items-start">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
              jsreport PDF Designer
            </p>
            <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-950">
              {selectedReport.label} Report
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Drag fields, adjust alignment, save the layout, then preview the PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
            <button
              className={`${ToolbarButtonClassName} px-2.5`}
              disabled={!canUndo}
              onClick={handleUndoLayout}
              title="Undo (Ctrl+Z)"
              type="button"
            >
              <Undo2 className="h-4 w-4" />
              <span className="sr-only">Undo</span>
            </button>
            <button
              className={`${ToolbarButtonClassName} px-2.5`}
              disabled={!canRedo}
              onClick={handleRedoLayout}
              title="Redo (Ctrl+Y)"
              type="button"
            >
              <Redo2 className="h-4 w-4" />
              <span className="sr-only">Redo</span>
            </button>
            <div className="inline-flex h-9 items-center overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
              <button
                className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={zoom <= MinZoom}
                onClick={() =>
                  setZoom((currentZoom) => clamp(currentZoom - ZoomStep, MinZoom, MaxZoom))
                }
                title="Zoom out"
                type="button"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-14 border-x border-slate-200 px-2 text-center text-sm font-semibold text-slate-700">
                {zoom}%
              </span>
              <button
                className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={zoom >= MaxZoom}
                onClick={() =>
                  setZoom((currentZoom) => clamp(currentZoom + ZoomStep, MinZoom, MaxZoom))
                }
                title="Zoom in"
                type="button"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
            <button
              className={ToolbarButtonClassName}
              onClick={() => setIsToolsDialogOpen(true)}
              type="button"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Tools
            </button>
            <button className={ToolbarButtonClassName} onClick={handleResetLayout}>
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>
            <button className={ToolbarButtonClassName} onClick={handleSaveLayout}>
              <Save className="h-4 w-4" />
              Save Layout
            </button>
            <button
              className={PrimaryButtonClassName}
              disabled={isRendering}
              onClick={handlePreviewPdf}
            >
              <FileText className="h-4 w-4" />
              {isRendering ? "Rendering..." : "Preview PDF"}
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:grid-cols-3">
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Report Module</span>
            <select
              className={`${ReportToolbarSelectClassName} w-full`}
              onChange={(event) => setSelectedReportId(event.target.value)}
              value={selectedReportId}
            >
              {["Cash Receipt", "Cash Disbursement", "Sales", "Purchasing", "Inventory"].map(
                (category) => (
                  <optgroup key={category} label={category}>
                    {CustomizeReportModuleOptions.filter(
                      (report) => report.category === category,
                    ).map((report) => (
                      <option key={report.id} value={report.id}>
                        {report.label} ({report.moduleCode})
                      </option>
                    ))}
                  </optgroup>
                ),
              )}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Paper</span>
            <select
              className={`${ReportToolbarSelectClassName} w-full`}
              onChange={(event) =>
                handlePageFormatChange(event.target.value as CustomizeReportPaperFormat)
              }
              value={pageSetup.format}
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Orientation</span>
            <select
              className={`${ReportToolbarSelectClassName} w-full`}
              onChange={(event) =>
                handlePageOrientationChange(
                  event.target.value as CustomizeReportPageSetup["orientation"],
                )
              }
              value={pageSetup.orientation}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>
        </div>
      </section>

      {isToolsDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-md border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-4">
              <div>
                <p className="text-sm font-bold text-slate-900">Customize tools</p>
                <p className="mt-1 text-xs text-slate-500">
                  Add layout elements and control snapping while designing.
                </p>
              </div>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setIsToolsDialogOpen(false)}
                title="Close"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <div className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Snap to Grid</p>
                    <p className="text-xs text-slate-500">Show grid and snap movement.</p>
                  </div>
                  <input
                    checked={snapToGrid}
                    className="h-5 w-5 accent-orange-500"
                    onChange={(event) => setSnapToGrid(event.target.checked)}
                    type="checkbox"
                  />
                </div>
                <label className="mt-3 block space-y-1">
                  <span className="text-xs font-semibold uppercase text-slate-500">Grid Size</span>
                  <input
                    className={InspectorNumberInputClassName}
                    min={1}
                    onChange={(event) => setGridSize(clamp(Number(event.target.value), 1, 100))}
                    type="number"
                    value={gridSize}
                  />
                </label>
              </div>

              <div className="rounded-md border border-slate-200 p-3">
                <p className="mb-3 text-sm font-semibold text-slate-800">Safe Print Area</p>
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    checked={marginSetup.visible}
                    className="h-4 w-4 accent-orange-500"
                    onChange={(event) =>
                      updateMarginSetup((currentSetup) => ({
                        ...currentSetup,
                        visible: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Show margin guide
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["top", "right", "bottom", "left"] as const).map((side) => (
                    <FieldNumberControl
                      key={side}
                      label={side}
                      value={marginSetup[side]}
                      onChange={(value) =>
                        updateMarginSetup((currentSetup) => ({
                          ...currentSetup,
                          [side]: clamp(value, 0, 240),
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-slate-200 p-3">
                <p className="mb-3 text-sm font-semibold text-slate-800">Table Designer</p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                  <FieldNumberControl
                    label="X"
                    value={tableSetup.x}
                    onChange={(value) =>
                      updateTableSetup((currentSetup) => ({
                        ...currentSetup,
                        x: clamp(value, 0, pageSetup.width - currentSetup.width),
                      }))
                    }
                  />
                  <FieldNumberControl
                    label="Y"
                    value={tableSetup.y}
                    onChange={(value) =>
                      updateTableSetup((currentSetup) => ({
                        ...currentSetup,
                        y: clamp(value, 0, pageSetup.height - currentSetup.rowHeight),
                      }))
                    }
                  />
                  <FieldNumberControl
                    label="Width"
                    value={tableSetup.width}
                    onChange={(value) =>
                      updateTableSetup((currentSetup) => ({
                        ...currentSetup,
                        width: clamp(value, 160, pageSetup.width - currentSetup.x),
                      }))
                    }
                  />
                  <FieldNumberControl
                    label="Font"
                    value={tableSetup.fontSize}
                    onChange={(value) =>
                      updateTableSetup((currentSetup) => ({
                        ...currentSetup,
                        fontSize: clamp(value, 8, 24),
                      }))
                    }
                  />
                  <FieldNumberControl
                    label="Row"
                    value={tableSetup.rowHeight}
                    onChange={(value) =>
                      updateTableSetup((currentSetup) => ({
                        ...currentSetup,
                        rowHeight: clamp(value, 18, 48),
                      }))
                    }
                  />
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    checked={tableSetup.showBorders}
                    className="h-4 w-4 accent-orange-500"
                    onChange={(event) =>
                      updateTableSetup((currentSetup) => ({
                        ...currentSetup,
                        showBorders: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Show table borders
                </label>
                <div className="mt-3 space-y-2">
                  {tableSetup.columns.map((column) => (
                    <div
                      key={column.key}
                      className="grid gap-2 rounded-md border border-slate-100 bg-slate-50 p-2 md:grid-cols-[auto_minmax(0,1fr)_5rem_6rem]"
                    >
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <input
                          checked={column.visible}
                          className="h-4 w-4 accent-orange-500"
                          onChange={(event) =>
                            updateTableColumn(column.key, (currentColumn) => ({
                              ...currentColumn,
                              visible: event.target.checked,
                            }))
                          }
                          type="checkbox"
                        />
                        Show
                      </label>
                      <input
                        className={InspectorNumberInputClassName}
                        onChange={(event) =>
                          updateTableColumn(column.key, (currentColumn) => ({
                            ...currentColumn,
                            label: event.target.value,
                          }))
                        }
                        value={column.label}
                      />
                      <input
                        className={InspectorNumberInputClassName}
                        min={24}
                        onChange={(event) =>
                          updateTableColumn(column.key, (currentColumn) => ({
                            ...currentColumn,
                            width: clamp(Number(event.target.value), 24, 260),
                          }))
                        }
                        type="number"
                        value={column.width}
                      />
                      <select
                        className={InspectorNumberInputClassName}
                        onChange={(event) =>
                          updateTableColumn(column.key, (currentColumn) => ({
                            ...currentColumn,
                            align: event.target.value as CustomizeReportAlign,
                          }))
                        }
                        value={column.align}
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button className={ToolbarButtonClassName} onClick={handleAddLine}>
                  <Plus className="h-4 w-4" />
                  Line
                </button>
                <button className={ToolbarButtonClassName} onClick={handleAddStaticText}>
                  <Type className="h-4 w-4" />
                  Text
                </button>
                <label className={ToolbarButtonClassName} htmlFor="customize-report-logo-upload">
                  <Upload className="h-4 w-4" />
                  Logo
                </label>
              </div>
              <input
                accept="image/*"
                className="hidden"
                id="customize-report-logo-upload"
                onChange={handleLogoUpload}
                type="file"
              />
            </div>
          </div>
        </div>
      ) : null}

      <section
        className={`grid gap-4 ${
          isElementsPanelOpen
            ? "xl:grid-cols-[240px_minmax(0,1fr)_290px]"
            : "xl:grid-cols-[48px_minmax(0,1fr)_290px]"
        }`}
      >
        <aside
          className={`rounded-md border border-slate-200 bg-white shadow-sm ${
            isElementsPanelOpen ? "p-3" : "flex items-start justify-center p-2"
          }`}
        >
          {isElementsPanelOpen ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-2 text-sm font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <PanelRight className="h-4 w-4 text-orange-500" />
                  Elements
                </span>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-orange-300 hover:text-orange-600"
                  onClick={() => setIsElementsPanelOpen(false)}
                  title="Close elements"
                  type="button"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Fields</p>
              <div className="space-y-2">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className={`flex w-full items-center overflow-hidden rounded-md border text-sm transition ${
                      selectedElementSet.has(getSelectedElementKey("field", field.id))
                        ? "border-orange-300 bg-orange-50 text-orange-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <button
                      className="min-w-0 flex-1 px-3 py-2 text-left font-semibold"
                      onClick={(event) => handleElementSelect(event, "field", field.id)}
                      type="button"
                    >
                      <span className={field.visible ? "" : "text-slate-400"}>{field.label}</span>
                    </button>
                    <button
                      className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-400 transition hover:bg-slate-100 hover:text-orange-600"
                      onClick={() => handleToggleFieldVisibility(field.id)}
                      title={field.visible ? `Hide ${field.label}` : `Show ${field.label}`}
                      type="button"
                    >
                      {field.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      <span className="sr-only">
                        {field.visible ? `Hide ${field.label}` : `Show ${field.label}`}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
              <p className="mb-2 mt-4 text-xs font-semibold uppercase text-slate-500">Lines</p>
              <div className="space-y-2">
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className={`flex w-full items-center overflow-hidden rounded-md border text-sm transition ${
                      selectedElementSet.has(getSelectedElementKey("line", line.id))
                        ? "border-orange-300 bg-orange-50 text-orange-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <button
                      className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left font-semibold"
                      onClick={(event) => handleElementSelect(event, "line", line.id)}
                      type="button"
                    >
                      <Minus className="h-4 w-4 shrink-0" />
                      <span className={line.visible ? "" : "text-slate-400"}>{line.label}</span>
                    </button>
                    <button
                      className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-400 transition hover:bg-slate-100 hover:text-orange-600"
                      onClick={() => handleToggleLineVisibility(line.id)}
                      title={line.visible ? `Hide ${line.label}` : `Show ${line.label}`}
                      type="button"
                    >
                      {line.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      <span className="sr-only">
                        {line.visible ? `Hide ${line.label}` : `Show ${line.label}`}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <button
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-orange-300 hover:text-orange-600"
              onClick={() => setIsElementsPanelOpen(true)}
              title="Open elements"
              type="button"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
        </aside>

        <div
          className={`h-[calc(100vh-15rem)] min-h-[32rem] overflow-auto overscroll-contain rounded-md border border-slate-200 bg-slate-200 p-4 shadow-sm ${
            isCanvasPanning ? "cursor-grabbing" : "cursor-grab"
          }`}
          onPointerCancel={handleCanvasPointerUp}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          ref={canvasScrollRef}
          title="Drag empty canvas to pan. Hold Ctrl and scroll to zoom."
        >
          <div
            className="relative mx-auto"
            style={{
              width: pageSetup.width * (zoom / 100),
              height: pageSetup.height * (zoom / 100),
            }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left overflow-hidden bg-white shadow-lg"
              style={{
                width: pageSetup.width,
                height: pageSetup.height,
                transform: `scale(${zoom / 100})`,
                backgroundImage: snapToGrid
                  ? "linear-gradient(to right, rgba(148, 163, 184, 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.22) 1px, transparent 1px)"
                  : undefined,
                backgroundSize: snapToGrid ? `${gridSize}px ${gridSize}px` : undefined,
              }}
            >
              {marginSetup.visible ? (
                <div
                  className="pointer-events-none absolute border border-dashed border-red-400/80 bg-red-50/10"
                  style={{
                    left: marginSetup.left,
                    top: marginSetup.top,
                    width: pageSetup.width - marginSetup.left - marginSetup.right,
                    height: pageSetup.height - marginSetup.top - marginSetup.bottom,
                    zIndex: 0,
                  }}
                />
              ) : null}

              <div
                className={`absolute overflow-hidden rounded-sm ${
                  tableSetup.showBorders ? "border border-slate-300" : ""
                }`}
                style={{
                  left: tableSetup.x,
                  top: tableSetup.y,
                  width: tableSetup.width,
                }}
              >
                <table className="w-full border-collapse" style={{ fontSize: tableSetup.fontSize }}>
                  <thead className="bg-slate-50">
                    <tr>
                      {tableSetup.columns
                        .filter((column) => column.visible)
                        .map((column) => (
                          <th
                            key={column.key}
                            className={
                              tableSetup.showBorders ? "border border-slate-300 px-2" : "px-2"
                            }
                            style={{
                              width: column.width,
                              height: tableSetup.rowHeight,
                              textAlign: column.align,
                            }}
                          >
                            {column.label}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CustomizeReportSampleData.items.map((item) => (
                      <tr key={item.itemCode}>
                        {tableSetup.columns
                          .filter((column) => column.visible)
                          .map((column) => (
                            <td
                              key={column.key}
                              className={
                                tableSetup.showBorders ? "border border-slate-200 px-2" : "px-2"
                              }
                              style={{
                                width: column.width,
                                height: tableSetup.rowHeight,
                                textAlign: column.align,
                              }}
                            >
                              {column.key === "unitCost" || column.key === "amount"
                                ? formatCurrency(item[column.key])
                                : item[column.key]}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {alignmentGuides.map((guide) => (
                <div
                  key={guide.id}
                  className={`pointer-events-none absolute z-30 ${
                    guide.orientation === "vertical"
                      ? "border-l-2 border-dashed border-orange-500"
                      : "border-t-2 border-dashed border-orange-500"
                  }`}
                  style={
                    guide.orientation === "vertical"
                      ? {
                          left: guide.position,
                          top: guide.start,
                          height: guide.end - guide.start,
                        }
                      : {
                          left: guide.start,
                          top: guide.position,
                          width: guide.end - guide.start,
                        }
                  }
                />
              ))}

              {lines
                .filter((line) => line.visible)
                .map((line) => {
                  const width =
                    line.orientation === "horizontal" ? line.length : Math.max(line.thickness, 8);
                  const height =
                    line.orientation === "horizontal" ? Math.max(line.thickness, 8) : line.length;

                  return (
                    <button
                      key={line.id}
                      data-report-element="true"
                      className={`absolute rounded-sm transition ${
                        selectedElementSet.has(getSelectedElementKey("line", line.id))
                          ? "ring-2 ring-orange-300"
                          : "hover:ring-2 hover:ring-sky-200"
                      } ${line.locked ? "cursor-not-allowed opacity-70" : "cursor-move"}`}
                      onClick={(event) => handleElementSelect(event, "line", line.id)}
                      onPointerDown={(event) => handleLinePointerDown(event, line)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      style={{
                        left: line.x,
                        top: line.y,
                        width,
                        height,
                        zIndex: line.zIndex ?? 1,
                        background:
                          line.orientation === "horizontal"
                            ? `linear-gradient(to bottom, transparent ${Math.max(Math.floor((height - line.thickness) / 2), 0)}px, ${line.color} ${Math.max(Math.floor((height - line.thickness) / 2), 0)}px, ${line.color} ${Math.max(Math.floor((height - line.thickness) / 2), 0) + line.thickness}px, transparent ${Math.max(Math.floor((height - line.thickness) / 2), 0) + line.thickness}px)`
                            : `linear-gradient(to right, transparent ${Math.max(Math.floor((width - line.thickness) / 2), 0)}px, ${line.color} ${Math.max(Math.floor((width - line.thickness) / 2), 0)}px, ${line.color} ${Math.max(Math.floor((width - line.thickness) / 2), 0) + line.thickness}px, transparent ${Math.max(Math.floor((width - line.thickness) / 2), 0) + line.thickness}px)`,
                      }}
                      title={line.label}
                      type="button"
                    />
                  );
                })}

              {fields
                .filter((field) => field.visible)
                .map((field) => (
                  <div
                    key={field.id}
                    data-report-element="true"
                    className={`absolute overflow-visible rounded-sm border text-slate-900 transition ${
                      selectedElementSet.has(getSelectedElementKey("field", field.id))
                        ? "border-orange-400 bg-orange-50/80 ring-2 ring-orange-200"
                        : "border-sky-200 bg-sky-50/70 hover:border-sky-400"
                    } ${field.locked ? "cursor-not-allowed opacity-80" : "cursor-move"}`}
                    onClick={(event) => handleElementSelect(event, "field", field.id)}
                    onPointerDown={(event) => handlePointerDown(event, field)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    role="button"
                    style={{
                      left: field.x,
                      top: field.y,
                      width: field.width,
                      height: field.height,
                      fontSize: field.fontSize,
                      fontFamily: field.fontFamily || DefaultFontFamily,
                      fontWeight: field.bold ? 700 : 400,
                      fontStyle: field.italic ? "italic" : "normal",
                      color: field.color || DefaultFieldColor,
                      textDecoration: field.underline ? "underline" : "none",
                      textAlign: field.align,
                      lineHeight: `${field.height}px`,
                      zIndex: field.zIndex ?? 1,
                    }}
                    tabIndex={0}
                  >
                    {field.type === "image" && field.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={field.label}
                        className="h-full w-full object-contain"
                        draggable={false}
                        src={field.src}
                      />
                    ) : (
                      <div className="h-full w-full overflow-hidden px-1">
                        {getFieldPreviewValue(field, reportData)}
                      </div>
                    )}
                    {field.id === selectedFieldId &&
                      selectedElementType === "field" &&
                      !field.locked &&
                      (["nw", "ne", "sw", "se"] as const).map((resizeHandle) => (
                        <div
                          key={resizeHandle}
                          data-report-element="true"
                          className={`absolute z-40 h-3 w-3 rounded-full border border-orange-500 bg-white shadow-sm ${
                            resizeHandle.includes("n") ? "-top-1.5" : "-bottom-1.5"
                          } ${resizeHandle.includes("w") ? "-left-1.5" : "-right-1.5"} ${
                            resizeHandle === "nw" || resizeHandle === "se"
                              ? "cursor-nwse-resize"
                              : "cursor-nesw-resize"
                          }`}
                          onPointerCancel={handlePointerUp}
                          onPointerDown={(event) =>
                            handleResizePointerDown(event, field, resizeHandle)
                          }
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          title="Resize"
                        />
                      ))}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <aside className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3">
            <p className="text-sm font-bold text-slate-800">Inspector</p>
            <p className="text-xs text-slate-500">
              {hasMultiSelection
                ? `${selectedElements.length} elements selected`
                : selectedElementType === "line" && selectedLine
                  ? selectedLine.label
                  : selectedField.label}
            </p>
          </div>

          {hasMultiSelection ? (
            <AlignDistributePanel onAction={handleAlignDistributeSelected} />
          ) : null}

          {selectedElementType === "line" && selectedLine ? (
            <LineInspector
              line={selectedLine}
              onDelete={handleDeleteSelectedLine}
              onDuplicate={handleDuplicateSelectedElement}
              onLayer={handleLayerSelectedElement}
              onToggleLock={handleToggleSelectedLock}
              pageSetup={pageSetup}
              onUpdate={updateSelectedLine}
            />
          ) : (
            <FieldInspector
              field={selectedField}
              onDelete={handleDeleteSelectedField}
              onDuplicate={handleDuplicateSelectedElement}
              onLayer={handleLayerSelectedElement}
              onToggleLock={handleToggleSelectedLock}
              pageSetup={pageSetup}
              onUpdate={updateSelectedField}
            />
          )}

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">jsreport Template</p>
            <textarea
              className="h-52 w-full resize-none rounded-md border border-slate-200 bg-slate-950 p-3 font-mono text-[11px] text-slate-100 outline-none"
              readOnly
              value={templatePreview}
            />
          </div>
        </aside>
      </section>
    </main>
  );
}

function FieldInspector({
  field,
  onDelete,
  onDuplicate,
  onLayer,
  onToggleLock,
  onUpdate,
  pageSetup,
}: {
  field: CustomizeReportField;
  onDelete: () => void;
  onDuplicate: () => void;
  onLayer: (action: "backward" | "forward" | "back" | "front") => void;
  onToggleLock: () => void;
  onUpdate: (updater: (field: CustomizeReportField) => CustomizeReportField) => void;
  pageSetup: CustomizeReportPageSetup;
}) {
  return (
    <>
      <ElementActionPanel
        isLocked={Boolean(field.locked)}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onLayer={onLayer}
        onToggleLock={onToggleLock}
      />

      <div className="grid grid-cols-2 gap-3">
        <FieldNumberControl
          label="X"
          value={field.x}
          onChange={(value) =>
            onUpdate((currentField) => ({
              ...currentField,
              x: clamp(value, 0, pageSetup.width - currentField.width),
            }))
          }
        />
        <FieldNumberControl
          label="Y"
          value={field.y}
          onChange={(value) =>
            onUpdate((currentField) => ({
              ...currentField,
              y: clamp(value, 0, pageSetup.height - currentField.height),
            }))
          }
        />
        <FieldNumberControl
          label="Width"
          value={field.width}
          onChange={(value) =>
            onUpdate((currentField) => ({
              ...currentField,
              width: clamp(value, 40, pageSetup.width - currentField.x),
            }))
          }
        />
        <FieldNumberControl
          label="Height"
          value={field.height}
          onChange={(value) =>
            onUpdate((currentField) => ({
              ...currentField,
              height: clamp(value, MinFieldHeight, pageSetup.height - currentField.y),
            }))
          }
        />
        {field.type !== "image" ? (
          <FieldNumberControl
            label="Font"
            value={field.fontSize}
            onChange={(value) =>
              onUpdate((currentField) => ({
                ...currentField,
                fontSize: clamp(value, 8, 36),
              }))
            }
          />
        ) : null}
      </div>

      {field.value !== undefined ? (
        <div className="mt-4 space-y-3">
          <TextControl
            label="Label"
            onChange={(value) =>
              onUpdate((currentField) => ({
                ...currentField,
                label: value || currentField.label,
              }))
            }
            value={field.label}
          />
          <TextControl
            label="Text"
            onChange={(value) =>
              onUpdate((currentField) => ({
                ...currentField,
                value,
              }))
            }
            value={field.value}
          />
        </div>
      ) : null}

      {field.type !== "image" ? (
        <div className="mt-4 space-y-3">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Font Family</span>
            <select
              className={InspectorNumberInputClassName}
              onChange={(event) =>
                onUpdate((currentField) => ({
                  ...currentField,
                  fontFamily: event.target.value,
                }))
              }
              value={field.fontFamily || DefaultFontFamily}
            >
              {FontFamilyOptions.map((fontFamily) => (
                <option key={fontFamily} value={fontFamily}>
                  {fontFamily.split(",")[0]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Text Color</span>
            <input
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              onChange={(event) =>
                onUpdate((currentField) => ({
                  ...currentField,
                  color: event.target.value,
                }))
              }
              type="color"
              value={field.color || DefaultFieldColor}
            />
          </label>
        </div>
      ) : null}

      {field.type !== "image" ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Alignment</p>
          <div className="grid grid-cols-3 overflow-hidden rounded-md border border-slate-200">
            <AlignButton
              align="left"
              currentAlign={field.align}
              onClick={() =>
                onUpdate((currentField) => ({
                  ...currentField,
                  align: "left",
                }))
              }
            />
            <AlignButton
              align="center"
              currentAlign={field.align}
              onClick={() =>
                onUpdate((currentField) => ({
                  ...currentField,
                  align: "center",
                }))
              }
            />
            <AlignButton
              align="right"
              currentAlign={field.align}
              onClick={() =>
                onUpdate((currentField) => ({
                  ...currentField,
                  align: "right",
                }))
              }
            />
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {field.type !== "image" ? (
          <>
            <button
              className={`${ToolbarButtonClassName} justify-center ${
                field.bold ? "border-orange-300 text-orange-600" : ""
              }`}
              onClick={() =>
                onUpdate((currentField) => ({
                  ...currentField,
                  bold: !currentField.bold,
                }))
              }
            >
              Bold
            </button>
            <button
              className={`${ToolbarButtonClassName} justify-center ${
                field.italic ? "border-orange-300 text-orange-600" : ""
              }`}
              onClick={() =>
                onUpdate((currentField) => ({
                  ...currentField,
                  italic: !currentField.italic,
                }))
              }
            >
              Italic
            </button>
            <button
              className={`${ToolbarButtonClassName} justify-center ${
                field.underline ? "border-orange-300 text-orange-600" : ""
              }`}
              onClick={() =>
                onUpdate((currentField) => ({
                  ...currentField,
                  underline: !currentField.underline,
                }))
              }
            >
              Underline
            </button>
          </>
        ) : null}
        <button
          className={`${ToolbarButtonClassName} justify-center`}
          onClick={() =>
            onUpdate((currentField) => ({
              ...currentField,
              visible: !currentField.visible,
            }))
          }
        >
          {field.visible ? "Hide" : "Show"}
        </button>
      </div>
    </>
  );
}

function LineInspector({
  line,
  onDelete,
  onDuplicate,
  onLayer,
  onToggleLock,
  onUpdate,
  pageSetup,
}: {
  line: CustomizeReportLine;
  onDelete: () => void;
  onDuplicate: () => void;
  onLayer: (action: "backward" | "forward" | "back" | "front") => void;
  onToggleLock: () => void;
  onUpdate: (updater: (line: CustomizeReportLine) => CustomizeReportLine) => void;
  pageSetup: CustomizeReportPageSetup;
}) {
  return (
    <>
      <ElementActionPanel
        isLocked={Boolean(line.locked)}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onLayer={onLayer}
        onToggleLock={onToggleLock}
      />

      <div className="grid grid-cols-2 gap-3">
        <FieldNumberControl
          label="X"
          value={line.x}
          onChange={(value) =>
            onUpdate((currentLine) => ({
              ...currentLine,
              x: clamp(
                value,
                0,
                pageSetup.width -
                  (currentLine.orientation === "horizontal"
                    ? currentLine.length
                    : currentLine.thickness),
              ),
            }))
          }
        />
        <FieldNumberControl
          label="Y"
          value={line.y}
          onChange={(value) =>
            onUpdate((currentLine) => ({
              ...currentLine,
              y: clamp(
                value,
                0,
                pageSetup.height -
                  (currentLine.orientation === "horizontal"
                    ? currentLine.thickness
                    : currentLine.length),
              ),
            }))
          }
        />
        <FieldNumberControl
          label="Length"
          value={line.length}
          onChange={(value) =>
            onUpdate((currentLine) => ({
              ...currentLine,
              length: clamp(
                value,
                12,
                currentLine.orientation === "horizontal"
                  ? pageSetup.width - currentLine.x
                  : pageSetup.height - currentLine.y,
              ),
            }))
          }
        />
        <FieldNumberControl
          label="Thick"
          value={line.thickness}
          onChange={(value) =>
            onUpdate((currentLine) => ({
              ...currentLine,
              thickness: clamp(value, 1, 8),
            }))
          }
        />
      </div>

      <div className="mt-4">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500">Orientation</span>
          <select
            className={InspectorNumberInputClassName}
            onChange={(event) =>
              onUpdate((currentLine) => ({
                ...currentLine,
                orientation: event.target.value as CustomizeReportLine["orientation"],
              }))
            }
            value={line.orientation}
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </label>
      </div>

      <div className="mt-4">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500">Color</span>
          <input
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            onChange={(event) =>
              onUpdate((currentLine) => ({
                ...currentLine,
                color: event.target.value,
              }))
            }
            type="color"
            value={line.color}
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2">
        <button
          className={`${ToolbarButtonClassName} justify-center`}
          onClick={() =>
            onUpdate((currentLine) => ({
              ...currentLine,
              visible: !currentLine.visible,
            }))
          }
        >
          {line.visible ? "Hide" : "Show"}
        </button>
      </div>
    </>
  );
}

function AlignDistributePanel({
  onAction,
}: {
  onAction: (action: AlignDistributionAction) => void;
}) {
  return (
    <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Align</p>
      <div className="grid grid-cols-3 gap-2">
        <button className={`${ToolbarButtonClassName} px-2`} onClick={() => onAction("left")}>
          Left
        </button>
        <button className={`${ToolbarButtonClassName} px-2`} onClick={() => onAction("center")}>
          Center
        </button>
        <button className={`${ToolbarButtonClassName} px-2`} onClick={() => onAction("right")}>
          Right
        </button>
        <button className={`${ToolbarButtonClassName} px-2`} onClick={() => onAction("top")}>
          Top
        </button>
        <button className={`${ToolbarButtonClassName} px-2`} onClick={() => onAction("middle")}>
          Middle
        </button>
        <button className={`${ToolbarButtonClassName} px-2`} onClick={() => onAction("bottom")}>
          Bottom
        </button>
      </div>
      <p className="mb-2 mt-3 text-xs font-semibold uppercase text-slate-500">Distribute</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          className={`${ToolbarButtonClassName} px-2`}
          onClick={() => onAction("distribute-horizontal")}
        >
          Horizontal
        </button>
        <button
          className={`${ToolbarButtonClassName} px-2`}
          onClick={() => onAction("distribute-vertical")}
        >
          Vertical
        </button>
      </div>
    </div>
  );
}

function ElementActionPanel({
  isLocked,
  onDelete,
  onDuplicate,
  onLayer,
  onToggleLock,
}: {
  isLocked: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onLayer: (action: "backward" | "forward" | "back" | "front") => void;
  onToggleLock: () => void;
}) {
  return (
    <div className="mb-4 space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="grid grid-cols-3 gap-2">
        <button className={`${ToolbarButtonClassName} px-2`} onClick={onDuplicate} type="button">
          <Copy className="h-4 w-4" />
          Copy
        </button>
        <button className={`${ToolbarButtonClassName} px-2`} onClick={onToggleLock} type="button">
          {isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {isLocked ? "Unlock" : "Lock"}
        </button>
        <button
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-2 text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50"
          onClick={onDelete}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
          <Layers className="h-3.5 w-3.5" />
          Layer
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`${ToolbarButtonClassName} px-2`}
            onClick={() => onLayer("front")}
            type="button"
          >
            Front
          </button>
          <button
            className={`${ToolbarButtonClassName} px-2`}
            onClick={() => onLayer("back")}
            type="button"
          >
            Back
          </button>
          <button
            className={`${ToolbarButtonClassName} px-2`}
            onClick={() => onLayer("forward")}
            type="button"
          >
            Forward
          </button>
          <button
            className={`${ToolbarButtonClassName} px-2`}
            onClick={() => onLayer("backward")}
            type="button"
          >
            Backward
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldNumberControl({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        className={InspectorNumberInputClassName}
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}

function TextControl({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input
        className={InspectorNumberInputClassName}
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
      />
    </label>
  );
}

function AlignButton({
  align,
  currentAlign,
  onClick,
}: {
  align: CustomizeReportAlign;
  currentAlign: CustomizeReportAlign;
  onClick: () => void;
}) {
  const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;

  return (
    <button
      className={`flex h-9 items-center justify-center border-r border-slate-200 last:border-r-0 ${
        align === currentAlign
          ? "bg-orange-500 text-white"
          : "bg-white text-slate-600 hover:bg-slate-50"
      }`}
      onClick={onClick}
      title={`Align ${align}`}
      type="button"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
