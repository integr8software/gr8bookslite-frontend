import { Copy, Layers, Lock, Trash2, Unlock } from "lucide-react";
import { ToolbarButtonClassName } from "@/app/src/ui/modules/system-administration/customized-reports/constants/CustomizeReportDesignerConstants";
export function CustomizeReportElementActionPanel({
  isLocked,
  onDelete,
  onDuplicate,
  onLayer,
  onToggleLock,
}: {
  isLocked: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onLayer: (action: "backward" | "forward" | "back" | "front") => void;
  onToggleLock: () => void;
}) {
  return (
    <div className="mb-4 space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="grid grid-cols-3 gap-2">
        <button className={`${ToolbarButtonClassName} px-2`} onClick={onDuplicate} type="button">
          <Copy className="h-4 w-4" />
          Copy
        </button>
        <button className={`${ToolbarButtonClassName} px-2`} onClick={onToggleLock} type="button">
          {isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {isLocked ? "Unlock" : "Lock"}
        </button>
        <button
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-2 text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50"
          onClick={onDelete}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
          <Layers className="h-3.5 w-3.5" />
          Layer
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`${ToolbarButtonClassName} px-2`}
            onClick={() => onLayer("front")}
            type="button"
          >
            Front
          </button>
          <button
            className={`${ToolbarButtonClassName} px-2`}
            onClick={() => onLayer("back")}
            type="button"
          >
            Back
          </button>
          <button
            className={`${ToolbarButtonClassName} px-2`}
            onClick={() => onLayer("forward")}
            type="button"
          >
            Forward
          </button>
          <button
            className={`${ToolbarButtonClassName} px-2`}
            onClick={() => onLayer("backward")}
            type="button"
          >
            Backward
          </button>
        </div>
      </div>
    </div>
  );
}

