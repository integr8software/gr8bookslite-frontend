import type {
	ApprovalAmountConditionOperator,
	ApprovalManagementStatus,
	ApprovalManagementTableColumnKey,
	ApprovalStageRequirement,
	ApprovalWorkflowFeatureKey,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";

export const ApprovalManagementHref =
	"/system-administration/approval-management";

export const ApprovalManagementPaginationStorageKey =
	"system-administration.approval-management";

export const ApprovalManagementEditFromParam = "from";
export const ApprovalManagementEditFromViewValue = "view";
export const ApprovalManagementEditFromViewQuery = `${ApprovalManagementEditFromParam}=${ApprovalManagementEditFromViewValue}`;

export const ApprovalStageCountOptions = [1, 2, 3, 4, 5] as const;
export const ApprovalAmountConditionLimit = 5;

export const ApprovalStageRequirementOptions = [
	{ label: "Any one approver", value: "any" },
	{ label: "All approvers", value: "all" },
] as const satisfies ReadonlyArray<{
	label: string;
	value: ApprovalStageRequirement;
}>;

export const ApprovalAmountConditionModeOptions = [
	{
		description: "Single approval path",
		label: "No amount condition",
		value: "standard",
	},
	{
		description: "Amount threshold path",
		label: "Use amount condition",
		value: "amount",
	},
] as const satisfies ReadonlyArray<{
	description: string;
	label: string;
	value: "standard" | "amount";
}>;

export const ApprovalAmountConditionOperatorOptions = [
	{ label: "Greater than", symbol: ">", value: "greaterThan" },
	{ label: "Greater than or equal", symbol: ">=", value: "greaterThanOrEqual" },
	{ label: "Less than", symbol: "<", value: "lessThan" },
	{ label: "Less than or equal", symbol: "<=", value: "lessThanOrEqual" },
] as const satisfies ReadonlyArray<{
	label: string;
	symbol: string;
	value: ApprovalAmountConditionOperator;
}>;

export const ApprovalWorkflowFeatureOptions = [
	{
		description: "Require the creator and approver to be different users.",
		key: "makerCheckerApproval",
		label: "Maker-checker approval",
	},
	{
		description: "Route transactions through more than one approval level.",
		key: "multiLevelApproval",
		label: "Multi-level approval",
	},
	{
		description: "Move overdue requests to the next configured approver.",
		key: "escalationRules",
		label: "Escalation rules",
	},
	{
		description: "Send reminders while an approval is still pending.",
		key: "autoReminders",
		label: "Auto reminders",
	},
	{
		description: "Track pending approvals against response-time targets.",
		key: "slaMonitoring",
		label: "SLA monitoring",
	},
] as const satisfies ReadonlyArray<{
	description: string;
	key: ApprovalWorkflowFeatureKey;
	label: string;
}>;

export const ApprovalManagementStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly ApprovalManagementStatus[];

export const ApprovalManagementTableColumns: Array<
	| {
			key: ApprovalManagementTableColumnKey;
			label: string;
			className: string;
	  }
	| {
			id: "actions";
			label: string;
			className: string;
	  }
> = [
	{ key: "moduleName", label: "Module", className: "w-[17rem]" },
	{ key: "stageCount", label: "Stages", className: "w-[8rem]" },
	{ key: "stageConditions", label: "Approval Path", className: "w-[30rem]" },
	{ key: "approverSummary", label: "Approvers", className: "w-[24rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "updatedAt", label: "Updated", className: "w-[10rem]" },
	{ id: "actions", label: "Actions", className: "w-[10rem]" },
];
