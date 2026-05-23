export type ApprovalManagementModuleCode =
	| "DV"
	| "CR"
	| "JV"
	| "PR"
	| "PO"
	| "RR";

export type ApprovalStageRequirement = "any" | "all";

export type ApprovalManagementStatus = "Active" | "Inactive";

export type ApprovalStageRecord = {
	id: string;
	sequence: number;
	name: string;
	approverIds: string[];
	requirement: ApprovalStageRequirement;
};

export type ApprovalManagementRecord = {
	id: string;
	moduleCode: ApprovalManagementModuleCode;
	moduleName: string;
	stageCount: number;
	stages: ApprovalStageRecord[];
	status: ApprovalManagementStatus;
	description: string;
	updatedAt: string;
};

export type ApprovalStageFormValues = ApprovalStageRecord;

export type ApprovalManagementFormValues = {
	moduleCode: ApprovalManagementModuleCode | "";
	stageCount: number;
	stages: ApprovalStageFormValues[];
	status: ApprovalManagementStatus;
	description: string;
};

export type ApprovalStageFormErrors = Partial<
	Record<keyof ApprovalStageFormValues, string>
>;

export type ApprovalManagementFormErrors = Partial<
	Record<Exclude<keyof ApprovalManagementFormValues, "stages">, string>
> & {
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
