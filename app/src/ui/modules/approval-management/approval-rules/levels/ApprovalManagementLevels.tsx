import { Settings, UsersRound } from "lucide-react";
import { useApprovalAlertStore } from "@/app/src/hooks/modules/approval-management/useApprovalAlertStore";
import { ApproverAssignmentTypeOptions } from "@/app/src/constants/modules/system-administration/user-management/approver-setup/ApproverSetupConstants";
import type {
  ApproverAssignmentType,
  ApproverSetupRecord,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import {
  ApprovalManagementField,
  approvalManagementFieldClassName,
} from "@/app/src/ui/modules/approval-management/approval-rules/workflow-details/ApprovalManagementEditorFields";
import { ApprovalManagementLevelCard } from "@/app/src/ui/modules/approval-management/approval-rules/levels/ApprovalManagementLevelCard";

type ApprovalManagementLevelsProps = {
  isLoading: boolean;
  records: ApproverSetupRecord[];
  selectedApproverType: ApproverAssignmentType | "";
  onApproverTypeChange: (type: ApproverAssignmentType | "") => void;
};

export function ApprovalManagementLevels({
  isLoading,
  onApproverTypeChange,
  records,
  selectedApproverType,
}: ApprovalManagementLevelsProps) {
  const openApproverSetup = useApprovalAlertStore((state) => state.setActiveTab);

  return (
    <section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
      <div className="flex items-center gap-2 border-b border-darknavy/10 px-4 py-3">
        <UsersRound className="h-4 w-4 text-darknavy/55" aria-hidden="true" />
        <h3 className="text-base font-semibold text-darknavy">Approval Levels</h3>
      </div>
      <div className="grid gap-4 p-4">
        <ApprovalManagementField label="Select Approver Type">
          <select
            value={selectedApproverType}
            onChange={(event) => onApproverTypeChange(event.target.value as ApproverAssignmentType | "")}
            className={approvalManagementFieldClassName}
          >
            <option value="">Select approver type</option>
            {ApproverAssignmentTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </ApprovalManagementField>
        {selectedApproverType ? (
          isLoading ? (
            <div className="rounded-md border border-darknavy/10 bg-offwhite/45 px-4 py-3 text-sm font-medium text-darknavy/55">
              Loading approver setups for this module...
            </div>
          ) : records.length > 0 ? (
            <div className="grid gap-3">
              {records.map((record) => (
                <ApprovalManagementLevelCard key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-coralpink/25 bg-coralpink/5 px-4 py-3">
              <span className="text-sm font-medium text-darknavy/65">
                This module has no approver setup for the selected type.
              </span>
              <button
                type="button"
                onClick={() => openApproverSetup("approver-setup")}
                className="inline-flex min-h-9 items-center gap-2 rounded-md bg-skyblue px-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Open Approver Setup
              </button>
            </div>
          )
        ) : null}
      </div>
    </section>
  );
}
