import { Plus, Type, Upload, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { FieldNumberControl } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportFormControls";
import {
  InspectorNumberInputClassName,
  ToolbarButtonClassName,
} from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import type {
  CustomizeReportAlign,
  CustomizeReportMarginSetup,
  CustomizeReportPageSetup,
  CustomizeReportTableColumn,
  CustomizeReportTableColumnKey,
  CustomizeReportTableSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";
import { clamp } from "@/app/src/ui/modules/system-administration/customized-reports/utils/CustomizeReportDesignerUtils";

type CustomizeReportToolsDialogProps = {
  gridSize: number;
  isOpen: boolean;
  marginSetup: CustomizeReportMarginSetup;
  pageSetup: CustomizeReportPageSetup;
  snapToGrid: boolean;
  tableSetup: CustomizeReportTableSetup;
  onAddLine: () => void;
  onAddStaticText: () => void;
  onClose: () => void;
  onGridSizeChange: (gridSize: number) => void;
  onLogoUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onMarginSetupChange: (
    updater: (setup: CustomizeReportMarginSetup) => CustomizeReportMarginSetup,
  ) => void;
  onSnapToGridChange: (snapToGrid: boolean) => void;
  onTableColumnChange: (
    columnKey: CustomizeReportTableColumnKey,
    updater: (column: CustomizeReportTableColumn) => CustomizeReportTableColumn,
  ) => void;
  onTableSetupChange: (
    updater: (setup: CustomizeReportTableSetup) => CustomizeReportTableSetup,
  ) => void;
};

export function CustomizeReportToolsDialog({
  gridSize,
  isOpen,
  marginSetup,
  onAddLine,
  onAddStaticText,
  onClose,
  onGridSizeChange,
  onLogoUpload,
  onMarginSetupChange,
  onSnapToGridChange,
  onTableColumnChange,
  onTableSetupChange,
  pageSetup,
  snapToGrid,
  tableSetup,
}: CustomizeReportToolsDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
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
            onClick={onClose}
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
                onChange={(event) => onSnapToGridChange(event.target.checked)}
                type="checkbox"
              />
            </div>
            <label className="mt-3 block space-y-1">
              <span className="text-xs font-semibold uppercase text-slate-500">Grid Size</span>
              <input
                className={InspectorNumberInputClassName}
                min={1}
                onChange={(event) => onGridSizeChange(clamp(Number(event.target.value), 1, 100))}
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
                  onMarginSetupChange((currentSetup) => ({
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
                    onMarginSetupChange((currentSetup) => ({
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
                  onTableSetupChange((currentSetup) => ({
                    ...currentSetup,
                    x: clamp(value, 0, pageSetup.width - currentSetup.width),
                  }))
                }
              />
              <FieldNumberControl
                label="Y"
                value={tableSetup.y}
                onChange={(value) =>
                  onTableSetupChange((currentSetup) => ({
                    ...currentSetup,
                    y: clamp(value, 0, pageSetup.height - currentSetup.rowHeight),
                  }))
                }
              />
              <FieldNumberControl
                label="Width"
                value={tableSetup.width}
                onChange={(value) =>
                  onTableSetupChange((currentSetup) => ({
                    ...currentSetup,
                    width: clamp(value, 160, pageSetup.width - currentSetup.x),
                  }))
                }
              />
              <FieldNumberControl
                label="Font"
                value={tableSetup.fontSize}
                onChange={(value) =>
                  onTableSetupChange((currentSetup) => ({
                    ...currentSetup,
                    fontSize: clamp(value, 8, 24),
                  }))
                }
              />
              <FieldNumberControl
                label="Row"
                value={tableSetup.rowHeight}
                onChange={(value) =>
                  onTableSetupChange((currentSetup) => ({
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
                  onTableSetupChange((currentSetup) => ({
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
                        onTableColumnChange(column.key, (currentColumn) => ({
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
                      onTableColumnChange(column.key, (currentColumn) => ({
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
                      onTableColumnChange(column.key, (currentColumn) => ({
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
                      onTableColumnChange(column.key, (currentColumn) => ({
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
            <button className={ToolbarButtonClassName} onClick={onAddLine} type="button">
              <Plus className="h-4 w-4" />
              Line
            </button>
            <button className={ToolbarButtonClassName} onClick={onAddStaticText} type="button">
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
            onChange={onLogoUpload}
            type="file"
          />
        </div>
      </div>
    </div>
  );
}
