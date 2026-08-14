import { Copy, Eye, EyeOff, Group, Ungroup } from "lucide-react";
import { useState } from "react";
import { AlignDistributePanel } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportAlignDistributePanel";
import { CustomizeReportFieldInspector } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportFieldInspector";
import { CustomizeReportLineInspector } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportLineInspector";
import { CustomizeReportTableInspector } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportTableInspector";
import { ToolbarButtonClassName } from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import type {
  AlignDistributionAction,
  ReportElementBounds,
  SelectedElementKey,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportDesignerTypes";
import type {
  CustomizeReportField,
  CustomizeReportLine,
  CustomizeReportMarginSetup,
  CustomizeReportPageSetup,
  CustomizeReportTableColumn,
  CustomizeReportTableColumnKey,
  CustomizeReportTableSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";

type SelectedReportElement = {
  bounds: ReportElementBounds;
  id: string;
  key: SelectedElementKey;
  type: "field" | "line" | "table";
};

type CustomizeReportInspectorPanelProps = {
  canGroupSelection: boolean;
  canUngroupSelection: boolean;
  hasMultiSelection: boolean;
  marginSetup: CustomizeReportMarginSetup;
  pageSetup: CustomizeReportPageSetup;
  reportData: Record<string, unknown>;
  selectedElementType: "field" | "line" | "table";
  selectedElements: SelectedReportElement[];
  selectedField: CustomizeReportField;
  selectedLine: CustomizeReportLine | null;
  tableSetup: CustomizeReportTableSetup;
  templatePreview: string;
  onAddTableColumn: () => void;
  onAlignDistribute: (action: AlignDistributionAction) => void;
  onDeleteField: () => void;
  onDeleteLine: () => void;
  onDuplicate: () => void;
  onGroup: () => void;
  onLayer: (action: "backward" | "forward" | "back" | "front") => void;
  onRemoveTableColumn: (columnKey: CustomizeReportTableColumnKey) => void;
  onTableColumnChange: (
    columnKey: CustomizeReportTableColumnKey,
    updater: (column: CustomizeReportTableColumn) => CustomizeReportTableColumn,
  ) => void;
  onTableSetupChange: (
    updater: (setup: CustomizeReportTableSetup) => CustomizeReportTableSetup,
  ) => void;
  onToggleLock: () => void;
  onUngroup: () => void;
  onUpdateField: (updater: (field: CustomizeReportField) => CustomizeReportField) => void;
  onUpdateLine: (updater: (line: CustomizeReportLine) => CustomizeReportLine) => void;
};

export function CustomizeReportInspectorPanel({
  canGroupSelection,
  canUngroupSelection,
  hasMultiSelection,
  marginSetup,
  onAddTableColumn,
  onAlignDistribute,
  onDeleteField,
  onDeleteLine,
  onDuplicate,
  onGroup,
  onLayer,
  onRemoveTableColumn,
  onTableColumnChange,
  onTableSetupChange,
  onToggleLock,
  onUngroup,
  onUpdateField,
  onUpdateLine,
  pageSetup,
  reportData,
  selectedElementType,
  selectedElements,
  selectedField,
  selectedLine,
  tableSetup,
  templatePreview,
}: CustomizeReportInspectorPanelProps) {
  const [isTemplatePreviewVisible, setIsTemplatePreviewVisible] = useState(false);

  return (
    <aside className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3">
        <p className="text-sm font-bold text-slate-800">Inspector</p>
        <p className="text-xs text-slate-500">
          {hasMultiSelection
            ? `${selectedElements.length} elements selected`
            : selectedElementType === "line" && selectedLine
              ? selectedLine.label
              : selectedElementType === "table"
                ? "Items Table"
              : selectedField.label}
        </p>
      </div>

      {hasMultiSelection ? (
        <MultiSelectionActionPanel
          canGroup={canGroupSelection}
          canUngroup={canUngroupSelection}
          onDuplicate={onDuplicate}
          onGroup={onGroup}
          onUngroup={onUngroup}
        />
      ) : canUngroupSelection ? (
        <SingleGroupActionPanel onUngroup={onUngroup} />
      ) : null}

      {hasMultiSelection ? <AlignDistributePanel onAction={onAlignDistribute} /> : null}

      {hasMultiSelection ? null : selectedElementType === "table" ? (
        <CustomizeReportTableInspector
          marginSetup={marginSetup}
          onAddColumn={onAddTableColumn}
          onRemoveColumn={onRemoveTableColumn}
          onTableColumnChange={onTableColumnChange}
          onTableSetupChange={onTableSetupChange}
          pageSetup={pageSetup}
          tableSetup={tableSetup}
        />
      ) : selectedElementType === "line" && selectedLine ? (
        <CustomizeReportLineInspector
          line={selectedLine}
          onDelete={onDeleteLine}
          onDuplicate={onDuplicate}
          onLayer={onLayer}
          onToggleLock={onToggleLock}
          pageSetup={pageSetup}
          onUpdate={onUpdateLine}
        />
      ) : (
        <CustomizeReportFieldInspector
          field={selectedField}
          onDelete={onDeleteField}
          onDuplicate={onDuplicate}
          onLayer={onLayer}
          onToggleLock={onToggleLock}
          pageSetup={pageSetup}
          reportData={reportData}
          onUpdate={onUpdateField}
        />
      )}

      <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase text-slate-500">jsreport Template</p>
          <button
            className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
            onClick={() => setIsTemplatePreviewVisible((currentValue) => !currentValue)}
            type="button"
          >
            {isTemplatePreviewVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isTemplatePreviewVisible ? "Hide" : "Show"}
          </button>
        </div>
        {isTemplatePreviewVisible ? (
          <textarea
            className="mt-3 h-52 w-full resize-none rounded-md border border-slate-200 bg-slate-950 p-3 font-mono text-[11px] text-slate-100 outline-none"
            readOnly
            value={templatePreview}
          />
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            Template source is hidden by default.
          </p>
        )}
      </div>
    </aside>
  );
}

function MultiSelectionActionPanel({
  canGroup,
  canUngroup,
  onDuplicate,
  onGroup,
  onUngroup,
}: {
  canGroup: boolean;
  canUngroup: boolean;
  onDuplicate: () => void;
  onGroup: () => void;
  onUngroup: () => void;
}) {
  return (
    <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Selection</p>
      <div className="grid grid-cols-3 gap-2">
        <button className={`${ToolbarButtonClassName} px-2`} onClick={onDuplicate} type="button">
          <Copy className="h-4 w-4" />
          Copy
        </button>
        <button
          className={`${ToolbarButtonClassName} px-2`}
          disabled={!canGroup}
          onClick={onGroup}
          type="button"
        >
          <Group className="h-4 w-4" />
          Group
        </button>
        <button
          className={`${ToolbarButtonClassName} px-2`}
          disabled={!canUngroup}
          onClick={onUngroup}
          type="button"
        >
          <Ungroup className="h-4 w-4" />
          Ungroup
        </button>
      </div>
    </div>
  );
}

function SingleGroupActionPanel({ onUngroup }: { onUngroup: () => void }) {
  return (
    <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3">
      <button className={`${ToolbarButtonClassName} w-full justify-center px-2`} onClick={onUngroup} type="button">
        <Ungroup className="h-4 w-4" />
        Ungroup
      </button>
    </div>
  );
}
