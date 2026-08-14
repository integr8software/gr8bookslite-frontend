import { Plus, Type, Upload, X } from "lucide-react";
import type { ChangeEvent } from "react";
import {
  InspectorNumberInputClassName,
  ToolbarButtonClassName,
} from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import { clamp } from "@/app/src/ui/modules/system-administration/customized-reports/utils/CustomizeReportDesignerUtils";

type CustomizeReportToolsDialogProps = {
  gridSize: number;
  isOpen: boolean;
  snapToGrid: boolean;
  onAddLine: () => void;
  onAddStaticText: () => void;
  onClose: () => void;
  onGridSizeChange: (gridSize: number) => void;
  onLogoUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onSnapToGridChange: (snapToGrid: boolean) => void;
};

export function CustomizeReportToolsDialog({
  gridSize,
  isOpen,
  onAddLine,
  onAddStaticText,
  onClose,
  onGridSizeChange,
  onLogoUpload,
  onSnapToGridChange,
  snapToGrid,
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
