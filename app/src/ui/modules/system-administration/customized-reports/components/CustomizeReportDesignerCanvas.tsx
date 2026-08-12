import type { MouseEvent, PointerEvent, RefObject } from "react";
import {
  DefaultFieldColor,
  DefaultFontFamily,
} from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import { CustomizeReportSampleData } from "@/app/src/data/modules/system-administration/customized-reports/CustomizeReportData";
import type {
  AlignmentGuide,
  SelectedElementKey,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportDesignerTypes";
import type {
  CustomizeReportField,
  CustomizeReportLine,
  CustomizeReportMarginSetup,
  CustomizeReportPageSetup,
  CustomizeReportTableSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";
import {
  formatCurrency,
  getFieldPreviewValue,
  getSelectedElementKey,
} from "@/app/src/ui/modules/system-administration/customized-reports/utils/CustomizeReportDesignerUtils";

type ResizeHandle = "nw" | "ne" | "sw" | "se";

type CustomizeReportDesignerCanvasProps = {
  alignmentGuides: AlignmentGuide[];
  canvasScrollRef: RefObject<HTMLDivElement | null>;
  fields: CustomizeReportField[];
  gridSize: number;
  isCanvasPanning: boolean;
  lines: CustomizeReportLine[];
  marginSetup: CustomizeReportMarginSetup;
  pageSetup: CustomizeReportPageSetup;
  reportData: Record<string, unknown>;
  selectedElementSet: Set<SelectedElementKey>;
  selectedElementType: "field" | "line" | "table";
  selectedFieldId: string;
  snapToGrid: boolean;
  tableSetup: CustomizeReportTableSetup;
  zoom: number;
  onCanvasPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onCanvasPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onCanvasPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onElementSelect: (
    event: MouseEvent<HTMLElement>,
    type: "field" | "line" | "table",
    id: string,
  ) => void;
  onFieldPointerDown: (
    event: PointerEvent<HTMLDivElement>,
    field: CustomizeReportField,
  ) => void;
  onLinePointerDown: (
    event: PointerEvent<HTMLButtonElement>,
    line: CustomizeReportLine,
  ) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement | HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement | HTMLDivElement>) => void;
  onResizePointerDown: (
    event: PointerEvent<HTMLDivElement>,
    field: CustomizeReportField,
    resizeHandle: ResizeHandle,
  ) => void;
  onTablePointerDown: (event: PointerEvent<HTMLDivElement>) => void;
};

export function CustomizeReportDesignerCanvas({
  alignmentGuides,
  canvasScrollRef,
  fields,
  gridSize,
  isCanvasPanning,
  lines,
  marginSetup,
  onCanvasPointerDown,
  onCanvasPointerMove,
  onCanvasPointerUp,
  onElementSelect,
  onFieldPointerDown,
  onLinePointerDown,
  onPointerMove,
  onPointerUp,
  onResizePointerDown,
  onTablePointerDown,
  pageSetup,
  reportData,
  selectedElementSet,
  selectedElementType,
  selectedFieldId,
  snapToGrid,
  tableSetup,
  zoom,
}: CustomizeReportDesignerCanvasProps) {
  return (
    <div
      className={`h-[calc(100vh-15rem)] min-h-[32rem] overflow-auto overscroll-contain rounded-md border border-slate-200 bg-slate-200 p-4 shadow-sm ${
        isCanvasPanning ? "cursor-grabbing" : "cursor-grab"
      }`}
      onPointerCancel={onCanvasPointerUp}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
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

          <ReportItemsPreview
            onElementSelect={onElementSelect}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onTablePointerDown={onTablePointerDown}
            selectedElementSet={selectedElementSet}
            tableSetup={tableSetup}
          />
          <AlignmentGuides guides={alignmentGuides} />

          {lines
            .filter((line) => line.visible)
            .map((line) => (
              <ReportLineElement
                key={line.id}
                line={line}
                onElementSelect={onElementSelect}
                onLinePointerDown={onLinePointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                selectedElementSet={selectedElementSet}
              />
            ))}

          {fields
            .filter((field) => field.visible)
            .map((field) => (
              <ReportFieldElement
                key={field.id}
                field={field}
                onElementSelect={onElementSelect}
                onFieldPointerDown={onFieldPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onResizePointerDown={onResizePointerDown}
                reportData={reportData}
                selectedElementSet={selectedElementSet}
                selectedElementType={selectedElementType}
                selectedFieldId={selectedFieldId}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function ReportItemsPreview({
  onElementSelect,
  onPointerMove,
  onPointerUp,
  onTablePointerDown,
  selectedElementSet,
  tableSetup,
}: {
  onElementSelect: (
    event: MouseEvent<HTMLElement>,
    type: "field" | "line" | "table",
    id: string,
  ) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement | HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement | HTMLDivElement>) => void;
  onTablePointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  selectedElementSet: Set<SelectedElementKey>;
  tableSetup: CustomizeReportTableSetup;
}) {
  const visibleColumns = tableSetup.columns.filter((column) => column.visible);
  const isSelected = selectedElementSet.has(getSelectedElementKey("table", "items-table"));
  const previewRows = Array.from({ length: tableSetup.previewRows }, (_, index) => CustomizeReportSampleData.items[index] ?? null);

  return (
    <div
      data-report-element="true"
      className={`absolute overflow-hidden rounded-sm transition ${
        tableSetup.showBorders ? "border border-slate-300" : "border border-transparent"
      } ${
        isSelected
          ? "bg-orange-50/60 ring-2 ring-orange-300"
          : "hover:bg-sky-50/50 hover:ring-2 hover:ring-sky-200"
      }`}
      onClick={(event) => onElementSelect(event, "table", "items-table")}
      onPointerCancel={onPointerUp}
      onPointerDown={onTablePointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="button"
      style={{
        left: tableSetup.x,
        top: tableSetup.y,
        width: tableSetup.width,
        zIndex: 1,
      }}
      tabIndex={0}
      title="Items Table"
    >
      <table className="w-full border-collapse" style={{ fontSize: tableSetup.fontSize }}>
        <thead className="bg-slate-50">
          <tr>
            {visibleColumns.map((column) => (
              <th
                key={column.key}
                className={tableSetup.showBorders ? "border border-slate-300 px-2" : "px-2"}
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
          {previewRows.map((item, rowIndex) => (
            <tr key={item?.itemCode ?? `preview-row-${rowIndex}`}>
              {visibleColumns.map((column) => (
                <td
                  key={column.key}
                  className={tableSetup.showBorders ? "border border-slate-200 px-2" : "px-2"}
                  style={{
                    width: column.width,
                    height: tableSetup.rowHeight,
                    textAlign: column.align,
                  }}
                >
                  {getTableCellPreviewValue(item, column.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getTableCellPreviewValue(
  item: (typeof CustomizeReportSampleData.items)[number] | null,
  columnKey: string,
) {
  if (!item) {
    return "";
  }

  const value = item[columnKey as keyof typeof item];

  if ((columnKey === "unitCost" || columnKey === "amount") && typeof value === "number") {
    return formatCurrency(value);
  }

  return value ?? "";
}

function AlignmentGuides({ guides }: { guides: AlignmentGuide[] }) {
  return (
    <>
      {guides.map((guide) => (
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
    </>
  );
}

function ReportLineElement({
  line,
  onElementSelect,
  onLinePointerDown,
  onPointerMove,
  onPointerUp,
  selectedElementSet,
}: {
  line: CustomizeReportLine;
  onElementSelect: (
    event: MouseEvent<HTMLElement>,
    type: "field" | "line",
    id: string,
  ) => void;
  onLinePointerDown: (
    event: PointerEvent<HTMLButtonElement>,
    line: CustomizeReportLine,
  ) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement | HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement | HTMLDivElement>) => void;
  selectedElementSet: Set<SelectedElementKey>;
}) {
  const width = line.orientation === "horizontal" ? line.length : Math.max(line.thickness, 8);
  const height = line.orientation === "horizontal" ? Math.max(line.thickness, 8) : line.length;
  const lineInset = Math.max(
    Math.floor(((line.orientation === "horizontal" ? height : width) - line.thickness) / 2),
    0,
  );

  return (
    <button
      data-report-element="true"
      className={`absolute rounded-sm transition ${
        selectedElementSet.has(getSelectedElementKey("line", line.id))
          ? "ring-2 ring-orange-300"
          : "hover:ring-2 hover:ring-sky-200"
      } ${line.locked ? "cursor-not-allowed opacity-70" : "cursor-move"}`}
      onClick={(event) => onElementSelect(event, "line", line.id)}
      onPointerDown={(event) => onLinePointerDown(event, line)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        left: line.x,
        top: line.y,
        width,
        height,
        zIndex: line.zIndex ?? 1,
        background:
          line.orientation === "horizontal"
            ? `linear-gradient(to bottom, transparent ${lineInset}px, ${line.color} ${lineInset}px, ${line.color} ${lineInset + line.thickness}px, transparent ${lineInset + line.thickness}px)`
            : `linear-gradient(to right, transparent ${lineInset}px, ${line.color} ${lineInset}px, ${line.color} ${lineInset + line.thickness}px, transparent ${lineInset + line.thickness}px)`,
      }}
      title={line.label}
      type="button"
    />
  );
}

function ReportFieldElement({
  field,
  onElementSelect,
  onFieldPointerDown,
  onPointerMove,
  onPointerUp,
  onResizePointerDown,
  reportData,
  selectedElementSet,
  selectedElementType,
  selectedFieldId,
}: {
  field: CustomizeReportField;
  onElementSelect: (
    event: MouseEvent<HTMLElement>,
    type: "field" | "line",
    id: string,
  ) => void;
  onFieldPointerDown: (
    event: PointerEvent<HTMLDivElement>,
    field: CustomizeReportField,
  ) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement | HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement | HTMLDivElement>) => void;
  onResizePointerDown: (
    event: PointerEvent<HTMLDivElement>,
    field: CustomizeReportField,
    resizeHandle: ResizeHandle,
  ) => void;
  reportData: Record<string, unknown>;
  selectedElementSet: Set<SelectedElementKey>;
  selectedElementType: "field" | "line" | "table";
  selectedFieldId: string;
}) {
  return (
    <div
      data-report-element="true"
      className={`absolute overflow-visible rounded-sm border text-slate-900 transition ${
        selectedElementSet.has(getSelectedElementKey("field", field.id))
          ? "border-orange-400 bg-orange-50/80 ring-2 ring-orange-200"
          : "border-sky-200 bg-sky-50/70 hover:border-sky-400"
      } ${field.locked ? "cursor-not-allowed opacity-80" : "cursor-move"}`}
      onClick={(event) => onElementSelect(event, "field", field.id)}
      onPointerDown={(event) => onFieldPointerDown(event, field)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
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
            onPointerCancel={onPointerUp}
            onPointerDown={(event) => onResizePointerDown(event, field, resizeHandle)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            title="Resize"
          />
        ))}
    </div>
  );
}
