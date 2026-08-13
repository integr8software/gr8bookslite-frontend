import { type FormEventHandler } from "react";
import { RefreshCw, Save } from "lucide-react";
import type {
  ApprovalManagementFormErrors,
  ApprovalManagementFormValues,
  ApprovalManagementRecord,
  ApprovalRoutingRuleFormValues,
} from "@/app/src/types/modules/approval-management/ApprovalManagementTypes";
import type {
  ApproverAssignmentType,
  ApproverSetupRecord,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import { ApprovalManagementLevels } from "@/app/src/ui/modules/approval-management/approval-rules/levels/ApprovalManagementLevels";
import { ApprovalManagementRules } from "@/app/src/ui/modules/approval-management/approval-rules/rules/ApprovalManagementRules";
import { ApprovalManagementEditorHeader } from "@/app/src/ui/modules/approval-management/approval-rules/workflow-details/ApprovalManagementEditorHeader";
import { ApprovalManagementEditorSkeleton } from "@/app/src/ui/modules/approval-management/approval-rules/workflow-details/ApprovalManagementEditorSkeleton";
import { ApprovalManagementWorkflowDetails } from "@/app/src/ui/modules/approval-management/approval-rules/workflow-details/ApprovalManagementWorkflowDetails";
import { approvalManagementPrimaryButtonClassName } from "@/app/src/ui/modules/approval-management/approval-rules/workflow-details/ApprovalManagementEditorFields";

export type ApprovalManagementEditorProps = {
  derivedApprovalLevelCount: number | null;
  errors: ApprovalManagementFormErrors;
  hasWorkflowChanges: boolean;
  isApproverSetupsLoading: boolean;
  isLoading: boolean;
  isMutating: boolean;
  approverNameById: Map<string, string>;
  selectedApproverType: ApproverAssignmentType | "";
  selectedWorkflow?: ApprovalManagementRecord;
  values: ApprovalManagementFormValues;
  visibleApproverSetupRecords: ApproverSetupRecord[];
  onApproverTypeChange: (type: ApproverAssignmentType | "") => void;
  onAmountConditionModeChange: (hasAmountCondition: boolean) => void;
  onAddAmountConditionRule: () => void;
  onRemoveAmountConditionRule: (routingRuleId: string) => void;
  onRoutingRuleStageMove: (routingRuleId: string, stageId: string, direction: "down" | "up") => void;
  onRoutingRuleFieldChange: <TKey extends keyof ApprovalRoutingRuleFormValues>(
    routingRuleId: string,
    field: TKey,
    value: ApprovalRoutingRuleFormValues[TKey],
  ) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function ApprovalManagementEditor({
  derivedApprovalLevelCount,
  errors,
  hasWorkflowChanges,
  isApproverSetupsLoading,
  isLoading,
  isMutating,
  approverNameById,
  onAddAmountConditionRule,
  onAmountConditionModeChange,
  onApproverTypeChange,
  onRemoveAmountConditionRule,
  onRoutingRuleFieldChange,
  onRoutingRuleStageMove,
  onSubmit,
  selectedApproverType,
  selectedWorkflow,
  values,
  visibleApproverSetupRecords,
}: ApprovalManagementEditorProps) {
  if (isLoading) {
    return <ApprovalManagementEditorSkeleton />;
  }

  if (!selectedWorkflow) {
    return (
      <div className="flex min-h-96 items-center justify-center p-6 text-sm font-medium text-darknavy/55">
        Select an approval workflow to configure its path.
      </div>
    );
  }

  const hasAmountCondition = values.routingRules.some((rule) => rule.basis === "amount");

  return (
    <form onSubmit={onSubmit} className="approval-management-editor grid min-h-0 min-w-0 content-start gap-4 p-4 lg:p-5">
      <ApprovalManagementEditorHeader
        hasAmountCondition={hasAmountCondition}
        isLoading={isLoading}
        isMutating={isMutating}
        selectedWorkflow={selectedWorkflow}
        stageCount={derivedApprovalLevelCount}
      />

      <ApprovalManagementWorkflowDetails
        derivedApprovalLevelCount={derivedApprovalLevelCount}
        errors={errors}
        selectedWorkflow={selectedWorkflow}
      />

      <ApprovalManagementLevels
        isLoading={isApproverSetupsLoading}
        records={visibleApproverSetupRecords}
        selectedApproverType={selectedApproverType}
        onApproverTypeChange={onApproverTypeChange}
      />

      <ApprovalManagementRules
        approverNameById={approverNameById}
        errors={errors}
        hasAmountCondition={hasAmountCondition}
        routingRules={values.routingRules}
        stages={values.stages}
        onAddAmountConditionRule={onAddAmountConditionRule}
        onAmountConditionModeChange={onAmountConditionModeChange}
        onRemoveAmountConditionRule={onRemoveAmountConditionRule}
        onRoutingRuleFieldChange={onRoutingRuleFieldChange}
        onRoutingRuleStageMove={onRoutingRuleStageMove}
      />

      {hasWorkflowChanges ? (
        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-skyblue/20 bg-white/95 p-3 shadow-lg shadow-darknavy/10 backdrop-blur">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-darknavy">Unsaved approval changes</div>
            <div className="mt-0.5 text-xs font-medium text-darknavy/55">
              Update this workflow to keep the latest rules and approval path.
            </div>
          </div>
          <button type="submit" disabled={isLoading || isMutating} className={approvalManagementPrimaryButtonClassName}>
            {isMutating ? (
              <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            Update Workflow
          </button>
        </div>
      ) : null}
    </form>
  );
}
