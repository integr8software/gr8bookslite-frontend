import type {
	ApproverAssignmentType,
	ApproverCondition,
	ApproverCoverageStatus,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";

export const ApproverSetupAllTypesFilter = "All types";
export const ApproverSetupAllStatusesFilter = "All statuses";
export const ApproverSetupCurrentDate = new Date("2026-07-08T00:00:00");

export const ApproverConditionOptions: ApproverCondition[] = [
	"Any one approver",
	"Any two approvers",
	"All approvers",
];

export const ApproverLevelOptions = ["1", "2", "3", "4"];

export const ApproverAssignmentTypeOptions: ApproverAssignmentType[] = [
	"Level-based",
	"No condition",
	"Temporary",
];

export const ApproverCoverageStatusOptions: ApproverCoverageStatus[] = [
	"Active",
	"Scheduled",
	"Expired",
];

export const ApproverAssignmentToneByType: Record<
	ApproverAssignmentType,
	string
> = {
	"Level-based": "border-skyblue/25 bg-skyblue/10 text-skyblue",
	"No condition": "border-emerald-500/25 bg-emerald-50 text-emerald-700",
	Temporary: "border-citron/60 bg-citron/25 text-darknavy",
};

export const ApproverStatusToneByStatus: Record<
	ApproverCoverageStatus,
	string
> = {
	Active: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
	Scheduled: "border-skyblue/25 bg-skyblue/10 text-skyblue",
	Expired: "border-darknavy/10 bg-offwhite text-darknavy/55",
};
