import {
	ApprovalAmountConditionOperatorOptions,
	ApprovalStageRequirementOptions,
} from "@/app/src/constants/modules/approval-management/ApprovalManagementConstants";
import type {
	ApprovalApproverOption,
	ApprovalManagementRecord,
	ApprovalRoutingRuleRecord,
	ApprovalStageRecord,
} from "@/app/src/types/modules/approval-management/ApprovalManagementTypes";

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

export function formatApprovalRoutingFlow(workflow: ApprovalManagementRecord) {
	return workflow.routingRules
		.map(
			(rule) =>
				`${formatApprovalRoutingCondition(rule)} -> ${formatApprovalRoutingStagePath(
					rule,
					workflow.stages,
				)}`,
		)
		.join(" | ");
}

export function formatApprovalRoutingCondition(rule: ApprovalRoutingRuleRecord) {
	if (rule.basis === "default") {
		return "Otherwise";
	}

	if (rule.basis === "amount") {
		const operator =
			ApprovalAmountConditionOperatorOptions.find(
				(option) => option.value === rule.amountOperator,
			)?.symbol ?? ">";
		const amount = formatApprovalAmount(rule.amountValue);

		return `Amount ${operator} ${amount}`;
	}
}

export function formatApprovalRoutingStagePath(
	rule: ApprovalRoutingRuleRecord,
	stages: ApprovalStageRecord[],
) {
	const stageById = new Map(stages.map((stage) => [stage.id, stage]));

	return rule.stageIds
		.map((stageId) => stageById.get(stageId)?.name ?? stageId)
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

function formatApprovalAmount(value: string) {
	const amount = Number(value.replaceAll(",", "").trim());

	if (!Number.isFinite(amount)) {
		return value || "0.00";
	}

	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	}).format(amount);
}
