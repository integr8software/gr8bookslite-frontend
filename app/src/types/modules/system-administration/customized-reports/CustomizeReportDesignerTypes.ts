import type { CustomizeReportLayout } from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";

export type DragState = {
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

export type CanvasPanState = {
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
};

export type ReportElementBounds = {
  id: string;
  label: string;
  type: "field" | "line";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AlignmentGuide = {
  id: string;
  orientation: "horizontal" | "vertical";
  position: number;
  start: number;
  end: number;
};

export type SnapPosition = {
  x: number;
  y: number;
  guides: AlignmentGuide[];
};

export type LayoutHistory = {
  past: CustomizeReportLayout[];
  future: CustomizeReportLayout[];
};

export type SelectedElementKey = `field:${string}` | `line:${string}`;

export type AlignDistributionAction =
  | "left"
  | "center"
  | "right"
  | "top"
  | "middle"
  | "bottom"
  | "distribute-horizontal"
  | "distribute-vertical";

