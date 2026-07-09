"use client";

import {
	useState,
	type ChangeEventHandler,
	type FormEventHandler,
} from "react";
import type {
	ApprovalManagementFormErrors,
	ApprovalManagementFormValues,
	ApprovalManagementRecord,
	ApprovalRoutingRuleFormValues,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import type { ApproverAssignmentType } from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import { ApprovalManagementLevels } from "@/app/src/ui/modules/system-administration/approval-management/approval-levels/ApprovalManagementLevels";
import { ApprovalManagementRules } from "@/app/src/ui/modules/system-administration/approval-management/approval-rules/ApprovalManagementRules";
import { ApprovalManagementEditorHeader } from "@/app/src/ui/modules/system-administration/approval-management/workflow-details/ApprovalManagementEditorHeader";
import { ApprovalManagementEditorSkeleton } from "@/app/src/ui/modules/system-administration/approval-management/workflow-details/ApprovalManagementEditorSkeleton";
import { ApprovalManagementWorkflowDetails } from "@/app/src/ui/modules/system-administration/approval-management/workflow-details/ApprovalManagementWorkflowDetails";

export type ApprovalManagementEditorProps = {
	errors: ApprovalManagementFormErrors;
	isLoading: boolean;
	isMutating: boolean;
	selectedWorkflow?: ApprovalManagementRecord;
	values: ApprovalManagementFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
	onAmountConditionModeChange: (hasAmountCondition: boolean) => void;
	onAddAmountConditionRule: () => void;
	onRemoveAmountConditionRule: (routingRuleId: string) => void;
	onRoutingRuleFieldChange: <
		TKey extends keyof ApprovalRoutingRuleFormValues,
	>(
		routingRuleId: string,
		field: TKey,
		value: ApprovalRoutingRuleFormValues[TKey],
	) => void;
	onRoutingRuleStageToggle: (routingRuleId: string, stageId: string) => void;
	onSubmit: FormEventHandler<HTMLFormElement>;
};

export function ApprovalManagementEditor({
	errors,
	isLoading,
	isMutating,
	onAddAmountConditionRule,
	onAmountConditionModeChange,
	onInputChange,
	onRemoveAmountConditionRule,
	onRoutingRuleFieldChange,
	onRoutingRuleStageToggle,
	onSubmit,
	selectedWorkflow,
	values,
}: ApprovalManagementEditorProps) {
	const [selectedApproverType, setSelectedApproverType] = useState<
		ApproverAssignmentType | ""
	>("");

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

	const hasAmountCondition = values.routingRules.some(
		(rule) => rule.basis === "amount",
	);

	return (
		<form
			onSubmit={onSubmit}
			className="approval-management-editor grid min-h-0 min-w-0 content-start gap-4 p-4 lg:p-5"
		>
			<ApprovalManagementEditorHeader
				hasAmountCondition={hasAmountCondition}
				isLoading={isLoading}
				isMutating={isMutating}
				selectedWorkflow={selectedWorkflow}
				stageCount={values.stageCount}
			/>

			<ApprovalManagementWorkflowDetails
				errors={errors}
				selectedWorkflow={selectedWorkflow}
				values={values}
				onInputChange={onInputChange}
			/>

			<ApprovalManagementLevels
				moduleName={selectedWorkflow.moduleName}
				selectedApproverType={selectedApproverType}
				stageCount={values.stageCount}
				onApproverTypeChange={setSelectedApproverType}
			/>

			<ApprovalManagementRules
				errors={errors}
				hasAmountCondition={hasAmountCondition}
				routingRules={values.routingRules}
				stages={values.stages}
				onAddAmountConditionRule={onAddAmountConditionRule}
				onAmountConditionModeChange={onAmountConditionModeChange}
				onRemoveAmountConditionRule={onRemoveAmountConditionRule}
				onRoutingRuleFieldChange={onRoutingRuleFieldChange}
				onRoutingRuleStageToggle={onRoutingRuleStageToggle}
			/>
		</form>
	);
}
