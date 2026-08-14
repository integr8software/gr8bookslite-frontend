import {
  FileText,
  FileCog,
  LayoutTemplate,
  Redo2,
  RefreshCcw,
  Save,
  SlidersHorizontal,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  CustomizeReportModuleCategories,
  MaxZoom,
  MinZoom,
  PrimaryButtonClassName,
  ReportToolbarSelectClassName,
  ToolbarButtonClassName,
  ZoomStep,
} from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import {
  CustomizeReportModuleOptions,
  CustomizeReportPresetTemplates,
} from "@/app/src/data/modules/system-administration/customized-reports/CustomizeReportData";
import type {
  CustomizeReportModuleOption,
  CustomizeReportPageSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { clamp } from "@/app/src/ui/modules/system-administration/customized-reports/utils/CustomizeReportDesignerUtils";

type CustomizeReportDesignerHeaderProps = {
  canRedo: boolean;
  canUndo: boolean;
  isRendering: boolean;
  pageSetup: CustomizeReportPageSetup;
  selectedPresetTemplateId: string;
  selectedReport: CustomizeReportModuleOption;
  selectedReportId: string;
  zoom: number;
  onOpenTools: () => void;
  onOpenPageSetup: () => void;
  onPresetTemplateApply: () => void;
  onPreviewPdf: () => void;
  onRedoLayout: () => void;
  onResetLayout: () => void;
  onSaveLayout: () => void;
  onSelectedPresetTemplateIdChange: (templateId: string) => void;
  onSelectedReportIdChange: (reportId: string) => void;
  onUndoLayout: () => void;
  onZoomChange: (zoom: number) => void;
};

export function CustomizeReportDesignerHeader({
  canRedo,
  canUndo,
  isRendering,
  onOpenTools,
  onOpenPageSetup,
  onPresetTemplateApply,
  onPreviewPdf,
  onRedoLayout,
  onResetLayout,
  onSaveLayout,
  onSelectedPresetTemplateIdChange,
  onSelectedReportIdChange,
  onUndoLayout,
  onZoomChange,
  pageSetup,
  selectedPresetTemplateId,
  selectedReport,
  selectedReportId,
  zoom,
}: CustomizeReportDesignerHeaderProps) {
  return (
    <section className="mb-4 rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(220px,1fr)_auto] lg:items-start">
        <ModuleHeader
          description="Drag fields, adjust alignment, save the layout, then preview the PDF."
          eyebrow="jsreport PDF Designer"
          title={`${selectedReport.label} Report`}
          titleAs="h1"
        />

        <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
          <button
            className={`${ToolbarButtonClassName} px-2.5`}
            disabled={!canUndo}
            onClick={onUndoLayout}
            title="Undo (Ctrl+Z)"
            type="button"
          >
            <Undo2 className="h-4 w-4" />
            <span className="sr-only">Undo</span>
          </button>
          <button
            className={`${ToolbarButtonClassName} px-2.5`}
            disabled={!canRedo}
            onClick={onRedoLayout}
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
              onClick={() => onZoomChange(clamp(zoom - ZoomStep, MinZoom, MaxZoom))}
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
              onClick={() => onZoomChange(clamp(zoom + ZoomStep, MinZoom, MaxZoom))}
              title="Zoom in"
              type="button"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
          <button className={ToolbarButtonClassName} onClick={onOpenTools} type="button">
            <SlidersHorizontal className="h-4 w-4" />
            Tools
          </button>
          <button className={ToolbarButtonClassName} onClick={onOpenPageSetup} type="button">
            <FileCog className="h-4 w-4" />
            Page Setup
          </button>
          <button className={ToolbarButtonClassName} onClick={onResetLayout} type="button">
            <RefreshCcw className="h-4 w-4" />
            Reset
          </button>
          <button className={ToolbarButtonClassName} onClick={onSaveLayout} type="button">
            <Save className="h-4 w-4" />
            Save Layout
          </button>
          <button
            className={PrimaryButtonClassName}
            disabled={isRendering}
            onClick={onPreviewPdf}
            type="button"
          >
            <FileText className="h-4 w-4" />
            {isRendering ? "Rendering..." : "Preview PDF"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:grid-cols-2 xl:grid-cols-[minmax(13rem,1.2fr)_minmax(13rem,1fr)_minmax(10rem,0.75fr)]">
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-semibold uppercase text-slate-500">Report Module</span>
          <select
            className={`${ReportToolbarSelectClassName} w-full`}
            onChange={(event) => onSelectedReportIdChange(event.target.value)}
            value={selectedReportId}
          >
            {CustomizeReportModuleCategories.map((category) => (
              <optgroup key={category} label={category}>
                {CustomizeReportModuleOptions.filter((report) => report.category === category).map(
                  (report) => (
                    <option key={report.id} value={report.id}>
                      {report.label} ({report.moduleCode})
                    </option>
                  ),
                )}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-semibold uppercase text-slate-500">Preset Template</span>
          <span className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
            <select
              className={`${ReportToolbarSelectClassName} w-full`}
              onChange={(event) => onSelectedPresetTemplateIdChange(event.target.value)}
              value={selectedPresetTemplateId}
            >
              {CustomizeReportPresetTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <button
              className={`${ToolbarButtonClassName} px-2.5`}
              onClick={onPresetTemplateApply}
              title={
                CustomizeReportPresetTemplates.find((template) => template.id === selectedPresetTemplateId)?.description ||
                "Apply preset template"
              }
              type="button"
            >
              <LayoutTemplate className="h-4 w-4" />
              Apply
            </button>
          </span>
        </label>
        <button
          className={`${ToolbarButtonClassName} h-full min-h-14 justify-start`}
          onClick={onOpenPageSetup}
          type="button"
        >
          <FileCog className="h-4 w-4" />
          {pageSetup.format} / {pageSetup.orientation}
        </button>
      </div>
    </section>
  );
}
