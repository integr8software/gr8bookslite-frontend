import { AlignDistributePanel } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportAlignDistributePanel";
import { CustomizeReportFieldInspector } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportFieldInspector";
import { CustomizeReportLineInspector } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportLineInspector";
import type {
  AlignDistributionAction,
  ReportElementBounds,
  SelectedElementKey,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportDesignerTypes";
import type {
  CustomizeReportField,
  CustomizeReportLine,
  CustomizeReportPageSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";

type SelectedReportElement = {
  bounds: ReportElementBounds;
  id: string;
  key: SelectedElementKey;
  type: "field" | "line";
};

type CustomizeReportInspectorPanelProps = {
  hasMultiSelection: boolean;
  pageSetup: CustomizeReportPageSetup;
  selectedElementType: "field" | "line";
  selectedElements: SelectedReportElement[];
  selectedField: CustomizeReportField;
  selectedLine: CustomizeReportLine | null;
  templatePreview: string;
  onAlignDistribute: (action: AlignDistributionAction) => void;
  onDeleteField: () => void;
  onDeleteLine: () => void;
  onDuplicate: () => void;
  onLayer: (action: "backward" | "forward" | "back" | "front") => void;
  onToggleLock: () => void;
  onUpdateField: (updater: (field: CustomizeReportField) => CustomizeReportField) => void;
  onUpdateLine: (updater: (line: CustomizeReportLine) => CustomizeReportLine) => void;
};

export function CustomizeReportInspectorPanel({
  hasMultiSelection,
  onAlignDistribute,
  onDeleteField,
  onDeleteLine,
  onDuplicate,
  onLayer,
  onToggleLock,
  onUpdateField,
  onUpdateLine,
  pageSetup,
  selectedElementType,
  selectedElements,
  selectedField,
  selectedLine,
  templatePreview,
}: CustomizeReportInspectorPanelProps) {
  return (
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

      {hasMultiSelection ? <AlignDistributePanel onAction={onAlignDistribute} /> : null}

      {selectedElementType === "line" && selectedLine ? (
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
          onUpdate={onUpdateField}
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
  );
}
