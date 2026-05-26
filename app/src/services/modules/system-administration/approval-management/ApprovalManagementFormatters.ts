import { ApprovalStageRequirementOptions } from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import type {
	ApprovalApproverOption,
	ApprovalManagementRecord,
	ApprovalStageRecord,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";

export function createApproverNameById(approvers: ApprovalApproverOption[]) {
	return new Map(approvers.map((approver) => [approver.id, approver.name]));
}

export function formatApprovalStageRequirement(stage: ApprovalStageRecord) {
	return (
		ApprovalStageRequirementOptions.find(
			(option) => option.value === stage.requirement,
		)?.label ?? "Any one approver"
	);
}

export function formatApprovalStageFlow(workflow: ApprovalManagementRecord) {
	return workflow.stages
		.map(
			(stage) =>
				`Stage ${stage.sequence}: ${formatApprovalStageRequirement(stage)}`,
		)
		.join(" -> ");
}

export function formatApprovalApproverNames(
	approverIds: string[],
	approverNameById: Map<string, string>,
) {
	return approverIds
		.map((approverId) => approverNameById.get(approverId) ?? approverId)
		.join(", ");
}

export function formatApprovalWorkflowUpdatedAt(updatedAt: string) {
	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(updatedAt));
}
