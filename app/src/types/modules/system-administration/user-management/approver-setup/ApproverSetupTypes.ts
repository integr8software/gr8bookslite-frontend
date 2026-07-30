export type ApproverAssignmentType =
	| "Level-based"
	| "No condition"
	| "Temporary";

export type ApproverCondition =
	| "Any one approver"
	| "Any two approvers"
	| "All approvers";

export type ApproverCoverageStatus = "Active" | "Scheduled" | "Expired";

export type ApproverSetupUser = {
	id: string;
	name: string;
	email: string;
};

export type ApproverSetupModuleOption = {
	code: string;
	id: string;
	name: string;
};

export type ApproverSetupRecord = {
	id: string;
	userIds: string[];
	approverUsers?: ApproverSetupUser[];
	assignmentType: ApproverAssignmentType;
	levelName: string;
	moduleScope: string;
	condition: ApproverCondition;
	sequence: number;
	effectiveFrom?: string;
	effectiveTo?: string;
	status: ApproverCoverageStatus;
	lastUpdatedBy: string;
	lastUpdatedAt: string;
};

export type ApproverSetupFormValues = {
	assignmentType: ApproverAssignmentType;
	condition: ApproverCondition;
	effectiveFrom: string;
	effectiveTo: string;
	levelName: string;
	moduleScope: string;
	sequence: string;
	status: ApproverCoverageStatus;
	userIds: string[];
};

export type ApproverSetupDrawerMode = "add" | "edit";

export type ApproverSetupDrawerState = {
	mode: ApproverSetupDrawerMode;
	record: ApproverSetupRecord | null;
};
