import { ToolbarButtonClassName } from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
import type { AlignDistributionAction } from "@/app/src/types/modules/system-administration/customized-reports/CustomizeReportDesignerTypes";
export function AlignDistributePanel({
  onAction,
}: {
  onAction: (action: AlignDistributionAction) => void;
}) {
  return (
    <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Align</p>
      <div className="grid grid-cols-3 gap-2">
        <button className={`${ToolbarButtonClassName} px-2`} onClick={() => onAction("left")}>
          Left
        </button>
        <button className={`${ToolbarButtonClassName} px-2`} onClick={() => onAction("center")}>
          Center
        </button>
        <button className={`${ToolbarButtonClassName} px-2`} onClick={() => onAction("right")}>
          Right
        </button>
        <button className={`${ToolbarButtonClassName} px-2`} onClick={() => onAction("top")}>
          Top
        </button>
        <button className={`${ToolbarButtonClassName} px-2`} onClick={() => onAction("middle")}>
          Middle
        </button>
        <button className={`${ToolbarButtonClassName} px-2`} onClick={() => onAction("bottom")}>
          Bottom
        </button>
      </div>
      <p className="mb-2 mt-3 text-xs font-semibold uppercase text-slate-500">Distribute</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          className={`${ToolbarButtonClassName} px-2`}
          onClick={() => onAction("distribute-horizontal")}
        >
          Horizontal
        </button>
        <button
          className={`${ToolbarButtonClassName} px-2`}
          onClick={() => onAction("distribute-vertical")}
        >
          Vertical
        </button>
      </div>
    </div>
  );
}

