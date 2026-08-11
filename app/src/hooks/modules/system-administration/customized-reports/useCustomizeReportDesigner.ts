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
  DefaultCustomizeReportModuleId,
  DefaultGridSize,
  DefaultMarginSetup,
  DefaultTableSetup,
  MaxLayoutHistoryLength,
  MaxZoom,
  MinFieldHeight,
  MinFieldWidth,
  MinZoom,
  ZoomStep,
} from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import {
  CustomizeReportDefaultPageSetup,
  CustomizeReportFields,
  CustomizeReportLines,
  CustomizeReportModuleOptions,
  CustomizeReportPresetTemplates,
  CustomizeReportSampleData,
  CustomizeReportStorageKey,
} from "@/app/src/data/modules/system-administration/customized-reports/CustomizeReportData";
import { useCustomizeReportPdfPreview } from "@/app/src/hooks/modules/system-administration/customized-reports/useCustomizeReportPdfPreview";
import type {
  AlignmentGuide,
  AlignDistributionAction,
  CanvasPanState,
  DragState,
  LayoutHistory,
  SelectedElementKey,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportDesignerTypes";
import type {
  CustomizeReportField,
  CustomizeReportLayout,
  CustomizeReportLine,
  CustomizeReportMarginSetup,
  CustomizeReportPageSetup,
  CustomizeReportPaperFormat,
  CustomizeReportTableColumn,
  CustomizeReportTableColumnKey,
  CustomizeReportTableSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";
import {
  buildReportTemplate,
  clamp,
  cloneLayout,
  getFieldBounds,
  getLineBounds,
  getMarginSetupWithDefaults,
  getPageSetup,
  getReportData,
  getReportStorageKey,
  getSelectedElementKey,
  getSnappedPosition,
  getTableBounds,
  getTableSetupWithDefaults,
  getVisibleElementBounds,
  isEditableElement,
  isSavedLayout,
  parseSelectedElementKey,
} from "@/app/src/ui/modules/system-administration/customized-reports/utils/CustomizeReportDesignerUtils";
import { validateCustomizeReportLayout } from "@/app/src/ui/modules/system-administration/customized-reports/validation/CustomizeReportValidation";

const CustomizeReportElementTypes = {
  Field: "field",
  Line: "line",
  Table: "table",
} as const;

const CustomizeReportTableElementId = "items-table";

const CustomizeReportLineOrientations = {
  Horizontal: "horizontal",
} as const;

type CustomizeReportElementType = (typeof CustomizeReportElementTypes)[keyof typeof CustomizeReportElementTypes];

export function useCustomizeReportDesigner() {
  const [fields, setFields] = useState<CustomizeReportField[]>(CustomizeReportFields);
  const [lines, setLines] = useState<CustomizeReportLine[]>(CustomizeReportLines);
  const [pageSetup, setPageSetup] = useState<CustomizeReportPageSetup>(CustomizeReportDefaultPageSetup);
  const [tableSetup, setTableSetup] = useState<CustomizeReportTableSetup>(DefaultTableSetup);
  const [marginSetup, setMarginSetup] = useState<CustomizeReportMarginSetup>(DefaultMarginSetup);
  const [selectedFieldId, setSelectedFieldId] = useState(CustomizeReportFields[0].id);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<CustomizeReportElementType>(CustomizeReportElementTypes.Field);
  const [selectedElementKeys, setSelectedElementKeys] = useState<SelectedElementKey[]>([
    getSelectedElementKey(CustomizeReportElementTypes.Field, CustomizeReportFields[0].id),
  ]);
  const [selectedReportId, setSelectedReportId] = useState(DefaultCustomizeReportModuleId);
  const [selectedPresetTemplateId, setSelectedPresetTemplateId] = useState(CustomizeReportPresetTemplates[0].id);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(DefaultGridSize);
  const [zoom, setZoom] = useState(100);
  const [isCanvasPanning, setIsCanvasPanning] = useState(false);
  const [isElementsPanelOpen, setIsElementsPanelOpen] = useState(true);
  const [isToolsDialogOpen, setIsToolsDialogOpen] = useState(false);
  const [deleteTargetType, setDeleteTargetType] = useState<CustomizeReportElementType | null>(null);
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

    if (selectedElementType === CustomizeReportElementTypes.Line && selectedLineId) {
      const restoredLine = nextLayout.lines.find((line) => line.id === selectedLineId);

      if (restoredLine) {
        setSelectedLineId(restoredLine.id);
        setSelectedElementType(CustomizeReportElementTypes.Line);
        setSelectedElementKeys([getSelectedElementKey(CustomizeReportElementTypes.Line, restoredLine.id)]);
        return;
      }
    }

    const restoredField = nextLayout.fields.find((field) => field.id === selectedFieldId) || nextLayout.fields[0];

    setSelectedFieldId(restoredField?.id || CustomizeReportFields[0].id);
    setSelectedLineId(null);
    setSelectedElementType(CustomizeReportElementTypes.Field);
    setSelectedElementKeys(restoredField ? [getSelectedElementKey(CustomizeReportElementTypes.Field, restoredField.id)] : []);
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
      selectedReportId === DefaultCustomizeReportModuleId ? window.localStorage.getItem(CustomizeReportStorageKey) : null;
    const storedLayout = window.localStorage.getItem(reportStorageKey) || legacyStoredLayout;

    if (!storedLayout) {
      setFields(CustomizeReportFields);
      setLines(CustomizeReportLines);
      setPageSetup(CustomizeReportDefaultPageSetup);
      setTableSetup(DefaultTableSetup);
      setMarginSetup(DefaultMarginSetup);
      setSelectedFieldId(CustomizeReportFields[0].id);
      setSelectedLineId(null);
      setSelectedElementType(CustomizeReportElementTypes.Field);
      setSelectedElementKeys([getSelectedElementKey(CustomizeReportElementTypes.Field, CustomizeReportFields[0].id)]);
      setLayoutHistory({ past: [], future: [] });
      return;
    }

    try {
      const parsedLayout = JSON.parse(storedLayout) as CustomizeReportField[] | CustomizeReportLayout;
      const nextFields = isSavedLayout(parsedLayout) ? parsedLayout.fields : parsedLayout;
      const nextLines = isSavedLayout(parsedLayout) ? parsedLayout.lines : CustomizeReportLines;
      const nextPageSetup = isSavedLayout(parsedLayout)
        ? parsedLayout.pageSetup || CustomizeReportDefaultPageSetup
        : CustomizeReportDefaultPageSetup;
      const nextTableSetup = isSavedLayout(parsedLayout) ? getTableSetupWithDefaults(parsedLayout.tableSetup) : DefaultTableSetup;
      const nextMarginSetup = isSavedLayout(parsedLayout) ? getMarginSetupWithDefaults(parsedLayout.marginSetup) : DefaultMarginSetup;

      setFields(nextFields);
      setLines(nextLines);
      setPageSetup(nextPageSetup);
      setTableSetup(nextTableSetup);
      setMarginSetup(nextMarginSetup);
      setSelectedFieldId(nextFields[0]?.id || CustomizeReportFields[0].id);
      setSelectedLineId(null);
      setSelectedElementType(CustomizeReportElementTypes.Field);
      setSelectedElementKeys(nextFields[0] ? [getSelectedElementKey(CustomizeReportElementTypes.Field, nextFields[0].id)] : []);
      setLayoutHistory({ past: [], future: [] });
    } catch {
      window.localStorage.removeItem(reportStorageKey);
    }
  }, [selectedReportId]);

  const selectedField = useMemo(() => fields.find((field) => field.id === selectedFieldId) || fields[0], [fields, selectedFieldId]);

  const selectedLine = useMemo(() => lines.find((line) => line.id === selectedLineId) || null, [lines, selectedLineId]);

  const selectedReport = useMemo(
    () => CustomizeReportModuleOptions.find((report) => report.id === selectedReportId) || null,
    [selectedReportId],
  );

  const selectedElementSet = useMemo(() => new Set<SelectedElementKey>(selectedElementKeys), [selectedElementKeys]);

  const selectedElements = useMemo(
    () =>
      selectedElementKeys
        .map((key) => {
          const { type, id } = parseSelectedElementKey(key);

          if (type === CustomizeReportElementTypes.Field) {
            const field = fields.find((currentField) => currentField.id === id);
            return field ? { key, type, id, bounds: getFieldBounds(field) } : null;
          }

          if (type === CustomizeReportElementTypes.Table) {
            return { key, type, id, bounds: getTableBounds(tableSetup) };
          }

          const line = lines.find((currentLine) => currentLine.id === id);

          return line ? { key, type, id, bounds: getLineBounds(line) } : null;
        })
        .filter((element): element is NonNullable<typeof element> => Boolean(element)),
    [fields, lines, selectedElementKeys, tableSetup],
  );

  const hasMultiSelection = selectedElements.length > 1;

  const reportData = useMemo(
    () => (selectedReport ? getReportData(CustomizeReportSampleData, selectedReport) : CustomizeReportSampleData),
    [selectedReport],
  );

  const templatePreview = useMemo(() => buildReportTemplate(fields, lines, pageSetup, tableSetup), [fields, lines, pageSetup, tableSetup]);
  const { handlePreviewPdf, isRendering } = useCustomizeReportPdfPreview({
    pageSetup,
    reportData,
    selectedReport,
    templatePreview,
  });

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

        if (selectedElementType === CustomizeReportElementTypes.Table) {
          pushUndoSnapshot();
          setTableSetup((currentSetup) => ({
            ...currentSetup,
            x: clamp(currentSetup.x + deltaX, 0, pageSetup.width - currentSetup.width),
            y: clamp(currentSetup.y + deltaY, 0, pageSetup.height - currentSetup.rowHeight),
          }));
          return;
        }

        if (selectedElementType === CustomizeReportElementTypes.Line && selectedLine) {
          if (selectedLine.locked) {
            return;
          }

          pushUndoSnapshot();
          setLines((currentLines) =>
            currentLines.map((line) => {
              if (line.id !== selectedLine.id) {
                return line;
              }

              const width = line.orientation === CustomizeReportLineOrientations.Horizontal ? line.length : line.thickness;
              const height = line.orientation === CustomizeReportLineOrientations.Horizontal ? line.thickness : line.length;

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
      setZoom((currentZoom) => clamp(currentZoom + (event.deltaY < 0 ? ZoomStep : -ZoomStep), MinZoom, MaxZoom));
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
    setFields((currentFields) => currentFields.map((field) => (field.id === selectedField.id ? updater(field) : field)));
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
    setLines((currentLines) => currentLines.map((line) => (line.id === selectedLine.id ? updater(line) : line)));
  }

  function selectElement(type: CustomizeReportElementType, id: string, additive = false) {
    const key = getSelectedElementKey(type, id);
    const allowAdditiveSelection = additive && type !== CustomizeReportElementTypes.Table;

    setSelectedElementType(type);
    if (type === CustomizeReportElementTypes.Field) {
      setSelectedFieldId(id);
      setSelectedLineId(null);
    } else if (type === CustomizeReportElementTypes.Line) {
      setSelectedLineId(id);
    } else {
      setSelectedLineId(null);
    }

    setSelectedElementKeys((currentKeys) => {
      if (!allowAdditiveSelection) {
        return [key];
      }

      if (currentKeys.includes(key)) {
        const nextKeys = currentKeys.filter((currentKey) => currentKey !== key);
        return nextKeys.length > 0 ? nextKeys : [key];
      }

      return [...currentKeys, key];
    });
  }

  function handleElementSelect(event: ReactMouseEvent<HTMLElement>, type: CustomizeReportElementType, id: string) {
    selectElement(type, id, event.shiftKey);
  }

  function getSelectedGroupOrigins(activeKey: SelectedElementKey) {
    const keys = selectedElementKeys.includes(activeKey) ? selectedElementKeys : [activeKey];

    return keys
      .map((key) => {
        const { type, id } = parseSelectedElementKey(key);

        if (type === CustomizeReportElementTypes.Field) {
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

        if (type === CustomizeReportElementTypes.Table) {
          const bounds = getTableBounds(tableSetup);

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

  function handleTablePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    pushUndoSnapshot();
    selectElement(CustomizeReportElementTypes.Table, CustomizeReportTableElementId, event.shiftKey);
    dragStateRef.current = {
      elementId: CustomizeReportTableElementId,
      elementType: CustomizeReportElementTypes.Table,
      action: "move",
      startX: event.clientX,
      startY: event.clientY,
      originX: tableSetup.x,
      originY: tableSetup.y,
      groupOrigins: getSelectedGroupOrigins(getSelectedElementKey(CustomizeReportElementTypes.Table, CustomizeReportTableElementId)),
    };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement | HTMLDivElement>, field: CustomizeReportField) {
    if (field.locked) {
      selectElement(CustomizeReportElementTypes.Field, field.id, event.shiftKey);
      return;
    }

    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    pushUndoSnapshot();
    selectElement(CustomizeReportElementTypes.Field, field.id, event.shiftKey);
    const activeKey = getSelectedElementKey(CustomizeReportElementTypes.Field, field.id);
    dragStateRef.current = {
      elementId: field.id,
      elementType: CustomizeReportElementTypes.Field,
      action: "move",
      startX: event.clientX,
      startY: event.clientY,
      originX: field.x,
      originY: field.y,
      groupOrigins: getSelectedGroupOrigins(activeKey),
    };
  }

  function handleLinePointerDown(event: ReactPointerEvent<HTMLButtonElement>, line: CustomizeReportLine) {
    if (line.locked) {
      selectElement(CustomizeReportElementTypes.Line, line.id, event.shiftKey);
      return;
    }

    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    pushUndoSnapshot();
    selectElement(CustomizeReportElementTypes.Line, line.id, event.shiftKey);
    const activeKey = getSelectedElementKey(CustomizeReportElementTypes.Line, line.id);
    dragStateRef.current = {
      elementId: line.id,
      elementType: CustomizeReportElementTypes.Line,
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
    selectElement(CustomizeReportElementTypes.Field, field.id, false);
    dragStateRef.current = {
      elementId: field.id,
      elementType: CustomizeReportElementTypes.Field,
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

    if (dragState.action === "move" && dragState.groupOrigins && dragState.groupOrigins.length > 1) {
      const pageMinX = Math.min(...dragState.groupOrigins.map((origin) => origin.x));
      const pageMaxX = Math.max(...dragState.groupOrigins.map((origin) => origin.x + origin.width));
      const pageMinY = Math.min(...dragState.groupOrigins.map((origin) => origin.y));
      const pageMaxY = Math.max(...dragState.groupOrigins.map((origin) => origin.y + origin.height));
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
          const position = nextPositions.get(getSelectedElementKey(CustomizeReportElementTypes.Field, field.id));

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
          const position = nextPositions.get(getSelectedElementKey(CustomizeReportElementTypes.Line, line.id));

          return position
            ? {
                ...line,
                x: position.x,
                y: position.y,
              }
            : line;
        }),
      );
      const tablePosition = nextPositions.get(getSelectedElementKey(CustomizeReportElementTypes.Table, CustomizeReportTableElementId));

      if (tablePosition) {
        setTableSetup((currentSetup) => ({
          ...currentSetup,
          x: tablePosition.x,
          y: tablePosition.y,
        }));
      }
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

    if (dragState.elementType === CustomizeReportElementTypes.Line) {
      const line = lines.find((currentLine) => currentLine.id === dragState.elementId);

      if (!line) {
        return;
      }

      const width = line.orientation === CustomizeReportLineOrientations.Horizontal ? line.length : line.thickness;
      const height = line.orientation === CustomizeReportLineOrientations.Horizontal ? line.thickness : line.length;
      const rawX = clamp(snapValue(dragState.originX + deltaX), 0, pageSetup.width - width);
      const rawY = clamp(snapValue(dragState.originY + deltaY), 0, pageSetup.height - height);
      const snappedPosition = getSnappedPosition(
        {
          id: line.id,
          label: line.label,
          type: CustomizeReportElementTypes.Line,
          x: rawX,
          y: rawY,
          width,
          height,
        },
        getVisibleElementBounds(fields, lines, tableSetup, line.id),
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

    if (dragState.elementType === CustomizeReportElementTypes.Table) {
      const tableBounds = getTableBounds(tableSetup);
      const rawX = clamp(snapValue(dragState.originX + deltaX), 0, pageSetup.width - tableSetup.width);
      const rawY = clamp(snapValue(dragState.originY + deltaY), 0, pageSetup.height - tableBounds.height);
      const snappedPosition = getSnappedPosition(
        {
          ...tableBounds,
          x: rawX,
          y: rawY,
        },
        getVisibleElementBounds(fields, lines, tableSetup, CustomizeReportTableElementId),
        pageSetup,
      );

      setAlignmentGuides(snappedPosition.guides);
      setTableSetup((currentSetup) => ({
        ...currentSetup,
        x: snappedPosition.x,
        y: snappedPosition.y,
      }));
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
      getVisibleElementBounds(fields, lines, tableSetup, field.id),
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
    if (!selectedReport) {
      toast.error("Select a report module before saving.");
      return;
    }

    const validationMessage = validateCustomizeReportLayout({ fields, lines, pageSetup });

    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

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
    if (!selectedReport) {
      toast.error("Select a report module before resetting.");
      return;
    }

    pushUndoSnapshot();
    window.localStorage.removeItem(getReportStorageKey(selectedReport.id));
    setFields(CustomizeReportFields);
    setLines(CustomizeReportLines);
    setPageSetup(CustomizeReportDefaultPageSetup);
    setTableSetup(DefaultTableSetup);
    setMarginSetup(DefaultMarginSetup);
    selectElement(CustomizeReportElementTypes.Field, CustomizeReportFields[0].id);
    toast.success(`${selectedReport.label} layout reset.`);
  }

  function handleApplyPresetTemplate() {
    const selectedTemplate = CustomizeReportPresetTemplates.find((template) => template.id === selectedPresetTemplateId);

    if (!selectedTemplate) {
      toast.error("Select a preset template before applying.");
      return;
    }

    pushUndoSnapshot();
    restoreLayoutSnapshot(selectedTemplate.layout);
    toast.success(`${selectedTemplate.name} template applied.`);
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
      orientation: CustomizeReportLineOrientations.Horizontal,
      color: "#334155",
      visible: true,
    };

    setLines((currentLines) => [...currentLines, nextLine]);
    selectElement(CustomizeReportElementTypes.Line, nextLine.id);
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
    selectElement(CustomizeReportElementTypes.Field, nextField.id);
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
      selectElement(CustomizeReportElementTypes.Field, nextField.id);
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
    selectElement(CustomizeReportElementTypes.Field, fields[0]?.id || CustomizeReportFields[0].id);
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
    selectElement(CustomizeReportElementTypes.Field, remainingFields[0]?.id || CustomizeReportFields[0].id);
    toast.success("Element removed.");
  }

  function handleDuplicateSelectedElement() {
    pushUndoSnapshot();

    if (selectedElementType === CustomizeReportElementTypes.Line && selectedLine) {
      const lineWidth =
        selectedLine.orientation === CustomizeReportLineOrientations.Horizontal ? selectedLine.length : selectedLine.thickness;
      const lineHeight =
        selectedLine.orientation === CustomizeReportLineOrientations.Horizontal ? selectedLine.thickness : selectedLine.length;
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
      selectElement(CustomizeReportElementTypes.Line, nextLine.id);
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
    selectElement(CustomizeReportElementTypes.Field, nextField.id);
    toast.success("Element duplicated.");
  }

  function handleToggleSelectedLock() {
    pushUndoSnapshot();

    if (selectedElementType === CustomizeReportElementTypes.Line && selectedLine) {
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
    const allZIndexes = [...fields.map((field) => field.zIndex ?? 1), ...lines.map((line) => line.zIndex ?? 1)];
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

    if (selectedElementType === CustomizeReportElementTypes.Line && selectedLine) {
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
      if (element.type === CustomizeReportElementTypes.Field) {
        return !fields.find((field) => field.id === element.id)?.locked;
      }

      return !lines.find((line) => line.id === element.id)?.locked;
    });

    if (unlockedElements.length < 2) {
      toast.error("Unlock at least two selected elements first.");
      return;
    }

    const minLeft = Math.min(...unlockedElements.map((element) => element.bounds.x));
    const maxRight = Math.max(...unlockedElements.map((element) => element.bounds.x + element.bounds.width));
    const minTop = Math.min(...unlockedElements.map((element) => element.bounds.y));
    const maxBottom = Math.max(...unlockedElements.map((element) => element.bounds.y + element.bounds.height));
    const centerX = minLeft + (maxRight - minLeft) / 2;
    const centerY = minTop + (maxBottom - minTop) / 2;
    const horizontalOrder = [...unlockedElements].sort((a, b) => a.bounds.x - b.bounds.x);
    const verticalOrder = [...unlockedElements].sort((a, b) => a.bounds.y - b.bounds.y);
    const horizontalGap =
      horizontalOrder.length > 2
        ? (maxRight - minLeft - horizontalOrder.reduce((sum, item) => sum + item.bounds.width, 0)) / (horizontalOrder.length - 1)
        : 0;
    const verticalGap =
      verticalOrder.length > 2
        ? (maxBottom - minTop - verticalOrder.reduce((sum, item) => sum + item.bounds.height, 0)) / (verticalOrder.length - 1)
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
        const position = nextPositions.get(getSelectedElementKey(CustomizeReportElementTypes.Field, field.id));

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
        const position = nextPositions.get(getSelectedElementKey(CustomizeReportElementTypes.Line, line.id));
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
    selectElement(CustomizeReportElementTypes.Field, fieldId);
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
    selectElement(CustomizeReportElementTypes.Line, lineId);
  }

  function handlePageFormatChange(format: CustomizeReportPaperFormat) {
    pushUndoSnapshot();
    setPageSetup((currentSetup) => getPageSetup(format, currentSetup.orientation));
  }

  function handlePageOrientationChange(orientation: CustomizeReportPageSetup["orientation"]) {
    pushUndoSnapshot();
    setPageSetup((currentSetup) => getPageSetup(currentSetup.format, orientation));
  }

  function updateTableSetup(updater: (setup: CustomizeReportTableSetup) => CustomizeReportTableSetup) {
    pushUndoSnapshot();
    setTableSetup((currentSetup) => getTableSetupWithDefaults(updater(currentSetup)));
  }

  function updateTableColumn(
    columnKey: CustomizeReportTableColumnKey,
    updater: (column: CustomizeReportTableColumn) => CustomizeReportTableColumn,
  ) {
    updateTableSetup((currentSetup) => ({
      ...currentSetup,
      columns: currentSetup.columns.map((column) => (column.key === columnKey ? updater(column) : column)),
    }));
  }

  function handleAddTableColumn() {
    updateTableSetup((currentSetup) => {
      const nextColumnNumber = currentSetup.columns.length + 1;

      return {
        ...currentSetup,
        columns: [
          ...currentSetup.columns,
          {
            key: `customColumn${Date.now()}`,
            label: `Column ${nextColumnNumber}`,
            width: 96,
            visible: true,
            align: "left",
          },
        ],
      };
    });
    toast.success("Column added.");
  }

  function handleRemoveTableColumn(columnKey: CustomizeReportTableColumnKey) {
    if (tableSetup.columns.length <= 1) {
      toast.error("Keep at least one table column.");
      return;
    }

    updateTableSetup((currentSetup) => ({
      ...currentSetup,
      columns: currentSetup.columns.filter((column) => column.key !== columnKey),
    }));
    toast.success("Column removed.");
  }

  function updateMarginSetup(updater: (setup: CustomizeReportMarginSetup) => CustomizeReportMarginSetup) {
    pushUndoSnapshot();
    setMarginSetup((currentSetup) => updater(currentSetup));
  }

  function handleConfirmDeleteSelectedElement() {
    if (deleteTargetType === CustomizeReportElementTypes.Line) {
      handleDeleteSelectedLine();
    } else {
      handleDeleteSelectedField();
    }

    setDeleteTargetType(null);
  }

  return {
    alignmentGuides,
    canvasScrollRef,
    canRedo,
    canUndo,
    deleteTargetType,
    fields,
    gridSize,
    handleAddLine,
    handleAddStaticText,
    handleAddTableColumn,
    handleApplyPresetTemplate,
    handleAlignDistributeSelected,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
    handleConfirmDeleteSelectedElement,
    handleDuplicateSelectedElement,
    handleElementSelect,
    handleLayerSelectedElement,
    handleLinePointerDown,
    handleLogoUpload,
    handlePageFormatChange,
    handlePageOrientationChange,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePreviewPdf,
    handleRedoLayout,
    handleResetLayout,
    handleResizePointerDown,
    handleRemoveTableColumn,
    handleSaveLayout,
    handleTablePointerDown,
    handleToggleFieldVisibility,
    handleToggleLineVisibility,
    handleToggleSelectedLock,
    handleUndoLayout,
    hasMultiSelection,
    isCanvasPanning,
    isElementsPanelOpen,
    isRendering,
    isToolsDialogOpen,
    lines,
    marginSetup,
    pageSetup,
    reportData,
    selectedElementKeys,
    selectedElementSet,
    selectedElementType,
    selectedElements,
    selectedField,
    selectedFieldId,
    selectedLine,
    selectedPresetTemplateId,
    selectedReport,
    selectedReportId,
    setDeleteTargetType,
    setGridSize,
    setIsElementsPanelOpen,
    setIsToolsDialogOpen,
    setSelectedPresetTemplateId,
    setSelectedReportId,
    setSnapToGrid,
    setZoom,
    snapToGrid,
    tableSetup,
    templatePreview,
    updateMarginSetup,
    updateSelectedField,
    updateSelectedLine,
    updateTableColumn,
    updateTableSetup,
    zoom,
  };
}
