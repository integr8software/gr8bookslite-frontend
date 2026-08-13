import { BadgeCheck, ListChecks, RefreshCw, Save } from "lucide-react";
import type { ApprovalManagementRecord } from "@/app/src/types/modules/approval-management/ApprovalManagementTypes";
import { approvalManagementPrimaryButtonClassName } from "@/app/src/ui/modules/approval-management/approval-rules/workflow-details/ApprovalManagementEditorFields";

type ApprovalManagementEditorHeaderProps = {
  hasAmountCondition: boolean;
  isLoading: boolean;
  isMutating: boolean;
  selectedWorkflow: ApprovalManagementRecord;
  stageCount: number | null;
};

export function ApprovalManagementEditorHeader({
  hasAmountCondition,
  isLoading,
  isMutating,
  selectedWorkflow,
  stageCount,
}: ApprovalManagementEditorHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-darknavy/10 pb-4">
      <div className="min-w-0">
        <h2 className="truncate text-xl font-semibold tracking-tight text-darknavy">{selectedWorkflow.moduleName}</h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className="rounded-md border border-skyblue/15 bg-skyblue/8 px-2 py-0.5 text-skyblue">{selectedWorkflow.moduleCode}</span>
          <span className="rounded-md border border-darknavy/8 bg-offwhite/60 px-2 py-0.5 text-darknavy/65">
            {stageCount === null ? "No approver type selected" : `${stageCount} approval level${stageCount === 1 ? "" : "s"}`}
          </span>
          {hasAmountCondition ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-50 px-2 py-0.5 text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Amount-based rules enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-darknavy/8 bg-offwhite/60 px-2 py-0.5 text-darknavy/55">
              <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
              Single approval path
            </span>
          )}
        </div>
      </div>
      <button type="submit" disabled={isLoading || isMutating} className={approvalManagementPrimaryButtonClassName}>
        {isMutating ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
        Update Workflow
      </button>
    </div>
  );
}
