import {
	type FormEventHandler,
} from "react";
import type {
	ApprovalManagementFormErrors,
	ApprovalManagementFormValues,
	ApprovalManagementRecord,
	ApprovalRoutingRuleFormValues,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import type {
	ApproverAssignmentType,
	ApproverSetupRecord,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import { ApprovalManagementLevels } from "@/app/src/ui/modules/system-administration/approval-management/approval-levels/ApprovalManagementLevels";
import { ApprovalManagementRules } from "@/app/src/ui/modules/system-administration/approval-management/approval-rules/ApprovalManagementRules";
import { ApprovalManagementEditorHeader } from "@/app/src/ui/modules/system-administration/approval-management/workflow-details/ApprovalManagementEditorHeader";
import { ApprovalManagementEditorSkeleton } from "@/app/src/ui/modules/system-administration/approval-management/workflow-details/ApprovalManagementEditorSkeleton";
import { ApprovalManagementWorkflowDetails } from "@/app/src/ui/modules/system-administration/approval-management/workflow-details/ApprovalManagementWorkflowDetails";

export type ApprovalManagementEditorProps = {
	derivedApprovalLevelCount: number | null;
	errors: ApprovalManagementFormErrors;
	isApproverSetupsLoading: boolean;
	isLoading: boolean;
	isMutating: boolean;
	selectedApproverType: ApproverAssignmentType | "";
	selectedWorkflow?: ApprovalManagementRecord;
	values: ApprovalManagementFormValues;
	visibleApproverSetupRecords: ApproverSetupRecord[];
	onApproverTypeChange: (type: ApproverAssignmentType | "") => void;
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
	derivedApprovalLevelCount,
	errors,
	isApproverSetupsLoading,
	isLoading,
	isMutating,
	onAddAmountConditionRule,
	onAmountConditionModeChange,
	onApproverTypeChange,
	onRemoveAmountConditionRule,
	onRoutingRuleFieldChange,
	onRoutingRuleStageToggle,
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
