export type ApprovalManagementModuleCode = string;

export type ApprovalManagementModuleOption = {
	code: ApprovalManagementModuleCode;
	name: string;
};

export type ApprovalStageRequirement = "any" | "all";

export type ApprovalManagementStatus = "Active" | "Inactive";

export type ApprovalRoutingBasis = "default" | "amount";

export type ApprovalAmountConditionOperator =
	| "greaterThan"
	| "greaterThanOrEqual"
	| "lessThanOrEqual"
	| "between";

export type ApprovalWorkflowFeatureKey =
	| "makerCheckerApproval"
	| "multiLevelApproval"
	| "escalationRules"
	| "autoReminders"
	| "slaMonitoring";

export type ApprovalWorkflowFeatures = Record<ApprovalWorkflowFeatureKey, boolean>;

export type ApprovalStageRecord = {
	id: string;
	sequence: number;
	name: string;
	approverIds: string[];
	requirement: ApprovalStageRequirement;
};

export type ApprovalRoutingRuleRecord = {
	id: string;
	sequence: number;
	name: string;
	basis: ApprovalRoutingBasis;
	amountOperator: ApprovalAmountConditionOperator;
	amountValue: string;
	amountValueTo: string;
	stageIds: string[];
};

export type ApprovalManagementRecord = {
	id: string;
	moduleCode: ApprovalManagementModuleCode;
	moduleName: string;
	stageCount: number;
	stages: ApprovalStageRecord[];
	routingRules: ApprovalRoutingRuleRecord[];
	workflowFeatures: ApprovalWorkflowFeatures;
	status: ApprovalManagementStatus;
	description: string;
	updatedAt: string;
};

export type ApprovalStageFormValues = ApprovalStageRecord;
export type ApprovalRoutingRuleFormValues = ApprovalRoutingRuleRecord;

export type ApprovalManagementFormValues = {
	moduleCode: ApprovalManagementModuleCode | "";
	stageCount: number;
	stages: ApprovalStageFormValues[];
	routingRules: ApprovalRoutingRuleFormValues[];
	workflowFeatures: ApprovalWorkflowFeatures;
	status: ApprovalManagementStatus;
	description: string;
};

export type ApprovalStageFormErrors = Partial<
	Record<keyof ApprovalStageFormValues, string>
>;

export type ApprovalRoutingRuleFormErrors = Partial<
	Record<keyof ApprovalRoutingRuleFormValues, string>
>;

export type ApprovalManagementFormErrors = Partial<
	Record<
		Exclude<
			keyof ApprovalManagementFormValues,
			"routingRules" | "stages" | "workflowFeatures"
		>,
		string
	>
> & {
	routingRules?: Record<string, ApprovalRoutingRuleFormErrors>;
	stages?: Record<string, ApprovalStageFormErrors>;
};

export type ApprovalManagementActionMode = "add" | "edit" | "view";

export type ApprovalManagementTableColumnKey =
	| "moduleName"
	| "stageCount"
	| "stageConditions"
	| "approverSummary"
	| "status"
	| "updatedAt";

export type ApprovalApproverOption = {
	email: string;
	id: string;
	name: string;
	role: string;
	status: string;
};
