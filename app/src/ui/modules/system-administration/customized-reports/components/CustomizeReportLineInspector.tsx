import { FieldNumberControl } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportFormControls";
import { CustomizeReportElementActionPanel as ElementActionPanel } from "@/app/src/ui/modules/system-administration/customized-reports/components/CustomizeReportElementActionPanel";
import { InspectorNumberInputClassName, ToolbarButtonClassName } from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import type {
  CustomizeReportLine,
  CustomizeReportPageSetup,
} from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportTypes";
import { clamp } from "@/app/src/ui/modules/system-administration/customized-reports/utils/CustomizeReportDesignerUtils";
export function CustomizeReportLineInspector({
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

