import { Settings2 } from "lucide-react";
import type {
  ApprovalManagementFormErrors,
  ApprovalManagementRecord,
} from "@/app/src/types/modules/approval-management/ApprovalManagementTypes";
import {
  ApprovalManagementField,
  approvalManagementFieldClassName,
} from "@/app/src/ui/modules/approval-management/approval-rules/workflow-details/ApprovalManagementEditorFields";

type ApprovalManagementWorkflowDetailsProps = {
  derivedApprovalLevelCount: number | null;
  errors: ApprovalManagementFormErrors;
  selectedWorkflow: ApprovalManagementRecord;
};

export function ApprovalManagementWorkflowDetails({
  derivedApprovalLevelCount,
  errors,
  selectedWorkflow,
}: ApprovalManagementWorkflowDetailsProps) {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
      <div className="flex items-center gap-2 px-4 py-3">
        <Settings2 className="h-4 w-4 text-darknavy/55" aria-hidden="true" />
        <h3 className="text-base font-semibold text-darknavy">Workflow Details</h3>
      </div>
      <div className="grid gap-4 px-4 pb-4 md:grid-cols-3">
        <ApprovalManagementField label="Module" error={errors.moduleCode}>
          <input value={selectedWorkflow.moduleName} readOnly className={`${approvalManagementFieldClassName} bg-offwhite/65`} />
        </ApprovalManagementField>
        <ApprovalManagementField label="Module Code" error={errors.moduleCode}>
          <input value={selectedWorkflow.moduleCode} readOnly className={`${approvalManagementFieldClassName} bg-offwhite/65 font-mono`} />
        </ApprovalManagementField>
        <ApprovalManagementField label="Approval Levels" error={errors.stageCount}>
          <input
            name="stageCount"
            value={derivedApprovalLevelCount ?? ""}
            readOnly
            placeholder="Select approver type"
            className={`${approvalManagementFieldClassName} bg-offwhite/65`}
          />
        </ApprovalManagementField>
      </div>
    </section>
  );
}
