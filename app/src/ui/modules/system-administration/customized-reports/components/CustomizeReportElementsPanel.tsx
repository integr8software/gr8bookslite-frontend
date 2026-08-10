import { Eye, EyeOff, Menu, Minus, PanelRight } from "lucide-react";
import type { MouseEvent } from "react";
import type { SelectedElementKey } from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportDesignerTypes";
import type {
  CustomizeReportField,
  CustomizeReportLine,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";
import { getSelectedElementKey } from "@/app/src/ui/modules/system-administration/customized-reports/utils/CustomizeReportDesignerUtils";

type CustomizeReportElementsPanelProps = {
  fields: CustomizeReportField[];
  isOpen: boolean;
  lines: CustomizeReportLine[];
  selectedElementSet: Set<SelectedElementKey>;
  onElementSelect: (
    event: MouseEvent<HTMLElement>,
    type: "field" | "line",
    id: string,
  ) => void;
  onOpenChange: (isOpen: boolean) => void;
  onToggleFieldVisibility: (fieldId: string) => void;
  onToggleLineVisibility: (lineId: string) => void;
};

export function CustomizeReportElementsPanel({
  fields,
  isOpen,
  lines,
  onElementSelect,
  onOpenChange,
  onToggleFieldVisibility,
  onToggleLineVisibility,
  selectedElementSet,
}: CustomizeReportElementsPanelProps) {
  return (
    <aside
      className={`rounded-md border border-slate-200 bg-white shadow-sm ${
        isOpen ? "p-3" : "flex items-start justify-center p-2"
      }`}
    >
      {isOpen ? (
        <>
          <div className="mb-3 flex items-center justify-between gap-2 text-sm font-bold text-slate-800">
            <span className="flex items-center gap-2">
              <PanelRight className="h-4 w-4 text-orange-500" />
              Elements
            </span>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-orange-300 hover:text-orange-600"
              onClick={() => onOpenChange(false)}
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
                  onClick={(event) => onElementSelect(event, "field", field.id)}
                  type="button"
                >
                  <span className={field.visible ? "" : "text-slate-400"}>{field.label}</span>
                </button>
                <button
                  className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-400 transition hover:bg-slate-100 hover:text-orange-600"
                  onClick={() => onToggleFieldVisibility(field.id)}
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
                  onClick={(event) => onElementSelect(event, "line", line.id)}
                  type="button"
                >
                  <Minus className="h-4 w-4 shrink-0" />
                  <span className={line.visible ? "" : "text-slate-400"}>{line.label}</span>
                </button>
                <button
                  className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-400 transition hover:bg-slate-100 hover:text-orange-600"
                  onClick={() => onToggleLineVisibility(line.id)}
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
          onClick={() => onOpenChange(true)}
          title="Open elements"
          type="button"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}
    </aside>
  );
}
